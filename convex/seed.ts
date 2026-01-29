/**
 * Development seed data for Lock It In Trading Cards
 * 
 * This file contains dev-only functions to populate the database with mock listings.
 * Only available in development environment.
 * 
 * Usage:
 *   npx convex run seed:seedListings -- --first=true
 *   npx convex run seed:clearListings
 *   npx convex run seed:resetAll
 */

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// ============================================================================
// MOCK USER IDs
// ============================================================================

const MOCK_SELLERS = [
  { clerkId: "mock_seller_1", phone: "+1-555-0101", city: "Los Angeles", state: "CA", metro: "Los Angeles-Long Beach-Anaheim" },
  { clerkId: "mock_seller_2", phone: "+1-555-0102", city: "New York", state: "NY", metro: "New York-Newark-Jersey City" },
  { clerkId: "mock_seller_3", phone: "+1-555-0103", city: "Chicago", state: "IL", metro: "Chicago-Naperville-Elgin" },
  { clerkId: "mock_seller_4", phone: "+1-555-0104", city: "Houston", state: "TX", metro: "Houston-The Woodlands-Sugar Land" },
  { clerkId: "mock_seller_5", phone: "+1-555-0105", city: "Phoenix", state: "AZ", metro: "Phoenix-Mesa-Chandler" },
];

// ============================================================================
// SEED LISTINGS DATA
// ============================================================================

interface SeedListing {
  title: string;
  priceCents: number;
  categoryGroup: "tcg" | "sports" | "other";
  category: string;
  gradedStatus: "raw" | "graded";
  gradeCompany?: "PSA" | "BGS" | "CGC" | "SGC";
  gradeValue?: 8 | 8.5 | 9 | 9.5 | 10;
  city: string;
  state: string;
  metro: string;
  imageUrl: string;
}

