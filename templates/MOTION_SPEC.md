# Motion & Animation Specification

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level B (Extracted CSS Keyframes, WAAPI, GSAP/Framer parameters) & Level C (Frame-by-frame verification)

Do **NOT** describe motion with vague words like "smoothly fades" or "bounces slightly". Every motion sequence must have exact properties, numeric ranges, durations, delays, and easing curves recorded below.

---

## 1. Global Motion Curves & Standard Easing

| Curve Name | Function / Value | Characteristics | Primary Usage | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- |
| **Standard Decelerate** | `cubic-bezier(0.16, 1, 0.3, 1)` | Rapid initial velocity, natural organic settle | Modal enter, dropdown open, page reveals | Level B |
| **Standard Accelerate** | `cubic-bezier(0.7, 0, 0.84, 0)` | Gradual start, swift exit | Modal exit, toast dismiss, drawer close | Level B |
| **Standard Move** | `cubic-bezier(0.4, 0, 0.2, 1)` | Symmetric, balanced momentum | Hover transitions, tab indicator slides | Level B |
| **Spring Physics** *(if detected)*| `mass: 1, stiffness: 260, damping: 20` | Responsive, non-overshooting spring | Card drags, toggle switches | Level C / D |

---

## 2. Itemized Motion Registry

### M01: Hero Headline Reveal (On-Page Load)
- **Target Element**: `h1.hero-title .word-span`
- **Trigger**: Page mount / initial DOM load
- **Property**: `opacity`, `transform (translateY)`
- **Initial Value**: `opacity: 0; transform: translateY(24px);`
- **Final Value**: `opacity: 1; transform: translateY(0px);`
- **Duration**: `600ms`
- **Delay**: `100ms` base, staggered `40ms` per word
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Iteration**: `1`
- **Direction**: `normal`
- **Viewport Condition**: Visible above the fold immediately
- **Enter Behavior**: Runs once on mount; does not re-trigger on subsequent scroll
- **Exit Behavior**: N/A (persistent)
- **Library / Engine**: `[CSS Keyframes / Framer Motion / GSAP / WAAPI]`
- **Epistemic Level**: `Level B`

### M02: Feature Card Viewport Scroll Reveal
- **Target Element**: `.feature-grid > .feature-card`
- **Trigger**: Scroll intersection (`IntersectionObserver` threshold: `0.15`)
- **Property**: `opacity`, `transform (translateY)`
- **Initial Value**: `opacity: 0; transform: translateY(32px);`
- **Final Value**: `opacity: 1; transform: translateY(0px);`
- **Duration**: `500ms`
- **Delay**: Staggered `80ms` index-based (`i * 80ms`)
- **Easing**: `cubic-bezier(0.25, 1, 0.5, 1)`
- **Iteration**: `1`
- **Direction**: `normal`
- **Viewport Condition**: Triggers when top of card is within 85% of viewport height
- **Enter Behavior**: Elements become visible and stay rendered (`once: true`)
- **Exit Behavior**: None (does not fade out when scrolling past)
- **Library / Engine**: `[Framer Motion viewport / IntersectionObserver]`
- **Epistemic Level**: `Level B`

### M03: Dropdown Menu Flyout
- **Target Element**: `.nav-dropdown-content`
- **Trigger**: Hover (desktop) / Click (tablet)
- **Property**: `opacity`, `transform (scale, translateY)`
- **Initial Value**: `opacity: 0; transform: scale(0.96) translateY(-8px);`
- **Final Value**: `opacity: 1; transform: scale(1.0) translateY(0px);`
- **Duration**: `180ms`
- **Delay**: `0ms` (enter), `100ms` (exit grace period to prevent accidental close)
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Iteration**: `1`
- **Direction**: `normal`
- **Viewport Condition**: Anchored to navigation trigger
- **Enter Behavior**: Immediate animation on trigger activation
- **Exit Behavior**: Animate reverse to `scale(0.96) translateY(-6px)`, `opacity: 0` in `120ms`
- **Library / Engine**: `[CSS Transition]`
- **Epistemic Level**: `Level B`

### M04: Modal Dialog Backdrop & Panel
- **Target Element**: Backdrop: `.modal-overlay`, Panel: `.modal-container`
- **Trigger**: Click on modal trigger button
- **Property**: 
  - Backdrop: `opacity`
  - Panel: `opacity`, `transform (translateY, scale)`
- **Initial Value**:
  - Backdrop: `opacity: 0;`
  - Panel: `opacity: 0; transform: translateY(16px) scale(0.95);`
- **Final Value**:
  - Backdrop: `opacity: 1;` (with `backdrop-filter: blur(8px)`)
  - Panel: `opacity: 1; transform: translateY(0px) scale(1.0);`
- **Duration**: Backdrop: `200ms`, Panel: `250ms`
- **Delay**: `0ms`
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Iteration**: `1`
- **Direction**: `normal`
- **Viewport Condition**: Fixed full-screen overlay
- **Enter Behavior**: Locks background scroll, autofocuses first modal input
- **Exit Behavior**: Panel slides down `translateY(12px) scale(0.96)` and fades out in `150ms`, backdrop fades out in `150ms`
- **Library / Engine**: `[Tailwind Transition / Framer Motion AnimatePresence]`
- **Epistemic Level**: `Level B`

### M05: Sticky Navigation Transition
- **Target Element**: `header.nav-root`
- **Trigger**: Scroll threshold (`window.scrollY > 40px`)
- **Property**: `background-color`, `box-shadow`, `padding-top`, `padding-bottom`, `backdrop-filter`
- **Initial Value**: `bg-transparent; shadow-none; py-6; backdrop-filter: blur(0px);`
- **Final Value**: `bg-slate-900/80; shadow-sm; py-3; backdrop-filter: blur(12px);`
- **Duration**: `200ms`
- **Delay**: `0ms`
- **Easing**: `ease-in-out`
- **Iteration**: `1`
- **Direction**: `normal`
- **Viewport Condition**: Fixed top `0px`
- **Enter Behavior**: Transitions smoothly when scroll passes 40px
- **Exit Behavior**: Transitions back when scrolling back to page top ($<40\text{px}$)
- **Library / Engine**: `[CSS Transitions]`
- **Epistemic Level**: `Level C`

---

## 3. Detected Animation Frameworks & Engines

- **CSS Transitions / Keyframes**: `[Yes/No - List detected selectors]`
- **Web Animations API (WAAPI)**: `[Detected via element.getAnimations() - Yes/No]`
- **GSAP**: `[window.gsap detected: Yes/No - ScrollTrigger active: Yes/No]`
- **Framer Motion**: `[Detected via HTML attributes / data-framer attributes: Yes/No]`
- **Lottie / Canvas**: `[Lottie player or SVG JSON animation detected: Yes/No]`

---

## 4. Accessibility & Reduced-Motion Handling

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
*Note: Any essential animations (e.g. progress bar) must degrade to an instant jump or gentle opacity transition.*
