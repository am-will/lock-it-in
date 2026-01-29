/**
 * Combined filter configuration for the Lock It In marketplace
 * Exports all filter-related types, data, and helper functions
 */

// Import types and data first
import type {
  GradingStatus,
  CategoryGroup,
  ListingStatus,
  Category,
  CategoryGroupConfig,
  GradingCompany,
  GradeValue,
} from "./categories";

import type { Location } from "./locations";
import type { Metro } from "./metros";

// Re-export all types
export type {
  GradingStatus,
  CategoryGroup,
  ListingStatus,
  Category,
  CategoryGroupConfig,
  GradingCompany,
  GradeValue,
  Location,
  Metro,
};

// Import data and functions
import {
  CATEGORY_GROUPS,
  CATEGORIES,
  GRADING_COMPANIES,
  GRADE_VALUES,
  getCategoriesByGroup,
  getCategoryById,
  getCategoryGroupName,
} from "./categories";

import {
  US_STATES,
  US_STATES_BY_NAME,
  US_STATES_BY_CODE,
  getStateByCode,
  getStateByName,
  getStateName,
  getStateCode,
} from "./locations";

import {
  TOP_50_METROS,
  METROS_BY_NAME,
  METROS_BY_RANK,
  getMetroById,
  getMetroByName,
  getMetrosByState,
  getMetroName,
} from "./metros";

// Re-export all data and functions
export {
  CATEGORY_GROUPS,
  CATEGORIES,
  GRADING_COMPANIES,
  GRADE_VALUES,
  getCategoriesByGroup,
  getCategoryById,
  getCategoryGroupName,
  US_STATES,
  US_STATES_BY_NAME,
  US_STATES_BY_CODE,
  getStateByCode,
  getStateByName,
  getStateName,
  getStateCode,
  TOP_50_METROS,
  METROS_BY_NAME,
  METROS_BY_RANK,
  getMetroById,
  getMetroByName,
  getMetrosByState,
  getMetroName,
};

// Filter option interfaces for UI components
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  name: string;
  options: FilterOption[];
}

// Grading status filter options
export const GRADING_STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Cards" },
  { value: "raw", label: "Raw (Ungraded)" },
  { value: "graded", label: "Graded" },
];

// Category group filter options
export const CATEGORY_GROUP_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Categories" },
  { value: "tcg", label: "Trading Card Games" },
  { value: "sports", label: "Sports Cards" },
  { value: "other", label: "Other Collectibles" },
];

// Build category options for a specific group
export function buildCategoryOptions(
  groupFilter: CategoryGroup | "all"
): FilterOption[] {
  const base: FilterOption[] = [{ value: "all", label: "All" }];
  
  if (groupFilter === "all") {
    return base;
  }
  
  const categories = getCategoriesByGroup(groupFilter);
  return [
    ...base,
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];
}

// Build state filter options
export function buildStateOptions(): FilterOption[] {
  return [
    { value: "all", label: "All States" },
    ...US_STATES_BY_NAME.map((state) => ({
      value: state.code,
      label: state.name,
    })),
  ];
}

// Build metro filter options for a specific state
export function buildMetroOptions(stateCode: string | "all"): FilterOption[] {
  const base: FilterOption[] = [{ value: "all", label: "All Metros" }];
  
  if (stateCode === "all") {
    return base;
  }
  
  const metros = getMetrosByState(stateCode);
  return [
    ...base,
    ...metros.map((metro) => ({
      value: metro.id,
      label: metro.name,
    })),
  ];
}

// Default filter configuration for marketplace
export interface FilterConfig {
  categoryGroup: CategoryGroup | "all";
  category: string;
  gradingStatus: GradingStatus | "all";
  state: string;
  metro: string;
  priceMin?: number;
  priceMax?: number;
}

export const DEFAULT_FILTER_CONFIG: FilterConfig = {
  categoryGroup: "all",
  category: "all",
  gradingStatus: "all",
  state: "all",
  metro: "all",
};

// Helper to check if any filters are active
export function hasActiveFilters(config: FilterConfig): boolean {
  return (
    config.categoryGroup !== "all" ||
    config.category !== "all" ||
    config.gradingStatus !== "all" ||
    config.state !== "all" ||
    config.metro !== "all" ||
    config.priceMin !== undefined ||
    config.priceMax !== undefined
  );
}

// Helper to reset filters
export function resetFilters(): FilterConfig {
  return { ...DEFAULT_FILTER_CONFIG };
}
