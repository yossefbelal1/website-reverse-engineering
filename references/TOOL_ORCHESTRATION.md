# Tool-First Forensics & Tool Orchestration Guide

## 1. The Tool-First Principle

When conducting website reverse-engineering and forensic reconstruction:
**NEVER immediately default to raw manual code or guesswork if specialized visual-forensics tools, extensions, or skills are available.**

```
┌────────────────────────────────────────────────────────┐
│             SPECIALIZED FORENSIC TOOL                  │
│       Capture Motion, CSS Peeper, Woblo, etc.          │
└───────────────────────────┬────────────────────────────┘
                            │ Yields structured evidence
                            ▼
┌────────────────────────────────────────────────────────┐
│           BROWSER / RUNTIME CROSS-VALIDATION           │
│   Chrome DevTools MCP / Computed Styles / GSAP / DOM   │
└───────────────────────────┬────────────────────────────┘
                            │ Confirms ground truth
                            ▼
┌────────────────────────────────────────────────────────┐
│            VERIFIED FORENSIC SPECIFICATION             │
│            Ready for High-Fidelity Rebuild             │
└────────────────────────────────────────────────────────┘
```

The preferred workflow is always:
$$\text{Specialized Tool} \longrightarrow \text{Verify with Browser/Source} \longrightarrow \text{Reconstruct}$$
rather than:
$$\text{Custom Approximation} \longrightarrow \text{Assume Correctness (Violation!)}$$

---

## 2. Step 0: Mandatory Tool & Environment Discovery

Before beginning any website reconstruction, inspect the active environment to identify all available forensic tools, browser extensions, MCP servers, and companion skills.

### Discovery Protocol
1. **MCP Tooling**: Check for `chrome-devtools-mcp` (page navigation, screenshots, console, network, scripts) and any specialized MCP visual inspectors.
2. **Browser Extensions**: Check if the active browser profile contains:
   - **Capture Motion**: Frame-by-frame animation, spring physics, and timeline recorder.
   - **CSS Peeper**: Instant token extractor for colors, typography, spacing, and dimensions.
   - **Woblo**: Deep visual/design architecture and layout extractor.
   - **Webmimic / Slicer**: DOM and asset extraction tools.
3. **Environment Skills & Utilities**: Check for:
   - `workflow-skill-creator` / `SKILL Extractor`: Reusable methodology distiller.
   - `design-taste-frontend`, `high-end-visual-design`, `review-animations`.
   - Node-based automation engines (Playwright, Puppeteer, CDP).
   - In-repo scripts (`scripts/audit-route-geometry.js`, `scripts/interaction-crawler.js`, `scripts/inspect-animations.js`).

---

## 3. The Visual Forensics Capability Matrix

| Tool | Core Capability | When to Use | Direct Output | Fallback Hierarchy |
| :--- | :--- | :--- | :--- | :--- |
| **Capture Motion** | Micro-motion & animation recording, frame stepping, easing extraction | Complex hover, hover-exit, scroll parallax, magnetic cursor physics, page transitions | Exact animation curves, durations, delays, stagger orders | 1. Chrome DevTools MCP (`getAnimations()`, GSAP inspection)<br>2. WAAPI runtime extraction<br>3. Source JS/timeline reverse-engineering |
| **CSS Peeper** | Rapid design-token extraction, color palettes, typography specs, spacing | Initial design system scan, component dimension extraction, asset downloading | Clean token list (hex/rgba, font-family, sizes, line-heights, padding) | 1. Chrome DevTools computed styles (`getComputedStyle`)<br>2. `scripts/extract-design-tokens.js`<br>3. Raw CSS stylesheet AST parsing |
| **Woblo** | Visual/UI structural analysis, layout relationship decomposition | Deep visual hierarchy mapping, nested layout analysis, component boundary detection | Visual layout maps, component relationship trees, spatial groupings | 1. Browser DOM visual inspection via CDP screenshots<br>2. `scripts/audit-route-geometry.js`<br>3. Rendered bounding-box analysis |
| **DESIGN.md Tooling** | Structured design-system documentation generation | Translating extracted evidence into standardized design-system markdown | Publication-grade `DESIGN.md` capturing tokens, components, and rules | 1. Re-engineering design templates (`templates/DESIGN_SYSTEM.md`)<br>2. Manual structured extraction from verified tokens |
| **SKILL Extractor** (e.g. `workflow-skill-creator`) | Codifying validated reconstruction workflows into reusable agent skills | When a novel, proven forensic workflow or failure-prevention rule is validated on a real site | Validated `SKILL.md` update in global skills configuration | 1. Direct manual editing of `SKILL.md` and `references/`<br>2. Global skill architecture update |
| **Chrome DevTools / CDP** | Runtime execution, DOM manipulation, console logs, network payloads | Programmatic inspection, synthetic event triggering, layout bounding boxes | Raw computed styles, event listener trees, live DOM mutations | 1. Headless Puppeteer / Playwright CLI scripts<br>2. Static fetch + Cheerio parser |

