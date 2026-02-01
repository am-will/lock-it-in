/**
 * PageHero.tsx
 * 
 * Reusable hero section component for page consistency.
 * Features neomorphic styling with gradient orbs background,
 * optional pattern overlay, and call-to-action button.
 */

import React from "react";

export interface PageHeroProps {
  title: string;
  subtitle: string;
  showPattern?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

export function PageHero({
  title,
  subtitle,
  showPattern = true,
  ctaText,
  ctaHref,
}: PageHeroProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 mb-8">
      <div className="neo-container">
        <div className="neo-extrude-lg p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          {/* Background Pattern */}
          {showPattern && (
            <div className="absolute inset-0 pattern-dots opacity-30" />
          )}

          {/* Gradient Orbs */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl mb-2">
                {title}
              </h1>
              <p className="text-secondary max-w-xl">{subtitle}</p>
            </div>

            {ctaText && ctaHref && (
              <a href={ctaHref} className="neo-button neo-button-lg shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {ctaText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PageHero;
