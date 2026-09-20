# Route Inventory & Page Architecture Template

## 1. Overview
- **Target Source URL**: `[SOURCE_URL]`
- **Discovery Method**: `[DOM crawl / sitemap.xml / robots.txt / Network requests / SPA route manifest]`
- **Total Unique Routes**: `[COUNT]`

---

## 2. Route Map Table

| # | Route URL / Path | Page Type | Layout Template | Dynamic Elements | Auth / Paywall | Status |
|---|------------------|-----------|-----------------|------------------|----------------|--------|
| 1 | `/` | Home / Landing | Root Layout | Parallax Hero, Slider, Curve Footer | None | Discovered |
| 2 | `/work` | Archive / Grid | Root Layout | Filter tags, Hover previews, Lazy load | None | Discovered |
| 3 | `/work/[slug]` | Case Study | Project Layout | Next Case link, Media carousel | None | Discovered |
| 4 | `/about` | Static Content | Root Layout | Bio slider, Interactive globe/graphic | None | Discovered |
| 5 | `/contact` | Form / Interactive | Minimal Layout | Contact form, Copy-to-clipboard, Status tag | None | Discovered |

---

## 3. Global vs Page-Specific Shells
- **Persistent Shell Elements**:
  - Global Navigation (`nav`): Fixed header, hamburger overlay, active route indicator
  - Custom Cursor / Magnet: Persistent across SPA transitions
  - Footer & Transition Mask: Shared curve/mask transition into footer
- **Route-Specific Injections**:
  - CSS bundles or modules loaded per page
  - Third-party scripts (e.g. WebGL canvas, map embeds, form handlers)

---

## 4. SPA Navigation & State Traps
- **Router Engine**: `[Barba.js / Next.js router / Nuxt / React Router / Custom PJAX]`
- **Transition Animation**:
  - Exit animation: Duration, easing, affected elements
  - Enter animation: Duration, easing, affected elements
  - Scroll reset rule: Does scroll jump to `(0, 0)` immediately or after transition completes?
- **Re-initialization Requirements on Navigation**:
  - [ ] ScrollTrigger.refresh()
  - [ ] Lenis / Locomotive scroll restart
  - [ ] Magnetic button listener rebind
  - [ ] Custom cursor target rebind
  - [ ] WebGL viewport resize
