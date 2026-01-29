# Lock It In - Trading Cards Marketplace

A premium trading card marketplace built with real-time locking, identity verification, and professional grading services.

![Lock It In](public/favicon.svg)

## Overview

**Lock It In** is a full-stack marketplace for buying, selling, and grading premium trading cards. The platform features a distinctive neomorphic design aesthetic with real-time card locking, phone + identity verification, and Stripe-powered payments.

### Key Features

- 🔒 **Real-Time Card Locking** - Lock cards for 10 minutes while completing checkout
- 📱 **Phone Verification** - SMS OTP authentication via Clerk
- 🛡️ **Identity Verification** - Stripe Identity integration for US residents
- 💳 **Secure Payments** - Stripe Checkout with webhook handling
- 📦 **Grading Services** - Optional professional card grading after purchase
- 🎨 **Neomorphic Design** - Bold, distinctive Soft UI aesthetic
- ⚡ **Real-Time Updates** - Convex powers live marketplace updates

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [Astro](https://astro.build/) | Static site generation with React islands |
| **Frontend** | [React 19](https://react.dev/) | Interactive UI components |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first styling |
| **Backend** | [Convex](https://convex.dev/) | Real-time database & serverless functions |
| **Auth** | [Clerk](https://clerk.dev/) | Phone verification & JWT auth |
| **Payments** | [Stripe](https://stripe.com/) | Checkout & Identity verification |
| **Language** | [TypeScript](https://typescriptlang.org/) | Type-safe development |

---

## Project Structure

```
lock-it-in-trading-cards/
├── astro.config.mjs          # Astro configuration
├── convex/                   # Convex backend functions
│   ├── schema.ts            # Database schema
│   ├── auth.config.ts       # Clerk JWT config
│   ├── listings.ts          # Listing CRUD & locking
│   ├── orders.ts            # Order lifecycle
│   ├── checkout.ts          # Stripe Checkout
│   ├── identity.ts          # Identity verification
│   ├── grading.ts           # Grading requests
│   ├── http.ts              # Webhook handlers
│   ├── seed.ts              # Demo data seeding
│   └── _generated/          # Generated types
├── public/                   # Static assets
├── scripts/                  # Utility scripts
│   └── seed.js              # Seeding helper
├── src/
│   ├── components/
│   │   └── react/           # React components
│   │       ├── AppProviders.tsx
│   │       ├── MarketplaceApp.tsx
│   │       ├── CardSlab.tsx
│   │       ├── LockButton.tsx
│   │       ├── FiltersPanel.tsx
│   │       ├── CheckoutPanel.tsx
│   │       ├── PhoneVerificationFlow.tsx
│   │       ├── AuthGate.tsx
│   │       ├── VerifiedGate.tsx
│   │       ├── IdentityVerificationPanel.tsx
│   │       ├── GradingToggle.tsx
│   │       └── GradingPanel.tsx
│   ├── data/                # Static data
│   │   ├── categories.ts    # Category definitions
│   │   ├── locations.ts     # US states
│   │   ├── metros.ts        # Top 50 US metros
│   │   └── filters.ts       # Filter configs
│   ├── layouts/
│   │   └── BaseLayout.astro # Main layout
│   ├── lib/
│   │   ├── convexClient.ts  # Convex client setup
│   │   └── stripeClient.ts  # Stripe.js helpers
│   ├── pages/               # Astro pages
│   │   ├── index.astro      # Marketplace home
│   │   ├── checkout/
│   │   │   ├── success.astro
│   │   │   └── cancel.astro
│   │   └── identity/
│   │       ├── verify.astro
│   │       └── pending.astro
│   ├── styles/
│   │   ├── globals.css      # Global styles
│   │   ├── theme.css        # Design tokens
│   │   └── neomorph.css     # Neomorphic utilities
│   └── types/               # TypeScript types
│       ├── marketplace.ts
│       ├── checkout.ts
│       └── grading.ts
├── .env.example             # Environment template
├── package.json
├── tailwind.config.mjs
└── tsconfig.json
```

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ or **pnpm**
- **Git**

### External Services

You'll need accounts with:

1. **[Convex](https://convex.dev)** - Database & serverless functions
2. **[Clerk](https://clerk.dev)** - Authentication (phone verification)
3. **[Stripe](https://stripe.com)** - Payments & Identity verification

---

## Setup Instructions

### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd lock-it-in-trading-cards

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# ============================================
# Convex Configuration
# ============================================
# Get from: https://dashboard.convex.dev > Your Project > Settings
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# ============================================
# Clerk Authentication
# ============================================
# Get from: https://dashboard.clerk.dev > Your App > API Keys
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
CLERK_JWT_TEMPLATE_NAME=convex

# ============================================
# Site Configuration
# ============================================
PUBLIC_SITE_URL=http://localhost:4321

# ============================================
# Stripe Payment Processing
# ============================================
# Get from: https://dashboard.stripe.com > Developers > API Keys
STRIPE_SECRET_KEY=sk_test_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook secrets (see Webhook Setup below)
STRIPE_WEBHOOK_SECRET_CHECKOUT=whsec_...
STRIPE_WEBHOOK_SECRET_IDENTITY=whsec_...
```

### 3. Clerk Configuration

1. Go to [Clerk Dashboard](https://dashboard.clerk.dev)
2. Create a new application
3. Enable **Phone Number** authentication (disable email if phone-only)
4. Go to **JWT Templates** → Create template named `convex`
5. Note the **Issuer Domain** from Clerk JWT template page

### 4. Convex Configuration

1. Install Convex CLI:
   ```bash
   npm install -g convex
   ```

2. Initialize Convex:
   ```bash
   npx convex dev
   ```

3. This will:
   - Create a new Convex project (if needed)
   - Generate `_generated` types
   - Start the Convex dev server

4. Copy your deployment URL from the output to `.env`

### 5. Stripe Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Enable **Identity** in the product settings
3. Create a verification workflow for Identity
4. Copy API keys to `.env`

#### Webhook Setup

For local development, use the Stripe CLI:

```bash
# Install Stripe CLI (macOS example)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your Convex dev deployment
stripe listen --forward-to https://your-deployment.convex.site/stripe/checkout
stripe listen --forward-to https://your-deployment.convex.site/stripe/identity
```

Copy the webhook signing secrets to your `.env` file.

---

## Development Workflow

### Start Development Server

```bash
# Terminal 1: Start Astro dev server
npm run dev

# Terminal 2: Start Convex dev server (in another terminal)
npx convex dev
```

The Astro dev server runs on `http://localhost:4321` by default.

### Seed Demo Data

```bash
# Seed 40 demo listings across all categories
npm run seed

# View seed statistics
npm run seed:stats

# Reset all demo data
npm run seed:reset

# Clear all listings
npm run seed:clear
```

See [SEEDING.md](SEEDING.md) for detailed seeding documentation.

---

## Build & Deployment

### Static Build

```bash
npm run build
```

This generates a static site in the `dist/` directory.

**Note:** For the build to succeed, you must have:
- Environment variables configured
- Convex `_generated` files present (run `npx convex dev` at least once)

### Preview Build Locally

```bash
npm run build
npm run preview
```

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard.

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --build --prod
```

#### Self-Hosted

Upload the `dist/` folder to any static hosting service (AWS S3, Cloudflare Pages, etc.).

---

## Architecture Overview

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│    Clerk    │────▶│   Convex    │
│             │◀────│   (Phone)   │◀────│   (users)   │
└─────────────┘     └─────────────┘     └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │  Stripe ID  │
                                         │ (Identity)  │
                                         └─────────────┘
```

### Checkout Flow

```
1. User clicks "Lock It In"
   ↓
2. listing.lockListing (10-min lock)
   ↓
3. orders.createFromLock
   ↓
4. checkout.createCheckoutSession → Stripe
   ↓
5. User completes payment
   ↓
6. Webhook → orders.markPaid
   ↓
7. Optional: grading.createRequest
```

### Data Model

| Table | Key Fields |
|-------|-----------|
| **users** | clerkId, phone, phoneVerifiedAt, identityStatus, location |
| **listings** | title, priceCents, category, location, status, lockExpiresAt |
| **orders** | listingId, buyerId, sellerId, status, stripeSessionId |
| **gradingRequests** | orderId, status, partnerRef |
| **identityChecks** | userId, stripeSessionId, status |

---

## Environment Variables Reference

| Variable | Source | Required For |
|----------|--------|--------------|
| `PUBLIC_CONVEX_URL` | Convex Dashboard | Database connection |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard | Authentication UI |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk JWT Template | Convex auth integration |
| `CLERK_JWT_TEMPLATE_NAME` | Clerk Settings | Must be `convex` |
| `PUBLIC_SITE_URL` | Your domain | Redirects |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | Payments |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | Stripe.js |
| `STRIPE_WEBHOOK_SECRET_CHECKOUT` | Stripe CLI/Webhooks | Checkout webhooks |
| `STRIPE_WEBHOOK_SECRET_IDENTITY` | Stripe CLI/Webhooks | Identity webhooks |

---

## Manual QA Checklist

Use this checklist to verify all functionality before deployment:

### Responsive Design

- [ ] **Mobile (320px-639px)**
  - [ ] Navigation collapses to hamburger menu
  - [ ] Filter panel is collapsible
  - [ ] Card grid shows 1 column
  - [ ] Touch targets are 44px minimum
  - [ ] Typography scales appropriately

- [ ] **Tablet (640px-1023px)**
  - [ ] Navigation shows desktop layout
  - [ ] Filter panel shows as sidebar
  - [ ] Card grid shows 2 columns
  - [ ] Spacing adjusts properly

- [ ] **Desktop (1024px+)**
  - [ ] Full navigation visible
  - [ ] Card grid shows 3-4 columns
  - [ ] Hover states work correctly
  - [ ] Max-width container centered

### Filters

- [ ] **Category Filter**
  - [ ] TCG category shows correct subcategories
  - [ ] Sports category shows correct subcategories
  - [ ] Other category shows correct subcategories
  - [ ] "All" shows all categories

- [ ] **Location Filters**
  - [ ] State dropdown populates correctly
  - [ ] Metro dropdown filters by selected state
  - [ ] "All States" shows all metros

- [ ] **Grading Filter**
  - [ ] "Raw" shows only ungraded cards
  - [ ] "Graded" shows only graded cards
  - [ ] Grade badges display correctly (PSA, BGS, CGC, SGC)

- [ ] **Reset Function**
  - [ ] "Clear Filters" resets all to default
  - [ ] Results update immediately

### Lock Flow

- [ ] **Lock Listing**
  - [ ] Unauthenticated user sees auth gate
  - [ ] Clicking "Lock It In" starts countdown (10:00)
  - [ ] Button shows locked state
  - [ ] Card appearance changes (pressed state)

- [ ] **Lock Expiration**
  - [ ] Countdown reaches 0:00
  - [ ] Lock releases automatically
  - [ ] Card returns to available state

- [ ] **Concurrent Locks**
  - [ ] Two users can't lock same card
  - [ ] Second user sees "Locked" indicator

### Authentication Gates

- [ ] **Phone Verification**
  - [ ] Unverified user sees auth prompt
  - [ ] Clicking CTA opens verification modal
  - [ ] Country code selector works
  - [ ] OTP input accepts 6 digits
  - [ ] Resend cooldown (60s) works
  - [ ] Success syncs with Convex

- [ ] **Identity Verification**
  - [ ] Unverified users can't checkout
  - [ ] VerifiedGate shows appropriate UI
  - [ ] "Start Verification" launches Stripe flow
  - [ ] Pending state shows correctly
  - [ ] Verified state updates after webhook

### Checkout Flow

- [ ] **Success Path**
  - [ ] Checkout redirects to Stripe
  - [ ] Payment success redirects to /checkout/success
  - [ ] Success page shows polling state
  - [ ] Order details display after webhook
  - [ ] Lock releases after completion

- [ ] **Cancel Path**
  - [ ] Cancel redirects to /checkout/cancel
  - [ ] Page shows clear messaging
  - [ ] "Try Again" button works
  - [ ] Lock status shown correctly

- [ ] **Grading Option**
  - [ ] Toggle appears during checkout
  - [ ] Disclaimer visible when enabled
  - [ ] Price updates with grading fee
  - [ ] Grading request created on payment

### Webhooks

- [ ] **Checkout Webhook**
  - [ ] checkout.session.completed updates order
  - [ ] Order status changes to "paid"
  - [ ] Lock releases properly

- [ ] **Identity Webhook**
  - [ ] identity.verification_session.verified updates user
  - [ ] User identityStatus changes to "verified"

### Design Consistency

- [ ] **Neomorphic Elements**
  - [ ] Extruded elements have proper shadows
  - [ ] Recessed elements appear pressed
  - [ ] Buttons transition on press
  - [ ] Cards have consistent styling

- [ ] **Typography**
  - [ ] Chakra Petch used for headings
  - [ ] Work Sans used for body text
  - [ ] Text hierarchy is clear

- [ ] **Colors**
  - [ ] Base color #E0E5EC on all backgrounds
  - [ ] Action gradient (indigo to purple) on CTAs
  - [ ] Status colors consistent (green/red/yellow)

---

## Testing Mode vs Live Mode

### Test Mode (Development)

| Service | How to Enable |
|---------|--------------|
| Stripe | Use `sk_test_*` and `pk_test_*` keys |
| Clerk | Use development instance keys |
| Convex | Use dev deployment URL |

### Test Credit Cards (Stripe)

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

Use any future expiry date and any 3-digit CVC.

### Live Mode (Production)

1. Switch to live Stripe keys
2. Configure production Clerk instance
3. Use production Convex deployment
4. Update `PUBLIC_SITE_URL` to production domain
5. Reconfigure webhooks for production URLs

---

## Known Issues & Limitations

### Build-Time Considerations

1. **Static Build Requires Env Vars**: The build process needs environment variables to be set, even if using placeholder values. This is because Convex hooks are referenced at build time.

2. **SSR with Clerk**: React components using `useUser()` or other Clerk hooks must use `client:only="react"` directive to prevent SSR issues. The `ClientOnlyIdentityPanel` component demonstrates this pattern.

3. **Convex Function References**: The `_generated/api.ts` file contains function stubs for build compatibility. These are replaced with actual function references at runtime when Convex connects.

### Current Limitations

1. **US-Only**: Identity verification is limited to US residents via Stripe Identity.

2. **Image Storage**: Demo listings use placeholder images. Production should use Convex storage or external image hosting.

3. **Grading Partner**: The grading partner API is stubbed. Integration with PSA/BGS/CGC would be required for production.

4. **No Admin Panel**: Currently no admin interface for managing listings/users.

---

## Troubleshooting

### Build Errors

**"useUser can only be used within ClerkProvider"**
- Ensure components use `client:only="react"` if they access auth hooks
- Check that `AppProviders` wraps the content in `BaseLayout`

**"Cannot read properties of undefined (reading 'listFiltered')"**
- Run `npx convex dev` to generate `_generated` files
- Verify `PUBLIC_CONVEX_URL` is set in `.env`

**"Missing PUBLIC_CONVEX_URL"**
- Check `.env` file exists and is properly formatted
- Ensure no spaces around `=` in env vars

### Runtime Errors

**"Must be authenticated" when seeding**
- Seeding functions use internal mutations that bypass auth
- Ensure you're running against dev deployment

**Webhooks not firing**
- Verify Stripe CLI is running with correct forward URLs
- Check webhook secrets match between Stripe and `.env`
- Look at Convex logs for webhook processing errors

### Development Issues

**Hot reload not working**
- Restart both Astro and Convex dev servers
- Clear browser cache
- Check for TypeScript errors

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

[MIT](LICENSE) - See LICENSE file for details.

---

## Support

For support, email support@lockitin.cards or join our Discord community.

---

**Built with ❤️ for the trading card community**
