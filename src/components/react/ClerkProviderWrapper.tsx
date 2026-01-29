/**
 * ClerkProviderWrapper.tsx
 * 
 * Conditionally wraps children with ClerkProvider only when a valid
 * publishable key is available. This prevents build failures with
 * placeholder environment variables.
 */

import React, { useState, useEffect } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { convexClient } from "../../lib/convexClient";

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

// Dummy auth for when Clerk is not configured
const useDummyAuth = () => ({
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  sessionId: null,
  getToken: async () => null,
  signOut: async () => {},
  orgId: null,
  orgRole: null,
  orgSlug: null,
});

/**
 * Inner component that integrates Convex with Clerk (or dummy auth)
 */
function ConvexWithAuth({ children }: { children: React.ReactNode }) {
  const clerkKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidKey = clerkKey && 
    clerkKey.startsWith('pk_') && 
    !clerkKey.includes('your_publishable_key') &&
    !clerkKey.includes('mock');

  if (isValidKey) {
    return (
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    );
  }

  // Use dummy auth for development/build without Clerk
  return (
    <ConvexProviderWithClerk client={convexClient} useAuth={useDummyAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

/**
 * Wrapper that conditionally provides Clerk context
 */
export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const clerkKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidKey = clerkKey && 
    clerkKey.startsWith('pk_') && 
    !clerkKey.includes('your_publishable_key') &&
    !clerkKey.includes('mock');

  // During SSR/build, render without Clerk to avoid errors
  if (!isClient || !isValidKey) {
    if (!isValidKey && isClient) {
      console.warn(
        "[LockItIn] Missing or invalid PUBLIC_CLERK_PUBLISHABLE_KEY. " +
        "Running without authentication. Set real credentials for auth features."
      );
    }
    
    return (
      <ConvexProviderWithClerk client={convexClient} useAuth={useDummyAuth}>
        {children}
      </ConvexProviderWithClerk>
    );
  }

  return (
    <ClerkProvider 
      publishableKey={clerkKey}
      appearance={{
        elements: {
          card: "neo-card",
          buttonPrimary: "neo-action",
          input: "neo-recess",
        }
      }}
    >
      <ConvexWithAuth>
        {children}
      </ConvexWithAuth>
    </ClerkProvider>
  );
}

export default ClerkProviderWrapper;
