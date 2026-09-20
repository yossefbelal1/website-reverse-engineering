# Cross-Page Harmonization & Consistency Matrix Template

## 1. Scope of Harmonization
- **Total Pages Analyzed**: `[COUNT]`
- **Global Components Checked**: Header/Nav, Footer, Custom Cursor, Magnetic Buttons, Page Transitions, Scroll System.

---

## 2. Design Token Consistency Across Pages

| Token / Style Property | Home (`/`) | Work (`/work`) | Case Study (`/work/[id]`) | About (`/about`) | Contact (`/contact`) | Harmonized? |
|------------------------|------------|----------------|---------------------------|------------------|----------------------|-------------|
| Primary Background | `#1c1d20` | `#1c1d20` | `#ffffff` | `#1c1d20` | `#1c1d20` | [YES / NO] |
| Text Primary Color | `#ffffff` | `#ffffff` | `#1c1d20` | `#ffffff` | `#ffffff` | [YES / NO] |
| Nav Bar Padding | `40px 60px`| `40px 60px`| `40px 60px` | `40px 60px`| `40px 60px` | [YES / NO] |
| Nav Link Font Size | `16px` | `16px` | `16px` | `16px` | `16px` | [YES / NO] |
| Magnetic Button Radius | `50%` | `50%` | `50%` | `50%` | `50%` | [YES / NO] |
| Footer Curve Height | `100px` | `100px` | `100px` | `100px` | `100px` | [YES / NO] |
| Scroll Inertia / Damping| `0.1` | `0.1` | `0.1` | `0.1` | `0.1` | [YES / NO] |

---

## 3. Route Transition Stress Testing Matrix

| Route A (Origin) | Route B (Destination) | Return Route (B -> A) | Scroll Position on Arrival | Animation Cleanup | Event Listeners Leaked? | Verdict |
|-------------------|-----------------------|-----------------------|----------------------------|-------------------|-------------------------|---------|
| `/` | `/work` | `/work` -> `/` | Top (0, 0) | Clean exit & enter | Zero leaks | PASS |
| `/` | `/about` | `/about` -> `/` | Top (0, 0) | Clean exit & enter | Zero leaks | PASS |
| `/work` | `/work/case-1` | `/work/case-1` -> `/work` | Top (0, 0) | Clean exit & enter | Zero leaks | PASS |
| `/contact` | `/` | `/` -> `/contact` | Top (0, 0) | Clean exit & enter | Zero leaks | PASS |

---

## 4. Component-Level Behavior Verification

### A. Navigation & Hamburger Menu
- [ ] Opens smoothly with identical stagger timing across all routes.
- [ ] Active route indicator updates correctly on client-side routing.
- [ ] Body scroll lock activates when menu is open, releases upon closing or navigating.

### B. Custom Cursor & Magnetic Fields
- [ ] Cursor persists without flickering or disappearing during page transitions.
- [ ] Magnetic effect re-binds dynamically to newly mounted buttons on the target page.
- [ ] Cursor text/scale changes reset when navigating away while hovering an element.

### C. Parallax & Smooth Scroll
- [ ] Smooth scroll initializes immediately on new route without requiring manual user touch/scroll.
- [ ] `ScrollTrigger.refresh()` runs after DOM has fully rendered on new route.
- [ ] Parallax offsets reset to initial values at top of page.
