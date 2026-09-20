# Route Inventory & Architecture Specification

**Target Website**: `https://www.bramvanvugt.com`  
**Total Discovered Routes**: `13`  
**Dynamic Route Families**: `1`  
**Generated At**: `2026-09-20T02:21:40.887Z`  

---

## 1. Dynamic Route Families

| Template | Parameter | Total Instances | Discovered Examples | Parent Route |
| :--- | :--- | :--- | :--- | :--- |
| `/projecten/:slug` | `slug` | 8 | `/projecten/alquion`, `/projecten/ausems`, `/projecten/bloomer`, `/projecten/design-chair`, `/projecten/limelight` | `/projecten` |

---

## 2. Complete Route Inventory & Verification Matrix

| # | Route Path | Type | Priority | Dynamic Template | Discovery Source | Implemented | Verified | QA Status |
|---|------------|------|----------|------------------|------------------|-------------|----------|-----------|
| 1 | `/` | `root` | **CRITICAL** | - | sitemap.xml, root-entry, html-link, json-ld | [ ] | [ ] | PENDING |
| 2 | `/about` | `static` | **HIGH** | - | sitemap.xml, html-link, crawler, json-ld | [ ] | [ ] | PENDING |
| 3 | `/contact` | `static` | **HIGH** | - | sitemap.xml, html-link, crawler, json-ld | [ ] | [ ] | PENDING |
| 4 | `/privacy-statement` | `static` | **HIGH** | - | sitemap.xml, html-link, crawler, json-ld | [ ] | [ ] | PENDING |
| 5 | `/work` | `static` | **HIGH** | - | sitemap.xml, html-link, crawler, json-ld | [ ] | [ ] | PENDING |
| 6 | `/projecten/alquion` | `dynamic-instance` | **MEDIUM** | `/projecten/:slug` | sitemap.xml, html-link, json-ld, crawler | [ ] | [ ] | PENDING |
| 7 | `/projecten/ausems` | `dynamic-instance` | **MEDIUM** | `/projecten/:slug` | sitemap.xml, html-link, json-ld, crawler | [ ] | [ ] | PENDING |
| 8 | `/projecten/bloomer` | `dynamic-instance` | **MEDIUM** | `/projecten/:slug` | sitemap.xml, html-link, json-ld, crawler | [ ] | [ ] | PENDING |
| 9 | `/projecten/design-chair` | `dynamic-instance` | **MEDIUM** | `/projecten/:slug` | sitemap.xml, html-link, json-ld, crawler | [ ] | [ ] | PENDING |
| 10 | `/projecten/limelight` | `dynamic-instance` | **MEDIUM** | `/projecten/:slug` | sitemap.xml, html-link, json-ld, crawler | [ ] | [ ] | PENDING |
| 11 | `/projecten/massage-studio` | `dynamic-instance` | **MEDIUM** | `/projecten/:slug` | sitemap.xml, html-link, json-ld, crawler | [ ] | [ ] | PENDING |
| 12 | `/projecten/move-to-dream` | `dynamic-instance` | **MEDIUM** | `/projecten/:slug` | sitemap.xml, html-link, json-ld, crawler | [ ] | [ ] | PENDING |
| 13 | `/projecten/yoga-website` | `dynamic-instance` | **MEDIUM** | `/projecten/:slug` | sitemap.xml, html-link, json-ld, crawler | [ ] | [ ] | PENDING |

---

## 3. Route Hierarchy Tree

```text
/ (root)
  ├── about (static)
  ├── contact (static)
  ├── privacy-statement (static)
  ├── work (static)
alquion (dynamic-instance)
ausems (dynamic-instance)
bloomer (dynamic-instance)
design-chair (dynamic-instance)
limelight (dynamic-instance)
massage-studio (dynamic-instance)
move-to-dream (dynamic-instance)
yoga-website (dynamic-instance)
```

---

> [!IMPORTANT]
> **First-Page Mirage Prevention Rule**:
> Project sign-off strictly requires 100% of the routes listed in this inventory to be implemented, navigable, and verified with $\Delta \le 1\text{px}$ container geometry.