---

## 4. Deep Forensic Protocols for Specialized Tools

### A. Capture Motion Protocol
When Capture Motion is available, execute forensic motion capture across all interactive states:
1. **Interactive Hover & Re-entry**:
   - Initial hover entry: Record origin coordinate, scale, translation, duration, and easing curve.
   - Hover exit: Record exit trajectory. Does the fill follow the cursor or collapse to center?
   - Quick re-entry: Does the animation reset abruptly, or blend smoothly from its current transform?
2. **Scroll-Driven Parallax**:
   - Record vertical/horizontal pixel displacement relative to window scroll delta ($\Delta y$).
   - Identify whether parallax uses linear scrub, lerp inertia, or threshold triggers.
3. **Cursor & Magnetic Fields**:
   - Record magnetic attraction radius (distance in pixels before element begins pull).
   - Measure magnetic spring damping and stiffness coefficients.
4. **Organic Masks & Transitions**:
   - Record SVG path morphing or border-radius percentage transitions during page scroll.
   - Record transition mask enter/exit timing during client-side navigation.

> [!IMPORTANT]
> **Spatial Motion Rule**: Never reduce complex motion to mere opacity/scale fading if Capture Motion or visual inspection reveals multi-axis spatial translation, staggered character transforms, or DrawSVG path trimming.

---

### B. CSS Peeper Protocol
When CSS Peeper is available:
1. Extract global color tokens: brand colors, surface neutrals, typography shades, border tones.
2. Extract typography hierarchies: primary/display headings, subtitles, body, captions, line heights, and letter-spacing.
3. Extract spacing metrics: section paddings, container max-widths, grid column gaps.
4. Export vector assets and icons with native SVG dimensions.
5. **Cross-Validation Rule**: Cross-reference high-impact tokens with `window.getComputedStyle(element)` to confirm that media queries or CSS variables do not override values in specific contexts.

---

### C. Woblo Protocol
When Woblo is available:
1. Inspect high-level visual geometry and layout rhythm.
2. Isolate compound component boundaries (e.g. card groups, sticky sidebars, hero split layouts).
3. Document visual patterns and responsive layout shifts.
4. **Cross-Validation Rule**: Do not treat Woblo output as absolute truth without confirming against rendered browser geometry (`getBoundingClientRect()`).

---

### D. DESIGN.md Protocol
When DESIGN.md tooling or workflow is invoked:
1. Build a living design system document grounded strictly in Level B extracted values.
2. Capture:
   - Design philosophy and visual direction.
   - Color tokens with functional roles (`surface-primary`, `text-muted`, etc.).
   - Fluid typography scales (`clamp()` rules).
   - Layout grid rules and container maximum widths.
   - Interaction states and motion choreography tokens.
3. **Anti-Hallucination Guardrail**: Keep `DESIGN.md` strictly synchronized with observed reality. Do NOT invent hypothetical tokens or utility classes not present on the reference site.

---

### E. SKILL Extractor Protocol
When reusable workflow distillation is triggered:
1. **Scope Restriction**: Only extract **reusable, generalized methodologies, forensic workflows, failure-prevention rules, and QA gates**.
2. **Strict Exclusion**: NEVER extract website-specific implementation details (e.g. specific client names, hex colors, font names, specific layout dimensions, or proprietary copy) into global skills.
3. Update the global skill repository (`~/.gemini/config/skills/website-reverse-engineering`) to benefit all future reconstructions.

