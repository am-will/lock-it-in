import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

/**
 * Order management functions
 * Handles order creation, payment status, and lifecycle
 */

/**
 * Create an order from a locked listing
 * Called after successful lock to create order stub
 */
export const createFromLock = mutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create an order");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    // Verify listing is locked by this user
    const now = Date.now();
    if (listing.status !== "locked" || !listing.lockExpiresAt || listing.lockExpiresAt < now) {
      throw new Error("Listing is not locked or lock has expired");
    }

    // Check if there's already a pending order for this listing by this buyer
    const existingOrders = await ctx.db
      .query("orders")
      .withIndex("by_listing", (q) => q.eq("listingId", args.listingId))
      .filter((q) =>
        q.and(
          q.eq(q.field("buyerId"), userId),
          q.or(
            q.eq(q.field("status"), "pending_payment"),
            q.eq(q.field("status"), "payment_processing")
          )
        )
      )
      .collect();

    if (existingOrders.length > 0) {
      // Return existing order instead of creating duplicate
      return { orderId: existingOrders[0]._id };
    }

    const orderId = await ctx.db.insert("orders", {
      listingId: args.listingId,
      buyerId: userId,
      sellerId: listing.sellerId,
      status: "pending_payment",
      priceCents: listing.priceCents,
      stripeCheckoutSessionId: undefined,
      idempotencyKey: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return { orderId };
  },
});

/**
 * Mark an order as paid (called by webhook)
 */
export const markPaid = mutation({
  args: {
    orderId: v.id("orders"),
    stripeCheckoutSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Idempotency check - already paid
    if (order.status === "paid") {
      return { success: true, alreadyPaid: true };
    }

    // Only transition from valid states
    if (order.status !== "pending_payment" && order.status !== "payment_processing") {
      throw new Error(`Cannot mark order as paid from status: ${order.status}`);
    }

    const now = Date.now();

    // Update order status
    await ctx.db.patch(args.orderId, {
      status: "paid",
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      updatedAt: now,
    });

    // Mark listing as sold
    const listing = await ctx.db.get(order.listingId);
    if (listing) {
      await ctx.db.patch(order.listingId, {
        status: "sold",
        lockExpiresAt: undefined,
      });
    }

    return { success: true };
  },
});

/**
 * Mark an order as expired (called by releaseExpiredLocks or scheduled function)
 */
export const expireOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Idempotency check
    if (order.status === "expired") {
      return { success: true, alreadyExpired: true };
    }

    // Only expire pending/processing orders
    if (order.status !== "pending_payment" && order.status !== "payment_processing") {
      throw new Error(`Cannot expire order from status: ${order.status}`);
    }

    const now = Date.now();

    await ctx.db.patch(args.orderId, {
      status: "expired",
      updatedAt: now,
    });

    // Release the listing lock if it's still locked
    const listing = await ctx.db.get(order.listingId);
    if (listing && listing.status === "locked") {
      await ctx.db.patch(order.listingId, {
        status: "available",
        lockExpiresAt: undefined,
      });
    }

    return { success: true };
  },
});

/**
 * Mark an order as cancelled
 */
export const cancelOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Only buyer or seller can cancel
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new Error("Only buyer or seller can cancel the order");
    }

    // Idempotency check
    if (order.status === "cancelled") {
      return { success: true, alreadyCancelled: true };
    }

    // Can only cancel pending/processing orders
    if (order.status !== "pending_payment" && order.status !== "payment_processing") {
      throw new Error(`Cannot cancel order from status: ${order.status}`);
    }

    const now = Date.now();

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      updatedAt: now,
    });

    // Release the listing lock
    const listing = await ctx.db.get(order.listingId);
    if (listing && listing.status === "locked") {
      await ctx.db.patch(order.listingId, {
        status: "available",
        lockExpiresAt: undefined,
      });
    }

    return { success: true };
  },
});

/**
 * Get order by ID
 */
export const getById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    return order;
  },
});

/**
 * Get orders for the current user (as buyer or seller)
 */
export const getMyOrders = query({
  args: {
    as: v.optional(v.union(v.literal("buyer"), v.literal("seller"))),
    status: v.optional(v.union(
      v.literal("pending_payment"),
      v.literal("payment_processing"),
      v.literal("paid"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("refunded")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const limit = args.limit ?? 50;
    const orders: Doc<"orders">[] = [];

    // Query as buyer
    if (!args.as || args.as === "buyer") {
      let query_ = ctx.db
        .query("orders")
        .withIndex("by_buyer", (q) => q.eq("buyerId", userId));

      if (args.status) {
        query_ = ctx.db
          .query("orders")
          .withIndex("by_status", (q) => q.eq("status", args.status!));
      }

      const buyerOrders = await query_.take(limit);
      orders.push(...buyerOrders);
    }

    // Query as seller
    if (!args.as || args.as === "seller") {
      let query_ = ctx.db
        .query("orders")
        .withIndex("by_seller", (q) => q.eq("sellerId", userId));

      if (args.status) {
        query_ = query_.filter((q) => q.eq(q.field("status"), args.status!));
      }

      const sellerOrders = await query_.take(limit);
      orders.push(...sellerOrders);
    }

    // Sort by createdAt descending
    orders.sort((a, b) => b.createdAt - a.createdAt);

    return orders.slice(0, limit);
  },
});

/**
 * Get order by Stripe checkout session ID
 */
export const getByStripeSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripeSession", (q) =>
        q.eq("stripeCheckoutSessionId", args.sessionId)
      )
      .unique();
    return order;
  },
});

/**
 * Get order with listing details by Stripe checkout session ID
 * Returns order enriched with listing title for display
 */
export const getWithListingByStripeSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripeSession", (q) =>
        q.eq("stripeCheckoutSessionId", args.sessionId)
      )
      .unique();

    if (!order) {
      return null;
    }

    // Fetch listing details
    const listing = await ctx.db.get(order.listingId);

    return {
      ...order,
      listingTitle: listing?.title || "Unknown Item",
      listingImageUrl: listing?.imageUrl,
    };
  },
});

/**
 * Get order with listing details by order ID
 */
export const getWithListingById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      return null;
    }

    // Fetch listing details
    const listing = await ctx.db.get(order.listingId);

    return {
      ...order,
      listingTitle: listing?.title || "Unknown Item",
      listingImageUrl: listing?.imageUrl,
    };
  },
});

/**
 * Update order with Stripe checkout session ID
 */
export const setStripeSession = mutation({
  args: {
    orderId: v.id("orders"),
    stripeCheckoutSessionId: v.string(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      idempotencyKey: args.idempotencyKey,
      status: "payment_processing",
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
