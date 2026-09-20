# Spacing & Layout Geometry Specification

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level B (Extracted Geometry & Computed Box Models)

---

## 1. Global Spacing Scale

| Token | Computed Pixels | Rem Equivalent | Common Usage | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- |
| `spacing.2xs` | `2px` | `0.125rem` | Fine sub-pixel offset, thin divider padding | Level B |
| `spacing.xs` | `4px` | `0.25rem` | Icon-to-text gap, badge inline padding | Level B |
| `spacing.sm` | `8px` | `0.5rem` | Compact button padding (Y), list item gap | Level B |
| `spacing.md` | `12px` | `0.75rem` | Standard input padding (Y), card header gap | Level B |
| `spacing.base` | `16px` | `1.0rem` | Button padding (X), card internal padding | Level B |
| `spacing.lg` | `24px` | `1.5rem` | Section block gap, card body padding | Level B |
| `spacing.xl` | `32px` | `2.0rem` | Sub-section vertical margin, modal body padding | Level B |
| `spacing.2xl` | `48px` | `3.0rem` | Section vertical padding (Mobile) | Level B |
| `spacing.3xl` | `64px` | `4.0rem` | Section vertical padding (Desktop) | Level B |
| `spacing.4xl` | `96px` | `6.0rem` | Hero section top/bottom padding | Level B |

---

## 2. Container Max-Widths & Gutters

| Breakpoint | Container `max-width` | Horizontal Gutter (Padding X) | Layout Behavior | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile (<640px)** | `100%` | `16px` (`1rem`) | Full-bleed with edge gutters | Level B |
| **Tablet (640px - 1024px)**| `100%` | `24px` (`1.5rem`) | Fluid width centered | Level B |
| **Desktop (1024px - 1280px)**| `1024px` / `1152px` | `32px` (`2rem`) | Centered (`margin: 0 auto`) | Level B |
| **Wide Desktop (>=1280px)** | `1280px` (`max-w-7xl`) | `32px` (`2rem`) | Centered with max constraint | Level B |
| **Ultra-Wide (>=1536px)** | `1440px` (or `1280px`) | `48px` (`3rem`) | Centered, gutters expand | Level B |

---

## 3. Grid & Column Systems

| Section / View | Grid Layout Type | Columns | Gap (X / Y) | Alignment Rules | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Header Nav** | Flexbox | N/A | `gap: 32px` | `align-items: center; justify-content: space-between;` | Level B |
| **Hero Actions**| Flexbox | N/A | `gap: 16px` | `flex-wrap: wrap; align-items: center;` | Level B |
| **Feature Grid**| CSS Grid | 3 Columns (`1fr 1fr 1fr`) | `gap: 32px` | Responsive collapses to 1 col on mobile | Level B |
| **Pricing Cards**| CSS Grid / Flex | 3 Columns | `gap: 24px` | Aligned items stretch | Level B |
| **Footer Links**| CSS Grid | 4 Columns (`repeat(4, 1fr)`)| `gap: 40px` | Collapses to 2 cols (tablet), 1 col (mobile) | Level B |

---

## 4. Component-Specific Dimensions

| Component | Height / Min-Height | Padding (Top/Right/Bottom/Left) | Border Radius | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Button (md)** | `40px` | `10px 18px 10px 18px` | `8px` | Level B |
| **Small Button (sm)** | `32px` | `6px 12px 6px 12px` | `6px` | Level B |
| **Search Input** | `44px` | `10px 14px 10px 40px` (with icon) | `8px` | Level B |
| **Navbar Height** | `64px` | `0 24px 0 24px` | `0px` (fixed top) | Level B |
| **Feature Card** | Auto (`min-h: 240px`) | `24px 24px 24px 24px` | `16px` | Level B |
