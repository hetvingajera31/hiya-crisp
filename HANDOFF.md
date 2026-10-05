# Handoff — Hiya Crisp Website

## Context

This is a session handoff for the Hiya Crisp website (homemade dosa-paper business, Surat). Over the last session we: set up dev tooling (graphify + superpowers), fixed several bugs, added products, did a full visual/typography/color overhaul, and migrated the app from a Vite SPA to **React Router v7 framework mode with SSR**. Next up: **SEO**.

---

## Project snapshot

- **What:** Single-page marketing + WhatsApp-ordering site for Hiya Crisp.
- **Stack now:** React 19.2 + React Router v8.2 framework mode (SSR) + Vite 8. No DB/backend; orders go to a WhatsApp deep link. **Requires Node ≥22.22.0** (RR v8 engine floor — set in `package.json` `engines`).
- **Working dir:** `c:\Users\Admin\Desktop\hiya crisp - Copy` (untracked copy inside a git repo rooted at `C:/Users/Admin`).
- **Code comments:** romanized Gujarati style — match it when editing.

## How to run

| Command | What |
| --- | --- |
| `npm run dev` | React Router dev server (SSR + HMR) → http://localhost:5173 |
| `npm run build` | Production build → `build/client` + `build/server` |
| `npm start` | `react-router-serve ./build/server/index.js` → http://localhost:3000 |

## Current file structure (post-migration)

- `react-router.config.js` — `ssr: true`
- `vite.config.js` — uses `@react-router/dev/vite` plugin
- `app/root.jsx` — HTML shell (`<html>`/`<head>`/`<body>`), `Meta`/`Links` exports (title, description, fonts, favicon), imports `../src/styles.css`, branded `ErrorBoundary` (404 page)
- `app/routes.js` — single index route
- `app/routes/home.jsx` — renders `HiyaCrispApp`
- `src/main.jsx` (~2800 lines) — the entire app; `export default HiyaCrispApp` (wraps `<FestivalProvider><App/></FestivalProvider>`). This monolith is intentional.
- `src/useFestival.jsx`, `src/festivalData.js` — festival theming
- `src/styles.css` (~4200 lines) — all styling
- `public/images/*` — live product/hero images

---

## Work completed this session (all browser-verified)

### A. Dev tooling setup (global, `~/.claude/`)

- **graphify** installed (`pip install graphifyy`; `graphify install`) → skill at `~/.claude/skills/graphify/`. Python Scripts dir added to user PATH.
- **superpowers** installed → 14 skills in `~/.claude/skills/`, plugin at `~/.claude/superpowers/`, SessionStart hook in `~/.claude/settings.json`.
- Built graphify knowledge graph for the project (`graphify-out/`). Workflow: navigate via graphify to save tokens; rebuild with `graphify update .` after changes.

### B. Bug fixes & features (in `src/main.jsx` + `src/styles.css`)

- **Hamburger menu transparent bg** — header's scroll animation left a transform → made the fixed panel's containing block the ~95px header. Fixed panel with `height:100dvh` + `bottom:auto`.
- **Menu outside-tap close** — `.menu-scrim` had same containing-block issue → gave it viewport height.
- **Quantity selectors broken (Green Chilli, Shezwan)** — `products` has 7 ids but `quantities`/`draftBox` hardcoded 5 → `NaN`. Now both derive from `products`; `updateQty` is NaN-safe (`(prev[id]||0)+amount`).
- **Shezwan box color missing** — `tone:'red'` had no CSS in 5 places (`.custom-selector-item`, `.result-card`, `.tray-slot.filled`, `.opt-flavor`, `.stacked-paper-sheet`) → added `.red` (and `.green` for the carton sheet).
- **Mobile responsive** — hero CTA row stacks on mobile; bumped sub-10px fonts; verified no horizontal overflow.
- **Typography system** — swapped to Fraunces (display) + Inter (body) via `index.html`/root fonts + `--font`/`--display`; added font-smoothing, tabular numerals for prices, refined tracking.
- **Color palette → target image** — brighter cream (`--cream:#fbf4e9`), richer gold (`#c99a4a`), new terracotta primary `--accent:#c85a1c` (buttons/CTAs), fixed WhatsApp green-hover bug, converted 2 off-palette green bars → warm brown (top ticker, live-kitchen bar).
- **Hero/nav/footer pro colors** — cinematic layered hero overlay; glass scrolled header (translucent + backdrop-filter); nav underline → terracotta; footer espresso gradient + gold hairline.
- **Navigation overflow fix** — compacted nav (font 12px, tighter gaps); WhatsApp button becomes icon-only ≤1080px; hamburger only ≤920px (verified full nav fits ≥940px, no cut-off at 1172px).
- **Hamburger UX** — hamburger icon pinned far-right; in hamburger mode the header WhatsApp pill is hidden and a WhatsApp CTA is appended as the last item inside the drawer (JSX `.nav-drawer-whatsapp`, desktop-hidden).
- **Added 2 products** (`products` array, `main.jsx`) — Regular Paper (Groundnut Oil) ₹250 as FIRST; Chocolate Paper ₹500 as LAST (`tone:'maroon'`). Added `shortLabels` entries. Both flow through order builder + mix&match automatically.

