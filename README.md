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

# 7. Evaluate Hard Quality Gates (First-Page Mirage Enforcer)
# Runs all 17 Quality Gates and outputs FINAL_QA.md (exits with code 1 if any mandatory gate fails)
node scripts/reverse-engineer-cli.js qa route-graph.json --workspace ./ --out FINAL_QA.md

# One-Shot Automated Pipeline
node scripts/reverse-engineer-cli.js pipeline https://example.com --workspace ./
```

---

## Repository Structure

```
website-reverse-engineering/
├── package.json                           # Engine manifest and npm run scripts
├── SKILL.md                               # Complete skill definition and operational protocol
├── README.md                              # Repository overview and CLI documentation
├── scripts/                               # Programmatic reverse-engineering engines
│   ├── reverse-engineer-cli.js            # Master unified CLI orchestrator
│   ├── discover-routes.js                 # Multi-source route discovery engine
│   ├── build-route-graph.js               # Route graph builder & dynamic clustering
│   ├── collect-page-evidence.js           # Structured page-by-page evidence collector
│   ├── extract-assets.js                  # Multi-page media & asset harvester
│   ├── generate-page-specs.js             # Route specifications & design system generator
│   ├── audit-route-coverage.js            # Route completeness, FOUC, and navigation auditor
│   ├── verify-geometry-and-visuals.js     # Container-first sub-pixel geometry verifier (Δ <= 1px)
│   ├── run-quality-gates.js               # Hard Quality Gate evaluator & FINAL_QA.md generator
│   ├── audit-route-geometry.js            # In-browser DOM geometry extractor (console/CDP)
│   ├── extract-design-tokens.js           # In-browser computed tokens extractor
│   ├── inspect-animations.js              # In-browser animation & ScrollTrigger inspector
│   ├── interaction-crawler.js             # In-browser interactive reachability crawler
│   └── capture-comparison.js              # Multi-viewport capture & visual metrics helper
├── tests/                                 # Automated test suite
│   ├── run-all-tests.js                   # Master test runner
│   ├── test-route-discovery.js            # URL normalization, domain boundaries, sitemap parsing
│   ├── test-dynamic-routes.js             # Parametric segment detection & family clustering
│   ├── test-route-graph.js                # Hierarchy generation & parent-child relationships
│   ├── test-coverage-and-gates.js         # Coverage calculations, FOUC, and First-Page Mirage block
│   └── test-geometry-and-visuals.js       # Container width delta and line break detection
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
    ├── TYPOGRAPHY.md                      # Type scale, font families, line-heights, and weights
    └── VISUAL_COMPARISON_REPORT.md        # Pixel-diff and side-by-side audit report
```

---

## Running Automated Tests

Run the built-in test suite:
```bash
npm test
# or
node tests/run-all-tests.js
```

The test suite exercises:
- Route normalization (trailing slashes, tracking parameter stripping, hash fragments).
- Domain boundary protection (filtering external links and subdomains).
- Sitemap and robots.txt parsing.
- Dynamic route pattern clustering (e.g. `/work/:slug`).
- Hierarchical route graph building and parent-child tree mapping.
- Local route coverage and FOUC detection.
- Broken internal link discovery.
- Strict First-Page Mirage blocking (guaranteeing that missing subpages cause Quality Gates to fail).
- Sub-pixel container geometry delta assertions ($\Delta \le 1\text{px}$).

---

## License

MIT License. Designed for forensic engineering, design analysis, and visual reconstruction workflows.
