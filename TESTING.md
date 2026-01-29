# Testing & QA Guide

This document provides comprehensive testing procedures for the Lock It In Trading Cards platform.

## Table of Contents

- [Testing Overview](#testing-overview)
- [Environment Setup](#environment-setup)
- [Manual QA Checklist](#manual-qa-checklist)
- [Testing Procedures](#testing-procedures)
- [Edge Cases](#edge-cases)
- [Regression Testing](#regression-testing)

---

## Testing Overview

### Testing Philosophy

Lock It In follows a **manual QA-first** approach due to the complexity of:
- Third-party integrations (Stripe, Clerk, Convex)
- Real-time data synchronization
- Multi-step transaction flows

### Test Environment Requirements

- [ ] Convex dev deployment configured
- [ ] Stripe test mode enabled
- [ ] Clerk development instance
- [ ] Demo data seeded (`npm run seed`)
- [ ] All environment variables configured

---

## Environment Setup

### Pre-Test Checklist

```bash
# 1. Verify environment variables
cat .env | grep -E "PUBLIC_CONVEX_URL|PUBLIC_CLERK_PUBLISHABLE_KEY|STRIPE_SECRET_KEY"

# 2. Start Convex dev server (Terminal 1)
npx convex dev

# 3. Start Astro dev server (Terminal 2)
npm run dev

# 4. Seed demo data (if needed)
npm run seed

# 5. Verify seed data loaded
npm run seed:stats
```

### Browser Testing Matrix

| Browser | Versions | Priority |
|---------|----------|----------|
| Chrome | Latest, Latest-1 | Critical |
| Safari | Latest (macOS, iOS) | Critical |
| Firefox | Latest | High |
| Edge | Latest | Medium |
| Mobile Chrome | Latest (Android) | Critical |
| Mobile Safari | Latest (iOS) | Critical |

---

## Manual QA Checklist

### 1. Responsive Design Testing

#### Mobile (320px - 639px)

**Layout**
- [ ] Navigation collapses to hamburger menu
- [ ] Filter panel has toggle button
- [ ] Card grid shows 1 column
- [ ] Horizontal padding is 16px (px-4)
- [ ] Typography is readable without zooming

**Interactions**
- [ ] Touch targets are minimum 44x44px
- [ ] Swipe gestures work where expected
- [ ] Modal dialogs fit viewport
- [ ] Keyboard doesn't obscure inputs

**Visual**
- [ ] No horizontal scrolling
- [ ] Images scale proportionally
- [ ] Text doesn't overflow containers
- [ ] Shadows render correctly (neomorphic design)

#### Tablet (640px - 1023px)

- [ ] Navigation shows desktop layout
- [ ] Filter panel is visible as sidebar
- [ ] Card grid shows 2 columns
- [ ] Touch targets remain appropriate size

#### Desktop (1024px+)

- [ ] Full navigation visible
- [ ] Card grid shows 3-4 columns
- [ ] Hover states work correctly
- [ ] Max-width container (max-w-7xl) centered

### 2. Filters Functionality

#### Category Filter

```gherkin
Given I am on the marketplace page
When I select "TCG" category group
Then I should see only TCG-related subcategories
And the card grid should update immediately

When I select "Pokemon" subcategory
Then only Pokemon cards should be displayed
And the results count should update

When I select "All" category group
Then all categories should be visible
```

**Test Cases:**
- [ ] TCG → Pokémon, MTG, Yu-Gi-Oh!, Lorcana, One Piece, Star Wars
- [ ] Sports → Baseball, Basketball, Football, Hockey, Soccer, F1, UFC
- [ ] Other → Marvel, Garbage Pail Kids, Non-Sport Vintage
- [ ] Category counts display correctly

#### Location Filters

```gherkin
Given I am on the marketplace page
When I select "California" from state dropdown
Then the metro dropdown should show only CA metros
And the card grid should filter to CA listings

When I select "Los Angeles" from metro dropdown
Then only LA-area listings should display
```

**Test Cases:**
- [ ] State dropdown contains all 50 states + DC
- [ ] Metro dropdown filters by selected state
- [ ] "All States" shows metros from all states
- [ ] Selecting "All" clears location filter

#### Grading Filter

- [ ] "All" shows both raw and graded cards
- [ ] "Raw" shows only ungraded cards (no grade badge)
- [ ] "Graded" shows only graded cards (with grade badges)
- [ ] Grade badges show correct company (PSA/BGC/CGC/SGC)

#### Filter Reset

- [ ] "Clear Filters" button resets all filters
- [ ] URL parameters reset (if implemented)
- [ ] Results count updates to show all listings

### 3. Lock Flow Testing

#### Basic Lock

```gherkin
Given I am a phone-verified user
And I am viewing an available listing
When I click "Lock It In"
Then the button should show loading state
And then display countdown timer (10:00)
And the card should show locked styling
And the listing should be reserved for me
```

**Test Checklist:**
- [ ] Lock button appears for available listings
- [ ] Loading state shows during lock request
- [ ] Countdown timer displays (MM:SS format)
- [ ] Timer decrements every second
- [ ] Card styling changes to "pressed" state
-
- [ ] Lock persists on page refresh
- [ ] Lock releases automatically after 10 minutes

#### Lock Expiration

```gherkin
Given I have locked a listing
And the countdown has reached 0:00
When the timer expires
Then the lock should release automatically
And the listing should return to available state
And the button should show "Lock It In" again
```

**Test Checklist:**
- [ ] Timer counts down correctly
- [ ] At 0:00, lock releases
- [ ] UI updates without page refresh
- [ ] Other users can now lock the listing

#### Concurrent Lock Prevention

```gherkin
Given User A has locked a listing
When User B tries to lock the same listing
Then User B should see "Locked" indicator
And the lock button should be disabled
```

**Test Steps:**
1. Open browser A, log in as User A, lock a card
2. Open browser B (incognito), log in as User B
3. Navigate to same listing
4. Verify User B sees locked state
5. Verify User B cannot click lock button

#### Auth Gating

```gherkin
Given I am not logged in
When I view a listing
And I click "Lock It In"
Then I should see the AuthGate overlay
And the overlay should prompt for phone verification
```

**Test Checklist:**
- [ ] Unauthenticated users see auth gate
- [ ] Auth gate has blurred overlay effect
- [ ] CTA button opens phone verification
- [ ] After verification, lock flow continues

### 4. Authentication Flow

#### Phone Verification

```gherkin
Given I am an unauthenticated user
When I click "Sign In" or attempt a locked action
Then the phone verification modal should open

When I enter a valid US phone number
And click "Send Code"
Then I should receive an SMS with a 6-digit code
And the UI should show the code entry screen

When I enter the correct code
Then I should be authenticated
And my phone should be marked as verified
And my user record should sync to Convex
```

**Test Cases:**
- [ ] Country code selector shows common countries
- [ ] Phone number validation (format checking)
- [ ] Invalid number shows error message
- [ ] Code input accepts 6 digits
- [ ] Incorrect code shows error
- [ ] Resend button has 60-second cooldown
- [ ] Resend countdown displays correctly
- [ ] Success closes modal and unlocks actions

#### Identity Verification

```gherkin
Given I am phone-verified but not identity-verified
When I attempt to checkout
Then I should see the VerifiedGate blocking the action

When I click "Start Verification"
Then I should be redirected to Stripe Identity
And after completing verification
Then I should return to the pending page
And when approved, my status should update to "verified"
```

**Test Cases:**
- [ ] Unverified users see requirements list
- [ ] Pending users see progress indicator
- [ ] Verified users see success state
- [ ] Failed users see retry option
- [ ] Stripe Identity flow launches correctly
- [ ] Webhook updates user status
- [ ] Status persists across sessions

### 5. Checkout Flow

#### Successful Checkout

```gherkin
Given I have locked a listing
And I am identity-verified
When I click "Proceed to Checkout"
Then I should be redirected to Stripe Checkout

When I complete payment with test card 4242 4242 4242 4242
Then I should be redirected to /checkout/success
And the success page should show processing state
And after webhook receipt, show order confirmation
```

**Test Steps:**
1. Lock a listing
2. Proceed to checkout
3. In Stripe Checkout, use test card:
   - Number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
4. Complete payment
5. Verify redirect to success page
6. Verify order status updates to "paid"
7. Verify lock releases

#### Checkout Cancellation

```gherkin
Given I am on Stripe Checkout
When I click "Back" or close the tab
Then I should be redirected to /checkout/cancel
And the page should explain the lock is still active
And I should see a "Try Again" button
```

**Test Checklist:**
- [ ] Cancel page displays clear messaging
- [ ] Lock status is explained
- [ ] "Try Again" button re-initiates checkout
- [ ] "Browse Marketplace" button returns home
- [ ] Lock expiration time is shown

#### With Grading Option

```gherkin
Given I am checking out
When I enable "Send for Grading" toggle
Then I should see the grading disclaimer
And the total price should include grading fee ($75)

When I complete payment
Then a grading request should be created
And I should see grading status in my orders
```

**Test Checklist:**
- [ ] Toggle enables/disables grading
- [ ] Disclaimer visible when enabled
- [ ] Price updates with grading fee
- [ ] Grading request created on payment
- [ ] Status shows in orders list

### 6. Webhook Testing

#### Checkout Webhook

```gherkin
Given a checkout session is completed
When Stripe sends checkout.session.completed webhook
Then the order status should update to "paid"
And the listing status should update to "sold"
And the lock should be released
```

**Test Steps:**
1. Complete a checkout
2. Check Convex dashboard for webhook event
3. Verify order status changed to "paid"
4. Verify listing no longer appears in marketplace

#### Identity Webhook

```gherkin
Given a user completes identity verification
When Stripe sends identity.verification_session.verified webhook
Then the user identityStatus should update to "verified"
```

**Test Steps:**
1. Start identity verification
2. Complete verification in Stripe test mode
3. Check user record in Convex
4. Verify identityStatus is "verified"

### 7. Design System Verification

#### Neomorphic Design

**Extruded Elements:**
- [ ] Elements have outer shadow (bottom-right dark)
- [ ] Elements have inner highlight (top-left light)
- [ ] Transition to pressed state on click

**Recessed Elements:**
- [ ] Inner shadow visible
- [ ] Appears "pressed into" surface
- [ ] Input fields have focus states

**Pressed State:**
- [ ] Shadow direction reverses
- [ ] Element appears physically pressed
- [ ] Smooth transition animation

#### Typography

- [ ] Chakra Petch used for all headings
- [ ] Work Sans used for body text
- [ ] Font weights correct (bold headings, normal body)
- [ ] No system font fallbacks visible

#### Color Palette

- [ ] Base color: #E0E5EC (all backgrounds)
- [ ] Action gradient: #6366F1 → #A855F7
- [ ] Success: #10B981
- [ ] Warning: #F59E0B
- [ ] Error: #EF4444

---

## Testing Procedures

### New Feature Testing

When testing a new feature:

1. **Happy Path First**
   - Test the primary use case
   - Verify end-to-end flow works

2. **Edge Cases**
   - Empty states
   - Maximum values
   - Special characters
   - Network interruptions

3. **Cross-Browser**
   - Test in Chrome, Safari, Firefox
   - Verify mobile responsiveness

4. **Accessibility**
   - Keyboard navigation
   - Screen reader labels
   - Focus indicators

### Regression Testing

Before each release, verify:

1. All filters work correctly
2. Lock flow functions properly
3. Authentication gates work
4. Checkout completes successfully
5. Webhooks process correctly
6. Mobile layouts display correctly

---

## Edge Cases

### Data Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty marketplace | Show "No listings" message |
| 1000+ listings | Pagination or infinite scroll |
| Very long card titles | Truncate with ellipsis |
| $0 price | Display "$0.00" |
| $10,000+ price | Display "$10,000" |
| Missing image | Show gradient placeholder |

### Network Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Slow connection | Show loading skeletons |
| Connection lost | Retry with exponential backoff |
| Webhook timeout | Queue for retry |
| API rate limit | Show friendly error message |

### Auth Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Session expires | Redirect to login |
| Concurrent logins | Invalidate older session |
| Phone change | Require re-verification |
| Identity rejected | Show specific error reason |

---

## Bug Report Template

```markdown
## Bug Description
Brief description of the issue

## Environment
- Browser: [Chrome 120 / Safari 17 / etc]
- Device: [Desktop / iPhone 15 / etc]
- OS: [macOS 14 / iOS 17 / etc]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should have happened

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Console Errors
```
Paste any JavaScript errors here
```

## Additional Context
Any other relevant information
```

---

## Test Data

### Test User Credentials

For consistent testing, create these test users:

| User Type | Phone | Purpose |
|-----------|-------|---------|
| New User | +1 (555) 0100 | Fresh account testing |
| Verified User | +1 (555) 0101 | Phone + identity verified |
| Phone Only | +1 (555) 0102 | Phone verified, no identity |
| Seller | +1 (555) 0103 | Has active listings |

### Test Credit Cards

```
Successful Payment:
Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123

Declined Payment:
Number: 4000 0000 0000 0002
Expiry: 12/25
CVC: 123

Requires 3D Secure:
Number: 4000 0025 0000 3155
Expiry: 12/25
CVC: 123
```

---

## Continuous Testing

### Daily Checks
- [ ] Dev server starts without errors
- [ ] Seed data loads correctly
- [ ] Filters respond quickly

### Weekly Checks
- [ ] Full checkout flow
- [ ] Webhook processing
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Pre-Release Checks
- [ ] Complete QA checklist
- [ ] Test on production data (if possible)
- [ ] Verify all environment variables
- [ ] Test rollback procedure

---

**Last Updated:** January 2026  
**Version:** 1.0.0
