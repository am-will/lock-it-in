/**
 * AuthGate.tsx
 * 
 * Component that allows browsing but blocks list/buy actions until phone verification.
 * Wraps action elements (buttons, forms) and shows auth prompt if user not verified.
 */

import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PhoneVerificationFlow } from "./PhoneVerificationFlow";

type ActionType = "list" | "buy" | "sell" | "lock" | "message";

interface AuthGateProps {
  children: React.ReactNode;
  action: ActionType;
  fallback?: React.ReactNode;
}

interface ActionConfig {
  icon: string;
  title: string;
  description: string;
  ctaText: string;
}

const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
  list: {
    icon: "📤",
    title: "List Your Cards",
    description: "Verify your phone to start listing your trading cards for sale.",
    ctaText: "Verify to List",
  },
  buy: {
    icon: "🛒",
    title: "Buy Cards",
    description: "Verify your phone to purchase cards from the marketplace.",
    ctaText: "Verify to Buy",
  },
  sell: {
    icon: "💰",
    title: "Sell Cards",
    description: "Verify your phone to sell your trading cards.",
    ctaText: "Verify to Sell",
  },
  lock: {
    icon: "🔒",
    title: "Lock This Card",
    description: "Verify your phone to lock this card for purchase.",
    ctaText: "Verify to Lock",
  },
  message: {
    icon: "💬",
    title: "Send Message",
    description: "Verify your phone to message sellers and buyers.",
    ctaText: "Verify to Message",
  },
};

export function AuthGate({ children, action, fallback }: AuthGateProps) {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrent);
  const [showVerification, setShowVerification] = useState(false);

  const isLoading = !clerkLoaded || (isSignedIn && currentUser === undefined);
  const isPhoneVerified = !!currentUser?.phoneVerifiedAt;
  const canPerformAction = isSignedIn && isPhoneVerified;

  if (canPerformAction) {
    return <>{children}</>;
  }

  if (fallback && !canPerformAction) {
    return <>{fallback}</>;
  }

  const config = ACTION_CONFIG[action];

  if (showVerification) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowVerification(false)}
        />
        <div className="relative z-10 w-full max-w-md">
          <button
            onClick={() => setShowVerification(false)}
            className="absolute -top-12 right-0 neo-button neo-button-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Close
          </button>
          <PhoneVerificationFlow 
            onComplete={() => setShowVerification(false)}
            onCancel={() => setShowVerification(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="opacity-30 pointer-events-none select-none blur-[2px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="neo-card max-w-sm w-full mx-4 text-center p-6">
            {isLoading ? (
              <div className="py-8">
                <div className="neo-loading inline-block w-12 h-12 rounded-full mb-4" />
                <p style={{ fontFamily: "var(--font-body)" }}>
                  Checking verification...
                </p>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 neo-extrude-lg rounded-full mb-4 text-3xl">
                  {isSignedIn ? "🔐" : config.icon}
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {isSignedIn ? "Phone Verification Required" : config.title}
                </h3>
                <p 
                  className="text-gray-600 mb-6 text-sm"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {isSignedIn 
                    ? "Your phone number needs to be verified before you can proceed."
                    : config.description
                  }
                </p>
                <button
                  onClick={() => setShowVerification(true)}
                  className="neo-action w-full"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {isSignedIn ? "Verify Phone" : config.ctaText}
                </button>
                <p 
                  className="mt-4 text-xs text-gray-500"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  You can still browse all listings without verifying.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Standalone Auth Prompt
interface AuthPromptProps {
  action: ActionType;
  onVerify: () => void;
  compact?: boolean;
}

export function AuthPrompt({ action, onVerify, compact = false }: AuthPromptProps) {
  const { isSignedIn } = useUser();
  const currentUser = useQuery(api.users.getCurrent);
  const isPhoneVerified = !!currentUser?.phoneVerifiedAt;
  const config = ACTION_CONFIG[action];

  if (compact) {
    return (
      <div className="neo-recess-sm p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div className="flex-1">
            <p 
              className="font-medium text-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isSignedIn && !isPhoneVerified ? "Verify phone to continue" : config.title}
            </p>
          </div>
          <button
            onClick={onVerify}
            className="neo-action neo-action-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isSignedIn && !isPhoneVerified ? "Verify" : "Sign In"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card max-w-sm mx-auto text-center p-6">
      <div className="inline-flex items-center justify-center w-16 h-16 neo-extrude-lg rounded-full mb-4 text-3xl">
        {isSignedIn ? "🔐" : config.icon}
      </div>
      <h3 
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {isSignedIn ? "Verify Your Phone" : config.title}
      </h3>
      <p 
        className="text-gray-600 mb-6"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {isSignedIn 
          ? "Phone verification is required for this action."
          : config.description
        }
      </p>
      <button
        onClick={onVerify}
        className="neo-action w-full"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {isSignedIn && !isPhoneVerified ? "Verify Phone" : config.ctaText}
      </button>
    </div>
  );
}

export default AuthGate;
