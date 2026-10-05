# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page marketing + ordering website for **Hiya Crisp**, a homemade dosa-paper business in Surat, Gujarat. **React 19 + React Router v8 framework mode with SSR** (Vite 8 under the hood) — no backend, no database. "Orders" are assembled client-side and handed off to WhatsApp via a `wa.me` deep link; there is no server-side order processing. `HANDOFF.md` holds the detailed session-by-session history.

## Commands

```bash
npm run dev      # React Router dev server (SSR + HMR) -> http://localhost:5173
npm run build    # Production build -> build/client + build/server
npm start        # react-router-serve ./build/server/index.js -> http://localhost:3000
```

Requires **Node ≥ 22.22.0** (`engines` in package.json — RR v8 floor). There is **no test runner, linter, or TypeScript** configured. Verified working state: build exits 0; `GET /` returns full SSR HTML (hero/products/meta server-rendered); any other path (e.g. `/xyz`) returns the branded 404 from the `ErrorBoundary`.

**Stale-server gotcha:** `react-router-serve` loads `build/server/index.js` into memory at startup and keeps serving the *old* bundle after a rebuild — and a killed npm wrapper can leave the node child holding :3000 (next `npm start` dies "port in use" while the stale one serves HTML referencing deleted asset hashes → 404s). After rebuilding, kill the port first (`netstat -ano | grep :3000` → `taskkill //F //PID <pid>`) and sanity-check the served HTML before trusting anything you measure.

## Architecture

**Entry chain:** `app/root.jsx` (HTML shell; all SEO: meta/OG/Twitter, canonical, JSON-LD `FoodEstablishment`, favicon, hero preloads, async font loader; branded `ErrorBoundary` 404) → `app/routes.js` (single index route) → `app/routes/home.jsx` → `src/main.jsx` (`export default HiyaCrispApp` = `<FestivalProvider><App/></FestivalProvider>`).

**`src/main.jsx` (~150 lines) is a composition shell** — the former monolith is split into `src/components/*`:
- `Header.jsx` (scroll-spy nav + mobile drawer), `Hero.jsx`, `banners.jsx` (ticker/particles/scroll-progress), `Products.jsx` (tilt cards + details modal), `OrderBuilder.jsx` (quantities, mix&match custom boxes, WhatsApp checkout), `InteractiveHub.jsx` (flavor quiz / virtual tawa / FAQ tabs), `DosaFortuneModal.jsx`, `Reviews.jsx`, `StatsStrip.jsx`, `sections.jsx` (Benefits/Ordering/InfoStrip/Purity/FAQ/CTA/Footer), `ui.jsx` (Logo, WhatsAppButton, ScrollReveal, BackToTop).

