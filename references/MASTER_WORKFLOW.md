# Master Workflow: The 14-Phase Autonomous Reconstruction Engine

This document defines the exhaustive, step-by-step operational protocol for executing website reverse-engineering and high-fidelity reconstruction. Every phase is mandatory and must be executed with zero-trust rigor.

---

```
PHASE 0: TOOL DISCOVERY ── Inspect available visual-forensics tools (Capture Motion, CSS Peeper, Woblo, CDP)
      │
PHASE 1: DISCOVER ──────── Identify all routes, entry points, and structural perimeter
      │
PHASE 2: BROWSE ────────── Human-like session initialization, loading states, cookies
      │
PHASE 3: SCAN ──────────── Top-to-absolute-bottom full page visual audit
      │
PHASE 4: INTERACT ──────── Comprehensive interaction matrix & stateful crawler
      │
PHASE 5: MEASURE ───────── Sub-pixel geometry, container-first box models, spatial deltas
      │
PHASE 6: UNDERSTAND ────── Technology stack, animation engines, scroll physics, assets
      │
PHASE 7: RECONSTRUCT ───── Stack-native, container-first, typography-first rebuild
      │
PHASE 8: VISUAL COMPARE ── Identical viewport/DPR/scroll side-by-side image audit
      │
PHASE 9: FIX ROOT CAUSES ─ Systemic CSS/layout repair (never patch symptom pixel offsets)
      │
PHASE 10: RETEST ───────── Verify fixes against live browser rendering
      │
PHASE 11: RESPONSIVE ───── Multi-viewport stress test across 12 standard viewports
      │
PHASE 12: HARMONIZE ────── Global token unification, component extraction, SPA lifecycle
      │
PHASE 13: HUMAN-EYE QA ─── Visual plausibility, craft, rhythm, typographic soul
      │
PHASE 14: REGRESSION ───── Route-by-route zero-trust validation before sign-off
```

---

## Phase 0: Tool & Environment Discovery (Tool-First Forensics)

### 0.1 Objective
Never jump to manual recreation or raw guesswork when specialized visual-forensics tools are available. Inspect the environment first, establish the Capability Matrix, and route tasks to the best tool.

### 0.2 Procedure
1. Actively inspect the environment for specialized extensions and tools:
   - **Capture Motion**: Frame-by-frame animation, spring physics, easing extraction.
   - **CSS Peeper**: Instant design token extraction (colors, fonts, spacing, dimensions).
   - **Woblo**: Deep visual hierarchy and layout relationship decomposition.
   - **DESIGN.md Tooling**: Structured design system specification generator.
   - **SKILL Extractor** (e.g. `workflow-skill-creator`): Distilling validated methodology into reusable skills.
   - **Chrome DevTools / CDP**: Live DOM inspection, console logs, network payloads, runtime evaluation.
2. Build the task-specific Capability Matrix and determine primary tools and fallback paths (see `references/TOOL_ORCHESTRATION.md`).
3. Maintain the structured **Tool Evidence Log** with true statuses (`ACTUALLY USED`, `AVAILABLE BUT NOT NEEDED`, `UNAVAILABLE`, `FALLBACK USED`).

---

## Phase 1: Discover (Route & Asset Inventory)

### 1.1 Objective
Map the entire public boundary of the target website. Do NOT assume the homepage is the whole website.

### 1.2 Procedure
1. Load the primary URL.
2. Crawl all internal `<a href="...">` links, navigation bars, dropdowns, footer links, and archive menus.
3. Discover special routes:
   - Root (`/`)
   - Primary category / landing pages (`/work`, `/about`, `/services`, `/contact`)
   - Detail / case study pages (`/work/*`, `/projects/*`)
   - Archive / catalog pages (`/archive`)
   - System pages (`/404`, `/styleguide`, `/terms`)
4. Output `ROUTE_INVENTORY.md` categorizing each route by priority, layout type, and unique interactive modules.

---

## Phase 2: Browse (Human-Like Session Setup)

### 2.1 Objective
Initialize the browser session exactly as a real user would, recording preloader sequences, cookie prompts, and initial viewport states.

### 2.2 Procedure
1. Navigate to the target page under standard desktop viewport (`1440x960`, DPR: 1 or 2).
2. Measure initial loader / preloader sequence:
   - Duration, counter animations, word transitions, morphing curves (`.rounded-div-wrap`).
   - Settle timing before scroll is unlocked.
3. Observe body scroll locking mechanisms (`overflow: hidden`, virtual scroll instances).
4. Record cookie / consent states and ensure dismissed states do not pollute measurements.

---

## Phase 3: Scan (Top-to-Absolute-Bottom Visual Audit)

### 3.1 Objective
Visually examine every section from the initial hero down to the absolute bottom of the document.

