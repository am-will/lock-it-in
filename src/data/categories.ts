/**
 * Category constants and types for Lock It In Trading Cards
 * Organized by group: TCG, Sports, and Other collectibles
 */

export type GradingStatus = "raw" | "graded";

export type CategoryGroup = "tcg" | "sports" | "other";

export type ListingStatus = "available" | "locked" | "sold" | "delisted";

export interface Category {
  id: string;
  name: string;
  group: CategoryGroup;
  description?: string;
}

export interface CategoryGroupConfig {
  id: CategoryGroup;
  name: string;
  description: string;
}

// Category group configurations
export const CATEGORY_GROUPS: CategoryGroupConfig[] = [
  {
    id: "tcg",
    name: "Trading Card Games",
    description: "Collectible card games and TCGs",
  },
  {
    id: "sports",
    name: "Sports Cards",
    description: "Sports trading cards and memorabilia",
  },
  {
    id: "other",
    name: "Other Collectibles",
    description: "Non-sport and vintage collectibles",
  },
];

// All categories organized by group
export const CATEGORIES: Category[] = [
  // TCG (Trading Card Games)
  {
    id: "pokemon",
    name: "Pokémon",
    group: "tcg",
    description: "Pokémon Trading Card Game",
  },
  {
    id: "mtg",
    name: "MTG",
    group: "tcg",
    description: "Magic: The Gathering",
  },
  {
    id: "yugioh",
    name: "Yu-Gi-Oh!",
    group: "tcg",
    description: "Yu-Gi-Oh! Trading Card Game",
  },
  {
    id: "lorcana",
    name: "Disney Lorcana",
    group: "tcg",
    description: "Disney Lorcana Trading Card Game",
  },
  {
    id: "onepiece",
    name: "One Piece",
    group: "tcg",
    description: "One Piece Card Game",
  },
  {
    id: "starwars-unlimited",
    name: "Star Wars: Unlimited",
    group: "tcg",
    description: "Star Wars: Unlimited Trading Card Game",
  },

  // Sports
  {
    id: "baseball",
    name: "Baseball",
    group: "sports",
    description: "MLB Baseball Cards",
  },
  {
    id: "basketball",
    name: "Basketball",
    group: "sports",
    description: "NBA Basketball Cards",
  },
  {
    id: "football",
    name: "Football",
    group: "sports",
    description: "NFL Football Cards",
  },
  {
    id: "hockey",
    name: "Hockey",
    group: "sports",
    description: "NHL Hockey Cards",
  },
  {
    id: "soccer",
    name: "Soccer",
    group: "sports",
    description: "Soccer/Football Cards",
  },
  {
    id: "f1-racing",
    name: "F1/Racing",
    group: "sports",
    description: "Formula 1 and Racing Cards",
  },
  {
    id: "ufc-mma",
    name: "UFC/MMA",
    group: "sports",
    description: "UFC and MMA Trading Cards",
  },

  // Other
  {
    id: "marvel",
    name: "Marvel",
    group: "other",
    description: "Marvel Trading Cards",
  },
  {
    id: "garbage-pail-kids",
    name: "Garbage Pail Kids",
    group: "other",
    description: "Garbage Pail Kids Trading Cards",
  },
  {
    id: "non-sport-vintage",
    name: "Non-Sport Vintage",
    group: "other",
    description: "Vintage Non-Sport Trading Cards",
  },
];

// Helper functions
export function getCategoriesByGroup(group: CategoryGroup): Category[] {
  return CATEGORIES.filter((cat) => cat.group === group);
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryGroupName(group: CategoryGroup): string {
  return CATEGORY_GROUPS.find((g) => g.id === group)?.name ?? group;
}

// Grading companies for graded cards
export const GRADING_COMPANIES = [
  "PSA",
  "BGS",
  "CGC",
  "SGC",
  "HGA",
  "ACE",
  "Other",
] as const;

export type GradingCompany = (typeof GRADING_COMPANIES)[number];

// Grade values (1-10 scale)
export const GRADE_VALUES = [
  1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
] as const;

export type GradeValue = (typeof GRADE_VALUES)[number];
