# Visual Comparison & Alignment Report Template

## 1. Test Session Overview
- **Source URL**: `[SOURCE_URL]`
- **Local Preview URL**: `[LOCAL_URL]`
- **Audit Date**: `[DATE]`
- **Tested Route**: `[ROUTE]`

---

## 2. Multi-Viewport Alignment Matrix

| Viewport Preset | Dimensions | Navigation Alignment | Hero & Fold | Content Grid | Footer & Masks | Overall Verdict |
|-----------------|------------|----------------------|-------------|--------------|----------------|-----------------|
| 4K Ultra Wide | 3840 x 2160 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| QHD Desktop | 2560 x 1440 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| MacBook Pro 16 | 1728 x 1117 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| Standard Desktop | 1440 x 900 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| MacBook Air 13 | 1280 x 800 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| Small Laptop | 1024 x 768 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| Tablet Landscape| 1024 x 1366 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| Tablet Portrait | 768 x 1024 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| Foldable | 540 x 720 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| Mobile Large | 430 x 932 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| Mobile Standard | 390 x 844 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |
| Mobile Small | 320 x 568 | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] |

---

## 3. Side-by-Side Visual Artifacts

### A. Above-the-Fold (0px Scroll)
| Reference (Source) | Reconstructed (Local) | Delta Notes |
|--------------------|-----------------------|-------------|
| `![Orig Above Fold](path/to/orig_fold.png)` | `![Local Above Fold](path/to/local_fold.png)` | Alignment: Identical. Typography: Identical. |

### B. Mid-Page Scroll & Interactive Grid
| Reference (Source) | Reconstructed (Local) | Delta Notes |
|--------------------|-----------------------|-------------|
| `![Orig Mid](path/to/orig_mid.png)` | `![Local Mid](path/to/local_mid.png)` | Parallax speed and card offsets verified. |

### C. Curved Transition & Bottom Footer
| Reference (Source) | Reconstructed (Local) | Delta Notes |
|--------------------|-----------------------|-------------|
| `![Orig Footer](path/to/orig_footer.png)` | `![Local Footer](path/to/local_footer.png)` | Curve mask background match verified. |

---

## 4. Discrepancy Log & Root Cause Analysis

| # | Discrepancy Symptom | Surface Cause | Root Architectural Cause | Applied Permanent Fix | Verification Result |
|---|---------------------|---------------|--------------------------|-----------------------|---------------------|
| 1 | Footer buttons unclickable | Button CSS broken | Floating overlay element intercepting pointer events | Added `pointer-events: none` to overlay | PASS - Clickable |
| 2 | Mask curve invisible | SVG path error | Background color hardcoded instead of section color | Dynamic section bg matching applied | PASS - Seamless |
| 3 | Parallax inactive on scroll | Lenis scroll error | Data-scroll engine not connected to scroll proxy | Initialized GSAP ScrollTrigger proxy | PASS - Smooth |
