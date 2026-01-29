/// <reference types="astro/client" />

/**
 * Environment variable type definitions for Lock It In Trading Cards
 * 
 * This file extends the ImportMetaEnv interface to provide type safety
 * for environment variables used throughout the application.
 */

interface ImportMetaEnv {
  // ============================================
  // Convex Configuration
  // ============================================
  /** Convex deployment URL for client connections */
  readonly PUBLIC_CONVEX_URL: string;

  // ============================================
  // Clerk Authentication
  // ============================================
  /** Clerk publishable key for client-side auth */
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY: string;

  // ============================================
  // Site Configuration
  // ============================================
  /** Public site URL for redirects and webhooks */
  readonly PUBLIC_SITE_URL: string;

  // ============================================
  // Stripe Payment Processing
  // ============================================
  /** Stripe publishable key for client-side operations */
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
