import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";

/**
 * Listing management functions
 * Includes atomic locking, filtering, and state transitions
 */

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * List filtered listings with optional filters
 * Supports filtering by category, location, graded status, and price range
 */
export const listFiltered = query({
  args: {
    categoryGroup: v.optional(v.union(
      v.literal("tcg"),
      v.literal("sports"),
      v.literal("other")
    )),
    category: v.optional(v.string()),
    state: v.optional(v.string()),
    metro: v.optional(v.string()),
    gradedStatus: v.optional(v.union(v.literal("raw"), v.literal("graded"))),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query_ = ctx.db.query("listings");

    // Apply status filter - only show available listings
    // (locked listings are also visible but marked as such)
    query_ = query_.withIndex("by_status", (q) => 
      q.eq("status", "available")
    );

    // Apply category group filter
    if (args.categoryGroup) {
      if (args.category) {
        // Use composite index if both filters present
        query_ = ctx.db.query("listings").withIndex("by_status_category", (q) =>
          q.eq("status", "available")
           .eq("categoryGroup", args.categoryGroup)
           .eq("category", args.category!)
        );
      } else {
        query_ = ctx.db.query("listings").withIndex("by_categoryGroup", (q) =>
          q.eq("categoryGroup", args.categoryGroup)
        );
      }
    }

    // Apply graded status filter
    if (args.gradedStatus) {
      query_ = ctx.db.query("listings").withIndex("by_gradedStatus", (q) =>
        q.eq("gradedStatus", args.gradedStatus)
      );
    }

    // Apply location filters
    if (args.metro) {
      query_ = ctx.db.query("listings").withIndex("by_metro", (q) =>
        q.eq("metro", args.metro)
      );
    } else if (args.state) {
      query_ = ctx.db.query("listings").withIndex("by_state", (q) =>
        q.eq("state", args.state)
      );
    }

    // Collect and filter results
    const limit = args.limit ?? 50;
    const listings: Doc<"listings">[] = [];
    let cursor: string | undefined = undefined;

    // We need to paginate and filter manually for complex queries
    // For production, consider using more specific indexes
    const allListings = await query_.take(limit + 1);
    
    for (const listing of allListings.slice(0, limit)) {
      // Skip if not available (unless we want to show locked too)
      if (listing.status !== "available" && listing.status !== "locked") {
        continue;
      }

      // Check price range
      if (args.minPrice !== undefined && listing.priceCents < args.minPrice) {
        continue;
      }
      if (args.maxPrice !== undefined && listing.priceCents > args.maxPrice) {
        continue;
      }

      listings.push(listing);
    }

    if (allListings.length > limit) {
      cursor = allListings[limit]._id;
    }

    return {
      listings,
      cursor,
    };
  },
});

/**
 * Create a new listing
 * Requires authenticated user
 */
export const createListing = mutation({
  args: {
    title: v.string(),
    priceCents: v.number(),
    currency: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    categoryGroup: v.union(
      v.literal("tcg"),
      v.literal("sports"),
      v.literal("other")
    ),
    category: v.string(),
    gradedStatus: v.union(v.literal("raw"), v.literal("graded")),
    gradeCompany: v.optional(v.string()),
    gradeValue: v.optional(v.number()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    metro: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create a listing");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Require phone verification for listing
    if (!user.phoneVerifiedAt) {
      throw new Error("Phone verification required to create listings");
    }

    const now = Date.now();

    const listingId = await ctx.db.insert("listings", {
      title: args.title,
      priceCents: args.priceCents,
      currency: args.currency,
      imageStorageId: args.imageStorageId,
      imageUrl: args.imageUrl,
      categoryGroup: args.categoryGroup,
      category: args.category,
      gradedStatus: args.gradedStatus,
      gradeCompany: args.gradeCompany,
      gradeValue: args.gradeValue,
      sellerId: userId,
      city: args.city ?? user.city,
      state: args.state ?? user.state,
      metro: args.metro ?? user.metro,
      status: "available",
      lockExpiresAt: undefined,
      createdAt: now,
    });

    return { listingId };
  },
});

/**
 * Atomically lock a listing for purchase
 * Implements race-condition-safe locking with TTL
 */
export const lockListing = mutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to lock a listing");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    // Check if listing is available
    if (listing.status === "sold") {
      throw new Error("Listing already sold");
    }

    if (listing.status === "delisted") {
      throw new Error("Listing has been delisted");
    }

    // Check for active lock
    const now = Date.now();
    if (listing.status === "locked" && listing.lockExpiresAt && listing.lockExpiresAt > now) {
      throw new Error("Listing is currently locked by another buyer");
    }

    // Can't lock your own listing
    if (listing.sellerId === userId) {
      throw new Error("Cannot lock your own listing");
    }

    // Atomic lock update
    const lockExpiresAt = now + LOCK_DURATION_MS;
    await ctx.db.patch(args.listingId, {
      status: "locked",
      lockExpiresAt,
    });

    return {
      success: true,
      lockExpiresAt,
    };
  },
});

/**
 * Release expired locks
 * Can be called manually or scheduled
 * Returns count of released locks
 */
export const releaseExpiredLocks = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = args.limit ?? 100;

    // Find expired locks
    const expiredListings = await ctx.db
      .query("listings")
      .withIndex("by_status", (q) => q.eq("status", "locked"))
      .filter((q) => q.lt(q.field("lockExpiresAt"), now))
      .take(limit);

    let releasedCount = 0;

    for (const listing of expiredListings) {
      // Double-check the lock is still expired (prevent race conditions)
      if (listing.lockExpiresAt && listing.lockExpiresAt < now) {
        await ctx.db.patch(listing._id, {
          status: "available",
          lockExpiresAt: undefined,
        });
        releasedCount++;

        // Also expire any pending orders for this listing
        const pendingOrders = await ctx.db
          .query("orders")
          .withIndex("by_listing", (q) => q.eq("listingId", listing._id))
          .filter((q) =>
            q.or(
              q.eq(q.field("status"), "pending_payment"),
              q.eq(q.field("status"), "payment_processing")
            )
          )
          .collect();

        for (const order of pendingOrders) {
          await ctx.db.patch(order._id, {
            status: "expired",
            updatedAt: now,
          });
        }
      }
    }

    return { releasedCount };
  },
});

/**
 * Delist a listing (seller only)
 */
export const delist = mutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.sellerId !== userId) {
      throw new Error("Only the seller can delist");
    }

    if (listing.status === "sold") {
      throw new Error("Cannot delist a sold listing");
    }

    await ctx.db.patch(args.listingId, {
      status: "delisted",
      lockExpiresAt: undefined,
    });

    return { success: true };
  },
});

/**
 * Get a single listing by ID
 */
export const getById = query({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    return listing;
  },
});
