/**
 * VerifiedGate.tsx
 * 
 * Component requiring identity verification for checkout and sensitive actions.
 * Checks identityStatus === "verified" before allowing access to children.
 */

import React, { useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { launchIdentityVerification } from "../../lib/stripeClient";

type IdentityStatus = "unverified" | "pending" | "verified" | "failed";
type VerificationContext = "checkout" | "high_value" | "withdrawal" | "custom";

interface VerifiedGateProps {
  children: React.ReactNode;
  context?: VerificationContext;
  customTitle?: string;
  customDescription?: string;
  fallback?: React.ReactNode;
  onVerificationStart?: () => void;
  onVerificationComplete?: () => void;
}

interface ContextConfig {
  icon: string;
  title: string;
  description: string;
  ctaText: string;
  requirementLevel: string;
}

const CONTEXT_CONFIG: Record<VerificationContext, ContextConfig> = {
  checkout: {
    icon: "🛡️",
    title: "Identity Verification Required",
    description: "To complete your purchase, we need to verify your identity. This is a one-time process.",
    ctaText: "Start Verification",
    requirementLevel: "Required for purchases",
  },
  high_value: {
    icon: "💎",
    title: "High-Value Transaction",
    description: "This high-value transaction requires identity verification.",
    ctaText: "Verify Identity",
    requirementLevel: "Required for high-value items",
  },
  withdrawal: {
    icon: "🏦",
    title: "Verify to Withdraw",
    description: "Identity verification is required for withdrawals.",
    ctaText: "Verify Identity",
    requirementLevel: "Required for withdrawals",
  },
  custom: {
    icon: "🔒",
    title: "Verification Required",
    description: "Please verify your identity to continue.",
    ctaText: "Verify Now",
    requirementLevel: "Identity verification required",
  },
};

export function VerifiedGate({ 
  children, 
  context = "checkout",
  customTitle,
  customDescription,
  fallback,
  onVerificationStart,
  onVerificationComplete,
}: VerifiedGateProps) {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrent);
  const createVerificationSession = useAction(api.identity.createVerificationSession);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoadingUser = !clerkLoaded || (isSignedIn && currentUser === undefined);
  const identityStatus: IdentityStatus = currentUser?.identityStatus || "unverified";
  const isVerified = identityStatus === "verified";
  const isPending = identityStatus === "pending";

  const handleStartVerification = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    onVerificationStart?.();

    try {
      const result = await createVerificationSession();

      if (!result.clientSecret) {
        throw new Error("Failed to create verification session");
      }

      await launchIdentityVerification(result.clientSecret);
    } catch (err: any) {
      console.error("Identity verification error:", err);
      setError(err.message || "Failed to start verification.");
    } finally {
      setIsLoading(false);
    }
  }, [createVerificationSession, onVerificationStart]);

  if (isVerified) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const config = CONTEXT_CONFIG[context];
  const title = customTitle || config.title;
  const description = customDescription || config.description;

  if (isLoadingUser) {
    return (
      <div className="neo-card max-w-md mx-auto text-center p-8">
        <div className="neo-loading inline-block w-16 h-16 rounded-full mb-4" />
        <p style={{ fontFamily: "var(--font-body)" }}>
          Checking verification status...
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="neo-card max-w-md mx-auto text-center p-6">
        <div className="inline-flex items-center justify-center w-16 h-16 neo-extrude-lg rounded-full mb-4 text-3xl">
          🔐
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Sign In Required
        </h3>
        <p className="text-gray-600 mb-6" style={{ fontFamily: "var(--font-body)" }}>
          Please sign in to verify your identity and continue.
        </p>
        <div className="neo-status-info mx-auto w-fit">
          Authentication Required
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="neo-card max-w-md mx-auto text-center p-6">
        <div className="inline-flex items-center justify-center w-16 h-16 neo-extrude-lg rounded-full mb-4 text-3xl">
          ⏳
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Verification in Progress
        </h3>
        <p className="text-gray-600 mb-6" style={{ fontFamily: "var(--font-body)" }}>
          Your identity verification is being reviewed. This usually takes just a few minutes.
        </p>
        <div className="neo-status-warning mx-auto w-fit mb-4">
          Pending Review
        </div>
        <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-body)" }}>
          You will be notified once verification is complete.
        </p>
      </div>
    );
  }

  if (identityStatus === "failed") {
    return (
      <div className="neo-card max-w-md mx-auto text-center p-6">
        <div className="inline-flex items-center justify-center w-16 h-16 neo-extrude-lg rounded-full mb-4 text-3xl">
          ❌
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Verification Failed
        </h3>
        <p className="text-gray-600 mb-6" style={{ fontFamily: "var(--font-body)" }}>
          We could not verify your identity. Please try again with valid documents.
        </p>
        {error && (
          <div className="neo-recess-sm p-3 mb-4 rounded-lg bg-red-50">
            <p className="text-red-600 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {error}
            </p>
          </div>
        )}
        <button
          onClick={handleStartVerification}
          disabled={isLoading}
          className="neo-action w-full"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isLoading ? "Starting..." : "Try Again"}
        </button>
      </div>
    );
  }

  return (
    <div className="neo-card max-w-md mx-auto text-center p-6">
      <div className="inline-flex items-center justify-center w-16 h-16 neo-extrude-lg rounded-full mb-4 text-3xl">
        {config.icon}
      </div>
      
      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      
      <p className="text-gray-600 mb-4" style={{ fontFamily: "var(--font-body)" }}>
        {description}
      </p>

      <div className="neo-status-error mx-auto w-fit mb-6">
        {config.requirementLevel}
      </div>

      {error && (
        <div className="neo-recess-sm p-3 mb-4 rounded-lg bg-red-50">
          <p className="text-red-600 text-sm" style={{ fontFamily: "var(--font-body)" }}>
            {error}
          </p>
        </div>
      )}

      <button
        onClick={handleStartVerification}
        disabled={isLoading}
        className="neo-action w-full mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="neo-loading inline-block w-5 h-5 rounded-full" />
            Starting...
          </span>
        ) : (
          config.ctaText
        )}
      </button>

      <div className="neo-divider" />

      <div className="text-left space-y-3">
        <p className="text-sm font-medium text-gray-700" style={{ fontFamily: "var(--font-display)" }}>
          What to expect:
        </p>
        <ul className="text-sm text-gray-600 space-y-2" style={{ fontFamily: "var(--font-body)" }}>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Photo ID capture (driver&apos;s license or passport)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Selfie photo for face matching</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Takes about 2 minutes to complete</span>
          </li>
        </ul>
      </div>

      <p className="mt-6 text-xs text-gray-500" style={{ fontFamily: "var(--font-body)" }}>
        🔒 Powered by Stripe Identity. Your data is encrypted and secure.
      </p>
    </div>
  );
}

// Compact verification badge component
interface VerificationBadgeProps {
  className?: string;
}

export function VerificationBadge({ className = "" }: VerificationBadgeProps) {
  const currentUser = useQuery(api.users.getCurrent);
  const identityStatus: IdentityStatus = currentUser?.identityStatus || "unverified";

  const statusConfig = {
    unverified: { label: "Unverified", className: "neo-status-error" },
    pending: { label: "Pending", className: "neo-status-warning" },
    verified: { label: "Verified", className: "neo-status" },
    failed: { label: "Failed", className: "neo-status-error" },
  };

  const config = statusConfig[identityStatus];

  return (
    <span className={`${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

export default VerifiedGate;