### 3.2 Key Rules
- Checkpoints at 0%, 25%, 50%, 75%, 100% are ONLY benchmarks, not the scan itself.
- Scroll smoothly through every single viewport height.
- Stop at every meaningful visual transition:
  - Hero header and decorative badges/hangers.
  - Section dividers, whitespace, and typographic breaks.
  - Grid rows, case study cards, and media embeds.
  - Sticky / fixed elements (navbars, quick-contact buttons, cursor followers).
  - Footer entry transitions (organic curved masks, gradient overlays, inverted themes).
- **Whitespace is an intentional design element**: Never truncate or normalize whitespace without measuring it.

---

## Phase 4: Interact (Full Interaction Forensics)

### 4.1 Objective
Catalog and experimentally test every interactive element and document its complete state lifecycle.

### 4.2 Interactive Elements Catalog
- Primary/Secondary Buttons
- Navigation links and hamburger triggers
- Project list items, cards, and grid tiles
- Filter pills and toggle switches
- Accordions, tabs, and carousels
- Form inputs, textareas, submit controls
- Social icons and external links
- Custom cursor reactive areas (magnetic triggers, view pills)

### 4.3 The 12-Event State Test
For each element, observe:
1. `IDLE` (resting styles)
2. `HOVER` (entry transform, background fill, text color inversion)
3. `MOUSEMOVE` (magnetic offset, cursor follower attraction)
4. `MOUSEDOWN` (active press scale, shadow change)
5. `MOUSEUP` (release settle)
6. `CLICK` (resulting destination or modal trigger)
7. `LEAVE` (exit animation direction, elastic bounce)
8. `RE-ENTER` (re-triggering reliability)
9. `FOCUS` (focus visible ring, keyboard accessibility)
10. `BLUR` (field validation, error state)
11. `TAB / ENTER` (keyboard trigger)
12. `ESCAPE` (dismiss drawer / modal / menu)

### 4.4 Stateful Interaction Rule
**NEVER report "button works" without inspecting the resulting state.**
- If a click opens a menu $\rightarrow$ inspect the entire opened menu, background overlay, scroll lock, and close animation.
- If a click changes a filter $\rightarrow$ inspect the animated reordering, fade-in of filtered items, and count badges.
- If a click triggers a page transition $\rightarrow$ inspect exit animation, loading overlay, route change, scroll reset, and entry reveal.

---

## Phase 5: Measure (Sub-Pixel Geometry & Spacing)

### 5.1 Objective
Extract exact dimensional metrics and spatial relationships using container-first analysis.

### 5.2 Container-First Hierarchy
1. Measure the root container: `width`, `max-width`, `margin: 0 auto`, `padding-left`, `padding-right`.
2. Measure section vertical cadence: `padding-top`, `padding-bottom`, `min-height`.
3. Measure grid / flex mechanics: `display`, `grid-template-columns`, `column-gap`, `row-gap`, `align-items`.
4. Measure child elements: `width`, `height`, `margin`, `padding`, `border-radius`.

### 5.3 Spatial Relationship Deltas
Measure distances between key semantic pairs:
- `NAV` $\rightarrow$ `HERO`
- `HEADLINE` $\rightarrow$ `SUBTITLE`
- `BODY TEXT` $\rightarrow$ `CTA BUTTON`
- `CONTENT BLOCK` $\rightarrow$ `SECTION DIVIDER`
- `LAST SECTION` $\rightarrow$ `FOOTER MASK`
- Compare `ORIGINAL DISTANCE`, `LOCAL DISTANCE`, and calculate $\Delta$.

---

## Phase 6: Understand (Technology & Motion Forensics)

### 6.1 Objective
Uncover the exact rendering engine, motion libraries, and architectural paradigms used by the target site.

### 6.2 Inspection Vectors
- **Smooth Scroll Engine**: Native, Lenis, LocomotiveScroll v3/v4, GSAP ScrollSmoother.
- **ScrollTriggers**: Scrubbed timelines, pin triggers, horizontal marquee speeds, toggleActions.
- **Motion Libraries**: GSAP Core, Framer Motion, Motion One, WAAPI, CSS `@keyframes`.
- **SPA Routing**: Barba.js, Swup, Next.js / Astro client transitions, custom pushState handlers.
- **Media & Rendering**: LazyLoad instances, WebGL / Three.js canvases, video autoplay rules (`playpauze`), SVG clip paths.
- **Hardware / Touch Adaptation**: Touch point detection (`maxTouchPoints`), media queries (`(hover: hover)`), dual mouse + touch support.

---

## Phase 7: Reconstruct (Implementation Phase)

### 7.1 Objective
Build the local reconstruction within the target repository's native stack with zero structural compromise.

