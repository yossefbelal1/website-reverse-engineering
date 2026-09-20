# Spatial Geometry & Container-First Reconstruction Guide

This guide establishes the mathematical and structural methodology for achieving sub-pixel geometric parity ($\Delta \le 1\text{px}$) between the reference website and the local reconstruction.

---

## 1. The Container-First Hierarchy

When reconstructing layouts, never begin by moving individual child elements with arbitrary margins or absolute positioning. Always work from the outermost layout container inward:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VIEWPORT & ROOT CANVAS                                   │
│    (html, body, main-wrap, max-w-[xx], margin: 0 auto)      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 2. SECTION BOUNDARIES & VERTICAL CADENCE              │  │
│  │    (section padding-top, padding-bottom, min-height)  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ 3. CONTENT CONTAINER (container, max-w, padding)│  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │ 4. GRID / ROW MECHANICS                   │  │  │  │
│  │  │  │    (flex, grid, gap, justify, align)      │  │  │  │
│  │  │  │  ┌───────────────────┐ ┌───────────────┐  │  │  │  │
│  │  │  │  │ 5. CHILD COLUMN 1 │ │ CHILD COLUMN 2│  │  │  │  │
│  │  │  │  └───────────────────┘ └───────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Steps:
1. **Root Canvas**: Determine global layout constraint (e.g. `width: 100%`, max viewport width, default background).
2. **Section Paddings**: Measure computed `padding-top` and `padding-bottom` of each `<section>` or `.section`. In high-end design, these often use viewport formulas:
   `--section-padding: clamp(5em, 11vw, 11.5em)`.
3. **Inner Container**: Measure container horizontal padding and max width:
   `--container-padding: clamp(2.5em, 5vw, 5em)`.
4. **Grid Columns & Gaps**: Identify whether multi-column layouts use CSS Grid (`grid-template-columns: repeat(12, 1fr)`) or flexbox ratios (`flex: 0 0 70%`, `flex: 0 0 30%`).
5. **Child Dimensions**: Only after the container and row geometry match reference within $1\text{px}$ should child paddings and font sizes be tuned.

---

## 2. Spatial Relationship Analysis (Delta Measurement)

To ensure visual harmony, measure the vertical and horizontal spatial intervals between semantic element pairs:

| Interval | Measurement Target | Reference | Local | $\Delta$ | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nav $\rightarrow$ Hero Title** | `nav.bottom` to `h1.top` | `184px` | `184px` | `0px` | PASS |
| **Headline $\rightarrow$ Body** | `h1.bottom` to `p.top` | `48px` | `48px` | `0px` | PASS |
| **Body $\rightarrow$ CTA Button**| `p.bottom` to `button.top` | `32px` | `32px` | `0px` | PASS |
| **Section 1 $\rightarrow$ Section 2**| `section1.bottom` to `section2.top`| `0px` (flush) | `0px` | `0px` | PASS |
| **Last Section $\rightarrow$ Footer**| `content.bottom` to `footer.top` | `0px` | `0px` | `0px` | PASS |

### Automated Extraction Snippet:
```javascript
function measureInterval(selA, selB) {
  const elA = document.querySelector(selA);
  const elB = document.querySelector(selB);
  if (!elA || !elB) return null;
  const rectA = elA.getBoundingClientRect();
  const rectB = elB.getBoundingClientRect();
  return {
    gapY: Math.round(rectB.top - rectA.bottom),
    gapX: Math.round(rectB.left - rectA.right),
    rectA: { y: rectA.top, h: rectA.height },
    rectB: { y: rectB.top, h: rectB.height }
  };
}
```

---

## 3. Typography Forensics & Line Wrapping Rules

### 3.1 The "Zero Artificial `<br>`" Rule
**NEVER insert arbitrary `<br>` tags into paragraphs or headlines to force text to wrap like the reference.**
If the reference headline breaks after the 4th word, but your local headline breaks after the 5th word, inserting `<br>` is a superficial hack that breaks when the window is resized by even 10 pixels.

### 3.2 The Root Cause of Typographic Mismatches:
Text wrapping is governed by six exact mathematical factors:
1. **Container Width**: Is the text column 500px instead of 480px?
2. **Font Family & Metric**: Is the local font using an incorrect fallback with wider glyph bounds?
3. **Font Size**: Is the font size computed identically (e.g. `clamp(...)`)?
4. **Letter Spacing (Tracking)**: Does the reference use `letter-spacing: -0.03em`?
5. **Line Height (Leading)**: Does the reference use unitless line-height (e.g. `1.15`)?
6. **Font Weight**: Bold weights (`700`) occupy more horizontal space than medium (`500`).

Reconcile these six properties. Once they match, the text will wrap naturally at the exact same word as the reference across all viewport sizes.

---

## 4. Stacking Context & Overlay Traps

A frequent failure mode in reconstructed websites is interactive elements becoming unclickable or unresponsive to hover due to overlapping invisible elements.

### The Diagnostic Check:
```javascript
// Test if element at (x, y) receives pointer events
function verifyPointerEvents(selector) {
  const el = document.querySelector(selector);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const topEl = document.elementFromPoint(cx, cy);
  const isDirectOrChild = topEl === el || el.contains(topEl);
  if (!isDirectOrChild) {
    console.error(`Pointer event blocked! Target: ${selector}, Top Element:`, topEl);
  }
  return isDirectOrChild;
}
```

### Common Root Causes & Solutions:
1. **Curved Masks / Morph Dividers**:
   `.rounded-div-wrap` or `.overlay-gradient` sitting on top of content with `pointer-events: auto`.
   **Fix**: Always apply `pointer-events: none !important;` to decorative masks, background canvas layers, and gradient vignettes.
2. **Z-Index Inversion**:
   Footer buttons having lower `z-index` than section backgrounds.
   **Fix**: Explicitly elevate buttons and links:
   `footer .btn, footer a { position: relative; z-index: 10; pointer-events: auto !important; }`.
