import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * User management functions
 * Syncs users from Clerk and manages identity/verification status
 */

/**
 * Upsert a user from Clerk auth data
 * Called after phone verification to sync user data
 */
export const upsertFromClerk = mutation({
  args: {
    clerkId: v.string(),
    phone: v.optional(v.string()),
    phoneVerifiedAt: v.optional(v.number()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    metro: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const now = Date.now();

    if (existingUser) {
      // Update existing user
      const updateData: Partial<typeof args> = {};
      if (args.phone !== undefined) updateData.phone = args.phone;
      if (args.phoneVerifiedAt !== undefined) updateData.phoneVerifiedAt = args.phoneVerifiedAt;
      if (args.city !== undefined) updateData.city = args.city;
      if (args.state !== undefined) updateData.state = args.state;
      if (args.metro !== undefined) updateData.metro = args.metro;

      await ctx.db.patch(existingUser._id, updateData);
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        phone: args.phone,
        phoneVerifiedAt: args.phoneVerifiedAt,
        identityStatus: "unverified",
        identitySessionId: undefined,
        city: args.city,
        state: args.state,
        metro: args.metro,
        createdAt: now,
      });
      return userId;
    }
  },
});

/**
 * Get the current authenticated user
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      clerkId: user.clerkId,
      phone: user.phone,
      phoneVerifiedAt: user.phoneVerifiedAt,
      identityStatus: user.identityStatus,
      identitySessionId: user.identitySessionId,
      city: user.city,
      state: user.state,
      metro: user.metro,
      createdAt: user.createdAt,
    };
  },
});

/**
 * Get a user by their Clerk ID
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    return user;
  },
});

/**
 * Update user's identity status
 */
export const updateIdentityStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("unverified"),
      v.literal("pending"),
      v.literal("verified"),
      v.literal("failed")
    ),
    identitySessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: {
      identityStatus: "unverified" | "pending" | "verified" | "failed";
      identitySessionId?: string;
    } = {
      identityStatus: args.status,
    };

    if (args.identitySessionId !== undefined) {
      updateData.identitySessionId = args.identitySessionId;
    }

    await ctx.db.patch(args.userId, updateData);
    return { success: true };
  },
});