### 7.2 Implementation Sequence
1. **Tokens & Theme**: Inject CSS variables / Tailwind config (colors, typography, radii, spacing).
2. **Typography Foundations**: Load authentic web fonts (`@font-face` WOFF2), configure baseline tracking, leading, font-display.
3. **Global Layout & Containers**: Build responsive page containers, main wrapper, header, and footer shell.
4. **Section Assembly**: Reconstruct sections top-to-bottom matching DOM hierarchy.
5. **Interactive Primitives**: Implement magnetic buttons, dual-layer hover fills (`.btn-fill`), responsive cards.
6. **Motion & Scroll Architecture**: Wire smooth scroll, parallax scrubbers, rotational triggers, and curve morphing masks.
7. **Overlay & Stacking Safeguards**: Enforce `pointer-events: none` on decorative overlays, gradient fades, and curved masks so interactive buttons underneath remain fully clickable.

---

## Phase 8: Visual Compare (Side-by-Side Verification)

### 8.1 Objective
Prove visual parity by capturing local and reference screenshots under identical rendering parameters.

### 8.2 Protocol
- Viewport: identical dimensions (e.g. `1440x960`).
- Device Scale Factor (DPR): `1.0` or matching.
- Scroll position: identical vertical pixels (`scrollY = 0`, `scrollY = 400`, `scrollY = footer`).
- Capture both viewports and render a side-by-side or difference overlay.
- Audit layout bounds, typography baseline, image aspect ratios, and whitespace.

---

## Phase 9: Fix Root Causes (Systemic Engineering)

### 9.1 The Golden Rule of Fixing
**NEVER PATCH ONLY THE SYMPTOM WITH ARBITRARY PIXEL OFFSETS.**
If a button is 20px too low, do NOT add `margin-top: -20px`. Find out WHY:
- Is the parent container's `padding-bottom` incorrect?
- Is the headline's `line-height` or `margin` oversized?
- Is the grid row alignment set to `center` instead of `flex-start`?
Fix the systemic layout rule.

---

## Phase 10: Retest

### 10.1 Objective
Re-run automated geometry audits and browser inspection to confirm the fix resolved the delta without introducing side effects.

---

## Phase 11: Responsive Verification (12-Viewport Grid)

### 11.1 Test Matrix
Execute visual and interaction tests across 12 viewports:
- Mobile Small: `375x812` (iPhone X/11/12 mini)
- Mobile Standard: `390x844` (iPhone 13/14/15)
- Mobile Plus: `414x896` (iPhone XR/11)
- Mobile Max: `430x932` (iPhone 14/15 Pro Max)
- Tablet Portrait: `768x1024` (iPad Mini/Air)
- Tablet Large: `834x1112` (iPad Pro 10.5)
- Tablet Landscape: `1024x768` (iPad Landscape)
- Laptop Small: `1280x800` (MacBook Air 13")
- Laptop Standard: `1366x768` (Standard Laptop)
- Desktop Standard: `1440x900` (MacBook Pro / Desktop)
- Desktop Large: `1536x864` (Full HD Windows scaling)
- Ultra Desktop: `1920x1080` (Standard 1080p Monitor)

### 11.2 Requirements
- Zero horizontal overflow scrollbars (`document.documentElement.scrollWidth === window.innerWidth`).
- Fluid typographic scaling using clamp/rem.
- Navigation shifts cleanly between desktop links and mobile hamburger drawer.

---

## Phase 12: Cross-Page Harmonization & Lifecycle Management

### 12.1 Objective
Ensure design consistency across all routes and eliminate memory leaks / duplicate listeners during SPA navigation.

### 12.2 Lifecycle Checklist
- On page change (e.g. Route A $\rightarrow$ Route B $\rightarrow$ Route A):
  - Kill all previous ScrollTrigger instances (`ScrollTrigger.getAll().forEach(t => t.kill())`).
  - Disconnect obsolete IntersectionObservers and ResizeObservers.
  - Reset scroll position immediately to `(0, 0)` (`history.scrollRestoration = 'manual'`).
  - Clean up active cursor followers and magnetic listeners before re-binding.
  - Stop offscreen video players.

---

## Phase 13: Final Human-Eye QA

### 13.1 Objective
Step back from automated scripts and evaluate the interface through the eyes of a discerning human design critic.

### 13.2 Questions to Ask
- "Does this feel like the work of the same designer?"
- "Is the spatial rhythm natural, or does it feel cramped/stretched?"
- "Does the motion feel organic and physical (spring physics, ease curves) or stiff and robotic?"
- "Do hover states react with delightful fluidity?"
- "Are text line breaks natural and faithful to the source?"

---

## Phase 14: Final Regression & Sign-Off

### 14.1 Objective
Run full regression audit across all 17 Quality Gates for every route in `ROUTE_INVENTORY.md`.

### 14.2 Acceptance Criteria
Only mark the project complete when:
- All routes compile with zero build errors.
- Console outputs zero runtime exceptions.
- All 17 Quality Gates are satisfied.
- Both Mode A and Mode B deliverables are verified.
