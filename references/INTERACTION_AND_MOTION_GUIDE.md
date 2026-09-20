# Interaction & Motion Engineering Guide

This guide establishes the physical, mathematical, and programmatic implementation rules for high-end micro-interactions, magnetic physics, custom cursor dynamics, scroll parallax, and SPA lifecycle management.

---

## 1. Magnetic Button Physics

Magnetic buttons attract toward the user's cursor when the mouse hovers within their bounding area or proximity threshold, then snap back elastically when the cursor leaves.

```
       [Mouse Position: (clientX, clientY)]
                     │
                     ▼
          ┌─────────────────────┐
          │      Bounding Box   │
          │   (left, top, w, h) │
          └──────────┬──────────┘
                     │ Calculate Delta from Center
                     ▼
          x = (clientX - left - w/2) * (strength / w)
          y = (clientY - top - h/2) * (strength / h)
                     │
                     ▼
       gsap.to(button, { x, y, duration: 1.5, ease: "power4.out" })
```

### Implementation Rules:
1. **Configurable Strengths**:
   - `data-strength`: Outer button translation factor (typically 20–100).
   - `data-strength-text`: Inner text translation factor (typically 10–50), creating internal parallax.
2. **Elastic Release**:
   On `mouseleave`, reset coordinates to `x: 0, y: 0` with an elastic or spring ease:
   `gsap.to(target, { x: 0, y: 0, duration: 1.2, ease: "elastic.out(1, 0.3)" });`
3. **Mobile & Touch Protection**:
   Do **NOT** disable magnetic buttons simply because `navigator.maxTouchPoints > 0` (modern laptops have touchscreens while primarily using a mouse).
   Instead, disable only when viewport width $\le 540\text{px}$ or under `@media (hover: none)`.

---

## 2. Dual-Layer Fill Hover Architecture

In award-winning portfolios, buttons do not simply change background color. A circular or rounded fill element (`.btn-fill`) rises from the bottom (or enters from the cursor direction) and fills the button surface:

```css
.btn-normal {
  position: relative;
  overflow: hidden;
  border-radius: 9999px;
}
.btn-fill {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 9999px;
  background: var(--color-dark);
  transform: translate3d(0, 76%, 0);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.btn-normal:hover .btn-fill {
  transform: translate3d(0, 0%, 0);
}
```

---

## 3. Scroll Parallax Systems (`[data-scroll]`)

High-end sites use multi-layer parallax to create photographic depth.

### Parameters:
- `data-scroll`: Designates element as parallax reactive.
- `data-scroll-speed`: Speed multiplier.
  - Positive (e.g. `2`, `4`): moves faster than scroll (leads scroll).
  - Negative (e.g. `-1`, `-3`, `-4`): moves slower than scroll (lags scroll, background layer).
- `data-scroll-direction`: `'vertical'` (default) or `'horizontal'` (for marquees or lateral buttons).
- `data-scroll-position`: `'top'` (anchored to top of viewport) or `'bottom'` (anchored to bottom of viewport).

### GSAP ScrollTrigger Implementation Pattern:
```javascript
export function initParallaxScrubbers() {
  // Hero photo deep lag (speed: -3, position: top)
  const heroImg = document.querySelector('.home-header .personal-image');
  if (heroImg) {
    gsap.to(heroImg, {
      scrollTrigger: {
        trigger: '.home-header',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: () => window.innerHeight * 0.22,
      ease: 'none'
    });
  }

  // Footer reveal upward motion (speed: -4, position: bottom)
  const footerEl = document.querySelector('.footer-footer-wrap footer');
  if (footerEl) {
    gsap.fromTo(footerEl,
      { y: -80 },
      {
        scrollTrigger: {
          trigger: '.footer-footer-wrap',
          start: '0% 100%',
          end: '100% 100%',
          scrub: true
        },
        y: 0,
        ease: 'none'
      }
    );
  }
}
```

---

## 4. Organic Curved Transitions (`.rounded-div-wrap`)

Curved mask transitions between sections (e.g. page body to dark footer) are created using an oversized circular element contained within an overflowing wrapper:

```
               [Preceding Section: White Background]
─────────────────────────────────────────────────────────────────
         ▲
         │ Height scrubs from 10vh -> 0px
         ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ .rounded-div-wrap (overflow: hidden, height: 10vh)          │
 │                                                             │
 │            .rounded-div (width: 150%, border-radius: 50%,   │
 │                          background: matches preceding)     │
 └─────────────────────────────────────────────────────────────┘
─────────────────────────────────────────────────────────────────
               [Target Section: Dark Footer Background]
```

### Essential Rules:
1. **Dynamic Background Matching**: `.rounded-div` MUST match the background color of the preceding section. If the preceding section is white, `.rounded-div` is white. If the preceding section is `#C0CAC9`, `.rounded-div` must be `#C0CAC9`.
2. **Flattening Scrub**: As the target section enters the viewport, animate `.rounded-div-wrap` `height` from `10vh` down to `0px`.
3. **Pointer-Events Safeguard**: The mask MUST have `pointer-events: none !important;` so it does not intercept clicks to elements underneath.

---

## 5. SPA Animation Lifecycle & Leak Prevention

When single-page application routers (Barba.js, Swup, custom pushState) transition between routes:

### Mandatory Cleanup Protocol:
```javascript
export function cleanupPageAnimations() {
  // 1. Kill all ScrollTrigger instances
  if (window.ScrollTrigger) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  // 2. Disconnect active observers
  activeObservers.forEach(obs => obs.disconnect());
  activeObservers = [];

  // 3. Reset virtual scroll position
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true });
  }
  window.scrollTo(0, 0);

  // 4. Reset body scroll locks & navigation states
  document.body.style.overflow = '';
  document.querySelector('main')?.classList.remove('nav-active');

  // 5. Clean up custom cursor hover states
  resetDualCursor();
}
```
Always run this cleanup BEFORE mounting the new page container. Test navigating `A → B → A → B → A` to confirm zero duplicate RAF loops or orphaned event listeners.
