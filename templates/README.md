# Reverse Engineering Specification: [Target Site / Product Name]

- **Reference URL**: `[https://example.com]`
- **Audit Date**: `[YYYY-MM-DD]`
- **Auditor / Mode**: Antigravity (`website-reverse-engineering`) — `[MODE A: Analyze Only | MODE B: Analyze + Rebuild]`
- **Stack Target**: `[Detected Host Stack: e.g. Next.js 14 (App Router) + Tailwind CSS + Framer Motion]`

---

## Executive Summary

Brief 2-3 paragraph overview of the target website, its visual identity, architectural complexity, primary interactive patterns, and responsive behavior.

### Target Complexity Assessment
- **Component Count**: `[Estimated count, e.g., ~24 unique components]`
- **Layout Architecture**: `[e.g., Single-page landing with sticky header and fluid 12-column grid]`
- **Motion Complexity**: `[e.g., Medium: subtle micro-interactions, CSS keyframes, WAAPI entry fades, no heavy 3D/WebGL]`
- **Responsive Breadth**: `[e.g., 3 standard breakpoints: Mobile (375px), Tablet (768px), Desktop (1280px)]`

---

## Epistemic Audit Log

Summary of evidence confidence across this reverse-engineering dossier:

| Level | Classification | Percentage of Specs | Notes / Scope |
| :--- | :--- | :--- | :--- |
| **Level A** | Directly Observed Facts | `[%]` | Raw DOM structure, tag hierarchy, asset URLs, text content. |
| **Level B** | Extracted Values | `[%]` | Computed CSS styles, hex codes, exact pixel typography & padding. |
| **Level C** | Behavior Verified | `[%]` | Dynamic hover/click/scroll states verified in browser session. |
| **Level D** | Reasonable Inference | `[%]` | Inferred design token names, estimated spring curves where unmeasured. |
| **Level E** | Unknown / Unavailable | `[%]` | Proprietary backend endpoints, minified non-public logic. |

---

## Document Index

1. [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md): Unified token definitions (colors, typography, spacing, radius, elevation).
2. [`TYPOGRAPHY.md`](./TYPOGRAPHY.md): Exact font families, scale, weights, line-heights, and letter-spacing.
3. [`COLORS.md`](./COLORS.md): Full color palette breakdown, contrast scores, surface hierarchy, and gradients.
4. [`SPACING.md`](./SPACING.md): Spatial scale, component padding, container max-widths, and grid gutters.
5. [`COMPONENT_MAP.md`](./COMPONENT_MAP.md): Component hierarchy tree, variant inventory, props, and slots.
6. [`INTERACTION_SPEC.md`](./INTERACTION_SPEC.md): Complete Interaction Matrix covering triggers, states, transitions, and a11y.
7. [`MOTION_SPEC.md`](./MOTION_SPEC.md): Precise motion parameters (durations, delays, easing curves, transforms, springs).
8. [`RESPONSIVE_SPEC.md`](./RESPONSIVE_SPEC.md): Viewport breakpoints, layout shifts, mobile navigation, and touch adjustments.
9. [`ASSET_INVENTORY.md`](./ASSET_INVENTORY.md): Vector icons, images, typography sources, and asset licensing status.
10. [`PAGE_STRUCTURE.md`](./PAGE_STRUCTURE.md): Semantic DOM layout structure and wireframe breakdown.
11. [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md): Stack-aligned, step-by-step rebuild roadmap with verification gates.
