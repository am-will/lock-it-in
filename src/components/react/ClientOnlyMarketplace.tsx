/**
 * ClientOnlyMarketplace.tsx
 * 
 * Wrapper that ensures MarketplaceApp only renders on the client.
 * This prevents Convex hooks from running during SSR.
 */

import React, { useEffect, useState } from "react";
import { MarketplaceApp } from "./MarketplaceApp";
import type { MarketplaceAppProps } from "../../types/marketplace";

export function ClientOnlyMarketplace(props: MarketplaceAppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return loading skeleton during SSR
    return (
      <div className="neo-container">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar skeleton */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="neo-card p-4 space-y-4">
              <div className="h-6 bg-gray-300/30 rounded w-1/2 animate-pulse" />
              <div className="h-20 bg-gray-300/30 rounded animate-pulse" />
              <div className="h-20 bg-gray-300/30 rounded animate-pulse" />
              <div className="h-20 bg-gray-300/30 rounded animate-pulse" />
            </div>
          </aside>
          
          {/* Grid skeleton */}
          <main className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="neo-card animate-pulse">
                  <div className="neo-recess-sm rounded-xl aspect-[3/4] mb-4 bg-gray-300/30" />
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300/30 rounded w-2/3" />
                      <div className="h-4 bg-gray-300/30 rounded w-12" />
                    </div>
                    <div className="h-3 bg-gray-300/30 rounded w-1/2" />
                    <div className="flex justify-between pt-2">
                      <div className="h-6 bg-gray-300/30 rounded w-16" />
                      <div className="h-8 bg-gray-300/30 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Render the actual marketplace on client
  return <MarketplaceApp {...props} />;
}

export default ClientOnlyMarketplace;
