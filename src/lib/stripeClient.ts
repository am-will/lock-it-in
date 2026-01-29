/**
 * stripeClient.ts
 * 
 * Client-side Stripe.js helpers for payment processing and identity verification.
 * Provides lazy-loaded Stripe instance and helper functions for common operations.
 */

import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Singleton Stripe instance (lazy-loaded)
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get or create the Stripe.js instance.
 * Lazily loads Stripe.js on first call to avoid unnecessary script loading.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error(
        "Missing PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable. " +
        "Please check your .env file."
      );
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

/**
 * Reset the Stripe instance (useful for testing or re-initialization).
 */
export function resetStripe(): void {
  stripePromise = null;
}

// ============================================
// Stripe Checkout Helpers
// ============================================

interface CheckoutRedirectOptions {
  /** The Checkout Session URL from your backend (createCheckoutSession action) */
  checkoutUrl: string;
}

/**
 * Redirect to Stripe Checkout.
 * 
 * Note: Modern Stripe Checkout uses server-side session creation.
 * Your backend (convex/checkout.ts) creates the session and returns the URL.
 * This helper simply redirects to that URL.
 * 
 * @param options - Contains the Checkout Session URL from your backend
 * @returns Result of the redirect attempt
 */
export async function redirectToCheckout(
  options: CheckoutRedirectOptions
): Promise<{ error?: Error }> {
  // Verify Stripe is loaded (validates the publishable key)
  const stripe = await getStripe();
  
  if (!stripe) {
    return { error: new Error("Stripe failed to initialize") };
  }

  // Redirect to the Checkout Session URL
  // This is the modern approach: server creates session, client redirects
  try {
    window.location.href = options.checkoutUrl;
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// ============================================
// Stripe Identity Helpers
// ============================================

interface IdentityVerificationOptions {
  /** The Identity Verification Session client_secret from your backend */
  clientSecret: string;
}

/**
 * Open Stripe Identity verification flow.
 * 
 * This launches the hosted identity verification modal where users
 * complete document/selfie verification required for high-value purchases.
 * 
 * @param options - Contains the Identity Session client_secret from your backend
 * @returns Result of the verification launch
 */
export async function launchIdentityVerification(
  options: IdentityVerificationOptions
): Promise<{ error?: Error; verificationSession?: unknown }> {
  const stripe = await getStripe();
  
  if (!stripe) {
    return { error: new Error("Stripe failed to initialize") };
  }

  try {
    // Stripe Identity verification uses the verifyIdentity method
    const result = await stripe.verifyIdentity(options.clientSecret);
    
    if (result.error) {
      return { error: new Error(result.error.message) };
    }

    return { verificationSession: result.verificationSession };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// ============================================
// Payment Element Helpers (for future use)
// ============================================

interface CreatePaymentElementOptions {
  clientSecret: string;
  appearance?: {
    theme?: "stripe" | "night" | "flat";
    variables?: Record<string, string>;
  };
}

/**
 * Create a Payment Element instance for embedded checkout.
 * This is an alternative to redirect-based Checkout for inline payment forms.
 * 
 * @param options - Configuration for the payment element
 * @returns Elements instance or error
 */
export async function createPaymentElements(
  options: CreatePaymentElementOptions
): Promise<{ error?: Error; elements?: unknown }> {
  const stripe = await getStripe();
  
  if (!stripe) {
    return { error: new Error("Stripe failed to initialize") };
  }

  try {
    const elements = stripe.elements({
      clientSecret: options.clientSecret,
      appearance: options.appearance || {
        theme: "stripe",
      },
    });

    return { elements };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// ============================================
// Type Exports
// ============================================

export type { CheckoutRedirectOptions, IdentityVerificationOptions, CreatePaymentElementOptions };
