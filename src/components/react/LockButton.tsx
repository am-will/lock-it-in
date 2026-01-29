/**
 * LockButton.tsx
 * 
 * Lock action button for card listings.
 * Shows "Lock It In" when available, transitions to recessed state when clicked,
 * and displays countdown timer when locked.
 */

import React, { useEffect, useState, useCallback } from "react";
import type { LockButtonProps } from "../../types/marketplace";

const LOCK_DURATION_MINUTES = 10;

/**
 * Format seconds into MM:SS display
 */
function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function LockButton({
  status,
  lockExpiresAt,
  onClick,
  isLoading,
  disabled,
}: LockButtonProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Calculate and update time remaining for locked listings
  const updateTimeRemaining = useCallback(() => {
    if (status !== "locked" || !lockExpiresAt) {
      setTimeRemaining(null);
      return;
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((lockExpiresAt - now) / 1000));
    setTimeRemaining(remaining);

    if (remaining === 0) {
      // Lock expired
      setTimeRemaining(null);
    }
  }, [status, lockExpiresAt]);

  // Update timer every second when locked
  useEffect(() => {
    if (status !== "locked" || !lockExpiresAt) {
      setTimeRemaining(null);
      return;
    }

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [status, lockExpiresAt, updateTimeRemaining]);

  // Determine button state
  const isLocked = status === "locked" && timeRemaining !== null && timeRemaining > 0;
  const isSold = status === "sold";
  const isAvailable = status === "available";

  // Button content based on state
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Locking...</span>
        </>
      );
    }

    if (isSold) {
      return <span>Sold</span>;
    }

    if (isLocked) {
      return (
        <>
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
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{formatTimeRemaining(timeRemaining)}</span>
        </>
      );
    }

    return (
      <>
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Lock It In</span>
      </>
    );
  };

  // Button classes based on state
  const getButtonClasses = () => {
    const baseClasses = "neo-action neo-action-sm min-w-[100px]";

    if (disabled || isSold) {
      return `${baseClasses} opacity-50 cursor-not-allowed grayscale`;
    }

    if (isLocked) {
      return `${baseClasses} neo-locked cursor-default`;
    }

    return baseClasses;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading || isSold || isLocked}
      className={getButtonClasses()}
    >
      {getButtonContent()}
    </button>
  );
}

export default LockButton;
