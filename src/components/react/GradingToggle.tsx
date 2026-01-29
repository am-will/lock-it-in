/**
 * GradingToggle.tsx
 * 
 * Neomorphic toggle switch for "Send for Grading" option in checkout flow.
 * Shows estimated grading fee, turnaround time, and disclaimer when enabled.
 */

import React from "react";
import type { GradingToggleProps } from "../../types/grading";

const GRADING_FEE_MIN = 50;
const GRADING_FEE_MAX = 100;
const TURNAROUND_MIN_WEEKS = 2;
const TURNAROUND_MAX_WEEKS = 4;

const DISCLAIMER_TEXT = "Lock It In does not guarantee grades for cards not processed through our official grading partner.";

export function GradingToggle({
  isEnabled,
  onChange,
  disabled = false,
  estimatedFeeCents = 7500, // Default $75
}: GradingToggleProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!isEnabled);
    }
  };

  const estimatedFee = estimatedFeeCents / 100;

  return (
    <div
      className={`
        neo-card p-5
        ${disabled ? "opacity-60" : ""}
        transition-all duration-300
      `}
    >
      {/* Toggle Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="neo-recess-sm w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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

          {/* Title and Subtitle */}
          <div>
            <h4 className="font-display font-semibold text-sm">
              Send for Grading
            </h4>
            <p className="text-xs text-muted">
              Professional card grading service
            </p>
          </div>
        </div>

        {/* Neomorphic Toggle Switch */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            relative w-14 h-8 rounded-full transition-all duration-300
            ${isEnabled
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-inner"
              : "neo-recess-sm"
            }
            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          `}
          aria-pressed={isEnabled}
          aria-label="Toggle grading service"
        >
          {/* Toggle Thumb */}
          <span
            className={`
              absolute top-1 w-6 h-6 rounded-full
              transition-all duration-300 ease-out
              ${isEnabled
                ? "left-7 bg-white shadow-lg"
                : "left-1 bg-white shadow-md"
              }
            `}
            style={{
              boxShadow: isEnabled
                ? "0 2px 8px rgba(99, 102, 241, 0.5)"
                : "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Checkmark when enabled */}
            {isEnabled && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute inset-0 m-auto text-indigo-500"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </button>
      </div>

      {/* Expanded Content when Enabled */}
      {isEnabled && (
        <div className="mt-4 pt-4 border-t border-transparent grading-expand-content">
          {/* Fee and Turnaround Info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="neo-recess-sm rounded-xl p-3">
              <p className="text-xs text-muted mb-1">Estimated Fee</p>
              <p className="font-display font-bold text-lg text-primary">
                ${estimatedFee.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted">
                Range: ${GRADING_FEE_MIN}-${GRADING_FEE_MAX}
              </p>
            </div>
            <div className="neo-recess-sm rounded-xl p-3">
              <p className="text-xs text-muted mb-1">Turnaround</p>
              <p className="font-display font-bold text-lg text-primary">
                {TURNAROUND_MIN_WEEKS}-{TURNAROUND_MAX_WEEKS} weeks
              </p>
              <p className="text-[10px] text-muted">
                Estimated processing time
              </p>
            </div>
          </div>

          {/* Disclaimer - Prominently Displayed */}
          <div className="neo-recess-sm rounded-xl p-4 bg-amber-50/50">
            <div className="flex items-start gap-3">
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
                className="text-amber-500 shrink-0 mt-0.5"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  Important Disclaimer
                </p>
                <p className="text-xs text-amber-700/80 leading-relaxed">
                  {DISCLAIMER_TEXT}
                </p>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-secondary">What's included:</p>
            <ul className="space-y-2">
              {[
                "Professional authentication and grading",
                "Protective card slab and labeling",
                "Insurance during transit",
                "Tracking throughout the process",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-xs text-secondary">
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
                    className="text-success shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradingToggle;
