import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * State machine types for Lock It In Trading Cards platform
 */

// ListingStatus: available | locked | sold | delisted
const ListingStatus = v.union(
  v.literal("available"),
  v.literal("locked"),
  v.literal("sold"),
  v.literal("delisted")
);

// OrderStatus: pending_payment | payment_processing | paid | cancelled | expired | refunded
const OrderStatus = v.union(
  v.literal("pending_payment"),
  v.literal("payment_processing"),
  v.literal("paid"),
  v.literal("cancelled"),
  v.literal("expired"),
  v.literal("refunded")
);

// IdentityStatus: unverified | pending | verified | failed
const IdentityStatus = v.union(
  v.literal("unverified"),
  v.literal("pending"),
  v.literal("verified"),
  v.literal("failed")
);

// GradingStatus: none | requested | in_transit | received | graded | returned
const GradingStatus = v.union(
  v.literal("none"),
  v.literal("requested"),
  v.literal("in_transit"),
  v.literal("received"),
  v.literal("graded"),
  v.literal("returned")
);

// CategoryGroup for listings
const CategoryGroup = v.union(
  v.literal("tcg"),
  v.literal("sports"),
  v.literal("other")
);

// GradedStatus for listings (raw vs graded)
const GradedStatus = v.union(
  v.literal("raw"),
  v.literal("graded")
);

export default defineSchema({
  /**
   * Users table - synced from Clerk
   * Tracks phone verification, identity status, and location
   */
  users: defineTable({
    clerkId: v.string(),
    phone: v.optional(v.string()),
    phoneVerifiedAt: v.optional(v.number()), // Unix timestamp in ms
    identityStatus: IdentityStatus,
    identitySessionId: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()), // 2-letter state code
    metro: v.optional(v.string()), // Metro area name
    createdAt: v.number(), // Unix timestamp in ms
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_metro", ["metro"])
    .index("by_identityStatus", ["identityStatus"]),

  /**
   * Listings table - trading card listings
   * Supports filtering by category, location, and graded status
   */
  listings: defineTable({
    title: v.string(),
    priceCents: v.number(),
    currency: v.string(), // e.g., "usd"
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()), // Fallback/external URL
    categoryGroup: CategoryGroup,
    category: v.string(), // Specific category name
    gradedStatus: GradedStatus,
    gradeCompany: v.optional(v.string()), // e.g., "PSA", "BGS"
    gradeValue: v.optional(v.number()), // e.g., 10, 9.5
    sellerId: v.id("users"),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    metro: v.optional(v.string()),
    status: ListingStatus,
    lockExpiresAt: v.optional(v.number()), // Unix timestamp in ms for lock TTL
    createdAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_status", ["status"])
    .index("by_categoryGroup", ["categoryGroup"])
    .index("by_category", ["category"])
    .index("by_gradedStatus", ["gradedStatus"])
    .index("by_metro", ["metro"])
    .index("by_state", ["state"])
    .index("by_status_category", ["status", "categoryGroup", "category"])
    .index("by_lockExpiresAt", ["lockExpiresAt"]),

  /**
   * Orders table - purchase orders
   * Tracks payment status and Stripe checkout session
   */
  orders: defineTable({
    listingId: v.id("listings"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    status: OrderStatus,
    priceCents: v.number(),
    stripeCheckoutSessionId: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()), // For Stripe idempotency
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_listing", ["listingId"])
    .index("by_status", ["status"])
    .index("by_stripeSession", ["stripeCheckoutSessionId"])
    .index("by_idempotencyKey", ["idempotencyKey"]),

  /**
   * GradingRequests table - optional post-purchase grading service
   */
  gradingRequests: defineTable({
    orderId: v.id("orders"),
    listingId: v.id("listings"),
    buyerId: v.id("users"),
    status: GradingStatus,
    partnerRef: v.optional(v.string()), // External grading partner reference
    gradeCompany: v.optional(v.string()),
    gradeValue: v.optional(v.number()),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_buyer", ["buyerId"])
    .index("by_listing", ["listingId"])
    .index("by_status", ["status"])
    .index("by_partnerRef", ["partnerRef"]),

  /**
   * IdentityChecks table - Stripe Identity verification sessions
   */
  identityChecks: defineTable({
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
    processedAt: v.optional(v.number()), // For webhook idempotency
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripeSession", ["stripeSessionId"])
    .index("by_status", ["status"]),

  /**
   * WebhookEvents table - for idempotency
   */
  webhookEvents: defineTable({
    eventId: v.string(), // Stripe event ID
    eventType: v.string(),
    processedAt: v.number(),
    metadata: v.optional(v.record(v.string(), v.any())),
  }).index("by_eventId", ["eventId"]),
});
