/**
 * Grading types for Lock It In Trading Cards
 * TypeScript interfaces for grading requests and component props
 */

/**
 * Grading status stages
 */
export type GradingStatus =
  | "none"
  | "requested"
  | "in_transit"
  | "received"
  | "graded"
  | "returned";

/**
 * Grading request data from Convex
 */
export interface GradingRequest {
  _id: string;
  _creationTime: number;
  orderId: string;
  listingId: string;
  buyerId: string;
  status: GradingStatus;
  partnerRef?: string;
  gradeCompany?: string;
  gradeValue?: number;
  trackingNumber?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Props for GradingToggle component
 */
export interface GradingToggleProps {
  /** Whether grading is enabled */
  isEnabled: boolean;
  /** Callback when toggle changes */
  onChange: (isEnabled: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Estimated grading fee in cents */
  estimatedFeeCents?: number;
}

/**
 * Props for GradingPanel component
 */
export interface GradingPanelProps {
  /** The grading request to display */
  gradingRequest: GradingRequest;
  /** Optional listing details */
  listing?: {
    title: string;
    imageUrl?: string;
  };
  /** Whether to show detailed status stages */
  showDetails?: boolean;
}

/**
 * Props for GradingStatusBadge component
 */
export interface GradingStatusBadgeProps {
  status: GradingStatus;
  size?: "sm" | "md" | "lg";
}

/**
 * Grading service configuration
 */
export interface GradingServiceConfig {
  feeMinCents: number;
  feeMaxCents: number;
  turnaroundMinWeeks: number;
  turnaroundMaxWeeks: number;
  supportedCompanies: string[];
}

/**
 * Default grading service configuration
 */
export const DEFAULT_GRADING_CONFIG: GradingServiceConfig = {
  feeMinCents: 5000, // $50
  feeMaxCents: 10000, // $100
  turnaroundMinWeeks: 2,
  turnaroundMaxWeeks: 4,
  supportedCompanies: ["PSA", "BGS", "CGC", "SGC"],
};