### C. React Router v7 framework-mode (SSR) migration

- Installed `react-router`, `@react-router/dev`, `@react-router/node`, `@react-router/serve`, `isbot` (all `^7.18.1`).
- Scaffolded `app/` (root, routes, home); moved mount out of `main.jsx` → `export default HiyaCrispApp`.
- **SSR-safety fixes** (browser APIs during render crash/mismatch on server):
  - `FestivalProvider` `useState` init → guarded with `typeof window === 'undefined'`.
  - Reviews `localStorage` read → moved from `useState` init to a client `useEffect` (server uses defaults).
  - `FloatingParticles` `Math.random()` → generated in `useEffect` (client-only; server renders none) — this was the one hydration mismatch, now resolved.
- `package.json`: added `"type":"module"`, scripts → react-router commands.
- Verified: raw SSR HTML contains hero/products/title/meta (SEO-ready); hydration clean; order-builder interactivity works; production build + serve both succeed (200, warning-free).
- **Branded 404** — added `ErrorBoundary` to `app/root.jsx`: on-brand "Page not found" (Fraunces heading, terracotta "Back to Home" button) instead of RR's bare "404 Not Found". Verified at `/products`.

---

## Known state / gotchas

- **404 note:** the app is single-page (one `/` route). Any other path (e.g. `/products`) is not a real route — nav uses `#hash` anchors. The branded 404 now handles unmatched paths gracefully. (Final home-render re-confirm was in progress when the session was interrupted — **re-verify `/` renders full page**.)
- **Obsolete files — REMOVED** during the v8 upgrade (see addendum): `server.js`, root `index.html`, `dist/`, `public/js/main.js`, `public/css/style.css`, and the `express` + `@vitejs/plugin-react` deps are all gone. `public/` now contains only `images/`.
- Chocolate Paper image is a placeholder (`exotic-dosa.jpg`); Groundnut Oil reuses the regular-paper image. Swap in real images in `public/images/` + update `image:` fields.
- `/favicon.ico` dev 404 is harmless (data-URI favicon in `<link>` covers the tab icon).

---

## Pending / next up

- **Phase 3 — SEO (the main next task):** expand meta (Open Graph, Twitter cards), JSON-LD structured data (LocalBusiness/Product), `sitemap.xml`, `robots.txt`, semantic/a11y pass. RR `meta`/`links` exports + optional resource routes are the mechanism.
- Optional: obsolete-file cleanup; real Chocolate image; decide if nav sections should become real deep-linkable routes (currently `#hash`).

## Verification after resuming

