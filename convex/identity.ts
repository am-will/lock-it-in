import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

/**
 * Identity verification functions
 * Integrates with Stripe Identity for US identity verification
 */

/**
 * Create a Stripe Identity verification session
 * Requires authenticated user
 */
export const createVerificationSession = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to start identity verification");
    }

    // Fetch user data
    const user = await ctx.runQuery(api.users.getCurrent, {});
    if (!user) {
      throw new Error("User not found");
    }

    // Check if already verified
    if (user.identityStatus === "verified") {
      return {
        alreadyVerified: true,
        clientSecret: null,
      };
    }

    // Require phone verification first
    if (!user.phoneVerifiedAt) {
      throw new Error("Phone verification required before identity verification");
    }

    // Initialize Stripe
    const Stripe = await import("stripe");
    const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    });

    // Create Stripe Identity verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: {
        userId: userId,
        clerkId: user.clerkId,
      },
    });

    // Store the session in our database
    await ctx.runMutation(api.identity._storeSession, {
      userId: userId,
      stripeSessionId: verificationSession.id,
      status: "created",
    });

    // Update user to pending status
    await ctx.runMutation(api.users.updateIdentityStatus, {
      userId: userId,
      status: "pending",
      identitySessionId: verificationSession.id,
    });

    return {
      alreadyVerified: false,
      clientSecret: verificationSession.client_secret,
      sessionId: verificationSession.id,
    };
  },
});

/**
 * Internal: Store identity check session
 */
export const _storeSession = mutation({
  args: {
    userId: v.id("users"),
    stripeSessionId: v.string(),
    status: v.union(
      v.literal("created"),
      v.literal("processing"),
      v.literal("verified"),
      v.literal("canceled"),
      v.literal("requires_input")
    ),
    verificationReportId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("identityChecks", {
      userId: args.userId,
      stripeSessionId: args.stripeSessionId,
      status: args.status,
      verificationReportId: args.verificationReportId,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Update identity status from webhook
 * Called by the Stripe webhook handler
 */
export const updateStatusFromWebhook = mutation({
  args: {
    stripeSessionId: v.string(),
    status: v.union(
      v.literal("verified"),
      v.literal("canceled"),
      v.literal("requires_input")
    ),
    verificationReportId: v.optional(v.string()),
    processedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Find the identity check record
    const identityCheck = await ctx.db
      .query("identityChecks")
      .withIndex("by_stripeSession", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .unique();

    if (!identityCheck) {
      throw new Error(`Identity check not found for session: ${args.stripeSessionId}`);
    }

    // Idempotency check
    if (identityCheck.processedAt) {
      return { success: true, alreadyProcessed: true };
    }

    // Update identity check record
    await ctx.db.patch(identityCheck._id, {
      status: args.status,
      verificationReportId: args.verificationReportId,
      processedAt: args.processedAt,
    });

    // Map to user identity status
    let userIdentityStatus: "unverified" | "pending" | "verified" | "failed";
    switch (args.status) {
      case "verified":
        userIdentityStatus = "verified";
        break;
      case "canceled":
        userIdentityStatus = "failed";
        break;
      case "requires_input":
        userIdentityStatus = "pending";
        break;
      default:
        userIdentityStatus = "unverified";
    }

    // Update user identity status
    await ctx.db.patch(identityCheck.userId, {
      identityStatus: userIdentityStatus,
    });

    return { success: true };
  },
});

/**
 * Get identity verification status for current user
 */
export const getMyStatus = query({
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

    // Get latest identity check if exists
    const latestCheck = await ctx.db
      .query("identityChecks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    return {
      identityStatus: user.identityStatus,
      identitySessionId: user.identitySessionId,
      latestCheck: latestCheck
        ? {
            status: latestCheck.status,
            createdAt: latestCheck.createdAt,
            processedAt: latestCheck.processedAt,
          }
        : null,
    };
  },
});

/**
 * Get identity check by Stripe session ID
 */
export const getByStripeSession = query({
  args: {
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const check = await ctx.db
      .query("identityChecks")
      .withIndex("by_stripeSession", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .unique();
    return check;
  },
});
