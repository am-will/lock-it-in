#!/usr/bin/env node
/**
 * Seed script for Lock It In Trading Cards demo data
 * 
 * This script seeds the database with mock listings for development.
 * 
 * Prerequisites:
 * - Convex CLI installed: npm install -g convex
 * - Authenticated to Convex: npx convex login
 * 
 * Usage:
 *   node scripts/seed.js              # Seed with confirmation
 *   node scripts/seed.js --yes        # Skip confirmation
 *   node scripts/seed.js --reset      # Clear and re-seed
 *   node scripts/seed.js --clear      # Clear all listings
 *   node scripts/seed.js --stats      # Show seed statistics
 */

import { execSync } from 'child_process';

const args = process.argv.slice(2);

function run(command) {
  console.log(`> ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error('Command failed:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Seed Script for Lock It In Trading Cards

Usage: node scripts/seed.js [options]

Options:
  --yes, -y       Skip confirmation prompts
  --reset, -r     Clear all listings and re-seed
  --clear, -c     Clear all listings (destructive)
  --stats, -s     Show current seed statistics
  --check         Check if mock users exist
  --help, -h      Show this help message

Examples:
  node scripts/seed.js --yes          # Seed with confirmation
  node scripts/seed.js --reset        # Reset all demo data
  node scripts/seed.js --stats        # View seed stats
  npm run seed                        # Using npm script
  npm run seed:reset                  # Reset via npm
  npm run seed:stats                  # Stats via npm
`);
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--stats') || args.includes('-s')) {
    run('npx convex run seed:getStats');
    return;
  }

  if (args.includes('--check')) {
    run('npx convex run seed:checkMockUsers');
    return;
  }

  if (args.includes('--clear') || args.includes('-c')) {
    console.log('⚠️  This will DELETE all listings!');
    if (!args.includes('--yes') && !args.includes('-y')) {
      console.log('Add --yes to confirm.');
      return;
    }
    run('npx convex run seed:clearListings -- --first=true --includeUsers=true');
    console.log('✅ All listings and mock users cleared.');
    return;
  }

  if (args.includes('--reset') || args.includes('-r')) {
    console.log('🔄 Resetting all demo data...');
    run('npx convex run seed:resetAll -- --first=true');
    console.log('✅ Demo data reset complete!');
    return;
  }

  // Default: seed
  console.log('🌱 Seeding demo listings...');
  run('npx convex run seed:seedListings -- --first=true');
  console.log('✅ Seed complete! Run `npm run seed:stats` to view statistics.');
}

main();