1. `npm run dev`, open http://localhost:5173 → full page renders, no console hydration errors.
2. Test: hamburger ≤920px (drawer + WhatsApp last item), order builder +/- (incl. Chocolate/Green Chilli/Shezwan), bad path (`/xyz`) → branded 404.
3. `npm run build` succeeds; `npm start` serves SSR HTML with content at http://localhost:3000.
4. After any change: `graphify update .` — **note:** the `graphify` CLI is currently NOT on PATH (its Python was replaced by Python 3.14, which doesn't have `graphifyy` installed). Reinstall with `pip install graphifyy` under the active Python before this step works again.

---

## Session 2 addendum — Upgrade to latest React Router (v8 + React 19 + Vite 8) — DONE

The project was already in RR v7 framework-mode SSR, so "latest" meant a major-version upgrade. Completed and verified in three staged steps (React/Vite first on RR v7 to isolate risk, then RR→8, then cleanup):

**Version changes (`package.json`):**
- `react-router`, `@react-router/dev`, `@react-router/node`, `@react-router/serve`: `7.18.1` → **`8.2.0`**
- `react`, `react-dom`: `18.3.1` → **`19.2.8`** (RR v8 requires React ≥19.2.7)
- `lucide-react`: `0.468.0` → **`1.25.0`** (0.468 capped React at `^19.0.0-rc`; all imported icons still resolve at 1.x — build passes)
- `vite`: `6.0.5` → **`8.1.5`**
- Removed direct deps `express` + `@vitejs/plugin-react` (both unused; express stays only as a transitive dep of `@react-router/serve`).
- Added `"engines": { "node": ">=22.22.0" }`.

**No app-code changes were needed** — the app has no loaders, no `react-router-dom`, no custom entry files, no custom server/middleware, and `meta`/`links` take no args, so every code-level v8 breaking change was a no-op. `app/root.jsx`, `app/routes.js`, `app/routes/home.jsx`, `react-router.config.js`, `vite.config.js`, `src/main.jsx` are unchanged. RSC stays opt-in (classic framework-mode SSR retained).

**Verified:** `npm run build` clean under Vite 8 (client + SSR, no envFile/future-flag warnings); `npm start` → `GET / 200` with real SSR HTML (title, meta description, hero headline, product names all server-rendered, 61 KB); `/xyz` → branded 404 (HTTP 404). Only residual server log line is RR's expected "No route matches /xyz" that drives the ErrorBoundary.

**Deploy caveat:** the production host/build must run **Node ≥22.22.0** (RR v8 engine floor).

**Not done:** browser-side hydration console was not visually inspected in a live browser (non-interactive session) — SSR is clean and the prior migration already fixed the known hydration mismatches, but do a quick `npm run dev` + devtools console check when convenient. SEO (Phase 3) remains the next task, unchanged.

---

## Session 3 — Bug-fixing pass + Lighthouse optimisation — DONE

**Lighthouse (production build, `npm start`, measured locally):**
- **Desktop: 100 / 100 / 100 / 100** (Perf / A11y / Best-Practices / SEO)
- **Mobile: 72 / 100 / 100 / 100** — Perf gated by simulated Slow-4G + 4× CPU on this rich SSR page; observed (real-connection) FCP/LCP ≈ 1.2 s. Getting mobile Perf to 100 would need an architectural change (lazy-mount below-fold to shrink initial DOM); `content-visibility:auto` was tried and reverted (it regressed the a11y audit for ~+1 Perf). See [[lighthouse-remeasure]] memory for the re-measure recipe + the react-router-serve stale-server gotcha.

**Performance changes:**
- Converted all on-page images to sized WebP via `sharp` (hero PNG **2 MB → 66 KB** desktop / **20 KB** mobile variant `hero-mobile.webp`; logo **1.3 MB → 11 KB**; product JPGs ~⅓ size). Refs updated in `data.js`, `ui.jsx` (logo now `<picture>`), `Reviews.jsx`, `sections.jsx`, and both `.hero-image`/`.ordering` `url()`s in `styles.css`.
- `app/root.jsx`: **preload the hero** (media-scoped: mobile vs desktop variant, `fetchPriority:high`) — the `.hero-image` CSS background couldn't be discovered early otherwise (LCP was 20.5 s → ~3 s → desktop 0.7 s).
- `app/root.jsx`: Google Fonts made **non-render-blocking** (`FONT_CSS` const + inline media="print"→onload swap loader + `<noscript>` fallback; `preload as=style`). Trimmed the font request (dropped `opsz` axis, italics, weights 500) → ~254 KB → ~145 KB.
- Added `width`/`height` to all above-DOM `<img>`s (CLS → ~0).

**Accessibility (→100):** fixed 4 contrast spots (pickup-time hint `#95571b`; ticker-badge `#2e2210`; hero crunch button solid cream `.crunch-sound-btn`; header WhatsApp pill `#a15d34`); tap-targets (footer link `padding-block`, mobile drawer `visibility:hidden` when closed — also fixes the WCAG focusable-when-hidden bug).

**Bug fixes (all 4 component groups audited):**
- `OrderBuilder`: **SSR hydration bug** — `new Date()` in render for the date-input `min` moved to a mount effect + fresh read at submit; `standardBoxes` now derived from `activeProducts`; guarded `.find().name` lookups; free-paper legend clarified (2–9 boxes).
- `Reviews`: **crash fix** — `localStorage` reviews validated/clamped on load + defensive clamp at render (`'☆'.repeat(neg)` RangeError → blank page).
- `effects.js`: **AudioContext leak** — one shared module-level context (was `new AudioContext()` per sound → dies after ~6); added `prefers-reduced-motion` guard to confetti.
- `DosaFortuneModal`: pointer-events (touch double-crack), moved crack side-effect out of the `setPressure` updater (StrictMode double-fire), tracked/cleared timers, Escape + `role=dialog` + focus in/restore, keyboard-operable wafer.
- `InteractiveHub` (`VirtualTawa`): tracked+cleared all timers on unmount (stray crunch sound after tab-switch); fixed PACK stale-event (fly-to-cart); fixed 4 scrambled topping emojis; literal `**markdown**` → `<strong>`; quiz progress-bar math.
- `Header`: Escape-close + body-scroll-lock + `aria-controls`. **Mobile drawer stacking fix** — `.header` is `z-index:990` (a stacking context), so the open drawer (`z-index:1002`) was trapped *below* the top ticker (`z-index:1000`) and scroll-progress (`z-index:1500`), which hid the close ✕ and showed the ticker over the menu. Fix: Header toggles `body.nav-open`; CSS then hides `.live-order-ticker` + `.scroll-progress` and lifts `.header` to `z-index:1600` while the drawer is open (verified with a headless-Chrome screenshot). `main.jsx`: scroll-spy uses `getBoundingClientRect` not `offsetTop`. `useFestival`: provider guard `=== null` (was `=== undefined`, wrong for `createContext(null)`). `root.jsx`: JSON-LD `aggregateRating` 5.0/3 → 4.9/8 to match the 8 rendered reviews.

**Not fixed (out of scope / needs owner input):** `festivalData.js` dates are hardcoded to 2026 (no festival activates from 2027-01-01 — needs a yearly lunar-date update); `callNumber` (+91 98253 56004) differs from the WhatsApp line (+91 95107 18854) — verify if intentional. Unused image files still on disk (`Max_a_is_image_ki_width_ba.png` original 2 MB source, `hero-realistic.png` 1.6 MB, `packaging-professional.jpg`) — safe to delete from `public/images/` to shrink the deploy.

---

## Session 4 — "Saffron & Cream" light theme redesign — DONE

Full light recolor (color-only; zero behavior/layout changes). All tokens in `:root` of `src/styles.css` ("SAFFRON & CREAM" block); design spec at `docs/superpowers/specs/2026-07-23-saffron-cream-redesign-design.md`. Method: token remap + hand-converted structural blocks + 6-agent workflow edit-plans (117 applied) + polish-pack override fixes (product labels/offers/buttons re-darkened at file end — cascade!) + leftover-dark sweep (luminance-checked; kept food/game props like tawa iron, carton kraft, dosa browning, spice flames, WhatsApp greens/blue ticks).

Palette: page #FFFDF9 · bands #FFF3E0/#FFE8CC · footer #FDF1E3 · primary #B4530A (hover #9C4509) · deep text #8F3E06 · display gold #A8690B · small gold #8A5A0B · ink #3B3226 · muted #6B5D4A · lines #F0DCC0/#E3B67C · decor mids #E8A94F/#D98324/#D9962F · flavour chips = pastel families with dark tone text · brand-ribbon = rich saffron accent strip (white text). Verified: screenshots all sections + mobile + drawer; Lighthouse desktop 100×4, mobile 73/100/100/100 (A11y 100 both).

## Session 5 — Cinematic scroll hero + scroll-performance pass — DONE

**Cinematic hero** (`src/main.jsx`, `src/styles.css` end block, `src/useGsapFx.js` block 3): `.hero-cine` 300vh runway → `.hero` pins via CSS `position:sticky`; Phase 1 = GSAP `scrub` (image 1→1.3, headline lines split L/R off-screen, hero content fades); Phase 2 = pure CSS `.hero-stack-next { margin-top:-100vh }` sliding the page over the pinned hero with a crisp torn top edge. Gated by `prefers-reduced-motion` **and** `min-height:740px` — the same condition is written twice (CSS + `gsap.matchMedia`) and must be kept in sync.

**🔴 Root cause found — images had been de-optimised.** Every product `.webp` + `hero.webp` were **lossless** exports (1.3–1.8 B/px, 2–2.8 MB each; 26.6 MB total). This, not the new animation, was the perf problem: desktop Perf 70 / LCP 9.0 s. Re-encoded with `sharp` (700px, q78; hero 1440px q74) → **0.68 MB total, −97.4%**. Backup of the originals was taken before overwriting. Note `Max_a_is_image_ki_width_ba.png` is a *different photo* and must not be used to regenerate the hero (CLAUDE.md previously said otherwise — corrected).

**Hero is now a real `<img>`** inside `<picture>` (was a CSS background) so it is a valid LCP candidate; the sticky height is `calc(100svh - 12px)` because at exactly 100svh Chrome's full-viewport-image heuristic drops it from LCP consideration.

**Scroll performance** — new `src/useRafScroll.js` (rAF-coalesced scroll hook) now backs the scroll-spy, `FloatingParticles`, and `BackToTop`; `Header` got the same treatment inline. Two structural fixes: the scroll-spy now uses **cached** section offsets refreshed by a `ResizeObserver` (was 6 × `getBoundingClientRect()` per scroll event = forced layout), and `FloatingParticles` writes transforms **straight to the DOM** (was a React re-render of 12 nodes per event). Section reveals are now scroll-linked: GSAP triggers use `scrub: 0.6`, and `.reveal-hidden` gets a native `animation-timeline: view()` animation behind `@supports`.

**Paper-grain blend removed** — measured at 1440×900 under 4× CPU throttle, `mix-blend-mode: multiply` on the six section overlays cost: median 21→17 ms, p95 43→35 ms, janky frames 20.3%→9.2%, long frames 3→1. Kept the grain, dropped the blend.

**Verified:** desktop **95–99 / 100 / 100 / 100** (LCP 0.7–1.3 s, CLS 0.002, TBT 0); mobile **69 / 100 / 100 / 100**. Scroll under 4× CPU: desktop median 18 ms, mobile median 17 ms / p95 34 ms, `overflowX = 0` at 1440px and 390px. Cinematic phases screenshot-verified at 0/55/120vh (sticky active, `scale(1.3)`, lines translated ±100vw).

**Not done:** mobile Perf is 69 vs the 72 recorded in session 3 — the remaining mobile cost is FCP ≈ 4 s on simulated Slow-4G, dominated by the 137 KB stylesheet + 120 KB SSR document, not by the new animation (A/B with the cinematic block disabled scored the same). Splitting `styles.css` into critical + deferred is the next real lever.

---

**Session 4 addendum — Baking Simulator all flavours:** VirtualTawa toppings 5 → 8 (added Green Chilli 🫑, Shezwan 🔥, Chocolate 🍫) end-to-end: state/reset/toggle, particle configs, `flavorByTopping` (→ `green-chilli`/`shezwan`/`chocolate` product ids), `getFlavorName`, dosa topping layers (`.layer-greenchilli/.layer-shezwan/.layer-choco` in styles.css). Removed the old CSS nth-child `order` + `.emoji::before` emoji-injection hacks (JSX is now the emoji/order source of truth — the hacks would have broken with 8 buttons). Buttons are a data-driven map. Verified via headless-Chrome click-through: pour→spread→season shows 8 toppings, Shezwan layer renders, bake completes with correct "Shezwan Dosa Paper" label, PACK button intact.
