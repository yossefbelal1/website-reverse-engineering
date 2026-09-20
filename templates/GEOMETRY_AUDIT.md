# Spatial Geometry & Container Audit Template

## 1. Executive Summary
- **Route Audited**: `[ROUTE_PATH]`
- **Reference Viewport**: `1440 x 900` (or target viewport)
- **Container Delta Goal**: `Δ <= 1px` across all structural containers

---

## 2. Container Hierarchy Comparison

| Hierarchy Level | Source Selector | Source Width | Source Max-W | Source Padding | Local Selector | Local Width | Local Max-W | Local Padding | Delta (Δ) | Status |
|-----------------|-----------------|--------------|--------------|----------------|----------------|-------------|-------------|---------------|-----------|--------|
| Viewport / Body | `body` | 1440px | none | 0 | `body` | 1440px | none | 0 | 0px | PASS |
| Outer Wrapper | `.main-wrap` | 1440px | none | 0 | `.main-wrap` | 1440px | none | 0 | 0px | PASS |
| Content Container| `.container` | 1360px | 1360px | 0 40px | `.container` | 1360px | 1360px | 0 40px | 0px | PASS |
| Grid System | `.grid-12` | 1280px | none | gap: 24px | `.grid-12` | 1280px | none | gap: 24px | 0px | PASS |

---

## 3. Section-by-Section Vertical Geometry

| Section Name | Source Offset Top | Source Height | Local Offset Top | Local Height | Height Delta (Δ) | Cause of Delta (if any) |
|--------------|-------------------|---------------|------------------|--------------|------------------|-------------------------|
| Navigation Header | 0px | 80px | 0px | 80px | 0px | Aligned |
| Hero Section | 80px | 820px | 80px | 820px | 0px | Aligned |
| Featured Work Grid | 900px | 1450px | 900px | 1452px | +2px | Line-height rounding |
| About / Bio Strip | 2350px | 680px | 2352px | 680px | 0px | Aligned |
| Curved Mask Section| 3030px | 150px | 3032px | 150px | 0px | Aligned |
| Global Footer | 3180px | 720px | 3182px | 720px | 0px | Aligned |

---

## 4. Typography & Wrap Verification
- **Font Stack Match**: `[Yes / No]` (Source: `font-family`, Local: `font-family`)
- **Root Sizing Scaling**:
  - Source `<html>` or `body` font-size: `[e.g. 16px, or clamp(...)]`
  - Relative unit base (`rem` vs `vw` vs `px`): `[...]`
- **Wrapping Forensics**:
  - [ ] Zero artificial `<br>` tags introduced for styling.
  - [ ] Natural wrap points match source at `1440px`, `1024px`, and `390px`.
  - [ ] Headings preserve letter-spacing, line-height, and word-spacing without overflow.

---

## 5. Overlay & Stacking Context Audit
- **Fixed / Sticky Elements**:
  - Element: `nav` -> `z-index: 100` -> `pointer-events: auto`
  - Element: `.custom-cursor` -> `z-index: 9999` -> `pointer-events: none !important;`
  - Element: `.overlay-gradient` -> `z-index: 10` -> `pointer-events: none !important;`
- **Click-Through Verification**:
  - Verified with `document.elementFromPoint(x, y)` across all interactive target coordinates.
