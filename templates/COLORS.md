# Colors Specification

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level B (Extracted Computed Styles via DevTools)

---

## 1. Primary & Brand Palettes

| Logical Token | Extracted Value (Hex/RGBA) | HSL Equivalent | Role & Context | Epistemic Level | Contrast vs Surface (WCAG) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `color.brand.primary` | `#2563eb` | `hsl(221, 83%, 53%)` | Primary CTA, active focus ring | Level B | 5.2:1 (Pass AA) |
| `color.brand.hover` | `#1d4ed8` | `hsl(224, 76%, 48%)` | Hovered state for primary button | Level B | 6.5:1 (Pass AA) |
| `color.brand.subtle` | `rgba(37, 99, 235, 0.1)` | `hsla(221, 83%, 53%, 0.1)` | Badge backgrounds, active tab tint | Level B | N/A |

---

## 2. Neutral & Surface Palettes

| Logical Token | Extracted Value | HSL Equivalent | Use Case | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- |
| `color.canvas.default` | `#ffffff` | `hsl(0, 0%, 100%)` | Root body background (Light mode) | Level B |
| `color.surface.default` | `#f8fafc` | `hsl(210, 40%, 98%)` | Card surface, sidebar, section tint | Level B |
| `color.surface.raised` | `#ffffff` | `hsl(0, 0%, 100%)` | Elevated cards, modal dialogs, popovers | Level B |
| `color.surface.sunken` | `#f1f5f9` | `hsl(214, 32%, 91%)` | Input wells, table header rows | Level B |

---

## 3. Text & Foreground Palettes

| Logical Token | Extracted Value | Use Case | Contrast vs Canvas | Contrast vs Surface | WCAG Rating |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `color.text.primary` | `#0f172a` | Main headings, body titles, crisp text | 15.8:1 | 14.7:1 | Pass AAA |
| `color.text.secondary`| `#475569` | Subtitles, descriptions, nav links | 7.3:1 | 6.8:1 | Pass AAA |
| `color.text.muted` | `#94a3b8` | Placeholders, timestamps, helper text | 3.1:1 (large) | 2.9:1 | Fail Normal (Level B) |
| `color.text.inverse` | `#ffffff` | Text on brand buttons and dark bars | 1:15.8 (on dark) | 1:14.7 | Pass AAA |

---

## 4. Borders & Dividers

| Logical Token | Extracted Value | Context | Epistemic Level |
| :--- | :--- | :--- | :--- |
| `color.border.subtle` | `rgba(0, 0, 0, 0.08)` | Card boundaries, subtle table dividers | Level B |
| `color.border.default` | `#e2e8f0` | Standard input borders, card outlines | Level B |
| `color.border.strong` | `#cbd5e1` | Selected tabs, hover borders | Level B |
| `color.border.focus` | `#2563eb` | Focus-visible outline ring | Level B |

---

## 5. Semantic & Feedback States

| Logical Token | Extracted Value | Applied State | Epistemic Level |
| :--- | :--- | :--- | :--- |
| `color.status.success` | `#10b981` | Positive alerts, verified checkmarks | Level B |
| `color.status.warning` | `#f59e0b` | Caution banners, pending badges | Level B |
| `color.status.error` | `#ef4444` | Form validation errors, destructive buttons | Level B |
| `color.status.info` | `#0ea5e9` | Informational callouts | Level B |

---

## 6. Complex Gradients & Overlays

| Token | CSS Gradient Formula | Applied Component | Epistemic Level |
| :--- | :--- | :--- | :--- |
| `gradient.hero.radial` | `radial-gradient(ellipse at top, rgba(37,99,235,0.15), transparent 70%)` | Hero section backdrop | Level B |
| `gradient.text.accent` | `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)` | Highlighted title keywords | Level B |
