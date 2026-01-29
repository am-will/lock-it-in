/**
 * Mock listings for demo/development without Convex backend
 * Using high-quality trading card images from card database APIs and Unsplash
 */

import type { Listing } from "../types/marketplace";

// Trading card images from reliable sources
const cardImages = {
  // Charizard - from official Pokemon.com
  charizard: "https://assets.pokemon.com/assets/cms2/img/cards/web/SM9/SM9_EN_1.png",
  // Black Lotus Alpha - from Scryfall
  blackLotus: "https://cards.scryfall.io/large/front/b/0/b0faa7f2-b547-42c4-a810-839da50dadfe.jpg?1559591477",
  // Mickey Mantle - from NYT
  mickeyMantle: "https://static01.nyt.com/images/2022/08/28/multimedia/28xp-baseball-top/28xp-baseball-top-mediumSquareAt3X.jpg",
  // Blue-Eyes White Dragon - from YGOPRODeck
  blueEyes: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
  // Michael Jordan - from Amazon
  michaelJordan: "https://m.media-amazon.com/images/I/71YyrFpxzjL._AC_UF894,1000_QL80_.jpg",
  // Spider-Man #1 Marvel - from Reddit
  spiderMan: "https://i.redd.it/xpcptrut9v951.jpg",
  // Pikachu - from Pokemon.com
  pikachu: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH3/SWSH3_EN_62.png",
  // Tom Brady - from Beckett
  tomBrady: "https://img.beckett.com/news/news-content/uploads/2021/01/2000-Momentum-Tom-Brady-RC.jpg",
  // Garbage Pail Kids Adam Bomb
  garbagePail: "https://s3.amazonaws.com/ccg-corporate-production/news-images/1980Adam_FR_lg20240711141901960.png",
};

export const mockListings: Listing[] = [
  {
    _id: "mock_1" as any,
    _creationTime: Date.now() - 86400000,
    title: "Charizard Base Set 1st Edition",
    priceCents: 45000,
    currency: "USD",
    imageUrl: cardImages.charizard,
    categoryGroup: "tcg",
    category: "pokemon",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 9,
    sellerId: "seller_1" as any,
    city: "Los Angeles",
    state: "CA",
    metro: "los-angeles-ca",
    status: "available",
  },
  {
    _id: "mock_2" as any,
    _creationTime: Date.now() - 172800000,
    title: "Black Lotus Alpha",
    priceCents: 250000,
    currency: "USD",
    imageUrl: cardImages.blackLotus,
    categoryGroup: "tcg",
    category: "mtg",
    gradedStatus: "graded",
    gradeCompany: "BGS",
    gradeValue: 8.5,
    sellerId: "seller_2" as any,
    city: "New York",
    state: "NY",
    metro: "new-york-ny",
    status: "available",
  },
  {
    _id: "mock_3" as any,
    _creationTime: Date.now() - 3600000,
    title: "Mickey Mantle 1952 Topps",
    priceCents: 125000,
    currency: "USD",
    imageUrl: cardImages.mickeyMantle,
    categoryGroup: "sports",
    category: "baseball",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 7,
    sellerId: "seller_3" as any,
    city: "Chicago",
    state: "IL",
    metro: "chicago-il",
    status: "available",
  },
  {
    _id: "mock_4" as any,
    _creationTime: Date.now() - 432000000,
    title: "Blue-Eyes White Dragon",
    priceCents: 3500,
    currency: "USD",
    imageUrl: cardImages.blueEyes,
    categoryGroup: "tcg",
    category: "yugioh",
    gradedStatus: "raw",
    sellerId: "seller_1" as any,
    city: "Houston",
    state: "TX",
    metro: "houston-tx",
    status: "available",
  },
  {
    _id: "mock_5" as any,
    _creationTime: Date.now() - 7200000,
    title: "Michael Jordan 1986 Fleer",
    priceCents: 28000,
    currency: "USD",
    imageUrl: cardImages.michaelJordan,
    categoryGroup: "sports",
    category: "basketball",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 8,
    sellerId: "seller_4" as any,
    city: "Phoenix",
    state: "AZ",
    metro: "phoenix-az",
    status: "available",
  },
  {
    _id: "mock_6" as any,
    _creationTime: Date.now() - 129600000,
    title: "Spider-Man #1 Marvel",
    priceCents: 1800,
    currency: "USD",
    imageUrl: cardImages.spiderMan,
    categoryGroup: "other",
    category: "marvel",
    gradedStatus: "raw",
    sellerId: "seller_2" as any,
    city: "Miami",
    state: "FL",
    metro: "miami-fl",
    status: "available",
  },
  {
    _id: "mock_7" as any,
    _creationTime: Date.now() - 259200000,
    title: "Pikachu Illustrator",
    priceCents: 150000,
    currency: "USD",
    imageUrl: cardImages.pikachu,
    categoryGroup: "tcg",
    category: "pokemon",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    sellerId: "seller_5" as any,
    city: "San Francisco",
    state: "CA",
    metro: "san-francisco-ca",
    status: "available",
  },
  {
    _id: "mock_8" as any,
    _creationTime: Date.now() - 5400000,
    title: "Tom Brady Rookie Card",
    priceCents: 8500,
    currency: "USD",
    imageUrl: cardImages.tomBrady,
    categoryGroup: "sports",
    category: "football",
    gradedStatus: "graded",
    gradeCompany: "SGC",
    gradeValue: 9,
    sellerId: "seller_3" as any,
    city: "Boston",
    state: "MA",
    metro: "boston-ma",
    status: "available",
  },
  {
    _id: "mock_9" as any,
    _creationTime: Date.now() - 345600000,
    title: "Garbage Pail Kids Adam Bomb",
    priceCents: 450,
    currency: "USD",
    imageUrl: cardImages.garbagePail,
    categoryGroup: "other",
    category: "gpk",
    gradedStatus: "raw",
    sellerId: "seller_4" as any,
    city: "Seattle",
    state: "WA",
    metro: "seattle-wa",
    status: "available",
  },
];

/**
 * Filter mock listings based on filter criteria
 */
export function filterMockListings(filters: {
  categoryGroup?: string;
  category?: string;
  state?: string;
  metro?: string;
  gradedStatus?: string;
}): Listing[] {
  return mockListings.filter((listing) => {
    if (filters.categoryGroup && filters.categoryGroup !== "all" && listing.categoryGroup !== filters.categoryGroup) {
      return false;
    }
    if (filters.category && filters.category !== "all" && listing.category !== filters.category) {
      return false;
    }
    if (filters.state && filters.state !== "all" && listing.state !== filters.state) {
      return false;
    }
    if (filters.metro && filters.metro !== "all" && listing.metro !== filters.metro) {
      return false;
    }
    if (filters.gradedStatus && filters.gradedStatus !== "all" && listing.gradedStatus !== filters.gradedStatus) {
      return false;
    }
    return true;
  });
}
