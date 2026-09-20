# Website Reverse-Engineering & Forensic Reconstruction Engine (v2.0.0)

An autonomous, battle-tested forensic engineering engine for reverse-engineering modern web applications and reconstructing their visual architecture, container geometry, stateful interaction physics, responsive layouts, and motion choreography with sub-pixel and microsecond precision ($\Delta \le 1\text{px}$).

---

## Overview

When given any reference website URL, this system executes an **autonomous, tool-first, evidence-driven multi-phase forensic reconstruction workflow**. It systematically eliminates the "First-Page Mirage" by treating the entire website as an interconnected route graph rather than a single landing page.

### Core Pillars

1. **Tool-First & Evidence-First**: Discovers and orchestrates specialized design forensics tooling (Chrome DevTools / CDP, CSS Peeper, Capture Motion, Woblo, DESIGN.md workflows) before falling back to programmatic extractors.
2. **Container-First Spatial Geometry**: Establishes parent container dimensions, flex/grid contexts, max-widths, and paddings before styling child elements. Enforces $\Delta \le 1\text{px}$ tolerance against the original.
3. **Multi-Page Route Completeness (First-Page Mirage Block)**: Models the entire target website into a hierarchical `route-graph.json` and enforces that 100% of reachable routes are implemented, styled, and navigable.
4. **Dynamic Route Clustering**: Automatically detects parameterized templates (e.g. `/work/:slug`, `/projecten/:slug`), clusters instances, preserves representative examples, and audits shared templates against instance variability.
5. **Headless Head & FOUC Prevention**: Ensures local asset routing, shared stylesheets, and web fonts are declared directly in subpage `<head>` tags to eliminate flash-of-unstyled-content.
6. **Programmatic Quality Gates**: Enforces 17 hard Quality Gates evaluated programmatically via `run-quality-gates.js`, generating evidence-based `FINAL_QA.md` reports with zero-tolerance exit codes.

---

## CLI & Engine Quickstart

The engine includes a master CLI orchestrator (`reverse-engineer`) and modular scripts:

```bash
# 1. Multi-Source Route Discovery
# Discovers routes from sitemap.xml, robots.txt, HTML crawl, JS bundle manifests, and interactive elements
node scripts/reverse-engineer-cli.js discover https://example.com --depth 2 --out discovered.json

# 2. Build Hierarchical Route Graph & Dynamic Families
# Clusters dynamic route families and generates ROUTE_INVENTORY.md
node scripts/reverse-engineer-cli.js graph discovered.json --out route-graph.json --md ROUTE_INVENTORY.md

# 3. Collect Page-by-Page Forensic Evidence
# Gathers dom.json, geometry.json, styles.json, assets.json, and interactions.json for every route
node scripts/reverse-engineer-cli.js evidence route-graph.json --out ./evidence

# 4. Multi-Page Asset Harvester
# Aggregates and downloads all images, fonts, SVGs, and videos across all routes
node scripts/reverse-engineer-cli.js assets ./evidence --download ./public --out ASSET_INVENTORY.md

# 5. Generate Route-Specific Page Specifications
# Generates PAGE_SPEC_<slug>.md for every discovered route
node scripts/reverse-engineer-cli.js specs route-graph.json --evidence ./evidence --outDir ./specs

# 6. Audit Route Coverage & Navigation Integrity
# Checks implementation completeness, FOUC safety, and tests for broken internal links
node scripts/reverse-engineer-cli.js coverage route-graph.json --workspace ./ --out ROUTE_COVERAGE_MATRIX.md

# # 7. Region-Based Visual Diffing
# Computes similarity per semantic region across desktop, tablet, and mobile viewports
node scripts/reverse-engineer-cli.js diff orig.html local.html --route /about --outDir ./visual-diffs

# 8. Bounded Autonomous Repair Loop
# Automatically classifies, locates, repairs, and re-verifies defects across all pages
node scripts/reverse-engineer-cli.js repair route-graph.json --workspace ./ --maxRetries 3 --log repair-log.json

# 9. Verify Spec-to-Code Traceability
# Confirms that all discovered routes and specs are fully implemented in code
node scripts/reverse-engineer-cli.js trace route-graph.json --specs ./specs --workspace ./ --out TRACEABILITY_MATRIX.md

# 10. Evaluate Hard Quality Gates & Generate Site Scorecard
# Runs all 17 Quality Gates and outputs FINAL_QA.md and FINAL_QA.json
node scripts/reverse-engineer-cli.js qa route-graph.json --workspace ./ --mode high-fidelity --out FINAL_QA.md --json FINAL_QA.json

# One-Shot Automated Pipeline
node scripts/reverse-engineer-cli.js pipeline https://example.com --workspace ./ --mode high-fidelity
```

---

## Repository Structure

