# Asset & Media Inventory

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level A (Network payloads, DOM attributes, SVG paths)

---

## 1. Vector Icons & Symbols (SVGs)

| Asset ID | Icon Name / Role | Format | Implementation Type | Original Dimensions / `viewBox` | Epistemic Level | Recommended Open-Source Equivalent (Lucide / Radix) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `icon-logo` | Brand Logo Mark | SVG | Inline `<svg>` | `0 0 140 32` | Level A | Reconstructed / Custom SVG |
| `icon-search` | Search trigger icon | SVG | Inline `<svg>` | `0 0 24 24` | Level A | `lucide-react: Search` |
| `icon-chevron-down`| Dropdown chevron | SVG | Inline `<svg>` | `0 0 20 20` | Level A | `lucide-react: ChevronDown` |
| `icon-check` | Feature checkmark | SVG | Inline `<svg>` | `0 0 16 16` | Level A | `lucide-react: Check` |
| `icon-arrow-right` | CTA link arrow | SVG | Inline `<svg>` | `0 0 20 20` | Level A | `lucide-react: ArrowRight` |
| `icon-close` | Modal/Drawer close | SVG | Inline `<svg>` | `0 0 24 24` | Level A | `lucide-react: X` |

---

## 2. Raster Images & Media

| Asset ID | Role / Section | Original URL / Path | Extracted Format | Intrinsic Dimensions | Display Dimensions (Desktop) | Fallback / Mock Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `img-hero-mockup` | Hero Dashboard Preview | `https://.../hero-preview.webp` | WebP | `1920x1080` | `1200x675` (Responsive) | High-fidelity mock screenshot or SVG illustration |
| `img-avatar-01` | Customer Testimonial | `https://.../avatar1.jpg` | JPG | `128x128` | `48x48` | Unsplash royalty-free portrait or avatar placeholder |
| `img-logo-client-1`| Social proof logo 1 | `https://.../logo-acme.svg` | SVG | `120x36` | `120x36` (Grayscale) | Clean monochrome SVG placeholder |

---

## 3. Typography & Font Files

| Font Family | Format | Loaded Weights | Font Source / CDN URL | Fallback Stack | Licensing / Usage Note |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Inter** | WOFF2 | 400, 500, 600, 700 | Google Fonts CDN | `system-ui, sans-serif` | Open Font License (OFL) |
| **Cal Sans** | WOFF2 | 600 | Self-hosted or CDN | `Inter, sans-serif` | Open Font License (OFL) |

---

## 4. Proprietary Asset Replacement Protocol

> [!IMPORTANT]
> **Proprietary & Copyright Guardrail**:
> Never clone copyrighted photography, trademarked brand logos, or licensed illustrations without explicit authorization.
> When rebuilding in Mode B:
> 1. Use clean open-source icon sets (e.g. `lucide-react`, `heroicons`, `radix-icons`).
> 2. Replace brand logos with clean text typography or generic placeholders unless the project owns the brand.
> 3. Replace proprietary imagery with royalty-free Unsplash equivalents or synthetic vector shapes.
