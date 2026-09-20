# Design System Specification

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level B (Extracted Computed Styles) & Level D (Logical Tokenization)

---

## 1. Design Token Architecture

Convert observed repetitive visual metrics into logical design tokens. **Do not invent tokens not backed by observed styles.**

### Token Naming Conventions
- Colors: `color.[category].[role].[variant]`
- Spacing: `spacing.[xs|sm|md|lg|xl|2xl|3xl]`
- Radii: `radius.[none|sm|md|lg|xl|full]`
- Shadows: `shadow.[none|sm|md|lg|xl]`
- Typography: `typography.[role].[property]`

---

## 2. Core Palette Summary

| Logical Token | Computed Value | CSS Variable Name | Epistemic Level | Contrast vs Surface |
| :--- | :--- | :--- | :--- | :--- |
| `color.background.base` | `#0f172a` | `--bg-base` | Level B | N/A (Canvas) |
| `color.background.surface` | `#1e293b` | `--bg-surface` | Level B | N/A |
| `color.brand.primary` | `#3b82f6` | `--brand-primary` | Level B | 4.8:1 (Pass AA) |
| `color.brand.hover` | `#2563eb` | `--brand-hover` | Level B | 5.2:1 (Pass AA) |
| `color.text.primary` | `#f8fafc` | `--text-primary` | Level B | 14.1:1 (Pass AAA) |
| `color.text.muted` | `#94a3b8` | `--text-muted` | Level B | 6.2:1 (Pass AA) |
| `color.border.subtle` | `rgba(255, 255, 255, 0.1)` | `--border-subtle` | Level B | N/A |

*(Refer to [`COLORS.md`](./COLORS.md) for full palette)*

---

## 3. Radii (Corner Rounding)

| Token | Value | Applied To | Epistemic Level |
| :--- | :--- | :--- | :--- |
| `radius.sm` | `4px` | Tags, tooltips, small inputs | Level B |
| `radius.md` | `8px` | Buttons, form controls, dropdowns | Level B |
| `radius.lg` | `16px` | Cards, modals, dialog panels | Level B |
| `radius.full` | `9999px` | Badges, avatar circles, pill buttons | Level B |

---

## 4. Elevation & Shadows

| Token | CSS Box Shadow Value | Use Case | Epistemic Level |
| :--- | :--- | :--- | :--- |
| `shadow.sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Subtle card rests, input fields | Level B |
| `shadow.md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` | Hovered cards, flyout menus | Level B |
| `shadow.lg` | `0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)` | Modals, drawers, sticky headers | Level B |
| `shadow.glow` | `0 0 24px rgba(59, 130, 246, 0.25)` | Brand emphasis / Active highlights | Level B |

---

## 5. Backgrounds & Surface Gradients

| Surface Token | Definition (CSS) | Epistemic Level |
| :--- | :--- | :--- |
| `surface.hero.gradient` | `linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)` | Level B |
| `surface.card.glass` | `rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px);` | Level B |
| `surface.border.gradient` | `linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%)` | Level B |

---

## 6. Implementation Code Snippet (CSS Variables)

```css
:root {
  /* Colors */
  --bg-base: #0f172a;
  --bg-surface: #1e293b;
  --brand-primary: #3b82f6;
  --brand-hover: #2563eb;
  --text-primary: #f8fafc;
  --text-muted: #94a3b8;
  --border-subtle: rgba(255, 255, 255, 0.1);

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}
```
