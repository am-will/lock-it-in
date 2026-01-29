/**
 * ClientOnlyIdentityPanel.tsx
 * 
 * Client-only wrapper for IdentityVerificationPanel to prevent SSR issues
 * with Clerk authentication. This component ensures the panel only renders
 * in the browser where ClerkProvider context is available.
 */

import React, { useState, useEffect } from "react";
import { IdentityVerificationPanel } from "./IdentityVerificationPanel";

interface ClientOnlyIdentityPanelProps {
  /** Optional fallback UI to show while loading */
  fallback?: React.ReactNode;
}

/**
 * Client-only wrapper that delays rendering until after hydration.
 * This prevents "useUser can only be used within ClerkProvider" errors
 * during Astro's static site generation.
 */
export function ClientOnlyIdentityPanel({ 
  fallback 
}: ClientOnlyIdentityPanelProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
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
            Initializing verification panel
          </p>
        </div>
      </div>
    );
  }

  return <IdentityVerificationPanel />;
}

export default ClientOnlyIdentityPanel;
