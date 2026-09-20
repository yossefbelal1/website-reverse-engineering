# Responsive & Adaptive Specification

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level B (Extracted Media Queries) & Level C (Verified Viewport Testing)

---

## 1. Breakpoint Definitions

| Device Category | Breakpoint Token | Min Width | Max Width | Target Devices / Viewports | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `sm` | `0px` | `639px` | iPhone SE, iPhone 14/15, Pixel 7 (375px - 430px) | Level B |
| **Tablet Portrait** | `md` | `640px` | `1023px` | iPad Mini, iPad Air (768px - 834px) | Level B |
| **Desktop / Laptop** | `lg` | `1024px` | `1279px` | MacBook Air 13", 1080p half-screens | Level B |
| **Wide Desktop** | `xl` | `1280px` | `1535px` | Standard 1080p full monitor (1440px) | Level B |
| **Ultra-Wide** | `2xl` | `1536px` | $\infty$ | 1440p, 4K, Ultra-wide monitors | Level B |

---

## 2. Multi-Viewport Transformation Matrix

Document comprehensive adaptations across the 3 core viewports:

| Dimension / Aspect | Desktop (>= 1024px) | Tablet (640px - 1023px) | Mobile (< 640px) | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- |
| **Overall Layout** | Multi-column grid (3-4 cols), centered container `max-w-7xl` | 2-column grid, fluid padding `24px` | Single-column vertical flow, full bleed with `16px` margin | Level B |
| **Header Navigation** | Horizontal menu with inline links + dropdown flyouts + CTA | Simplified horizontal links or collapsed drawer trigger | Full hamburger toggle $\rightarrow$ right slide-out mobile drawer | Level C |
| **Hero Section** | 2-column side-by-side (Text Left, Dashboard Mockup Right) | Stacked vertical: Text top, mockup scaled below | Stacked vertical: Condensed typography, mockup scaled 100% width | Level B |
| **Typography Scale** | Hero: `56px / 64px`, H2: `36px / 44px`, Body: `16px` | Hero: `44px / 52px`, H2: `30px / 38px`, Body: `15px` | Hero: `32px / 40px`, H2: `24px / 32px`, Body: `14px` | Level B |
| **Spacing System** | Section Y-padding: `96px` (`py-24`), Grid gap: `32px` | Section Y-padding: `64px` (`py-16`), Grid gap: `24px` | Section Y-padding: `48px` (`py-12`), Grid gap: `16px` | Level B |
| **Element Visibility** | All decorative graphics, sub-links, badges visible | Secondary illustration simplified | Decorative background orbs hidden (`display: none`) to prevent overflow | Level C |
| **Feature Grid** | 3 columns (`grid-cols-3`) | 2 columns (`grid-cols-2`) | 1 column (`grid-cols-1`) | Level B |
| **Pricing Cards** | 3 cards side-by-side with featured card highlighted | 3 cards stacked vertically or horizontal swipe | Vertical card stack; toggle sticks to top | Level C |
| **Component Arrangement** | Alternating image/text rows (Z-pattern) | Consistent image top, text bottom stack | Consistent image top, text bottom stack | Level B |
| **Interaction Behavior** | Hover reveals, subtle transform lifts, mouse cursors | Tap to open dropdowns, touch feedback active states | Tap to open drawer, active button color tint, no sticky hover | Level C |
| **Animation Behavior** | Full scroll-triggered stagger, parallax, flyout transitions | Subtle fade-ins, reduced parallax distance | Heavy parallax disabled; entrance fades simplified for performance | Level C |

---

## 3. Mobile Navigation Architecture

- **Trigger Selector**: `button[aria-label="Open Menu"]`
- **Drawer Placement**: Right-hand drawer sliding in (`translateX(100%)` to `translateX(0)`)
- **Backdrop**: Black 60% opacity (`rgba(0, 0, 0, 0.6)`) with `backdrop-filter: blur(4px)`
- **Body Scroll Lock**: Handled by adding `overflow: hidden` to `document.body`
- **Focus Trap**: Trapped inside drawer while open; returns to hamburger toggle on close
- **Close Triggers**:
  - Close button tap (`aria-label="Close Menu"`)
  - Backdrop tap
  - `Escape` key press
  - Internal navigation link tap

---

## 4. Touch & Viewport Guardrails

1. **Touch Target Size**: All touchable items on mobile must meet WCAG 2.5.5 target size ($\ge 44 \times 44\text{px}$).
2. **Viewport Meta**: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">`.
3. **No Horizontal Overflow**: Enforce `overflow-x: hidden` at layout root; prevent elements with unconstrained widths from generating horizontal scrollbars.
