/**
 * extract-design-tokens.js
 * 
 * Browser console script for extracting visual design tokens from any webpage.
 * Paste this into the browser DevTools Console on the reference website.
 * Output: Clean JSON object containing computed colors, typography, spacing, and radii.
 */

(() => {
  const result = {
    url: window.location.href,
    extractedAt: new Date().toISOString(),
    colors: {
      backgrounds: new Set(),
      text: new Set(),
      borders: new Set()
    },
    typography: new Map(),
    radii: new Set(),
    containerWidths: new Set()
  };

  const allElements = document.querySelectorAll('*');

  allElements.forEach(el => {
    // Skip script, style, meta, etc.
    if (['SCRIPT', 'STYLE', 'LINK', 'NOSCRIPT', 'META'].includes(el.tagName)) return;

    const style = window.getComputedStyle(el);

    // 1. Colors
    const bg = style.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      result.colors.backgrounds.add(bg);
    }
    const fg = style.color;
    if (fg && fg !== 'rgba(0, 0, 0, 0)' && fg !== 'transparent') {
      result.colors.text.add(fg);
    }
    const border = style.borderColor;
    if (border && border !== 'rgba(0, 0, 0, 0)' && border !== 'transparent' && style.borderWidth !== '0px') {
      result.colors.borders.add(border);
    }

    // 2. Typography
    const fontSize = style.fontSize;
    const lineHeight = style.lineHeight;
    const fontWeight = style.fontWeight;
    const fontFamily = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    const letterSpacing = style.letterSpacing;

    const typeKey = `${fontFamily}|${fontSize}|${fontWeight}`;
    if (!result.typography.has(typeKey)) {
      result.typography.set(typeKey, {
        fontFamily,
        fontSize,
        lineHeight,
        fontWeight,
        letterSpacing,
        sampleTag: el.tagName.toLowerCase()
      });
    }

    // 3. Border Radii
    const br = style.borderRadius;
    if (br && br !== '0px') {
      result.radii.add(br);
    }

    // 4. Container Max-Widths
    const maxWidth = style.maxWidth;
    if (maxWidth && maxWidth !== 'none' && maxWidth !== '0px' && maxWidth.includes('px')) {
      result.containerWidths.add(maxWidth);
    }
  });

  const payload = {
    url: result.url,
    extractedAt: result.extractedAt,
    colors: {
      backgrounds: Array.from(result.colors.backgrounds),
      text: Array.from(result.colors.text),
      borders: Array.from(result.colors.borders)
    },
    typography: Array.from(result.typography.values()),
    radii: Array.from(result.radii),
    containerWidths: Array.from(result.containerWidths)
  };

  console.log("=== Extracted Design Tokens ===");
  console.log(JSON.stringify(payload, null, 2));
  return payload;
})();
