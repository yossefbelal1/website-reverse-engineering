# Epistemic Standards: Evidence Levels & Verification Rules

This reference defines the strict epistemic standards enforced by `website-reverse-engineering`. The objective is to eliminate hallucination, prevent the confusion of guesses with observed realities, and ensure every recorded metric is grounded in observable facts.

---

## 1. The 5 Epistemic Levels

```
[Level A: Directly Observed Fact] ── Highest Grounding (Raw DOM / Markup / Network)
       │
[Level B: Extracted Value] ──────── Exact Rendering Metrics (Computed Styles)
       │
[Level C: Experimentally Verified] ── Dynamic Behavior (Triggered & Confirmed in Session)
       │
[Level D: Reasonable Inference] ───── Logical Deductions (Must be flagged as Inferred)
       │
[Level E: Unknown / Unavailable] ──── Inaccessible or Proprietary (Never Guess)
```

### Detailed Definitions & Examples

#### Level A: Directly Observed Fact
- **Definition**: Information extracted directly from observable source text, DOM node attributes, markup structures, or network payloads.
- **Criteria**: Can be verified by viewing the un-manipulated DOM tree or response body.
- **Examples**:
  - The hero title uses an `<h1>` tag with class `hero-headline text-5xl`.
  - The SVG icon contains `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>`.
  - The search input has attribute `placeholder="Search documentation..."`.
  - The website loads font `Inter-Variable.woff2` from `/fonts/inter.woff2`.

#### Level B: Extracted Value
- **Definition**: Numerical, color, or stylistic values computed by the browser layout and rendering engine.
- **Criteria**: Obtained via `window.getComputedStyle()`, `getBoundingClientRect()`, or DevTools Computed tab.
- **Examples**:
  - `font-size` is computed as `48px`.
  - `background-color` is computed as `rgba(15, 23, 42, 0.95)`.
  - `padding-left` is `24px` and `padding-right` is `24px`.
  - Container bounding rect width is `1280px` centered with `margin-inline: auto`.

#### Level C: Behavior Experimentally Verified
- **Definition**: Dynamic states, transitions, or event lifecycles confirmed by actively executing user interactions (hover, click, scroll, resize, input) within a live browser instance.
- **Criteria**: Must have been tested and observed to change state in real-time.
- **Examples**:
  - Clicking the mobile menu button transitions `transform: translateX(100%)` to `transform: translateX(0)` in `200ms` and locks body scroll.
  - Scrolling past `scrollY > 50px` toggles a backdrop blur class and reduces header height from `80px` to `64px`.
  - Hovering a pricing card initiates a scale transform `scale(1.02)` over `180ms` with `ease-out`.

#### Level D: Reasonable Inference
- **Definition**: A calculated deduction or architectural categorization made when direct extraction is unavailable or ambiguous.
- **Criteria**: Must be logically justified by surrounding patterns, but must NEVER be stated as an established fact.
- **Mandatory Annotation**: Must always be prefixed with `[Inferred]`.
- **Examples**:
  - `[Inferred: color.brand.accent = #3b82f6]` (The hex was extracted, but the semantic role token name is inferred).
  - `[Inferred: Easing is cubic-bezier(0.16, 1, 0.3, 1)]` (The motion feels like standard spring decelerate, but keyframe easing was not directly exported).
  - `[Inferred: Breakpoint is 768px]` (Observed at 800px and 700px, but exact media query was compiled into minified CSS).

#### Level E: Unknown / Unavailable Information
- **Definition**: Data or behavior that cannot be directly inspected or verified due to security, proprietary backend processing, obfuscation, or technical limitations.
- **Criteria**: No observable evidence exists.
- **Mandatory Annotation**: Must be recorded as `[Unknown]` or `[Unavailable]`.
- **Examples**:
  - Server-side database validation rules.
  - Exact WebGL fragment shader code compiled inside binary buffers.
  - Third-party analytics or payment gateway internal state machines.

---

## 2. Epistemic Violation Anti-Patterns

| Anti-Pattern | Violation Description | Proper Correction |
| :--- | :--- | :--- |
| **Guessing Animation Duration** | "The modal pops up quickly, around 300ms with ease." | "Modal duration measured via WAAPI: `220ms` with `cubic-bezier(0.16, 1, 0.3, 1)` [Level B] OR [Inferred: ~200-250ms, ease-out]." |
| **Fabricating Design Tokens** | Writing `color.secondary = #f43f5e` when no pink color appears anywhere on the target site. | Document only colors observed in the DOM. Do not invent palette slots. |
| **Assuming Responsive Layouts** | "It probably stacks on mobile." | "Mobile layout verified at 375px: Feature grid stacks into single column [Level C]." OR "Mobile layout not tested [Level E: Unknown]." |
| **Presenting Screenshot Guesstimates as Computed** | Eyeballing a screenshot and writing `padding: 18px`. | Mark as `[Inferred: ~16-20px from visual inspection]` until verified via DevTools computed styles. |