```
website-reverse-engineering/
├── package.json                           # Engine manifest and npm run scripts
├── SKILL.md                               # Complete skill definition and operational protocol
├── README.md                              # Repository overview and CLI documentation
├── fixtures/                              # End-to-end testing fixtures
│   ├── server.js                          # Zero-dependency local test server
│   └── realistic-site/                    # Multi-page test fixture (7 routes, assets, styles)
├── scripts/                               # Programmatic reverse-engineering engines
│   ├── reverse-engineer-cli.js            # Master unified CLI orchestrator
│   ├── discover-routes.js                 # Multi-source route discovery engine
│   ├── build-route-graph.js               # Route graph builder & dynamic clustering
│   ├── collect-page-evidence.js           # Structured page-by-page evidence collector
│   ├── extract-assets.js                  # Multi-page media & asset harvester
│   ├── generate-page-specs.js             # Route specifications & design system generator
│   ├── visual-diff-engine.js              # Region-based multi-viewport visual diff engine
│   ├── classify-mismatches.js             # 17-class error taxonomy classifier
│   ├── repair-loop.js                     # Bounded autonomous self-healing repair loop
│   ├── verify-traceability.js             # Page-spec to code traceability engine
│   ├── verify-content-and-assets.js       # Content fidelity & asset existence auditor
│   ├── audit-route-coverage.js            # Route completeness, FOUC, and navigation auditor
│   ├── verify-geometry-and-visuals.js     # Container-first sub-pixel geometry verifier (Δ <= 1px)
│   ├── run-quality-gates.js               # Hard Quality Gate evaluator & scorecard generator
│   ├── audit-route-geometry.js            # In-browser DOM geometry extractor (console/CDP)
│   ├── extract-design-tokens.js           # In-browser computed tokens extractor
│   ├── inspect-animations.js              # In-browser animation & ScrollTrigger inspector
│   ├── interaction-crawler.js             # In-browser interactive reachability crawler
│   └── capture-comparison.js              # Multi-viewport capture & visual metrics helper
├── tests/                                 # Automated test suite (9 test suites)
│   ├── run-all-tests.js                   # Master test runner
│   ├── test-route-discovery.js            # URL normalization, domain boundaries, sitemap parsing
│   ├── test-dynamic-routes.js             # Parametric segment detection & family clustering
│   ├── test-route-graph.js                # Hierarchy generation & parent-child tree mapping
│   ├── test-coverage-and-gates.js         # Coverage calculations, FOUC, and First-Page Mirage block
│   ├── test-geometry-and-visuals.js       # Container width delta and line break detection
│   ├── test-first-page-mirage-regression.js# Permanent regression test for First-Page Mirage
│   ├── test-false-pass-prevention.js      # Negative assertion suite testing failure modes
│   ├── test-repair-loop.js                # Self-healing repair cycle validation
│   └── test-end-to-end-pipeline.js        # Full pipeline test against realistic multi-page fixture
├── references/                            # Deep-dive guides & protocols
│   ├── EPISTEMIC_STANDARDS.md             # Evidence-based truth standards & measurement rules
│   ├── INSPECTION_GUIDE.md                # CDP, CSS inspection, and asset extraction guide
│   ├── INTERACTION_AND_MOTION_GUIDE.md    # Physics, easing curves, and timeline reconstruction
│   ├── MASTER_WORKFLOW.md                 # Step-by-step master reconstruction lifecycle
│   ├── SPATIAL_GEOMETRY_GUIDE.md          # Container geometry, box-model, and layout hierarchy
│   ├── TOOL_ORCHESTRATION.md              # Discovery matrix for specialized devtools & extensions
│   └── VERIFICATION_LOOP.md               # Visual diffing, side-by-side verification, and audit checklist
└── templates/                             # Deliverable and documentation templates
    ├── ASSET_INVENTORY.md                 # Media, icon, font, and asset mapping template
    ├── COLORS.md                          # Palette and theme token specification
    ├── COMPONENT_MAP.md                   # Component hierarchy and relationship tree
    ├── CROSS_PAGE_HARMONIZATION.md        # Consistency audit across multi-page layouts
    ├── DESIGN_SYSTEM.md                   # Unified design token manifest
    ├── FINAL_RECONSTRUCTION_QA.md         # Final quality assurance checklist
    ├── GEOMETRY_AUDIT.md                  # Container & element dimension comparison log
    ├── IMPLEMENTATION_PLAN.md             # Architecture and implementation plan template
    ├── INTERACTION_SPEC.md                # Interaction physics & gesture specification
    ├── MOTION_SPEC.md                     # Animation timing, easings, and choreographies
    ├── PAGE_STRUCTURE.md                  # DOM tree and landmark structure template
    ├── RESPONSIVE_SPEC.md                 # Breakpoint and adaptive layout specification
    ├── ROUTE_INVENTORY.md                 # Complete route catalog for multi-page sites
    ├── SPACING.md                         # Spatial rhythm and margin/padding scales
    ├── TRACEABILITY_MATRIX.md             # Spec-to-code traceability matrix template
    ├── TYPOGRAPHY.md                      # Type scale, font families, line-heights, and weights
    └── VISUAL_COMPARISON_REPORT.md        # Pixel-diff and side-by-side audit report
```

---

## Running Automated Tests

Run the full suite of 9 test suites:
```bash
npm test
# or
node tests/run-all-tests.js
```

The test suite exercises:
1. **Route Discovery & Normalization**: Trailing slashes, tracking parameter stripping, hash fragments, robots.txt, sitemaps.
2. **Dynamic Route Clustering**: Slug and ID detection, grouping into parameterized templates (e.g. `/work/:slug`).
3. **Route Graph & Hierarchy**: Tree generation, parent-child links, traversal, crawl prioritization.
4. **Route Coverage & Quality Gates**: Coverage calculations, FOUC detection, broken internal link detection.
5. **Geometry Delta & Visual Verification**: Container width delta ($\Delta \le 1\text{px}$), section height cadence ($\Delta \le 2\text{px}$), and artificial `<br>` suppression.
6. **First-Page Mirage Regression**: Proves that a perfect homepage with missing or broken subpages is strictly failed.
7. **False-Pass Prevention**: Tests negative cases across 5 failure categories to ensure invalid implementations cannot pass.
8. **Autonomous Self-Healing Repair Loop**: Proves that the repair loop detects defects, applies fixes, and achieves verification.
9. **End-to-End Pipeline Integration**: Tests full workflow on a realistic 7-route website fixture with local server.

---

## License

MIT License. Designed for forensic engineering, design analysis, and visual reconstruction workflows.
