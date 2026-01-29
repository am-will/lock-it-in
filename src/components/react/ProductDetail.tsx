/**
 * ProductDetail.tsx
 * 
 * Product detail page for trading cards
 * Displays card image, details, pricing, seller info, and market data
 */

import React, { useState } from 'react';
import type { Listing } from '../../types/marketplace';
import { getCategoryById, getCategoryGroupName } from '../../data/categories';
import { formatPrice } from '../../utils/format';

interface ProductDetailProps {
  listing: Listing;
  onLock?: (id: string) => void;
}

// Mock price history data
const priceHistory = [
  { date: '11/1', price: 115 },
  { date: '11/15', price: 112 },
  { date: '11/25', price: 75 },
  { date: '12/1', price: 78 },
  { date: '12/15', price: 82 },
  { date: '12/25', price: 76 },
  { date: '1/1', price: 74 },
  { date: '1/12', price: 88 },
  { date: '1/25', price: 63 },
];

export function ProductDetail({ listing, onLock }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const category = getCategoryById(listing.category);
  const categoryName = category?.name ?? listing.category;
  const groupName = getCategoryGroupName(listing.categoryGroup);

  const gradeBadge = listing.gradedStatus === 'graded' 
    ? `${listing.gradeCompany} ${listing.gradeValue}`
    : 'Raw';

  return (
    <div className="neo-container py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-secondary mb-6">
        <span className="hover:text-primary cursor-pointer">All Categories</span>
        <span className="mx-2">›</span>
        <span className="hover:text-primary cursor-pointer">{groupName}</span>
        <span className="mx-2">›</span>
        <span className="hover:text-primary cursor-pointer">{categoryName}</span>
        <span className="mx-2">›</span>
        <span className="text-primary">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Product Image */}
        <div className="lg:col-span-5">
          <div className="neo-extrude-lg rounded-2xl p-6 aspect-[3/4] flex items-center justify-center relative">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-8xl">🃏</div>
            )}
            <span className="absolute top-4 right-4 neo-badge neo-badge-gradient">
              {gradeBadge}
            </span>
          </div>
        </div>

        {/* Middle: Product Details */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl mb-2">
              {listing.title}
            </h1>
            <p className="text-secondary text-sm">
              {categoryName} • {groupName}
            </p>
          </div>

          {/* Product Details Section */}
          <div className="neo-card">
            <h2 className="font-display font-semibold text-lg mb-4">Product Details</h2>
            <div className="space-y-3 text-sm text-secondary">
              <p>
                <span className="text-primary font-medium">Category:</span> {categoryName}
              </p>
              <p>
                <span className="text-primary font-medium">Condition:</span> {listing.gradedStatus === 'graded' ? `Graded - ${listing.gradeCompany} ${listing.gradeValue}` : 'Raw (Ungraded)'}
              </p>
              <p>
                <span className="text-primary font-medium">Location:</span> {listing.city}, {listing.state}
              </p>
              <p>
                <span className="text-primary font-medium">Seller:</span> Verified Seller
              </p>
              <p className="pt-2">
                This {listing.title} is {listing.gradedStatus === 'graded' 
                  ? `professionally graded by ${listing.gradeCompany} with a grade of ${listing.gradeValue}.` 
                  : 'in raw condition and ready for your collection.'}
                Authenticated and ready to ship from {listing.city}, {listing.state}.
              </p>
            </div>
          </div>

          {/* Price History Chart (Mock) */}
          <div className="neo-card">
            <h2 className="font-display font-semibold text-lg mb-4">Market Price History</h2>
            <div className="h-32 flex items-end gap-1">
              {priceHistory.map((point, i) => {
                const maxPrice = Math.max(...priceHistory.map(p => p.price));
                const height = (point.price / maxPrice) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-indigo-500/30 to-indigo-400/60 rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${point.date}: $${point.price}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-secondary mt-2">
              <span>11/1</span>
              <span>12/1</span>
              <span>1/25</span>
            </div>
          </div>
        </div>

        {/* Right: Purchase Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Price Card */}
          <div className="neo-extrude-lg rounded-2xl p-6 space-y-4 bg-[#2D3748]">
            <div className="flex items-center gap-2">
              <span className="neo-badge">{listing.gradedStatus === 'graded' ? 'Graded' : 'Raw'}</span>
            </div>

            <div>
              <span className="font-display font-bold text-3xl text-gradient">
                {formatPrice(listing.priceCents)}
              </span>
              <span className="text-secondary text-sm ml-2">+ $5.00 shipping</span>
            </div>

            <div className="text-sm text-secondary">
              Sold by <span className="text-primary">Verified Seller</span> • {listing.city}, {listing.state}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">Quantity:</span>
              <div className="flex items-center neo-recess-sm rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:text-primary transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-secondary">of 1</span>
            </div>

            {/* Lock It In Button */}
            <button
              onClick={() => onLock?.(listing._id as string)}
              className="neo-action w-full py-4 text-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="inline-block mr-2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Lock It In
            </button>

            {/* Payment Info */}
            <div className="text-xs text-secondary text-center">
              Payment processing via Stripe
            </div>
          </div>

          {/* Other Listings */}
          <div className="neo-card text-center py-4">
            <p className="font-display font-semibold text-primary mb-1">
              View 12 Other Listings
            </p>
            <p className="text-xs text-secondary">
              As low as {formatPrice(listing.priceCents - 500)}
            </p>
          </div>

          {/* Price Comparison */}
          <div className="neo-card space-y-3">
            <h3 className="font-display font-semibold text-sm">Market Data</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Market Price:</span>
                <span className="font-medium">{formatPrice(listing.priceCents + 150)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Listed Median:</span>
                <span className="font-medium">{formatPrice(listing.priceCents + 300)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Recent Sale:</span>
                <span className="font-medium">{formatPrice(listing.priceCents - 100)}</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex justify-between text-sm">
            <button className="text-secondary hover:text-primary transition-colors">
              Sell this ↗
            </button>
            <button className="text-secondary hover:text-primary transition-colors">
              Report a problem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
