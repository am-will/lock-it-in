/**
 * convexClient.ts
 * 
 * Singleton ConvexReactClient instance for use throughout the application.
 * This client connects to the Convex backend and handles real-time
 * subscriptions, mutations, and authentication.
 */

import { ConvexReactClient } from "convex/react";

const CONVEX_URL = import.meta.env.PUBLIC_CONVEX_URL;

// Use placeholder for build-time; runtime will validate
const FALLBACK_URL = "https://placeholder.convex.cloud";

if (!CONVEX_URL && import.meta.env.DEV) {
  console.warn(
    "Missing PUBLIC_CONVEX_URL environment variable. " +
    "Please set it in your .env file to your Convex deployment URL."
  );
}

/**
 * Singleton ConvexReactClient instance.
 * 
 * This client is shared across all React components and islands to maintain
 * a single connection to the Convex backend. It automatically handles:
 * - WebSocket connection management
 * - Authentication token synchronization (via ConvexProviderWithClerk)
 * - Real-time query subscriptions
 * - Optimistic updates for mutations
 */
export const convexClient = new ConvexReactClient(CONVEX_URL || FALLBACK_URL, {
  // Enable unsaved changes warning in development
  unsavedChangesWarning: import.meta.env.DEV,
});

/**
 * Re-export the client as default for convenience.
 */
export default convexClient;
