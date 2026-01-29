/**
 * IdentityVerificationPanel.tsx
 * 
 * Main identity verification UI component.
 * Shows current identity status and manages the verification flow.
 * Uses Stripe Identity for US identity verification.
 */

import React, { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { launchIdentityVerification } from "../../lib/stripeClient";

type IdentityStatus = "unverified" | "pending" | "verified" | "failed";
type CheckStatus = "created" | "processing" | "verified" | "canceled" | "requires_input";

interface IdentityStatusData {
  identityStatus: IdentityStatus;
  identitySessionId?: string;
  latestCheck: {
    status: CheckStatus;
    createdAt: number;
    processedAt?: number;
  } | null;
}

// Status configuration with icons and colors
const STATUS_CONFIG: Record<IdentityStatus, {
  icon: string;
  title: string;
  description: string;
  badgeClass: string;
  accentColor: string;
}> = {
  unverified: {
    icon: "🔒",
    title: "Identity Not Verified",
    description: "Complete identity verification to unlock all marketplace features.",
    badgeClass: "neo-status-error",
    accentColor: "#EF4444",
  },
  pending: {
    icon: "⏳",
    title: "Verification In Progress",
    description: "Your identity verification is being reviewed. This usually takes just a few minutes.",
    badgeClass: "neo-status-warning",
    accentColor: "#F59E0B",
  },
  verified: {
    icon: "✓",
    title: "Identity Verified",
    description: "Your identity has been successfully verified. You have full access to all marketplace features.",
    badgeClass: "neo-status",
    accentColor: "#10B981",
  },
  failed: {
    icon: "✕",
    title: "Verification Failed",
    description: "We couldn't verify your identity. Please review the requirements and try again.",
    badgeClass: "neo-status-error",
    accentColor: "#EF4444",
  },
};

// Requirements list for unverified state
const VERIFICATION_REQUIREMENTS = [
  {
    icon: "🪪",
    title: "Government-Issued ID",
    description: "Valid driver's license, passport, or state ID",
  },
  {
    icon: "📸",
    title: "Live Photo",
    description: "Quick selfie to match with your ID",
  },
  {
    icon: "🇺🇸",
    title: "US Residents Only",
    description: "Current US address required",
  },
  {
    icon: "⏱️",
    title: "Takes 2-3 Minutes",
    description: "Quick and secure process",
  },
];

// Failure reasons mapping
const FAILURE_REASONS: Record<string, string> = {
  "document_unreadable": "The document image was unclear or blurry",
  "document_expired": "The document has expired",
  "document_type_not_supported": "Document type not accepted",
  "document_country_not_supported": "Document country not supported (US only)",
  "name_mismatch": "Name on document doesn't match",
  "face_mismatch": "Photo doesn't match the document",
  "under_supported_age": "Age verification failed",
  "default": "Unable to verify identity with provided documents",
};

export function IdentityVerificationPanel() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const statusData = useQuery(api.identity.getMyStatus) as IdentityStatusData | null | undefined;
  const createVerificationSession = useAction(api.identity.createVerificationSession);

  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const isLoadingUser = !clerkLoaded || (isSignedIn && statusData === undefined);
  
  const identityStatus: IdentityStatus = statusData?.identityStatus || "unverified";
  const statusConfig = STATUS_CONFIG[identityStatus];

  // Polling for status updates when pending
  useEffect(() => {
    if (identityStatus === "pending") {
      setIsPolling(true);
      const interval = setInterval(() => {
        setLastChecked(new Date());
        // Convex's useQuery will automatically refetch
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setIsPolling(false);
    }
  }, [identityStatus]);

  const handleStartVerification = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await createVerificationSession();

      if (result.alreadyVerified) {
        // Already verified, refresh the page to update UI
        window.location.reload();
        return;
      }

      if (!result.clientSecret) {
        throw new Error("Failed to create verification session");
      }

      // Launch Stripe Identity verification
      const { error: launchError, verificationSession } = await launchIdentityVerification({
        clientSecret: result.clientSecret,
      });

      if (launchError) {
        throw new Error(launchError.message);
      }

      // On success, redirect to pending page
      window.location.href = "/identity/pending";
    } catch (err: any) {
      console.error("Identity verification error:", err);
      setError(err.message || "Failed to start verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [createVerificationSession]);

  const handleCheckStatus = useCallback(() => {
    setIsPolling(true);
    setLastChecked(new Date());
    // Force a refetch by reloading the page
    window.location.reload();
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    handleStartVerification();
  }, [handleStartVerification]);

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="neo-extrude-lg max-w-2xl mx-auto p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="neo-loading w-20 h-20 rounded-full mb-6" />
          <h3 
            className="text-xl font-bold text-gray-700 mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Loading...
          </h3>
          <p className="text-gray-500" style={{ fontFamily: "var(--font-body)" }}>
            Checking your verification status
          </p>
        </div>
      </div>
    );
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="neo-extrude-lg max-w-2xl mx-auto p-8 sm:p-12">
        <div className="flex flex-col items-center text-center py-8">
          <div className="neo-extrude-xl w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6">
            🔐
          </div>
          <h2 
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sign In Required
          </h2>
          <p 
            className="text-gray-600 max-w-md mb-8"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Please sign in to verify your identity and access all marketplace features.
          </p>
          <div className="neo-recess-sm px-6 py-3 rounded-full">
            <span className="text-gray-500" style={{ fontFamily: "var(--font-body)" }}>
              Authentication Required
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main Status Card */}
      <div className="neo-extrude-lg p-6 sm:p-8 mb-6">
        {/* Header with Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div 
              className="neo-extrude-xl w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
              style={{ 
                color: statusConfig.accentColor,
                boxShadow: identityStatus === "verified" 
                  ? `0 0 20px ${statusConfig.accentColor}40` 
                  : undefined 
              }}
            >
              {statusConfig.icon}
            </div>
            <div>
              <h2 
                className="text-xl sm:text-2xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {statusConfig.title}
              </h2>
              <div className="mt-2">
                <span className={statusConfig.badgeClass}>
                  {identityStatus.charAt(0).toUpperCase() + identityStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p 
          className="text-gray-600 mb-6 leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {statusConfig.description}
        </p>

        {/* Error Message */}
        {error && (
          <div className="neo-recess-sm p-4 mb-6 rounded-xl bg-red-50">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-600" style={{ fontFamily: "var(--font-body)" }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {identityStatus === "unverified" && (
            <button
              onClick={handleStartVerification}
              disabled={isLoading}
              className="neo-action w-full neo-action-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="neo-loading inline-block w-5 h-5 rounded-full" />
                  Starting Verification...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🔐</span>
                  Start Identity Verification
                </span>
              )}
            </button>
          )}

          {identityStatus === "pending" && (
            <div className="space-y-4">
              <div className="neo-recess p-4 rounded-xl text-center">
                <div className="neo-loading w-12 h-12 rounded-full mx-auto mb-3" />
                <p className="text-gray-600 mb-2" style={{ fontFamily: "var(--font-body)" }}>
                  Checking verification status...
                </p>
                {isPolling && (
                  <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-body)" }}>
                    Auto-refreshing every 5 seconds
                  </p>
                )}
              </div>
              <button
                onClick={handleCheckStatus}
                className="neo-button w-full"
                style={{ fontFamily: "var(--font-display)" }}
              >
                🔄 Check Status Now
              </button>
            </div>
          )}

          {identityStatus === "verified" && (
            <div className="space-y-3">
              <div 
                className="p-4 rounded-xl text-center"
                style={{ 
                  background: "linear-gradient(135deg, #10B98120 0%, #05966920 100%)",
                  border: "1px solid #10B98140"
                }}
              >
                <p className="text-green-700 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                  ✓ You can now buy, sell, and trade with full access
                </p>
              </div>
              <a
                href="/"
                className="neo-button w-full text-center block"
                style={{ fontFamily: "var(--font-display)" }}
              >
                🛒 Browse Marketplace
              </a>
            </div>
          )}

          {identityStatus === "failed" && (
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="neo-action w-full"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="neo-loading inline-block w-5 h-5 rounded-full" />
                    Starting...
                  </span>
                ) : (
                  "🔄 Try Again"
                )}
              </button>
              <p 
                className="text-sm text-gray-500 text-center"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Make sure you have a valid ID ready and are in a well-lit area
              </p>
            </div>
          )}
        </div>

        {/* Last checked timestamp for pending state */}
        {identityStatus === "pending" && lastChecked && (
          <p className="text-xs text-gray-400 text-center mt-4" style={{ fontFamily: "var(--font-body)" }}>
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Requirements Section (Unverified Only) */}
      {identityStatus === "unverified" && (
        <div className="neo-extrude p-6 sm:p-8">
          <h3 
            className="text-lg font-bold mb-6 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span>📋</span>
            What You&apos;ll Need
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VERIFICATION_REQUIREMENTS.map((req, index) => (
              <div 
                key={index} 
                className="neo-recess-sm p-4 rounded-xl flex items-start gap-3"
              >
                <span className="text-2xl flex-shrink-0">{req.icon}</span>
                <div>
                  <h4 
                    className="font-semibold text-sm mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {req.title}
                  </h4>
                  <p 
                    className="text-xs text-gray-500"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {req.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="neo-divider my-6" />

          {/* Security Note */}
          <div className="flex items-start gap-3 p-4 neo-recess-sm rounded-xl">
            <span className="text-xl flex-shrink-0">🔒</span>
            <div>
              <h4 
                className="font-semibold text-sm mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bank-Level Security
              </h4>
              <p 
                className="text-xs text-gray-500 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Your identity data is encrypted and processed securely by Stripe. 
                We never store your ID documents on our servers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failure Details (Failed Only) */}
      {identityStatus === "failed" && (
        <div className="neo-extrude p-6 sm:p-8">
          <h3 
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span>⚠️</span>
            Common Issues
          </h3>
          
          <ul className="space-y-3">
            {Object.values(FAILURE_REASONS).slice(0, -1).map((reason, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 text-sm text-gray-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span className="text-red-400 mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>

          <div className="neo-divider my-6" />

          <div className="neo-recess-sm p-4 rounded-xl">
            <h4 
              className="font-semibold text-sm mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              💡 Tips for Success
            </h4>
            <ul 
              className="text-xs text-gray-500 space-y-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Use a well-lit area with no glare on your ID
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Ensure all corners of your ID are visible
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Hold your phone steady when taking the selfie
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                Remove hats, sunglasses, or anything covering your face
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Verified Features (Verified Only) */}
      {identityStatus === "verified" && (
        <div className="neo-extrude p-6 sm:p-8">
          <h3 
            className="text-lg font-bold mb-6 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span>🎉</span>
            Your Verified Benefits
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🛒", title: "Buy Cards", desc: "Purchase any listing" },
              { icon: "💰", title: "Sell Cards", desc: "List your own cards" },
              { icon: "🔒", title: "Secure Locks", desc: "Lock cards instantly" },
              { icon: "📦", title: "Grading Service", desc: "Send cards for grading" },
            ].map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 neo-recess-sm rounded-xl"
              >
                <span className="text-2xl">{benefit.icon}</span>
                <div>
                  <h4 
                    className="font-semibold text-sm"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {benefit.title}
                  </h4>
                  <p 
                    className="text-xs text-gray-500"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Info (for debugging/support) */}
      {statusData?.latestCheck && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-body)" }}>
            Session started: {new Date(statusData.latestCheck.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default IdentityVerificationPanel;
