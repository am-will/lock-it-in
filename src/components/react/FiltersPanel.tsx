/**
 * FiltersPanel.tsx
 * 
 * Filter controls for the marketplace:
 * - Category group tabs (TCG, Sports, Other)
 * - Category dropdown (dependent on group)
 * - State dropdown
 * - Metro dropdown (dependent on state)
 * - Grading status toggle (Raw vs Graded)
 * 
 * Uses neomorphic inputs and buttons.
 * Collapsible on mobile.
 */

import React, { useMemo } from "react";
import type { FiltersPanelProps } from "../../types/marketplace";
import type { CategoryGroup } from "../../data/categories";
import {
  CATEGORY_GROUP_OPTIONS,
  GRADING_STATUS_OPTIONS,
  buildCategoryOptions,
  buildStateOptions,
  buildMetroOptions,
} from "../../data/filters";

// Category group icon mapping
const GROUP_ICONS: Record<string, string> = {
  all: "🎴",
  tcg: "🎮",
  sports: "🏆",
  other: "✨",
};

// Grading status icon mapping
const GRADING_ICONS: Record<string, string> = {
  all: "🎴",
  raw: "📦",
  graded: "✓",
};

export function FiltersPanel({
  filters,
  onChange,
  isOpen,
  onToggle,
  resultCount,
}: FiltersPanelProps) {
  // Build options based on current filters
  const categoryOptions = useMemo(
    () => buildCategoryOptions(filters.categoryGroup),
    [filters.categoryGroup]
  );

  const stateOptions = useMemo(() => buildStateOptions(), []);

  const metroOptions = useMemo(
    () => buildMetroOptions(filters.state),
    [filters.state]
  );

  // Handle filter changes
  const handleCategoryGroupChange = (group: CategoryGroup | "all") => {
    onChange({
      ...filters,
      categoryGroup: group,
      category: "all", // Reset category when group changes
    });
  };

  const handleStateChange = (state: string) => {
    onChange({
      ...filters,
      state,
      metro: "all", // Reset metro when state changes
    });
  };

  const handleReset = () => {
    onChange({
      categoryGroup: "all",
      category: "all",
      state: "all",
      metro: "all",
      gradingStatus: "all",
    });
  };

  const hasActiveFilters =
    filters.categoryGroup !== "all" ||
    filters.category !== "all" ||
    filters.state !== "all" ||
    filters.metro !== "all" ||
    filters.gradingStatus !== "all";

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={onToggle}
          className="neo-button w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
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
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="neo-badge neo-badge-gradient text-[10px] px-2">
                Active
              </span>
            )}
          </span>
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
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Filter Panel Content */}
      <div className={`${isOpen ? "block" : "hidden lg:block"}`}>
        <div className="neo-card space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-lg">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-xs text-accent-purple hover:text-accent-blue transition-colors font-medium"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Category Group Tabs */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted font-medium">
              Category Group
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORY_GROUP_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    handleCategoryGroupChange(option.value as CategoryGroup | "all")
                  }
                  className={`
                    neo-button neo-button-sm text-xs flex flex-col items-center gap-1 py-3
                    ${filters.categoryGroup === option.value ? "neo-pressed" : ""}
                  `}
                >
                  <span className="text-lg">{GROUP_ICONS[option.value]}</span>
                  <span className="truncate w-full text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted font-medium">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                onChange({ ...filters, category: e.target.value })
              }
              disabled={filters.categoryGroup === "all"}
              className="neo-input neo-select disabled:opacity-50"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="neo-divider" />

          {/* Location Filters */}
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-wider text-muted font-medium">
              Location
            </label>

            {/* State Dropdown */}
            <select
              value={filters.state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="neo-input neo-select"
            >
              {stateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Metro Dropdown */}
            <select
              value={filters.metro}
              onChange={(e) => onChange({ ...filters, metro: e.target.value })}
              disabled={filters.state === "all"}
              className="neo-input neo-select disabled:opacity-50"
            >
              {metroOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="neo-divider" />

          {/* Grading Status Toggle */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted font-medium">
              Card Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADING_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      gradingStatus: option.value as "all" | "raw" | "graded",
                    })
                  }
                  className={`
                    neo-button neo-button-sm text-xs flex flex-col items-center gap-1 py-3
                    ${filters.gradingStatus === option.value ? "neo-pressed" : ""}
                  `}
                >
                  <span>{GRADING_ICONS[option.value]}</span>
                  <span className="truncate w-full text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          {resultCount !== undefined && (
            <>
              <div className="neo-divider" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary">Results</span>
                <span className="font-display font-semibold">{resultCount}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FiltersPanel;
