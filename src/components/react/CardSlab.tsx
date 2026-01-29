/**
 * CardSlab.tsx
 * 
 * Neomorphic card display component for marketplace listings.
 * Shows image placeholder, title, price, seller location, graded status,
 * category badge, and Lock button integration.
 */

import React from "react";
import type { CardSlabProps } from "../../types/marketplace";
import { LockButton } from "./LockButton";
import { ListingMeta } from "./ListingMeta";
import { getCategoryById, getCategoryGroupName } from "../../data/categories";
import { getStateCode } from "../../data/locations";

/**
 * Format price from cents to dollars
 */
function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Get gradient based on category group for image placeholder
 */
function getCategoryGradient(categoryGroup: string): string {
  switch (categoryGroup) {
    case "tcg":
      return "from-indigo-400/30 to-purple-400/30";
    case "sports":
      return "from-emerald-400/30 to-teal-400/30";
    case "other":
      return "from-amber-400/30 to-orange-400/30";
    default:
      return "from-slate-400/30 to-gray-400/30";
  }
}

/**
 * Get emoji icon based on category
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    pokemon: "⚡",
    mtg: "🔮",
    yugioh: "🐉",
    lorcana: "✨",
    onepiece: "🏴‍☠️",
    "starwars-unlimited": "🚀",
    baseball: "⚾",
    basketball: "🏀",
    football: "🏈",
    hockey: "🏒",
    soccer: "⚽",
    "f1-racing": "🏎️",
    "ufc-mma": "🥊",
    marvel: "🦸",
    "garbage-pail-kids": "🤢",
    "non-sport-vintage": "📜",
  };
  return icons[category] || "🃏";
}

/**
 * Get grade badge text
 */
function getGradeBadge(listing: CardSlabProps["listing"]): string {
  if (listing.gradedStatus === "raw") {
    return "Raw";
  }
  if (listing.gradeCompany && listing.gradeValue) {
    return `${listing.gradeCompany} ${listing.gradeValue}`;
  }
  return "Graded";
}

/**
 * Get badge style based on grading
 */
function getGradeBadgeStyle(listing: CardSlabProps["listing"]): string {
  if (listing.gradedStatus === "raw") {
    return "";
  }
  // High grades get gradient badge
  if (listing.gradeValue && listing.gradeValue >= 9) {
    return "neo-badge-gradient";
  }
  return "";
}

export function CardSlab({ listing, onLock, isLocking }: CardSlabProps) {
  const category = getCategoryById(listing.category);
  const categoryName = category?.name ?? listing.category;
  const groupName = getCategoryGroupName(listing.categoryGroup);
  const isLocked = listing.status === "locked";
  const isSold = listing.status === "sold";
  const isAvailable = listing.status === "available";

  return (
    <div 
      className={`
        neo-card group
        ${isLocked ? "neo-card-locked" : ""}
      `}
    >
      {/* Card Image */}
      <div 
        className={`
          neo-recess-sm rounded-xl aspect-[3/4] mb-4 
          overflow-hidden relative
          transition-opacity duration-200
          ${isLocked || isSold ? "opacity-60" : "opacity-100"}
        `}
      >
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('flex', 'items-center', 'justify-center', 'bg-gradient-to-br', getCategoryGradient(listing.categoryGroup));
                const span = document.createElement('span');
                span.className = 'text-6xl select-none';
                span.textContent = getCategoryIcon(listing.category);
                parent.appendChild(span);
              }
            }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getCategoryGradient(listing.categoryGroup)}`}>
            <span className="text-6xl select-none">
              {getCategoryIcon(listing.category)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Title and Grade Badge */}
        <div className="flex items-start justify-between gap-2">
          <h4 
            className="font-display font-semibold text-sm line-clamp-2 flex-1"
            title={listing.title}
          >
            {listing.title}
          </h4>
          <span className={`neo-badge text-[10px] shrink-0 ${getGradeBadgeStyle(listing)}`}>
            {getGradeBadge(listing)}
          </span>
        </div>

        {/* Category Info */}
        <p className="text-xs text-muted">
          {categoryName} • {groupName}
        </p>

        {/* Location & Date */}
        <ListingMeta 
          city={listing.city} 
          state={listing.state}
          createdAt={listing.createdAt}
        />

        {/* Price and Lock Button */}
        <div className="flex items-center justify-between pt-3 border-t border-transparent">
          <span className={`
            font-display font-bold text-lg
            ${isSold ? "text-muted line-through" : "text-primary"}
          `}>
            {formatPrice(listing.priceCents)}
          </span>
          
          <LockButton
            status={listing.status}
            lockExpiresAt={listing.lockExpiresAt}
            onClick={() => onLock?.(listing._id)}
            isLoading={isLocking}
            disabled={!isAvailable}
          />
        </div>
      </div>
    </div>
  );
}

export default CardSlab;
