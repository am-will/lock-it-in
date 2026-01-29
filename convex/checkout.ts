import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

/**
 * Stripe Checkout integration
 * Creates checkout sessions with idempotency
 */

/**
 * Create a Stripe Checkout session
 * Idempotent - uses orderId as idempotency key
 */
export const createCheckoutSession = action({
  args: {
    orderId: v.id("orders"),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to checkout");
    }

    // Fetch order
    const order = await ctx.runQuery(api.orders.getById, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Verify ownership
    if (order.buyerId !== userId) {
      throw new Error("Not authorized to checkout this order");
    }

    // Check order status
    if (order.status === "paid") {
      throw new Error("Order already paid");
    }

    if (order.status === "cancelled" || order.status === "expired") {
      throw new Error("Order is no longer valid");
    }

    // Fetch listing for product details
    const listing = await ctx.runQuery(api.listings.getById, {
      listingId: order.listingId,
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    // Verify listing is still locked
    const now = Date.now();
    if (listing.status !== "locked" || !listing.lockExpiresAt || listing.lockExpiresAt < now) {
      throw new Error("Listing lock has expired");
    }

    // Initialize Stripe
    const Stripe = await import("stripe");
    const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    });

    // Use orderId as idempotency key for Stripe
    const idempotencyKey = `order_${args.orderId}_${Math.floor(now / 1000 / 60 / 10)}`; // 10-minute window

    // Check if we already have a session for this order
    if (order.stripeCheckoutSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          order.stripeCheckoutSessionId
        );

        // Return existing session if still valid
        if (existingSession.status === "open") {
          return {
            sessionUrl: existingSession.url,
            sessionId: existingSession.id,
          };
        }
      } catch (e) {
        // Session not found or expired, continue to create new one
      }
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: listing.currency || "usd",
              product_data: {
                name: listing.title,
                images: listing.imageUrl ? [listing.imageUrl] : undefined,
              },
              unit_amount: order.priceCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: args.successUrl,
        cancel_url: args.cancelUrl,
        metadata: {
          orderId: args.orderId,
          listingId: order.listingId,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
        },
        expires_at: Math.floor(listing.lockExpiresAt! / 1000), // Expire with lock
      },
      {
        idempotencyKey,
      }
    );

    // Store session ID in order
    await ctx.runMutation(api.orders.setStripeSession, {
      orderId: args.orderId,
      stripeCheckoutSessionId: session.id,
      idempotencyKey,
    });

    return {
      sessionUrl: session.url,
      sessionId: session.id,
    };
  },
});

/**
 * Create checkout session with grading option
 * Includes the grading service as a line item
 */
export const createCheckoutSessionWithGrading = action({
  args: {
    orderId: v.id("orders"),
    successUrl: v.string(),
    cancelUrl: v.string(),
    includeGrading: v.boolean(),
    gradingPriceCents: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to checkout");
    }

    // Fetch order
    const order = await ctx.runQuery(api.orders.getById, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Verify ownership
    if (order.buyerId !== userId) {
      throw new Error("Not authorized to checkout this order");
    }

    // Check order status
    if (order.status === "paid") {
      throw new Error("Order already paid");
    }

    if (order.status === "cancelled" || order.status === "expired") {
      throw new Error("Order is no longer valid");
    }

    // Fetch listing for product details
    const listing = await ctx.runQuery(api.listings.getById, {
      listingId: order.listingId,
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    // Verify listing is still locked
    const now = Date.now();
    if (listing.status !== "locked" || !listing.lockExpiresAt || listing.lockExpiresAt < now) {
      throw new Error("Listing lock has expired");
    }

    // Initialize Stripe
    const Stripe = await import("stripe");
    const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    });

    // Use orderId as idempotency key for Stripe
    const idempotencyKey = `order_grading_${args.orderId}_${Math.floor(now / 1000 / 60 / 10)}`;

    // Build line items
    const lineItems: Stripe.default.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: listing.currency || "usd",
          product_data: {
            name: listing.title,
            images: listing.imageUrl ? [listing.imageUrl] : undefined,
          },
          unit_amount: order.priceCents,
        },
        quantity: 1,
      },
    ];

    // Add grading service if requested
    if (args.includeGrading) {
      const gradingPrice = args.gradingPriceCents || 5000; // Default $50
      lineItems.push({
        price_data: {
          currency: listing.currency || "usd",
          product_data: {
            name: "Professional Grading Service",
            description: "Send your card to our official grading partner",
          },
          unit_amount: gradingPrice,
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: args.successUrl,
        cancel_url: args.cancelUrl,
        metadata: {
          orderId: args.orderId,
          listingId: order.listingId,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
          includeGrading: args.includeGrading ? "true" : "false",
        },
        expires_at: Math.floor(listing.lockExpiresAt! / 1000),
      },
      {
        idempotencyKey,
      }
    );

    // Store session ID in order
    await ctx.runMutation(api.orders.setStripeSession, {
      orderId: args.orderId,
      stripeCheckoutSessionId: session.id,
      idempotencyKey,
    });

    return {
      sessionUrl: session.url,
      sessionId: session.id,
      includeGrading: args.includeGrading,
    };
  },
});
