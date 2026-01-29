/**
 * Marketplace types for Lock It In Trading Cards
 * TypeScript interfaces for listings, filters, and component props
 */

import type { CategoryGroup, GradingStatus } from "../data/categories";

/**
 * Filter state for the marketplace
 */
export interface FilterState {
  categoryGroup: CategoryGroup | "all";
  category: string;
  state: string;
  metro: string;
  gradingStatus: GradingStatus | "all";
}

/**
 * Listing data from Convex
 */
export interface Listing {
  _id: string;
  _creationTime: number;
  title: string;
  priceCents: number;
  currency: string;
  imageStorageId?: string;
  imageUrl?: string;
  categoryGroup: CategoryGroup;
  category: string;
  gradedStatus: GradingStatus;
  gradeCompany?: string;
  gradeValue?: number;
  sellerId: string;
  city?: string;
  state?: string;
  metro?: string;
  status: "available" | "locked" | "sold" | "delisted";
  lockExpiresAt?: number;
  createdAt: number;
}

/**
 * Props for CardSlab component
 */
export interface CardSlabProps {
  listing: Listing;
  onLock?: (listingId: string) => void;
  isLocking?: boolean;
}

/**
 * Props for LockButton component
 */
export interface LockButtonProps {
  status: Listing["status"];
  lockExpiresAt?: number;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Props for ListingMeta component
 */
export interface ListingMetaProps {
  city?: string;
  state?: string;
  createdAt: number;
  sellerName?: string;
}

/**
 * Props for FiltersPanel component
 */
export interface FiltersPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
  resultCount?: number;
}

/**
 * Props for MarketplaceApp component
 */
export interface MarketplaceAppProps {
  initialFilters?: Partial<FilterState>;
}

/**
 * Lock state for a listing
 */
export interface LockState {
  isLocked: boolean;
  expiresAt?: number;
  timeRemaining?: number;
}

/**
 * Props for CheckoutPanel component
 */
export interface CheckoutPanelProps {
  listingId: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}
