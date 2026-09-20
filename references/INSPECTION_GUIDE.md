# Inspection Guide: Tools, Techniques & Extraction Protocols

This reference guide details practical inspection methodologies for extracting DOM, CSS, computed styles, layout geometry, JavaScript interactions, and motion curves from reference websites.

---

## 1. Toolchain Hierarchy & Adaptation

When analyzing a reference site, apply the strongest available tool in the environment:

| Priority Tier | Tool | Primary Capabilities | When to Use / Fallback |
| :--- | :--- | :--- | :--- |
| **Tier 1: Extensions** | **Woblo** | Full-page DOM/CSS decompiler, semantic extraction | When installed; ultra-fast baseline capture |
| **Tier 1: Extensions** | **CSS Peeper** | Token inspector, color palettes, spacing box, asset exporter | Instant design token & SVG asset extraction |
| **Tier 1: Extensions** | **Capture Motion** | Frame-by-frame animation curve, easing, duration recorder | Capturing complex micro-interactions and transitions |
| **Tier 1: Extensions** | **Webmimic / Slicer**| Component slicing, HTML/CSS asset harvesting | Isolating single composite components |
| **Tier 2: DevTools** | **Chrome DevTools MCP**| Direct browser DOM inspection, evaluate script, screenshot | When running in Antigravity or automated browser sessions |
| **Tier 2: DevTools** | **DevTools Elements & Computed**| Real-time box model, computed styles, z-index, font rendering | Standard baseline for all web development |
| **Tier 3: Automation** | **Puppeteer / Playwright** | Programmatic viewport resizing, scroll simulation, style dumping | Automated or headless bulk extraction |
| **Tier 4: Static CLI** | **curl / fetch + Cheerio** | Raw HTML markup, inline SVGs, CSS stylesheet links | When browser rendering engine is unavailable |

---

## 2. In-Browser Console Extraction Scripts

Run these snippets in the DevTools console or evaluate via CDP/Puppeteer to harvest ground-truth metrics:

### A. Extract Distinct Color Palette (Level B)
```javascript
(() => {
  const colors = new Set();
  const elements = document.querySelectorAll('*');
  for (const el of elements) {
    const style = window.getComputedStyle(el);
    ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
      const val = style[prop];
      if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent') {
        colors.add(val);
      }
    });
  }
  console.table([...colors].map(c => ({ value: c })));
})();
```

### B. Extract Typography Scale (Level B)
```javascript
(() => {
  const typeScale = [];
  const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'a'];
  tags.forEach(tag => {
    document.querySelectorAll(tag).forEach(el => {
      const s = window.getComputedStyle(el);
      if (el.innerText && el.innerText.trim().length > 0) {
        typeScale.push({
          tag,
          fontSize: s.fontSize,
          lineHeight: s.lineHeight,
          fontWeight: s.fontWeight,
          letterSpacing: s.letterSpacing,
          fontFamily: s.fontFamily.split(',')[0].replace(/['"]/g, ''),
          sample: el.innerText.trim().slice(0, 30)
        });
      }
    });
  });
  console.table(typeScale);
})();
```

### C. Detect Web Animations API (WAAPI) Instances (Level B)
```javascript
(() => {
  const animations = document.getAnimations();
  console.log(`Detected ${animations.length} active WAAPI animations:`);
  animations.forEach((anim, i) => {
    const effect = anim.effect;
    const timing = effect ? effect.getTiming() : {};
    console.log(`Animation #${i}:`, {
      target: effect && effect.target ? effect.target.tagName + (effect.target.className ? '.' + effect.target.className : '') : 'unknown',
      duration: timing.duration,
      delay: timing.delay,
      easing: timing.easing,
      iterations: timing.iterations,
      playState: anim.playState
    });
  });
})();
```

### D. Detect GSAP & ScrollTrigger (Level B/C)
```javascript
(() => {
  if (window.gsap) {
    console.log("GSAP Detected! Version:", window.gsap.version);
    if (window.ScrollTrigger) {
      console.log("ScrollTrigger Detected! Active Triggers:", window.ScrollTrigger.getAll().length);
    }
  } else {
    console.log("No global GSAP instance detected on window.");
  }
})();
```

### E. Extract Transitions and Transforms on Elements (Level B)
```javascript
(() => {
  const animatedElements = [];
  document.querySelectorAll('*').forEach(el => {
    const s = window.getComputedStyle(el);
    if (s.transition && s.transition !== 'all 0s ease 0s' && s.transition !== 'none') {
      animatedElements.push({
        selector: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').join('.') : ''),
        transition: s.transition,
        transform: s.transform
      });
    }
  });
  console.table(animatedElements);
})();
```

---

## 3. Isolating Component Hierarchy

1. **Semantic HTML Inspection**:
   - Locate main container landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
   - Identify repeated card components by inspecting container children with matching class patterns or flex/grid positioning.
2. **Container Max-Widths & Paddings**:
   - Inspect wrapper `div` elements directly inside sections.
   - Note `max-width`, `margin-left: auto; margin-right: auto`, and `padding-inline` (horizontal gutters).
3. **Z-Index Layering Order**:
   - Filter all elements with `position: relative | absolute | fixed | sticky` and `z-index != auto`.
   - Map out stacking order to prevent clipping or overlay stacking bugs.

---

## 4. Inspecting Dynamic Interactive States

To inspect hover, active, and focus states that vanish when the cursor moves:
1. **Force State in DevTools**:
   - In Chrome DevTools Elements panel, right-click the element $\rightarrow$ **Force state** $\rightarrow$ `:hover`, `:active`, `:focus`, `:focus-visible`, or `:focus-within`.
   - Immediately inspect the **Computed** panel to see newly applied colors, box-shadows, and transforms.
2. **Emulate Breakpoints & Media Features**:
   - Toggle Device Toolbar (`Cmd+Shift+M` / `Ctrl+Shift+M`).
   - Test at standard dimensions: `375x812` (Mobile), `768x1024` (Tablet), `1280x800` (Laptop), `1440x900` (Desktop).
   - In DevTools Rendering drawer, test `prefers-reduced-motion: reduce` and `prefers-color-scheme: dark`.
