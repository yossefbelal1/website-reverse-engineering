# Reconstruction Implementation Plan

- **Target Reference**: `[Target Website Name]`
- **Mode**: `[MODE A: Analyze Only (Specification Only) | MODE B: Analyze + Rebuild]`
- **Target Tech Stack**: `[Detected Host Project Stack: e.g. React 18, Vite, Tailwind CSS, TypeScript]`
- **Status**: `[DRAFT | APPROVED | IN PROGRESS | VERIFIED]`

---

## 1. Stack Detection & Architecture Alignment

Prior to writing any code in Mode B, inspect the repository and document the confirmed runtime environment:

| Layer | Detected Technology | Existing Convention | Strategy for Rebuild |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js 14 / Vite / Nuxt / SvelteKit / Vanilla | App Router / Single-page bundle | Match existing folder structure & routing |
| **Styling** | Tailwind CSS / CSS Modules / Styled-Components | `tailwind.config.js` or `globals.css` | Extend existing theme tokens; do not replace |
| **Component Primitives** | Radix UI / Headless UI / Shadcn / Custom | Radix dialogs & dropdowns | Use existing headless primitives |
| **Animation Engine** | Framer Motion / CSS Keyframes / GSAP | `framer-motion` installed in `package.json` | Re-use installed engine; avoid extra dependencies |
| **Icon Library** | Lucide / Heroicons / Tabler | `lucide-react` | Reuse installed icons |

> [!CAUTION]
> **Stack Preservation Principle**:
> Never introduce a new framework, package manager, or CSS paradigm when the host project already has an established solution. Always preserve existing architecture.

---

## 2. Phased Reconstruction Roadmap

### Phase 1: Foundation & Design Tokens
- [ ] **Task 1.1**: Add extracted color palette, radii, and shadows to Tailwind config / CSS variables.
- [ ] **Task 1.2**: Configure typography scale and font families in project stylesheets.
- [ ] **Task 1.3**: Verify base resets and layout container wrappers.

### Phase 2: Atomic Primitives
- [ ] **Task 2.1**: Implement Button primitive (`variants: primary, secondary, outline, ghost`).
- [ ] **Task 2.2**: Implement Badge & Tag components.
- [ ] **Task 2.3**: Implement Input & Form control primitives with focus-visible states.

### Phase 3: Shell & Global Layout
- [ ] **Task 3.1**: Implement Navigation Bar (`header`) with sticky scroll threshold and blur.
- [ ] **Task 3.2**: Implement Mobile Navigation Drawer and responsive hamburger toggle.
- [ ] **Task 3.3**: Implement Footer component with responsive column collapse.

### Phase 4: Page Content Sections
- [ ] **Task 4.1**: Implement Hero Section (Headline, CTA group, mockup graphic).
- [ ] **Task 4.2**: Implement Social Proof / Logo marquee section.
- [ ] **Task 4.3**: Implement Feature Grid with responsive card layout.
- [ ] **Task 4.4**: Implement Alternating Deep-Dive feature blocks.
- [ ] **Task 4.5**: Implement Pricing Cards with interactive monthly/annual switch.
- [ ] **Task 4.6**: Implement FAQ Accordion with height transition.

### Phase 5: Motion Choreography & Micro-Interactions
- [ ] **Task 5.1**: Apply hover/active transitions to all buttons and cards.
- [ ] **Task 5.2**: Implement scroll-triggered entrance reveals with intersection observers.
- [ ] **Task 5.3**: Add modal dialog enter/exit transitions and focus trapping.
- [ ] **Task 5.4**: Add `@media (prefers-reduced-motion: reduce)` fallbacks.

---

## 3. The Continuous Verification Loop Protocol

For each component and section built, run the Verification Loop:

```
[REFERENCE]  <─── Inspect Target ───┐
     │                               │
     ▼                               │
[IMPLEMENTATION]                     │
     │                               │
     ▼                               │
  [COMPARE]                          │
     │                               │
     ├─► Differences Detected?       │
     │   ├── Identify Delta (px, timing, color)
     │   └── Apply Targeted Fix ─────┘
     │
     └─► Fidelity Threshold Met (Delta <= 2px, Timings <= 50ms)
         └── PASS TO NEXT COMPONENT
```

### Verification Checklist
| Component | Visual Alignment ($\le 2\text{px}$) | Color Accuracy (Exact Hex) | Responsive Fluidity (375px - 1440px) | Motion & Timing Match ($\le 50\text{ms}$) | Keyboard & ARIA A11y | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Navigation Bar** | [ ] | [ ] | [ ] | [ ] | [ ] | PENDING |
| **Hero Section** | [ ] | [ ] | [ ] | [ ] | [ ] | PENDING |
| **Feature Grid** | [ ] | [ ] | [ ] | [ ] | [ ] | PENDING |
| **Pricing Section** | [ ] | [ ] | [ ] | [ ] | [ ] | PENDING |
| **FAQ Accordion** | [ ] | [ ] | [ ] | [ ] | [ ] | PENDING |
| **Mobile Drawer** | [ ] | [ ] | [ ] | [ ] | [ ] | PENDING |
