/**
 * AppProviders.tsx
 * 
 * Root provider component that wraps the application with Clerk and Convex
 * authentication contexts. This enables auth-gated Convex queries throughout
 * the React island components.
 */

import React from "react";
import { ClerkProviderWrapper } from "./ClerkProviderWrapper";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders wraps children with Clerk and Convex authentication contexts.
 * 
 * Uses ClerkProviderWrapper to conditionally load Clerk only when valid
 * credentials are available, preventing build failures with placeholder values.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ClerkProviderWrapper>
      {children}
    </ClerkProviderWrapper>
  );
}

export default AppProviders;
