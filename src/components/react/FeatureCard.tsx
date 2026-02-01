/**
 * FeatureCard.tsx
 * 
 * Reusable feature card component for showcasing features.
 * Uses neomorphic styling with centered content layout.
 */

import React from "react";

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="neo-card text-center py-6">
      <div className="neo-extrude w-12 h-12 mx-auto mb-3 flex items-center justify-center text-2xl rounded-xl">
        {icon}
      </div>
      <h3 className="font-display font-bold text-base mb-1">{title}</h3>
      <p className="text-xs text-secondary">{description}</p>
    </div>
  );
}

export default FeatureCard;
