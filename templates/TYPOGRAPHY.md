# Typography Specification

- **Target**: `[Target Website Name]`
- **Observation Basis**: Level B (Computed Styles from Browser Rendering Engine)

---

## 1. Font Family Stack

| Role | Declared `font-family` | Computed Font Face | Fallback Chain | Source / Provider | Epistemic Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Body** | `Inter, -apple-system, sans-serif` | `Inter-Regular` | `system-ui, -apple-system, sans-serif` | Google Fonts (WOFF2) | Level B |
| **Display / Heading** | `Cal Sans, Inter, sans-serif` | `CalSans-SemiBold` | `Inter, sans-serif` | Self-hosted (`/fonts/...`) | Level B |
| **Monospace / Code** | `JetBrains Mono, monospace` | `JetBrainsMono-Regular` | `ui-monospace, SFMono-Regular, monospace` | CDN | Level B |

---

## 2. Type Scale (Desktop)

| Step / Role | Font Size (px / rem) | Line Height (px / unitless) | Font Weight | Letter Spacing | Epistemic Level | Applied Elements |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `56px` (`3.5rem`) | `64px` (`1.14`) | `700` (Bold) | `-0.03em` | Level B | `h1.hero-title` |
| **H1 Section** | `40px` (`2.5rem`) | `48px` (`1.2`) | `700` (Bold) | `-0.025em` | Level B | `h2.section-heading` |
| **H2 Subheading**| `28px` (`1.75rem`)| `36px` (`1.28`) | `600` (SemiBold)| `-0.015em` | Level B | `h3.card-title` |
| **H3 Feature** | `20px` (`1.25rem`)| `28px` (`1.4`) | `600` (SemiBold)| `-0.01em` | Level B | `h4.feature-title` |
| **Body Large** | `18px` (`1.125rem`)| `28px` (`1.55`) | `400` (Regular) | `0em` | Level B | `.lead-paragraph` |
| **Body Default**| `15px` (`0.9375rem`)| `24px` (`1.6`) | `400` (Regular) | `0em` | Level B | `p, li, label` |
| **Body Small** | `13px` (`0.8125rem`)| `20px` (`1.53`) | `400` / `500` | `+0.01em` | Level B | `.caption, footer, meta` |
| **Micro / Tag** | `11px` (`0.6875rem`)| `16px` (`1.45`) | `600` (SemiBold)| `+0.05em` (caps) | Level B | `.badge, .pill-tag` |

---

## 3. Responsive Type Adjustments

| Step | Desktop (>=1280px) | Tablet (768px - 1024px) | Mobile (<=640px) | Scaling Technique |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `56px / 64px` | `44px / 52px` | `36px / 44px` | Fluid `clamp()` or Breakpoint media query |
| **H1 Section** | `40px / 48px` | `32px / 40px` | `28px / 36px` | Media query `@media (max-width: 768px)` |
| **Body Large** | `18px / 28px` | `16px / 24px` | `16px / 24px` | Static step |

---

## 4. Typography Implementation (Tailwind / CSS Example)

```javascript
// tailwind.config.js typography scale mapping
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '4rem', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h1': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h2': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '-0.015em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0em', fontWeight: '400' }],
        'body': ['0.9375rem', { lineHeight: '1.5rem', letterSpacing: '0em', fontWeight: '400' }],
      }
    }
  }
}
```