const SEED_LISTINGS: SeedListing[] = [
  // ==========================================================================
  // POKEMON (TCG)
  // ==========================================================================
  {
    title: "Charizard Base Set 1st Edition Shadowless PSA 10",
    priceCents: 500000, // $5,000
    categoryGroup: "tcg",
    category: "pokemon",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    city: "Los Angeles",
    state: "CA",
    metro: "Los Angeles-Long Beach-Anaheim",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },
  {
    title: "Pikachu Illustrator Promo - Raw Near Mint",
    priceCents: 250000, // $2,500
    categoryGroup: "tcg",
    category: "pokemon",
    gradedStatus: "raw",
    city: "New York",
    state: "NY",
    metro: "New York-Newark-Jersey City",
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&h=300&fit=crop",
  },
  {
    title: "Blastoise Base Set Holo PSA 9",
    priceCents: 85000, // $850
    categoryGroup: "tcg",
    category: "pokemon",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 9,
    city: "Chicago",
    state: "IL",
    metro: "Chicago-Naperville-Elgin",
    imageUrl: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=300&fit=crop",
  },
  {
    title: "Mewtwo GX Rainbow Rare - Raw",
    priceCents: 4500, // $45
    categoryGroup: "tcg",
    category: "pokemon",
    gradedStatus: "raw",
    city: "Miami",
    state: "FL",
    metro: "Miami-Fort Lauderdale-West Palm Beach",
    imageUrl: "https://images.unsplash.com/photo-1642425149556-b6f90e946859?w=400&h=300&fit=crop",
  },
  {
    title: "Lugia Neo Genesis 1st Edition PSA 8.5",
    priceCents: 120000, // $1,200
    categoryGroup: "tcg",
    category: "pokemon",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 8.5,
    city: "Dallas",
    state: "TX",
    metro: "Dallas-Fort Worth-Arlington",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },
  {
    title: "Rayquaza VMAX Alt Art - CGC 9.5",
    priceCents: 32000, // $320
    categoryGroup: "tcg",
    category: "pokemon",
    gradedStatus: "graded",
    gradeCompany: "CGC",
    gradeValue: 9.5,
    city: "Denver",
    state: "CO",
    metro: "Denver-Aurora-Lakewood",
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // MAGIC: THE GATHERING (TCG)
  // ==========================================================================
  {
    title: "Black Lotus Alpha - BGS 9.5 Gem Mint",
    priceCents: 500000, // $5,000 (demo price, real ones are $100k+)
    categoryGroup: "tcg",
    category: "mtg",
    gradedStatus: "graded",
    gradeCompany: "BGS",
    gradeValue: 9.5,
    city: "Seattle",
    state: "WA",
    metro: "Seattle-Tacoma-Bellevue",
    imageUrl: "https://images.unsplash.com/photo-1599409636242-7588b7f20c46?w=400&h=300&fit=crop",
  },
  {
    title: "Mox Pearl Beta - Raw LP",
    priceCents: 85000, // $850
    categoryGroup: "tcg",
    category: "mtg",
    gradedStatus: "raw",
    city: "Boston",
    state: "MA",
    metro: "Boston-Cambridge-Newton",
    imageUrl: "https://images.unsplash.com/photo-1599409636242-7588b7f20c46?w=400&h=300&fit=crop",
  },
  {
    title: "Time Walk Unlimited - PSA 8",
    priceCents: 150000, // $1,500
    categoryGroup: "tcg",
    category: "mtg",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 8,
    city: "San Francisco",
    state: "CA",
    metro: "San Francisco-Oakland-Berkeley",
    imageUrl: "https://images.unsplash.com/photo-1599409636242-7588b7f20c46?w=400&h=300&fit=crop",
  },
  {
    title: "Liliana of the Veil - Foil Modern Masters",
    priceCents: 12000, // $120
    categoryGroup: "tcg",
    category: "mtg",
    gradedStatus: "raw",
    city: "Atlanta",
    state: "GA",
    metro: "Atlanta-Sandy Springs-Roswell",
    imageUrl: "https://images.unsplash.com/photo-1599409636242-7588b7f20c46?w=400&h=300&fit=crop",
  },
  {
    title: "Force of Will Alliances - CGC 9",
    priceCents: 25000, // $250
    categoryGroup: "tcg",
    category: "mtg",
    gradedStatus: "graded",
    gradeCompany: "CGC",
    gradeValue: 9,
    city: "Phoenix",
    state: "AZ",
    metro: "Phoenix-Mesa-Chandler",
    imageUrl: "https://images.unsplash.com/photo-1599409636242-7588b7f20c46?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // YU-GI-OH! (TCG)
  // ==========================================================================
  {
    title: "Blue-Eyes White Dragon LOB 1st Edition - SGC 9.5",
    priceCents: 45000, // $450
    categoryGroup: "tcg",
    category: "yugioh",
    gradedStatus: "graded",
    gradeCompany: "SGC",
    gradeValue: 9.5,
    city: "Las Vegas",
    state: "NV",
    metro: "Las Vegas-Henderson-Paradise",
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&h=300&fit=crop",
  },
  {
    title: "Dark Magician Starter Deck Yugi - Raw NM",
    priceCents: 8000, // $80
    categoryGroup: "tcg",
    category: "yugioh",
    gradedStatus: "raw",
    city: "Orlando",
    state: "FL",
    metro: "Orlando-Kissimmee-Sanford",
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&h=300&fit=crop",
  },
  {
    title: "Exodia the Forbidden One Complete Set - PSA 9",
    priceCents: 65000, // $650
    categoryGroup: "tcg",
    category: "yugioh",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 9,
    city: "Philadelphia",
    state: "PA",
    metro: "Philadelphia-Camden-Wilmington",
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // DISNEY LORCANA (TCG)
  // ==========================================================================
  {
    title: "Mickey Mouse Brave Little Tailor - Enchanted PSA 10",
    priceCents: 28000, // $280
    categoryGroup: "tcg",
    category: "lorcana",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    city: "Austin",
    state: "TX",
    metro: "Austin-Round Rock-Georgetown",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },
  {
    title: "Elsa Snow Queen - Foil Raw",
    priceCents: 3500, // $35
    categoryGroup: "tcg",
    category: "lorcana",
    gradedStatus: "raw",
    city: "Portland",
    state: "OR",
    metro: "Portland-Vancouver-Hillsboro",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },
  {
    title: "Stitch Rock Star - Legendary CGC 9.5",
    priceCents: 12000, // $120
    categoryGroup: "tcg",
    category: "lorcana",
    gradedStatus: "graded",
    gradeCompany: "CGC",
    gradeValue: 9.5,
    city: "San Diego",
    state: "CA",
    metro: "San Diego-Chula Vista-Carlsbad",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // ONE PIECE (TCG)
  // ==========================================================================
  {
    title: "Monkey D. Luffy OP01 - Manga Alt Art PSA 10",
    priceCents: 18000, // $180
    categoryGroup: "tcg",
    category: "onepiece",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    city: "Tampa",
    state: "FL",
    metro: "Tampa-St. Petersburg-Clearwater",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },
  {
    title: "Shanks OP01-Sec - Raw NM",
    priceCents: 5500, // $55
    categoryGroup: "tcg",
    category: "onepiece",
    gradedStatus: "raw",
    city: "Houston",
    state: "TX",
    metro: "Houston-The Woodlands-Sugar Land",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // STAR WARS: UNLIMITED (TCG)
  // ==========================================================================
  {
    title: "Darth Vader Hyperspace Foil - BGS 9",
    priceCents: 22000, // $220
    categoryGroup: "tcg",
    category: "starwars-unlimited",
    gradedStatus: "graded",
    gradeCompany: "BGS",
    gradeValue: 9,
    city: "Detroit",
    state: "MI",
    metro: "Detroit-Warren-Dearborn",
    imageUrl: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=300&fit=crop",
  },
  {
    title: "Luke Skywalker Leader - Raw",
    priceCents: 4500, // $45
    categoryGroup: "tcg",
    category: "starwars-unlimited",
    gradedStatus: "raw",
    city: "Minneapolis",
    state: "MN",
    metro: "Minneapolis-St. Paul-Bloomington",
    imageUrl: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // BASEBALL (SPORTS)
  // ==========================================================================
  {
    title: "Mike Trout 2011 Update US175 RC - PSA 10",
    priceCents: 95000, // $950
    categoryGroup: "sports",
    category: "baseball",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    city: "Los Angeles",
    state: "CA",
    metro: "Los Angeles-Long Beach-Anaheim",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },
  {
    title: "Ken Griffey Jr 1989 Upper Deck Star Rookie - BGS 9.5",
    priceCents: 32000, // $320
    categoryGroup: "sports",
    category: "baseball",
    gradedStatus: "graded",
    gradeCompany: "BGS",
    gradeValue: 9.5,
    city: "Seattle",
    state: "WA",
    metro: "Seattle-Tacoma-Bellevue",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },
  {
    title: "Shohei Ohtani 2018 Topps Chrome RC - Raw NM",
    priceCents: 18000, // $180
    categoryGroup: "sports",
    category: "baseball",
    gradedStatus: "raw",
    city: "Anaheim",
    state: "CA",
    metro: "Los Angeles-Long Beach-Anaheim",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // BASKETBALL (SPORTS)
  // ==========================================================================
  {
    title: "Michael Jordan 1986 Fleer RC #57 - PSA 9",
    priceCents: 450000, // $4,500
    categoryGroup: "sports",
    category: "basketball",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 9,
    city: "Chicago",
    state: "IL",
    metro: "Chicago-Naperville-Elgin",
    imageUrl: "https://images.unsplash.com/photo-1574602305399-0fca766684c0?w=400&h=300&fit=crop",
  },
  {
    title: "LeBron James 2003 Topps Chrome RC - BGS 9.5",
    priceCents: 320000, // $3,200
    categoryGroup: "sports",
    category: "basketball",
    gradedStatus: "graded",
    gradeCompany: "BGS",
    gradeValue: 9.5,
    city: "Cleveland",
    state: "OH",
    metro: "Cleveland-Elyria",
    imageUrl: "https://images.unsplash.com/photo-1574602305399-0fca766684c0?w=400&h=300&fit=crop",
  },
  {
    title: "Victor Wembanyama 2023 Prizm RC - Raw",
    priceCents: 25000, // $250
    categoryGroup: "sports",
    category: "basketball",
    gradedStatus: "raw",
    city: "San Antonio",
    state: "TX",
    metro: "San Antonio-New Braunfels",
    imageUrl: "https://images.unsplash.com/photo-1574602305399-0fca766684c0?w=400&h=300&fit=crop",
  },
  {
    title: "Stephen Curry 2009 Topps Chrome RC - PSA 10",
    priceCents: 280000, // $2,800
    categoryGroup: "sports",
    category: "basketball",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    city: "San Francisco",
    state: "CA",
    metro: "San Francisco-Oakland-Berkeley",
    imageUrl: "https://images.unsplash.com/photo-1574602305399-0fca766684c0?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // FOOTBALL (SPORTS)
  // ==========================================================================
  {
    title: "Tom Brady 2000 SP Authentic RC /1250 - PSA 10",
    priceCents: 180000, // $1,800
    categoryGroup: "sports",
    category: "football",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    city: "Boston",
    state: "MA",
    metro: "Boston-Cambridge-Newton",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },
  {
    title: "Joe Burrow 2020 Prizm Silver RC - CGC 9.5",
    priceCents: 22000, // $220
    categoryGroup: "sports",
    category: "football",
    gradedStatus: "graded",
    gradeCompany: "CGC",
    gradeValue: 9.5,
    city: "Cincinnati",
    state: "OH",
    metro: "Cincinnati",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },
  {
    title: "Patrick Mahomes 2017 Optic Holo RC - Raw",
    priceCents: 75000, // $750
    categoryGroup: "sports",
    category: "football",
    gradedStatus: "raw",
    city: "Kansas City",
    state: "MO",
    metro: "Kansas City",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // HOCKEY (SPORTS)
  // ==========================================================================
  {
    title: "Connor McDavid 2015 UD Young Guns RC - PSA 10",
    priceCents: 18000, // $180
    categoryGroup: "sports",
    category: "hockey",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    city: "Edmonton",
    state: "AB",
    metro: "Seattle-Tacoma-Bellevue",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },
  {
    title: "Wayne Gretzky 1979 O-Pee-Chee RC - BGS 8",
    priceCents: 95000, // $950
    categoryGroup: "sports",
    category: "hockey",
    gradedStatus: "graded",
    gradeCompany: "BGS",
    gradeValue: 8,
    city: "Toronto",
    state: "ON",
    metro: "Detroit-Warren-Dearborn",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // SOCCER (SPORTS)
  // ==========================================================================
  {
    title: "Lionel Messi 2004 Panini Megacracks RC - PSA 9",
    priceCents: 125000, // $1,250
    categoryGroup: "sports",
    category: "soccer",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 9,
    city: "Miami",
    state: "FL",
    metro: "Miami-Fort Lauderdale-West Palm Beach",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },
  {
    title: "Erling Haaland 2019 Topps Chrome - Raw",
    priceCents: 12000, // $120
    categoryGroup: "sports",
    category: "soccer",
    gradedStatus: "raw",
    city: "New York",
    state: "NY",
    metro: "New York-Newark-Jersey City",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // F1/RACING (SPORTS)
  // ==========================================================================
  {
    title: "Lewis Hamilton 2020 Topps Chrome F1 - CGC 10",
    priceCents: 8500, // $85
    categoryGroup: "sports",
    category: "f1-racing",
    gradedStatus: "graded",
    gradeCompany: "CGC",
    gradeValue: 10,
    city: "Austin",
    state: "TX",
    metro: "Austin-Round Rock-Georgetown",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },
  {
    title: "Max Verstappen 2016 Topps F1 RC - Raw",
    priceCents: 5500, // $55
    categoryGroup: "sports",
    category: "f1-racing",
    gradedStatus: "raw",
    city: "Las Vegas",
    state: "NV",
    metro: "Las Vegas-Henderson-Paradise",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // UFC/MMA (SPORTS)
  // ==========================================================================
  {
    title: "Conor McGregor 2013 Topps UFC RC - PSA 10",
    priceCents: 28000, // $280
    categoryGroup: "sports",
    category: "ufc-mma",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    city: "Las Vegas",
    state: "NV",
    metro: "Las Vegas-Henderson-Paradise",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },
  {
    title: "Israel Adesanya 2019 Topps UFC - Raw",
    priceCents: 3500, // $35
    categoryGroup: "sports",
    category: "ufc-mma",
    gradedStatus: "raw",
    city: "Phoenix",
    state: "AZ",
    metro: "Phoenix-Mesa-Chandler",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // MARVEL (OTHER)
  // ==========================================================================
  {
    title: "Spider-Man 1990 Marvel Universe #1 - PSA 10",
    priceCents: 12000, // $120
    categoryGroup: "other",
    category: "marvel",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 10,
    city: "New York",
    state: "NY",
    metro: "New York-Newark-Jersey City",
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=300&fit=crop",
  },
  {
    title: "Wolverine 1992 Marvel Masterpieces - Raw",
    priceCents: 2500, // $25
    categoryGroup: "other",
    category: "marvel",
    gradedStatus: "raw",
    city: "Los Angeles",
    state: "CA",
    metro: "Los Angeles-Long Beach-Anaheim",
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=300&fit=crop",
  },
  {
    title: "Thanos Infinity Gauntlet Sketch - CGC 9.5",
    priceCents: 35000, // $350
    categoryGroup: "other",
    category: "marvel",
    gradedStatus: "graded",
    gradeCompany: "CGC",
    gradeValue: 9.5,
    city: "Atlanta",
    state: "GA",
    metro: "Atlanta-Sandy Springs-Roswell",
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // GARBAGE PAIL KIDS (OTHER)
  // ==========================================================================
  {
    title: "Adam Bomb 1985 GPK 1st Series - PSA 9",
    priceCents: 45000, // $450
    categoryGroup: "other",
    category: "garbage-pail-kids",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 9,
    city: "Chicago",
    state: "IL",
    metro: "Chicago-Naperville-Elgin",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },
  {
    title: "Dead Ted 1985 GPK OS1 - Raw",
    priceCents: 1200, // $12
    categoryGroup: "other",
    category: "garbage-pail-kids",
    gradedStatus: "raw",
    city: "Detroit",
    state: "MI",
    metro: "Detroit-Warren-Dearborn",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },

  // ==========================================================================
  // NON-SPORT VINTAGE (OTHER)
  // ==========================================================================
  {
    title: "Star Wars 1977 Topps #1 Luke Skywalker - PSA 8",
    priceCents: 18000, // $180
    categoryGroup: "other",
    category: "non-sport-vintage",
    gradedStatus: "graded",
    gradeCompany: "PSA",
    gradeValue: 8,
    city: "Los Angeles",
    state: "CA",
    metro: "Los Angeles-Long Beach-Anaheim",
    imageUrl: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&h=300&fit=crop",
  },
  {
    title: "Batman 1966 Topps #1 The Batman - BGS 7.5",
    priceCents: 8500, // $85
    categoryGroup: "other",
    category: "non-sport-vintage",
    gradedStatus: "graded",
    gradeCompany: "BGS",
    gradeValue: 8,
    city: "New York",
    state: "NY",
    metro: "New York-Newark-Jersey City",
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=300&fit=crop",
  },
  {
    title: "Wacky Packages 1973 Series 1 - Raw",
    priceCents: 4500, // $45
    categoryGroup: "other",
    category: "non-sport-vintage",
    gradedStatus: "raw",
    city: "Philadelphia",
    state: "PA",
    metro: "Philadelphia-Camden-Wilmington",
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if running in development environment
 */
function isDevelopment(): boolean {
  // In Convex, we can check the deployment name or environment
  // For safety, we require an explicit flag
  return process.env.CONVEX_ENV !== "production";
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Create mock seller users for seed data
 * Internal mutation - can only be called from other Convex functions
 */
export const createMockUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const userIds: string[] = [];

    for (const seller of MOCK_SELLERS) {
      // Check if user already exists
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", seller.clerkId))
        .unique();

      if (existing) {
        userIds.push(existing._id);
        continue;
      }

      // Create mock user
      const userId = await ctx.db.insert("users", {
        clerkId: seller.clerkId,
        phone: seller.phone,
        phoneVerifiedAt: now,
        identityStatus: "verified",
        identitySessionId: undefined,
        city: seller.city,
        state: seller.state,
        metro: seller.metro,
        createdAt: now,
      });

      userIds.push(userId);
    }

    return { userIds, count: userIds.length };
  },
});

/**
 * Main seed function - creates mock users and listings
 * 
 * Usage: npx convex run seed:seedListings -- --first=true
 */
export const seedListings = mutation({
  args: {
    first: v.optional(v.boolean()), // Set to true to confirm
    clearExisting: v.optional(v.boolean()), // Clear listings first
  },
  handler: async (ctx, args) => {
    // Safety check - require explicit confirmation
    if (!args.first) {
      throw new Error(
        "This will seed demo data. Run with --first=true to confirm. " +
        "To also clear existing listings, add --clearExisting=true"
      );
    }

    // Optional: Clear existing listings first
    if (args.clearExisting) {
      const existing = await ctx.db.query("listings").collect();
      for (const listing of existing) {
        await ctx.db.delete(listing._id);
      }
    }

    // Step 1: Create mock users
    const { userIds } = await ctx.scheduler.runPromise(
      internal.seed.createMockUsers,
      {}
    );

    if (userIds.length === 0) {
      throw new Error("Failed to create mock users");
    }

    // Step 2: Create listings
    const now = Date.now();
    let createdCount = 0;
    const createdIds: string[] = [];

    for (const seed of SEED_LISTINGS) {
      // Pick a random seller
      const sellerId = userIds[Math.floor(Math.random() * userIds.length)];

      const listingId = await ctx.db.insert("listings", {
        title: seed.title,
        priceCents: seed.priceCents,
        currency: "usd",
        imageUrl: seed.imageUrl,
        categoryGroup: seed.categoryGroup,
        category: seed.category,
        gradedStatus: seed.gradedStatus,
        gradeCompany: seed.gradeCompany,
        gradeValue: seed.gradeValue,
        sellerId,
        city: seed.city,
        state: seed.state,
        metro: seed.metro,
        status: "available",
        createdAt: now + createdCount, // Slight offset for consistent ordering
      });

      createdIds.push(listingId);
      createdCount++;
    }

    return {
      success: true,
      usersCreated: userIds.length,
      listingsCreated: createdCount,
      listingIds: createdIds,
    };
  },
});

/**
 * Clear all seeded listings (and optionally mock users)
 * 
 * Usage: npx convex run seed:clearListings -- --includeUsers=true
 */
export const clearListings = mutation({
  args: {
    first: v.optional(v.boolean()), // Set to true to confirm
    includeUsers: v.optional(v.boolean()), // Also delete mock users
  },
  handler: async (ctx, args) => {
    if (!args.first) {
      throw new Error(
        "This will DELETE all listings! Run with --first=true to confirm. " +
        "Add --includeUsers=true to also delete mock users."
      );
    }

    // Delete all listings
    const listings = await ctx.db.query("listings").collect();
    let deletedListings = 0;
    for (const listing of listings) {
      await ctx.db.delete(listing._id);
      deletedListings++;
    }

    // Optionally delete mock users
    let deletedUsers = 0;
    if (args.includeUsers) {
      for (const seller of MOCK_SELLERS) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", seller.clerkId))
          .unique();

        if (user) {
          await ctx.db.delete(user._id);
          deletedUsers++;
        }
      }
    }

    return {
      success: true,
      deletedListings,
      deletedUsers,
    };
  },
});

/**
 * Reset all - clears and re-seeds
 * 
 * Usage: npx convex run seed:resetAll -- --first=true
 */
export const resetAll = mutation({
  args: {
    first: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.first) {
      throw new Error("This will RESET all demo data. Run with --first=true to confirm.");
    }

    // Clear existing listings
    const existing = await ctx.db.query("listings").collect();
    for (const listing of existing) {
      await ctx.db.delete(listing._id);
    }

    // Re-seed
    return ctx.runMutation(internal.seed.seedListings, { first: true });
  },
});

/**
 * Get seed statistics
 * 
 * Usage: npx convex run seed:getStats
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db.query("listings").collect();
    
    // Count by category group
    const byGroup: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byGradedStatus: Record<string, number> = {};
    const byGradeCompany: Record<string, number> = {};

    for (const listing of listings) {
      byGroup[listing.categoryGroup] = (byGroup[listing.categoryGroup] || 0) + 1;
      byCategory[listing.category] = (byCategory[listing.category] || 0) + 1;
      byGradedStatus[listing.gradedStatus] = (byGradedStatus[listing.gradedStatus] || 0) + 1;
      if (listing.gradeCompany) {
        byGradeCompany[listing.gradeCompany] = (byGradeCompany[listing.gradeCompany] || 0) + 1;
      }
    }

    return {
      totalListings: listings.length,
      byCategoryGroup: byGroup,
      byCategory: byCategory,
      byGradedStatus: byGradedStatus,
      byGradeCompany: byGradeCompany,
    };
  },
});

/**
 * Check if mock users exist
 * 
 * Usage: npx convex run seed:checkMockUsers
 */
export const checkMockUsers = query({
  args: {},
  handler: async (ctx) => {
    const results = [];
    
    for (const seller of MOCK_SELLERS) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", seller.clerkId))
        .unique();
      
      results.push({
        clerkId: seller.clerkId,
        exists: !!user,
        userId: user?._id,
        city: user?.city,
      });
    }

    return results;
  },
});