---

## 5. Cross-Validation Matrix

To prevent tool-specific false positives or missed overrides, always cross-validate findings across dual observation channels:

| Primary Finding | Primary Observation Channel | Cross-Validation Channel | Discrepancy Resolution |
| :--- | :--- | :--- | :--- |
| **Typography & Colors** | CSS Peeper / Design Inspector | Chrome DevTools `getComputedStyle()` | Computed style in active viewport wins |
| **Animation Durations & Easing** | Capture Motion / Visual Inspection | Runtime GSAP timeline / CSS Transition rules | Runtime timeline config confirms exact ms and cubic-bezier |
| **Container Width & Alignment** | Woblo / Layout Inspector | `getBoundingClientRect()` via CDP script | Sub-pixel rect bounding box wins ($\Delta \le 1\text{px}$) |
| **Interactive Clickability** | Visual Inspection | `document.elementFromPoint(x, y)` | Runtime hit-test wins (detects invisible pointer-events traps) |
| **Vector Geometry** | Exported SVG from asset tool | Raw inline SVG markup in DOM | Raw DOM markup confirms exact viewBox and inline styles |

---

## 6. The Tool Evidence Log Standard

In every forensic analysis report and implementation walkthrough, the agent must include a structured **Tool Evidence Log** documenting which tools were leveraged, what evidence was gathered, and how it impacted code reconstruction.

### Required Format

```markdown
### Forensic Tool Evidence Log

| Tool | Status | Forensic Task | Key Observation / Extracted Evidence | Implementation Impact | Cross-Validation Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Capture Motion** | ACTUALLY USED | Hero title & portrait entrance | Chars stagger 0.05s with Expo.easeOut over 1.5s; image scales 1.5 -> 1.0 | Built GSAP loader timeline with exact stagger & ease | Confirmed via `window.gsap` timeline inspection |
| **CSS Peeper** | ACTUALLY USED | Design token extraction | Background `#e3e3df`, primary green `#33423a`, lightgreen `#abb7aa` | Formatted into CSS variables in `:root` | Verified via `getComputedStyle(body)` |
| **Woblo** | AVAILABLE BUT NOT NEEDED | Page section layout | Single-page narrative structure with 10 vertical sections | Section order mirrored in semantic HTML | Verified via DOM tree traversal |
| **SKILL Extractor** | ACTUALLY USED | Methodology codification | 14-phase workflow and tool orchestration validated | Codified into global `website-reverse-engineering` skill | Verified via skill self-audit checklist |
| **Playwright** | UNAVAILABLE (FALLBACK USED) | Headless dual capture | Fallback: `chrome-devtools-mcp` evaluate_script & take_screenshot | Captured dual screenshots at identical viewports | Local & remote image diff |
```

### Strict Anti-Falsification Rule
- **NEVER** write *"Capture Motion verified this"* unless Capture Motion was genuinely invoked.
- **NEVER** write *"CSS Peeper extracted this"* unless CSS Peeper actually produced the token file.
- Always explicitly state the tool's true status:
  1. `ACTUALLY USED`
  2. `AVAILABLE BUT NOT NEEDED`
  3. `UNAVAILABLE (FALLBACK USED)`

---

## 7. Adaptive Tool Selection Strategy

Adapt tool selection based on the specific architectural nature of the target website:

1. **Static / Editorial Content Site**:
   - Prioritize: CSS Peeper, typography analyzers, layout inspection.
   - Focus: Perfect typography scale, grid alignment, image aspect ratios.
2. **Motion-Heavy / Awwwards Portfolio**:
   - Prioritize: Capture Motion, GSAP/WAAPI inspector, Lenis scroll trackers.
   - Focus: Magnetic physics, parallax scroll speeds, curved SVG transitions, preloader sequencing.
3. **Complex Multi-Route Web Application**:
   - Prioritize: Chrome DevTools MCP, Playwright/Puppeteer route crawlers, interaction hit-testing.
   - Focus: Route transitions, client-side state preservation, focus trap management, modal lifecycles.
4. **Validated Methodology Breakthrough**:
   - Prioritize: SKILL Extractor (`workflow-skill-creator`).
   - Focus: Codifying reusable lessons learned into the global skill architecture.