Key data/state flows:
- **`src/data.js` is the single source of truth**: `products` array (`id`, `numericPrice`, `image`, `tone`, `ingredients`, …), `shortLabels`, `whatsappUrl`, `callNumber`, `navItems`, `features`, `steps`. Product images are referenced by filename, served from `/images/...`.
- **`App` (main.jsx) owns cross-section state**: `quantities`, toast `notification`, `activeSection` (scroll-spy), modal visibility. `addStandardProduct` increments quantity + toast + fly-to-cart.
- **Ordering:** `OrderBuilder.handleWhatsAppOrder` serializes quantities + custom boxes + customer fields into a URL-encoded message and opens `https://wa.me/919510718854?text=...`. Offer rules: 2–9 boxes → 1 free paper per 2; 10+ → 5% off; 20+ → 10% off (free papers intentionally stop at 10+).
- **Reviews:** `localStorage` key `hiya_crisp_reviews`; payload is validated and rating clamped 0–5 on load (corrupt data must never crash the render — `'☆'.repeat(negative)` throws).
- **`src/effects.js`:** WebAudio sounds via **one shared module-level AudioContext** (per-call `new AudioContext()` dies after ~6 — don't regress this), confetti (respects `prefers-reduced-motion`), fly-to-cart.

**SSR-safety rules (React 19 hydration):** browser APIs (`window`, `localStorage`, `matchMedia`) and non-deterministic values (`Math.random()`, `new Date()`) must never run during render or in `useState` initializers — put them in `useEffect`/event handlers. Example: OrderBuilder's `todayStr` (date-input `min`) is set in a mount effect and re-read fresh at submit.

**Festival theming** — `src/festivalData.js` + `src/useFestival.jsx`:
- Date ranges with per-festival buffer days (Diwali −7/+2 etc., hardcoded in `getActiveFestival`). Active festival → CSS vars (`--accent-color`, `--decor-color`, `--gold`) on `documentElement`, `festival-active` + `fest-<id>` body classes, banner swap, and a combo product injected at the front of `activeProducts` (useMemo in `App`).
- Dev-only preview: `?simulateDate=YYYY-MM-DD` (localhost/DEV only).
- ⚠️ **Dates are hardcoded per calendar year (currently 2026)** — from 2027-01-01 no festival will ever activate until the dates are updated (lunar dates shift yearly).

**Styling:** one large `src/styles.css` (~6400 lines). Mobile drawer stacking: `.header` is `z-index:990` (its own stacking context), so overlays inside it can't beat the ticker (`z-index:1250`) / scroll-progress (1500) — when the drawer opens, `Header` toggles `body.nav-open`, which hides both bars and lifts `.header` to 1600. Keep that pattern for anything that must overlay from inside the header.

**Cinematic scroll hero** — `.hero-cine` / `.hero-stack-next` (see the `CINEMATIC SCROLL HERO` block at the end of `styles.css`, plus block 3 of `useGsapFx.js`):
- `.hero-cine` is a **300vh** runway; `.hero` inside it is `position:sticky; height:calc(100svh - 12px)` so it pins for 200vh of scroll. Phase 1 (first 100vh) is a GSAP `scrub` timeline: hero image scales 1→1.3 and the three `.hero-line` spans split alternately off-screen left/right. Phase 2 is **pure CSS** — `.hero-stack-next` has `margin-top:-100vh`, so the rest of the page slides up over the pinned hero like a sheet.
- Pinning uses CSS `sticky`, **not** ScrollTrigger's `pin` — no pin-spacer DOM is injected, so CLS stays ~0.
- Gating is duplicated in **two places that must stay identical**: the CSS `@media (prefers-reduced-motion: no-preference) and (min-height: 740px)` and the GSAP `mm.add('(min-height: 740px)')`. Below 740px tall (or reduced-motion) everything degrades to the plain static flow.
- ⚠️ Never put `overflow` on `.hero-cine` or any ancestor (incl. `html`/`body` `overflow-x:hidden`) — that silently kills `position:sticky`.
- ⚠️ The `- 12px` on the sticky height is **LCP-critical**, not cosmetic: at an exact `100svh` the hero `<img>` covers the whole viewport and Chrome's "full-viewport image = background" heuristic drops it as an LCP candidate; LCP then falls to the h1 and the GSAP entrance pushes it to ~9s in the simulation.

**Scroll performance:** every `scroll` listener goes through `src/useRafScroll.js` (rAF-coalesced, one call per frame). Two rules to preserve: the scroll-spy in `main.jsx` reads **cached** section offsets (re-measured by a `ResizeObserver`, never `getBoundingClientRect()` per event), and `FloatingParticles` writes transforms **directly to the DOM** rather than through React state. Section reveals are scroll-linked (GSAP `scrub`, plus a native `animation-timeline: view()` version of `.reveal-hidden` behind `@supports`).

## Performance & SEO invariants (don't regress)

Measured on the production build: **Desktop Lighthouse 95–99/100/100/100; Mobile 69/100/100/100** (mobile Perf is capped by Slow-4G+4×CPU simulation on this rich SSR page; real-connection FCP/LCP ≈ 1.2s). What keeps it there:

- ⚠️ **Image weight is the #1 regression risk — check it first when perf drops.** In July 2026 every product `.webp` and `hero.webp` had been replaced with **lossless** WebP exports (1.3–1.8 bytes/pixel, 2–2.8 MB each, 26.6 MB total); desktop Perf sat at 70 with LCP 9 s. Re-encoding to lossy q78 at 700 px brought it to **0.68 MB total (−97%)** and LCP to 0.7 s. Sanity check: a correctly compressed product WebP here is **~35–80 KB / ≤0.2 B/px**; anything over ~150 KB means someone re-exported losslessly. `sharp` is a devDependency for exactly this.
- **LCP is the hero `<img>`** (`.hero-image` inside `<picture>` in `Hero.jsx`) — it is deliberately a real `<img>`, **not** a CSS background: as a background it was undiscoverable until CSS parsed, and at full-viewport size Chrome also excluded it as an LCP candidate. `app/root.jsx` preloads it with media-scoped links: `hero-mobile.webp` (≤820px, 20 KB) / `hero.webp` (≥821px, ~80 KB); the `<source media>` breakpoint must stay in sync with those. Mobile framing is `object-position` (not `background-position`).
  - ⚠️ **`Max_a_is_image_ki_width_ba.png` is NOT the hero source** — despite what earlier notes said. It is a different photo (a folded dosa on a plate); the live hero is stacked papers in a basket, which is what the alt text describes. To re-compress the hero, re-encode the existing `hero.webp`.
- **Fonts are non-render-blocking**: `FONT_CSS` const in `root.jsx` + inline `media="print"`→onload swap script + `<noscript>` fallback. Edit weights/families only via `FONT_CSS`; never add a plain render-blocking `<link rel="stylesheet">`.
- **All `<img>`s have explicit `width`/`height`** (CLS ≈ 0) and below-fold ones are `loading="lazy"`. Live refs are `.webp`; the only intentional non-webp refs are `site-hero-professional.jpg` (OG share image — social scrapers) and `hiyacrisp.png` (`<picture>` fallback + JSON-LD logo).
- **JSON-LD `aggregateRating` in `root.jsx` must match the reviews actually rendered** (currently 4.9 / 8 seeded reviews in `Reviews.jsx`) — Google penalizes mismatches. Update both together.
- `SITE_URL` in `root.jsx` drives canonical/OG/sitemap refs — set it to the real domain at deploy time (also `public/robots.txt` + `public/sitemap.xml`).

## Gotchas

- Code comments are written in **romanized Gujarati** — match that style when editing existing files.
- This working directory is an **untracked copy**: the active git repo resolves to `C:/Users/Admin` (branch `master`, zero tracked files here). A leftover `.git` folder inside the project is non-functional. The "Fresh configuration for clean deploy" history belongs to the parent repo — not meaningful here.
- `public/images/` still contains the **unused originals** (`Max_a_is_image_ki_width_ba.png` 2 MB — keep as the hero regeneration source; `hero-realistic.png` 1.6 MB and `packaging-professional.jpg` — unreferenced; plus the pre-webp product JPGs). Safe to prune for a lighter deploy, but keep the hero source.
- Two different phone numbers exist by design of the data: WhatsApp `+91 95107 18854` (`whatsappUrl`) vs `callNumber` `+91 98253 56004` (Hero/CTA/Footer "or Call"). Unverified whether intentional — confirm with the owner before "fixing".
- `graphify-out/` holds a knowledge graph of the codebase; the `graphify` CLI is currently not on PATH (`pip install graphifyy` to restore), so rebuild the graph (`graphify update .`) only after reinstalling.
