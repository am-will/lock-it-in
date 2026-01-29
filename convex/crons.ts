import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

/**
 * Scheduled jobs for Lock It In Trading Cards
 */

const crons = cronJobs();

/**
 * Release expired listing locks every minute
 * This ensures locks are cleaned up even if webhooks fail
 */
crons.interval(
  "release expired locks",
  { minutes: 1 },
  api.listings.releaseExpiredLocks,
  { limit: 100 }
);

/**
 * Clean up old webhook events daily
 * Keeps the webhookEvents table from growing too large
 */
crons.interval(
  "cleanup old webhook events",
  { hours: 24 },
  api.webhooks.cleanupOldEvents,
  { olderThanMs: 7 * 24 * 60 * 60 * 1000 } // 7 days
);

export default crons;
