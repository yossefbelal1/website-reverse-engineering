# Interaction Matrix Specification

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level C (Experimentally Verified via Browser Interaction) & Level B (Extracted Transitions)

Every interactive element on the reference website must be documented in the Interaction Matrix below. Do not omit any interactive state.

---

## The Master Interaction Matrix

| Component | Trigger | Initial State | Interaction | Intermediate State (Observable) | Final State | Animation / Transition | Duration | Delay | Easing | Responsive Differences | Accessibility (a11y) Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary CTA Button** (`.btn-primary`) | `hover` | `bg-blue-600`, `shadow-sm`, `translateY(0)` | Pointer moves over button | Instant hover detection | `bg-blue-700`, `shadow-md`, `translateY(-1px)` | `background-color, transform, box-shadow` | `150ms` | `0ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Inactive on touch devices; activates on `active/tap` | Focus ring illuminated on keyboard tab (`focus-visible`) |
| **Primary CTA Button** (`.btn-primary`) | `active` (press) | `bg-blue-700`, `translateY(-1px)` | Pointer click / mouse down | Slight depression | `bg-blue-800`, `translateY(0px)`, `scale(0.98)` | `transform, background-color` | `75ms` | `0ms` | `ease-out` | Same on touch devices | Returns to focused state on release |
| **Primary CTA Button** (`.btn-primary`) | `focus-visible` | No ring, outline none | Tab key navigation | N/A | `ring-2 ring-blue-500 ring-offset-2` | `box-shadow` | `100ms` | `0ms` | `ease` | Not triggered by pointer clicks | High-contrast 2px outline compliant with WCAG 2.4.7 |
| **Header Navigation Bar** (`header.sticky`) | `scroll` (`scrollY > 30px`) | `bg-transparent`, `border-transparent`, `py-6` | Window scroll passes 30px threshold | Transition begins immediately | `bg-slate-900/90`, `backdrop-blur-md`, `border-b`, `py-3` | `background-color, padding, border-color` | `200ms` | `0ms` | `ease-in-out` | Same behavior on mobile | Landmark `<header role="banner">` remains fixed |
| **Nav Dropdown Menu** (`.nav-dropdown`) | `hover / click` | Hidden (`opacity: 0`, `scale(0.96)`, `pointer-events: none`) | Hover desktop, click tablet/mobile | Menu starts appearing | Visible (`opacity: 1`, `scale(1.0)`, `pointer-events: auto`) | `opacity, transform` | `180ms` | `0ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | On mobile: expands accordion within drawer | `aria-expanded="true/false"`, `aria-haspopup="true"`, closes on `Escape` |
| **Feature Card** (`.feature-card`) | `hover` | `border-slate-800`, `bg-slate-900`, `translateY(0)` | Pointer hover over card body | Cursor changes to pointer | `border-blue-500/40`, `translateY(-4px)`, `shadow-xl` | `transform, border-color, box-shadow` | `250ms` | `0ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Disabled on touch; card stays flat | Card inner link receives single focus stop |
| **FAQ Accordion** (`.accordion-item`) | `click` / `Space` | Closed (`height: 0`, chevron `rotate(0deg)`) | User clicks header or hits Enter/Space | Panel begins expanding, chevron rotates | Open (`height: auto`, chevron `rotate(180deg)`) | `grid-template-rows: 0fr -> 1fr`, `transform` | `220ms` | `0ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Full width on all viewports | `aria-expanded`, keyboard navigable, Enter/Space toggles |
| **Mobile Hamburger Toggle** (`.menu-toggle`) | `click` | Icon 3 bars, drawer closed | Tap hamburger button | Bars start morphing into X, backdrop fades | Icon is X (`rotate(90deg)`), Drawer fully open | `transform, opacity` | `200ms` | `0ms` | `ease-out` | Visible only on `<1024px` | Focus moves to first drawer link, body scroll locked (`overflow: hidden`) |
| **Search Modal Dialog** (`.search-modal`) | `click` / `Cmd+K` | Unmounted / Hidden | Click search or press shortcut | Backdrop fades in `0-100ms`, dialog scales in | Backdrop `opacity: 0.5`, dialog `translateY(0)` | `opacity, transform` | `200ms` | `0ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Bottom sheet on mobile; centered dialog on desktop | Focus trapped inside modal, `role="dialog"`, `aria-modal="true"`, `Esc` dismisses |
| **Form Input Field** (`input.text-input`) | `focus` | `border-slate-300`, placeholder muted | Click or Tab into input | Border highlights, label floats if floating label | `border-blue-600`, `ring-2 ring-blue-100` | `border-color, box-shadow, transform` | `150ms` | `0ms` | `ease` | Virtual keyboard pushes viewport on mobile | Accessible `<label for="...">`, announces error on invalid |
| **Pricing Billing Toggle** (`.billing-switch`)| `click` | Monthly selected, thumb on left | Click annual option | Switch thumb glides to right | Annual selected, prices change with counter | `transform (translateX(24px))` | `180ms` | `0ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Compact scale on mobile | `role="switch"`, `aria-checked="true/false"` |

---

## Micro-Interaction Rules

1. **State Independence**: Every interactive element must have visually distinct rules for `:hover`, `:active`, `:focus-visible`, and `:disabled`.
2. **Reduced Motion Adaptation**: Under `@media (prefers-reduced-motion: reduce)`, all transitions must fallback to instant or basic opacity fades ($<100\text{ms}$).
3. **Touch vs Pointer Guardrails**: Do not trap desktop hover effects onto mobile devices (prevents sticky hover bug on iOS Safari).
