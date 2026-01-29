/**
 * MarketplaceApp.tsx
 * 
 * Main marketplace React component.
 * Displays trading cards with filters. Uses mock data for demo mode.
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import type { FilterState, MarketplaceAppProps, Listing } from "../../types/marketplace";
import { FiltersPanel } from "./FiltersPanel";
import { CardSlab } from "./CardSlab";
import { DEFAULT_FILTER_CONFIG } from "../../data/filters";
import { filterMockListings } from "../../data/mockListings";

// Loading skeleton for card slabs
function CardSkeleton() {
  return (
    <div className="neo-card animate-pulse">
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
  );
}

// Empty state component
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="neo-card text-center py-16">
      <div className="neo-extrude w-20 h-20 mx-auto mb-6 flex items-center justify-center text-4xl rounded-2xl">
        🔍
      </div>
      <h3 className="font-display font-bold text-xl mb-2">No cards found</h3>
      <p className="text-secondary mb-6 max-w-sm mx-auto">
        We couldn&apos;t find any cards matching your filters. Try adjusting your search or browse all listings.
      </p>
      <button onClick={onReset} className="neo-action">
        Clear Filters
      </button>
    </div>
  );
}

// Get initial listings for SSR
function getInitialListings(filters: FilterState): Listing[] {
  return filterMockListings({
    categoryGroup: filters.categoryGroup === "all" ? undefined : filters.categoryGroup,
    category: filters.category === "all" ? undefined : filters.category,
    state: filters.state === "all" ? undefined : filters.state,
    metro: filters.metro === "all" ? undefined : filters.metro,
    gradedStatus: filters.gradingStatus === "all" ? undefined : filters.gradingStatus,
  });
}

export function MarketplaceApp({ initialFilters }: MarketplaceAppProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTER_CONFIG,
    ...initialFilters,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Compute listings (works for both SSR and client)
  const listings = useMemo(() => getInitialListings(filters), [filters]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle lock button click
  const handleLock = useCallback((listingId: string) => {
    if (isClient) {
      alert("🔒 Demo Mode: In the real app, this would lock the card for 10 minutes while you checkout!\n\nCard ID: " + listingId);
    }
  }, [isClient]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTER_CONFIG });
  }, []);

  // Close filters panel when filters change on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsFiltersOpen(false);
    }
  }, [filters]);

  return (
    <div className="neo-container">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:w-72 xl:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-28">
            <FiltersPanel
              filters={filters}
              onChange={setFilters}
              isOpen={isFiltersOpen}
              onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
              resultCount={listings.length}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Results Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl">
                Marketplace
              </h2>
              <p className="text-sm text-secondary mt-1">
                {listings.length} card{listings.length !== 1 ? "s" : ""} available
                <span className="ml-2 text-xs text-accent-purple font-medium">(Demo Mode)</span>
              </p>
            </div>

            {/* Sort dropdown - narrower width with solid background */}
            <div className="neo-extrude-sm rounded-lg hidden sm:block">
              <select className="neo-input neo-select text-sm w-36 shrink-0 bg-transparent shadow-none">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Card Grid */}
          {listings.length === 0 ? (
            <EmptyState onReset={handleResetFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <CardSlab
                  key={listing._id}
                  listing={listing}
                  onLock={handleLock}
                  isLocking={false}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {listings.length > 0 && (
            <div className="mt-8 text-center">
              <button className="neo-button">
                Load More Cards
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default MarketplaceApp;
