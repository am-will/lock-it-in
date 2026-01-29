# Demo Data Seeding Guide

This guide explains how to seed demo listings for the Lock It In Trading Cards platform.

## Overview

The seeding system creates:
- **5 mock seller users** across different US metros (LA, NYC, Chicago, Houston, Phoenix)
- **40 diverse demo listings** covering all category groups and types

## Quick Start

### 1. Seed Demo Listings

```bash
# Using npm script (recommended)
npm run seed

# Or using Convex CLI directly
npx convex run seed:seedListings -- --first=true
```

### 2. View Statistics

```bash
npm run seed:stats
```

### 3. Reset All Demo Data

```bash
npm run seed:reset
```

### 4. Clear All Listings

```bash
npm run seed:clear
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run seed` | Seed demo listings (safe to run multiple times) |
| `npm run seed:reset` | Clear all listings and re-seed |
| `npm run seed:clear` | Delete all listings and mock users |
| `npm run seed:stats` | View current seed statistics |
| `npm run seed:check` | Check if mock users exist |

## Seed Data Coverage

### By Category Group

| Group | Count | Categories |
|-------|-------|------------|
| **TCG** | 21 | Pokemon (6), MTG (5), Yu-Gi-Oh! (3), Lorcana (3), One Piece (2), Star Wars Unlimited (2) |
| **Sports** | 18 | Baseball (3), Basketball (4), Football (3), Hockey (2), Soccer (2), F1/Racing (2), UFC/MMA (2) |
| **Other** | 8 | Marvel (3), Garbage Pail Kids (2), Non-Sport Vintage (3) |

### By Grading Status

| Status | Count |
|--------|-------|
| **Graded** | 28 |
| **Raw** | 12 |

### By Grade Company (Graded Cards)

| Company | Count |
|---------|-------|
| PSA | 19 |
| BGS | 5 |
| CGC | 4 |
| SGC | 1 |

### Price Range

- **Minimum**: $12 (Dead Ted GPK)
- **Maximum**: $5,000 (Charizard, Black Lotus)
- **Distribution**: Mix of entry-level ($10-100), mid-range ($100-500), and high-end ($500+)

### Geographic Coverage

Listings span 15+ US metros including:
- Los Angeles, San Francisco, San Diego, Sacramento, San Jose (CA)
- New York, Buffalo (NY)
- Chicago (IL)
- Houston, Dallas, San Antonio, Austin (TX)
- Miami, Orlando, Tampa (FL)
- Seattle (WA)
- Denver (CO)
- Las Vegas (NV)
- Phoenix (AZ)
- Atlanta (GA)
- Boston (MA)
- Philadelphia (PA)
- Detroit (MI)
- And more...

## Convex Functions

### Mutations

- `seed:seedListings` - Create mock users and listings
- `seed:clearListings` - Delete listings (and optionally users)
- `seed:resetAll` - Clear and re-seed in one operation

### Queries

- `seed:getStats` - Get seed statistics
- `seed:checkMockUsers` - Check mock user status

### Internal

- `seed:createMockUsers` - Create mock seller users

## Safety Features

1. **Confirmation Required**: All destructive operations require `--first=true` flag
2. **Idempotent**: Can run `seed` multiple times safely (won't duplicate listings)
3. **Dev-Only**: Designed for development environment only
4. **Mock Users**: Separate from real Clerk users

## Manual Seeding Examples

### Seed with clearing existing

```bash
npx convex run seed:seedListings -- --first=true --clearExisting=true
```

### Clear only listings (keep users)

```bash
npx convex run seed:clearListings -- --first=true
```

### Clear everything including users

```bash
npx convex run seed:clearListings -- --first=true --includeUsers=true
```

## Troubleshooting

### "Must be authenticated" error

The seeding functions bypass normal auth requirements by using internal mutations. If you encounter auth issues, ensure:
1. Convex is properly configured
2. You're running against a dev deployment

### Missing generated files

If you see errors about `_generated` files:
```bash
npx convex dev --once
```

### Mock users already exist

The seed function handles this automatically - it will use existing mock users instead of creating duplicates.

## Sample Listings Highlights

### High-Value Cards ($1000+)
- Charizard Base Set 1st Edition PSA 10 ($5,000)
- Black Lotus Alpha BGS 9.5 ($5,000)
- Michael Jordan 1986 Fleer RC PSA 9 ($4,500)
- LeBron James 2003 Topps Chrome BGS 9.5 ($3,200)
- Stephen Curry 2009 Topps Chrome PSA 10 ($2,800)

### Popular Modern Cards
- Pikachu Illustrator Promo ($2,500)
- Lugia Neo Genesis PSA 8.5 ($1,200)
- Mike Trout 2011 RC PSA 10 ($950)
- Shohei Ohtani 2018 Chrome ($180)
- Victor Wembanyama 2023 Prizm ($250)

### Raw/Ungraded
- Pikachu Illustrator Promo - Raw Near Mint
- Mewtwo GX Rainbow Rare
- Dark Magician Starter Deck
- Yu-Gi-Oh! staples
- Modern TCG chase cards

## Image URLs

All listings use placeholder images from Unsplash:
- Trading cards: `images.unsplash.com` card/game photos
- Sports cards: Sports-related placeholder images

These are for demo purposes only - replace with actual card images in production.
