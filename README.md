# Website Reverse-Engineering & Forensic Reconstruction Skill

An autonomous, battle-tested forensic engineering skill for reverse-engineering modern web applications and reconstructing their visual architecture, container geometry, stateful interaction physics, responsive layouts, and motion choreography with sub-pixel and microsecond precision ($\Delta \le 1\text{px}$).

---

## Overview

When given any reference website URL, this skill guides an AI coding agent through an **autonomous, tool-first, evidence-first multi-phase forensic reconstruction workflow**. It prevents architectural mirages, target drift, FOUC traps, and approximation guessing by enforcing strict verification loops and container-first spatial geometry.

### Core Pillars

1. **Tool-First & Evidence-First**: Always discovers and orchestrates specialized design forensics tooling (Chrome DevTools / CDP, CSS Peeper, Capture Motion, Woblo, DESIGN.md workflows) before falling back to manual scripts.
2. **Container-First Spatial Geometry**: Establishes parent container dimensions, flex/grid contexts, max-widths, and padding before styling leaf elements. Enforces $\Delta \le 1\text{px}$ tolerance against the original.
3. **Multi-Page Route Completeness (No First-Page Mirage)**: Reconstructs every route discovered on the target site (Home, About, Work, Detail pages, Contact) to the exact same forensic standard as the primary page.
4. **Strict Target Locking**: Protects project identity against cross-session drift, previous project cache pollution, and stale references.
5. **Headless Head & FOUC Prevention**: Ensures local asset routing, shared Webflow/CSS master sheets, and font stylesheets are declared directly in subpage `<head>` tags to eliminate flash-of-unstyled-content and runtime breakage.

---

## Repository Structure

```
website-reverse-engineering/
├── SKILL.md                               # Complete skill definition and operational instructions
├── README.md                              # Repository overview and documentation
├── references/                            # Deep-dive guides & protocols
│   ├── EPISTEMIC_STANDARDS.md             # Evidence-based truth standards & measurement rules
│   ├── INSPECTION_GUIDE.md                # CDP, CSS inspection, and asset extraction guide
│   ├── INTERACTION_AND_MOTION_GUIDE.md    # Physics, easing curves, and timeline reconstruction
│   ├── MASTER_WORKFLOW.md                 # Step-by-step master reconstruction lifecycle
│   ├── SPATIAL_GEOMETRY_GUIDE.md          # Container geometry, box-model, and layout hierarchy
│   ├── TOOL_ORCHESTRATION.md              # Discovery matrix for specialized devtools & extensions
│   └── VERIFICATION_LOOP.md               # Visual diffing, side-by-side verification, and audit checklist
├── scripts/                               # Automated forensic extraction & inspection scripts
│   ├── audit-route-geometry.js            # Automated route-by-route geometry & alignment checker
│   ├── capture-comparison.js              # Viewport & element comparison capture utility
│   ├── extract-design-tokens.js           # Automated color, typography, and spacing token extractor
│   ├── inspect-animations.js              # CSS keyframes, transition timing, and Web Animations inspector
│   └── interaction-crawler.js             # Interactive state crawler (hover, active, focus, scroll)
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

## Installation & Usage

### Antigravity & Agent Plugins
Place this skill folder inside your AI agent skills directory:
```bash
# Global Antigravity / Gemini CLI skills directory
~/.gemini/config/skills/website-reverse-engineering/
```

### Triggering the Skill
The skill automatically activates whenever you ask your agent to:
- Reconstruct or clone a website (`"Recreate this website with maximum source fidelity: <URL>"`)
- Audit or inspect a reference site's design system or interactions
- Reverse-engineer layout geometry, CSS animations, or custom physics

---

## License

MIT License. Designed for forensic engineering, design analysis, and visual reconstruction workflows.
