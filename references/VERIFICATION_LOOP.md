# Verification Loop: Side-by-Side Fidelity Protocol

This reference defines the iterative verification protocol used during Mode B (Analyze + Rebuild) to ensure that the reconstructed interface matches the reference website visually, functionally, and behaviorally.

---

## 1. The Verification Cycle

```
  ┌────────────────────────────────────────────────────────┐
  │                   1. REFERENCE TARGET                  │
  │  Inspect live URL or captured reference specifications │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                   2. IMPLEMENTATION                    │
  │  Render current component / page in local dev server   │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                       3. COMPARE                       │
  │  Side-by-side visual, behavioral & responsive check    │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                4. IDENTIFY DIFFERENCES                 │
  │  Catalog geometry, color, typography, or timing deltas │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                       5. FIX                           │
  │  Apply targeted code adjustments to reconcile delta    │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                     6. RE-CHECK                        │
  │  Re-evaluate side-by-side until thresholds are passed  │
  └────────────────────────────────────────────────────────┘
```

---

## 2. Verification Dimensions & Acceptance Thresholds

| Dimension | Verification Procedure | Strict Acceptance Bar | Acceptable Variance |
| :--- | :--- | :--- | :--- |
| **Geometry & Layout** | Overlay screenshot or compare bounding client rects | Alignment, padding, and container widths match | $\le 2\text{px}$ deviation due to browser sub-pixel rendering |
| **Color & Gradients** | Eye-dropper / Computed style inspection | Exact hex/rgba match against extracted tokens | Zero variance on primary tokens; subtle perceptual parity on complex mesh gradients |
| **Typography** | Computed font-size, line-height, weight, letter-spacing | Exact font-size, line-height, and weight match | System fallback variance only if proprietary font cannot be licensed |
| **Hover & Active States**| Trigger pointer hover and active press on buttons/links | Color shifts, transform scales, shadows, and focus rings match | Identical transition triggers and visual response |
| **Motion & Timing** | Slow-motion (0.25x) comparison or WAAPI frame recording | Durations match within $\le 50\text{ms}$; curves match acceleration profile | $\le 50\text{ms}$ duration variance |
| **Responsive Scaling** | Resize viewport across 375px, 768px, 1024px, 1280px, 1440px | Layout reflows without overflow bugs; nav drawer triggers properly | Fluid breakpoints matching reference |
| **Keyboard Accessibility**| Tab through interactive elements with keyboard | Focus rings visible (`outline` / `ring`), Enter/Space triggers actions | Full keyboard navigation parity |

---

## 3. Discrepancy Categorization & Resolution Protocol

When a difference is identified during Step 4:

### Category 1: Measurable Stylistic Delta
- **Example**: Button padding in implementation is `12px 20px`, but reference computed style is `10px 18px`.
- **Resolution**: Directly update the component class or style to the exact computed metric (`px-4.5 py-2.5`).

### Category 2: Motion Profile Mismatch
- **Example**: Dropdown in implementation opens with linear ease, but reference accelerates then decelerates with spring physics.
- **Resolution**: Replace `ease` with the verified cubic-bezier curve `cubic-bezier(0.16, 1, 0.3, 1)`.

### Category 3: Asset or Proprietary Constraint (Level E)
- **Example**: Target uses proprietary trademarked illustrations or a private video stream.
- **Resolution**:
  1. Confirm that asset is Level E (Unavailable / Proprietary).
  2. Substitute with clean, geometrically equivalent SVG vector graphics or open-source placeholder media.
  3. Document the justified substitution in `IMPLEMENTATION_PLAN.md` without blocking verification.

---

## 4. Final Sign-Off Criteria

An implementation milestone is considered complete ONLY when:
1. All components pass the verification checklist.
2. Zero horizontal viewport scrollbars occur between `320px` and `2560px`.
3. Console has zero errors or unhandled exceptions.
4. `@media (prefers-reduced-motion: reduce)` is honored.
5. All interactive elements have accessible focus states.
