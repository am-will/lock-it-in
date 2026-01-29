/**
 * Checkout types for Lock It In Trading Cards
 * TypeScript interfaces for checkout flow and components
 */

import type { Listing } from "./marketplace";

/**
 * Checkout state for managing the checkout process
 */
export interface CheckoutState {
  /** Whether checkout is in progress */
  isLoading: boolean;
  /** Error message if checkout failed */
  error: string | null;
}

/**
 * Props for CheckoutPanel component
 */
export interface CheckoutPanelProps {
  /** The order ID to checkout */
  orderId: string;
  /** The listing being purchased */
  listing: Listing | null;
  /** Callback when checkout completes successfully */
  onCheckoutComplete?: () => void;
  /** Callback when checkout encounters an error */
  onCheckoutError?: (error: string) => void;
}

/**
 * Checkout session result from Convex
 */
export interface CheckoutSessionResult {
  /** Stripe Checkout session URL */
  sessionUrl: string | null;
  /** Stripe Checkout session ID */
  sessionId: string;
  /** Whether grading is included */
  includeGrading?: boolean;
}

/**
 * Order summary for display
 */
export interface OrderSummary {
  /** Line items in the order */
  items: OrderItem[];
  /** Subtotal before fees */
  subtotalCents: number;
  /** Grading fee if applicable */
  gradingFeeCents: number;
  /** Shipping cost */
  shippingCents: number;
  /** Total amount */
  totalCents: number;
}

/**
 * Individual order item
 */
export interface OrderItem {
  /** Item name */
  name: string;
  /** Item description */
  description?: string;
  /** Price in cents */
  priceCents: number;
  /** Quantity */
  quantity: number;
  /** Image URL */
  imageUrl?: string;
}

/**
 * Checkout options
 */
export interface CheckoutOptions {
  /** Whether to include grading service */
  includeGrading: boolean;
  /** Grading fee in cents (if grading enabled) */
  gradingPriceCents?: number;
  /** Success redirect URL */
  successUrl: string;
  /** Cancel redirect URL */
  cancelUrl: string;
}
