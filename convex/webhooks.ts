import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Webhook event tracking for idempotency
 * Prevents duplicate processing of Stripe webhooks
 */

/**
 * Get a webhook event by its Stripe event ID
 */
export const getEventById = query({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("webhookEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();
    return event;
  },
});

/**
 * Record a processed webhook event
 */
export const recordEvent = mutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const eventId = await ctx.db.insert("webhookEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      processedAt: now,
      metadata: args.metadata,
    });

    return { eventId };
  },
});

/**
 * Clean up old webhook events (for maintenance)
 * Can be called by a scheduled function
 */
export const cleanupOldEvents = mutation({
  args: {
    olderThanMs: v.number(), // Delete events older than this many milliseconds
  },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - args.olderThanMs;

    // Get old events
    const oldEvents = await ctx.db
      .query("webhookEvents")
      .filter((q) => q.lt(q.field("processedAt"), cutoffTime))
      .collect();

    // Delete them
    for (const event of oldEvents) {
      await ctx.db.delete(event._id);
    }

    return { deletedCount: oldEvents.length };
  },
});
