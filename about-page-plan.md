# Plan: Fix About Page Build & Implementation

**Generated**: 2026-01-31

## Overview
The about page exists but the entire site fails to build due to a configuration issue in `astro.config.mjs`. The build error is:
```
✘ [ERROR] The entry point "react-dom" cannot be marked as external
✘ [ERROR] The entry point "react" cannot be marked as external
```

This is caused by `optimizeDeps.exclude` including react and react-dom.

## Prerequisites
- Node.js 20+ with npm
- Existing project dependencies installed

## Dependency Graph

```
T1 (Fix Config) ──┬── T2 (Verify About Page) ──┐
                  │                             ├── T4 (Final Build)
                  └── T3 (Verify Nav Active) ───┘
```

## Tasks

### T1: Fix Build Configuration
- **depends_on**: []
- **location**: `astro.config.mjs`
- **description**: Remove the vite.optimizeDeps block from astro.config.mjs that excludes react packages. The current config has:
  ```js
  vite: {
    optimizeDeps: {
      exclude: ['@astrojs/react', 'react', 'react-dom'],
    },
  }
  ```
  Remove this entire vite.optimizeDeps block since these are entry points, not dependencies to exclude.
- **validation**: Run `npm run build` and confirm build completes without "cannot be marked as external" errors
- **status**: Completed
- **log**: Removed vite.optimizeDeps block from astro.config.mjs. Build completed successfully without react/react-dom external errors. 17 pages built in 1.81s.
- **files edited/created**: astro.config.mjs 

### T2: Verify About Page Data & Components
- **depends_on**: [T1]
- **location**: `src/data/about.ts`, `src/pages/about.astro`, `src/components/react/PageHero.tsx`
- **description**: Review and verify the about page data, imports, and component structure. Check that:
  - All imports resolve correctly (PageHero component loads)
  - Data types are correct in about.ts
  - Neomorphic styling renders (shadows, cards visible)
  - Avatar URLs from DiceBear API are accessible
  - No missing components or broken references
- **validation**: 
  - `npm run build` completes successfully
  - Page renders without console errors
  - All sections display: Our Story, Core Values, Stats, Team, Contact
- **status**: Completed
- **log**: 
  - Verified all imports resolve correctly (PageHero, about data)
  - Data types in about.ts are correct (CoreValue, TeamMember, StatItem interfaces)
  - All neomorphic CSS classes defined and working (neo-container, neo-extrude-lg, neo-card, neo-button, etc.)
  - DiceBear API URLs accessible (HTTP 200 confirmed, avatars render for all 3 team members)
  - All 5 sections present in build output: Our Story, Our Core Values, Stats, Meet the Team, Get in Touch
  - Build completed successfully: 17 pages built in 1.69s
  - No console errors during build
- **files edited/created**: None (no changes needed - all components working correctly) 

### T3: Verify Navigation Active State
- **depends_on**: [T1]
- **location**: `src/layouts/BaseLayout.astro`
- **description**: The BaseLayout has navigation active state logic but there may be a trailing slash issue. Astro.url.pathname returns `/about/` (with trailing slash) in some configs, but nav items use `/about`. The current strict equality check may fail. Verify the active state works and fix path comparison if needed:
  ```js
  currentPath.replace(/\/$/, '') === item.href
  ```
  Also verify the `.neo-nav-item.active` CSS class exists and renders correctly.
- **validation**: When on /about, the "About" nav item shows the active (pressed/highlighted) state
- **status**: Completed
- **log**: Fixed trailing slash path comparison in BaseLayout.astro. Changed `const currentPath = Astro.url.pathname;` to `const currentPath = Astro.url.pathname.replace(/\/$/, '') || '/';` to normalize paths. Verified `.neo-nav-item.active` CSS class exists in neomorph.css (lines 361-365) with proper pressed/highlighted styling. Build completed successfully.
- **files edited/created**: src/layouts/BaseLayout.astro 

### T4: Final Build Verification
- **depends_on**: [T2, T3]
- **location**: All files
- **description**: Run full build and verify the about page is generated correctly. Check:
  - Build completes without errors
  - `dist/about/index.html` exists and contains content
  - Neomorphic CSS classes are present in output
  - No 404s for external resources (DiceBear avatars)
- **validation**: 
  - `npm run build` completes successfully
  - `dist/about/index.html` exists with proper content
- **status**: Not Completed
- **log**: 
- **files edited/created**: 

## Parallel Execution Groups

| Wave | Tasks | Can Start When |
|------|-------|----------------|
| 1 | T1 | Immediately |
| 2 | T2, T3 | Wave 1 complete |
| 3 | T4 | T2, T3 complete |

## Testing Strategy
- Build the project with `npm run build`
- Check for any errors in the console
- Verify the dist folder contains the about page
- Test navigation active state on /about

## Risks & Mitigations
- **Risk**: Removing optimizeDeps.exclude might cause dev server issues
  - **Mitigation**: If issues arise, try using `include` instead of `exclude`:
    ```js
    optimizeDeps: { include: ['@astrojs/react'] }
    ```
- **Risk**: External DiceBear API images fail to load
  - **Mitigation**: Check avatar URLs are accessible or add fallback handling
- **Risk**: Trailing slash path matching breaks active state
  - **Mitigation**: Normalize path comparison in BaseLayout
