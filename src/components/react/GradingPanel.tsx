/**
 * GradingPanel.tsx
 * 
 * Displays grading status for purchased cards with progress indicator.
 * Shows status stages, grade results when complete, and shipping tracking placeholder.
 */

import React from "react";
import type { GradingPanelProps, GradingStatus } from "../../types/grading";

const GRADING_STAGES: { status: GradingStatus; label: string; description: string }[] = [
  { status: "requested", label: "Requested", description: "Grading request submitted" },
  { status: "in_transit", label: "In Transit", description: "Card being sent to grading partner" },
  { status: "received", label: "Received", description: "Card received by grading partner" },
  { status: "graded", label: "Graded", description: "Card has been graded" },
  { status: "returned", label: "Returned", description: "Card returned to you" },
];

/**
 * Format date for display
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get status color for visual indicators
 */
function getStatusColor(status: GradingStatus): string {
  switch (status) {
    case "requested":
      return "text-info";
    case "in_transit":
      return "text-accent-blue";
    case "received":
      return "text-accent-purple";
    case "graded":
      return "text-warning";
    case "returned":
      return "text-success";
    default:
      return "text-muted";
  }
}

/**
 * Get gradient for grade badge based on grade value
 */
function getGradeGradient(gradeValue?: number): string {
  if (!gradeValue) return "";
  if (gradeValue >= 9) return "from-emerald-500 to-teal-500";
  if (gradeValue >= 7) return "from-blue-500 to-indigo-500";
  if (gradeValue >= 5) return "from-amber-500 to-orange-500";
  return "from-rose-500 to-pink-500";
}

/**
 * Get grade quality label
 */
function getGradeQuality(gradeValue?: number): string {
  if (!gradeValue) return "";
  if (gradeValue >= 10) return "Gem Mint";
  if (gradeValue >= 9) return "Mint";
  if (gradeValue >= 8) return "Near Mint-Mint";
  if (gradeValue >= 7) return "Near Mint";
  if (gradeValue >= 5) return "Excellent";
  if (gradeValue >= 3) return "Very Good";
  return "Good";
}

export function GradingPanel({
  gradingRequest,
  listing,
  showDetails = true,
}: GradingPanelProps) {
  const currentStatus = gradingRequest.status;
  const currentStageIndex = GRADING_STAGES.findIndex(s => s.status === currentStatus);
  const isComplete = currentStatus === "returned";
  const isGraded = currentStatus === "graded" || isComplete;

  // Calculate progress percentage
  const progressPercent = Math.min(
    ((currentStageIndex + 1) / GRADING_STAGES.length) * 100,
    100
  );

  return (
    <div className="neo-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="neo-recess-sm w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent-purple"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Grading Status</h3>
            <p className="text-xs text-muted">
              Requested on {formatDate(gradingRequest.createdAt)}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`
          neo-badge text-xs
          ${isComplete 
            ? "neo-badge-gradient" 
            : ""
          }
        `}>
          <span className={`
            w-2 h-2 rounded-full mr-2
            ${isComplete 
              ? "bg-white" 
              : getStatusColor(currentStatus).replace("text-", "bg-")
            }
          `} />
          {GRADING_STAGES[currentStageIndex]?.label || currentStatus}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="neo-recess-sm h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted">
          <span>Start</span>
          <span>{Math.round(progressPercent)}% complete</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Status Stages */}
      {showDetails && (
        <div className="space-y-3 mb-6">
          {GRADING_STAGES.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div
                key={stage.status}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                  ${isCurrent ? "neo-recess-sm" : ""}
                  ${isCompleted ? "opacity-100" : "opacity-50"}
                `}
              >
                {/* Stage Indicator */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  transition-all duration-300
                  ${isCompleted
                    ? isComplete && index === GRADING_STAGES.length - 1
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                      : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                    : "neo-recess-sm text-muted"
                  }
                `}>
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1">
                  <p className={`
                    font-display font-semibold text-sm
                    ${isCurrent ? "text-primary" : "text-secondary"}
                  `}>
                    {stage.label}
                  </p>
                  <p className="text-xs text-muted">
                    {stage.description}
                  </p>
                </div>

                {/* Current Indicator */}
                {isCurrent && !isComplete && (
                  <div className="neo-recess-sm w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Grade Result Display (when graded or returned) */}
      {isGraded && gradingRequest.gradeValue && (
        <div className="neo-recess rounded-xl p-5 mb-5 bg-gradient-to-br from-slate-50 to-white">
          <div className="text-center">
            <p className="text-xs text-muted mb-2">Final Grade</p>
            <div className={`
              inline-flex flex-col items-center justify-center
              w-24 h-24 rounded-2xl
              bg-gradient-to-br ${getGradeGradient(gradingRequest.gradeValue)}
              text-white shadow-lg
            `}>
              <span className="font-display font-bold text-3xl">
                {gradingRequest.gradeValue}
              </span>
              <span className="text-[10px] uppercase tracking-wider opacity-90">
                {gradingRequest.gradeCompany || "PSA"}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-primary">
              {getGradeQuality(gradingRequest.gradeValue)}
            </p>
          </div>
        </div>
      )}

      {/* Shipping Tracking Placeholder */}
      {(currentStatus === "in_transit" || currentStatus === "returned") && (
        <div className="neo-recess-sm rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent-blue"
            >
              <rect width="16" height="16" x="4" y="3" rx="2" />
              <path d="M4 11h16" />
              <path d="M12 3v8" />
              <path d="m8 19-2 3" />
              <path d="m18 22-2-3" />
              <path d="M8 15h.01" />
              <path d="M16 15h.01" />
            </svg>
            <p className="font-display font-semibold text-sm">Shipping Tracking</p>
          </div>

          {gradingRequest.trackingNumber ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50">
              <div>
                <p className="text-xs text-muted">Tracking Number</p>
                <p className="font-mono text-sm font-semibold text-primary">
                  {gradingRequest.trackingNumber}
                </p>
              </div>
              <a
                href={`#track-${gradingRequest.trackingNumber}`}
                className="neo-button neo-button-sm text-xs"
              >
                Track
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              Tracking information will be available once the card is shipped
            </div>
          )}
        </div>
      )}

      {/* Partner Reference */}
      {gradingRequest.partnerRef && (
        <div className="flex items-center justify-between text-xs text-muted pt-4 border-t border-transparent">
          <span>Partner Reference</span>
          <span className="font-mono">{gradingRequest.partnerRef}</span>
        </div>
      )}

      {/* Notes */}
      {gradingRequest.notes && (
        <div className="mt-4 p-3 neo-recess-sm rounded-xl">
          <p className="text-xs text-muted mb-1">Notes</p>
          <p className="text-sm text-secondary">{gradingRequest.notes}</p>
        </div>
      )}
    </div>
  );
}

export default GradingPanel;
