/**
 * ListingMeta.tsx
 * 
 * Small component for displaying listing metadata:
 * seller info, location (city, state), and creation date
 */

import React from "react";
import type { ListingMetaProps } from "../../types/marketplace";
import { getStateName } from "../../data/locations";

/**
 * Format a timestamp into a readable relative date
 */
function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (months > 0) {
    return `${months}mo ago`;
  }
  if (weeks > 0) {
    return `${weeks}w ago`;
  }
  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return "Just now";
}

export function ListingMeta({ city, state, createdAt, sellerName }: ListingMetaProps) {
  const locationText = city && state 
    ? `${city}, ${state}`
    : city 
    ? city 
    : state 
    ? getStateName(state)
    : null;

  return (
    <div className="flex items-center gap-2 text-xs text-secondary">
      {/* Location */}
      {locationText && (
        <span className="flex items-center gap-1">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-muted"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {locationText}
        </span>
      )}
      
      {/* Separator */}
      {locationText && (
        <span className="text-muted">•</span>
      )}
      
      {/* Date */}
      <span>{formatRelativeDate(createdAt)}</span>
    </div>
  );
}

export default ListingMeta;
