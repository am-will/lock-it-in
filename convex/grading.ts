import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

/**
 * Grading request management
 * Handles optional post-purchase grading service
 */

/**
 * Create a grading request after successful payment
 */
export const createRequest = mutation({
  args: {
    orderId: v.id("orders"),
    gradeCompany: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    // Fetch order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Verify ownership
    if (order.buyerId !== userId) {
      throw new Error("Not authorized to create grading request for this order");
    }

    // Verify order is paid
    if (order.status !== "paid") {
      throw new Error("Order must be paid before creating grading request");
    }

    // Check if grading request already exists
    const existingRequests = await ctx.db
      .query("gradingRequests")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    if (existingRequests.length > 0) {
      throw new Error("Grading request already exists for this order");
    }

    const now = Date.now();

    const gradingRequestId = await ctx.db.insert("gradingRequests", {
      orderId: args.orderId,
      listingId: order.listingId,
      buyerId: userId,
      status: "requested",
      partnerRef: undefined,
      gradeCompany: args.gradeCompany,
      gradeValue: undefined,
      trackingNumber: undefined,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return { gradingRequestId };
  },
});

/**
 * Get grading request by ID
 */
export const getById = query({
  args: {
    gradingRequestId: v.id("gradingRequests"),
  },
  handler: async (ctx, args) => {
    const gradingRequest = await ctx.db.get(args.gradingRequestId);
    return gradingRequest;
  },
});

/**
 * Get grading requests for current user
 */
export const getMyRequests = query({
  args: {
    status: v.optional(v.union(
      v.literal("none"),
      v.literal("requested"),
      v.literal("in_transit"),
      v.literal("received"),
      v.literal("graded"),
      v.literal("returned")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    let query_ = ctx.db
      .query("gradingRequests")
      .withIndex("by_buyer", (q) => q.eq("buyerId", userId));

    if (args.status) {
      query_ = ctx.db
        .query("gradingRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!));
    }

    const limit = args.limit ?? 50;
    const requests = await query_.take(limit);

    return requests;
  },
});

/**
 * Get grading request by order ID
 */
export const getByOrder = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("gradingRequests")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .unique();
    return request;
  },
});

/**
 * Update grading status (internal/admin use)
 */
export const updateStatus = mutation({
  args: {
    gradingRequestId: v.id("gradingRequests"),
    status: v.union(
      v.literal("requested"),
      v.literal("in_transit"),
      v.literal("received"),
      v.literal("graded"),
      v.literal("returned")
    ),
    partnerRef: v.optional(v.string()),
    gradeValue: v.optional(v.number()),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: {
      status: typeof args.status;
      updatedAt: number;
      partnerRef?: string;
      gradeValue?: number;
      trackingNumber?: string;
      notes?: string;
    } = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.partnerRef !== undefined) updateData.partnerRef = args.partnerRef;
    if (args.gradeValue !== undefined) updateData.gradeValue = args.gradeValue;
    if (args.trackingNumber !== undefined) updateData.trackingNumber = args.trackingNumber;
    if (args.notes !== undefined) updateData.notes = args.notes;

    await ctx.db.patch(args.gradingRequestId, updateData);
    return { success: true };
  },
});

/**
 * Submit card for grading to partner (action)
 * Calls the grading partner API stub
 */
export const submitToPartner = action({
  args: {
    gradingRequestId: v.id("gradingRequests"),
  },
  handler: async (ctx, args) => {
    // Fetch grading request
    const request = await ctx.runQuery(api.grading.getById, {
      gradingRequestId: args.gradingRequestId,
    });

    if (!request) {
      throw new Error("Grading request not found");
    }

    // Fetch listing details
    const listing = await ctx.runQuery(api.listings.getById, {
      listingId: request.listingId,
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    // Call grading partner stub
    const result = await ctx.runAction(api.gradingPartner.submitForGrading, {
      gradingRequestId: args.gradingRequestId,
      cardTitle: listing.title,
      category: listing.category,
      gradeCompany: request.gradeCompany,
      notes: request.notes,
    });

    // Update request with partner reference
    if (result.success && result.partnerRef) {
      await ctx.runMutation(api.grading.updateStatus, {
        gradingRequestId: args.gradingRequestId,
        status: "in_transit",
        partnerRef: result.partnerRef,
      });
    }

    return result;
  },
});
