/**
 * CheckoutPanel.tsx
 * 
 * Main checkout panel component that integrates with the marketplace.
 * Shows order summary, payment options, and grading toggle.
 * Calls checkout.createCheckoutSessionWithGrading when grading is selected.
 */

import React, { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { GradingToggle } from "./GradingToggle";
import { VerifiedGate } from "./VerifiedGate";
import type { CheckoutPanelProps, CheckoutState } from "../../types/checkout";

const DEFAULT_GRADING_FEE_CENTS = 7500; // $75

export function CheckoutPanel({
  orderId,
  listing,
  onCheckoutComplete,
  onCheckoutError,
}: CheckoutPanelProps) {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    isLoading: false,
    error: null,
  });
  const [includeGrading, setIncludeGrading] = useState(false);
  const [gradingFeeCents] = useState(DEFAULT_GRADING_FEE_CENTS);

  // Convex mutations
  const createCheckoutSession = useMutation(api.checkout.createCheckoutSessionWithGrading);

  // Get current user to check verification status
  const user = useQuery(api.users.getCurrent);

  const handleCheckout = useCallback(async () => {
    if (!orderId || !listing) return;

    setCheckoutState({ isLoading: true, error: null });

    try {
      const successUrl = `${window.location.origin}/checkout/success?orderId=${orderId}`;
      const cancelUrl = `${window.location.origin}/checkout/cancel?orderId=${orderId}`;

      const result = await createCheckoutSession({
        orderId: orderId as Id<"orders">,
        successUrl,
        cancelUrl,
        includeGrading,
        gradingPriceCents: includeGrading ? gradingFeeCents : undefined,
      });

      if (result.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.sessionUrl;
        onCheckoutComplete?.();
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Checkout failed";
      setCheckoutState({ isLoading: false, error: errorMessage });
      onCheckoutError?.(errorMessage);
    }
  }, [orderId, listing, includeGrading, gradingFeeCents, createCheckoutSession, onCheckoutComplete, onCheckoutError]);

  const isIdentityVerified = user?.identityStatus === "verified";
  const canCheckout = isIdentityVerified && !checkoutState.isLoading;

  // Calculate totals
  const subtotal = listing?.priceCents ?? 0;
  const gradingFee = includeGrading ? gradingFeeCents : 0;
  const total = subtotal + gradingFee;

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="neo-card p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl mb-1">Complete Your Purchase</h2>
        <p className="text-sm text-muted">
          Review your order and proceed to payment
        </p>
      </div>

      {/* Order Summary */}
      <div className="neo-recess-sm rounded-xl p-4 mb-6">
        <h3 className="font-display font-semibold text-sm mb-4">Order Summary</h3>

        {listing && (
          <div className="flex gap-4 mb-4">
            {/* Image Placeholder */}
            <div className="neo-recess-sm w-20 h-24 rounded-lg flex items-center justify-center shrink-0">
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-2xl">🃏</span>
              )}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-semibold text-sm line-clamp-2">
                {listing.title}
              </h4>
              <p className="text-xs text-muted mt-1">
                {listing.category} • {listing.gradedStatus === "graded" ? "Graded" : "Raw"}
              </p>
              <p className="font-display font-bold text-lg mt-2">
                {formatPrice(listing.priceCents)}
              </p>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2 pt-4 border-t border-transparent">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          {includeGrading && (
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Grading Service</span>
              <span className="font-semibold text-accent-purple">
                +{formatPrice(gradingFee)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Shipping</span>
            <span className="font-semibold text-success">Free</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-transparent">
            <span>Total</span>
            <span className="text-accent-purple">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Grading Toggle */}
      <div className="mb-6">
        <GradingToggle
          isEnabled={includeGrading}
          onChange={setIncludeGrading}
          disabled={checkoutState.isLoading}
          estimatedFeeCents={gradingFeeCents}
        />
      </div>

      {/* Identity Verification Gate */}
      <VerifiedGate context="checkout" className="mb-6">
        <div className="neo-recess-sm rounded-xl p-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-3 text-success"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p className="font-semibold text-sm">Identity Verified</p>
          <p className="text-xs text-muted">You can proceed with checkout</p>
        </div>
      </VerifiedGate>

      {/* Error Message */}
      {checkoutState.error && (
        <div className="mb-4 p-4 neo-recess-sm rounded-xl bg-rose-50">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-rose-500 shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" x2="9" y1="9" y2="15" />
              <line x1="9" x2="15" y1="9" y2="15" />
            </svg>
            <p className="text-sm text-rose-700">{checkoutState.error}</p>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={!canCheckout}
        className={`
          w-full neo-action neo-action-lg
          ${!canCheckout ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {checkoutState.isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            <span>
              {isIdentityVerified
                ? `Pay ${formatPrice(total)}`
                : "Verify Identity to Continue"
              }
            </span>
          </>
        )}
      </button>

      {/* Secure Payment Notice */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Secure payment powered by Stripe</span>
      </div>

      {/* Grading Disclaimer (shown when grading selected) */}
      {includeGrading && (
        <div className="mt-4 p-3 neo-recess-sm rounded-xl bg-amber-50/50">
          <p className="text-[11px] text-amber-700/80 leading-relaxed text-center">
            By selecting grading, you agree to our grading terms. {" "}
            <strong>Lock It In does not guarantee grades</strong> for cards not processed through our official grading partner.
          </p>
        </div>
      )}
    </div>
  );
}

export default CheckoutPanel;
