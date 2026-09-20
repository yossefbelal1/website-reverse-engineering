/**
 * audit-route-geometry.js
 * 
 * Browser console script for extracting full-page layout geometry,
 * container dimensions, section heights, and spatial intervals.
 * 
 * Run in DevTools console or evaluate via CDP.
 */

(() => {
  const geometry = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio,
      scrollHeight: document.body.scrollHeight
    },
    containers: [],
    sections: [],
    keyElements: []
  };

  // 1. Audit Containers
  const containers = document.querySelectorAll('.container, [class*="container"], [class*="wrapper"], main, header, footer');
  containers.forEach(el => {
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    geometry.containers.push({
      selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').slice(0, 3).join('.') : ''),
      width: Math.round(r.width),
      height: Math.round(r.height),
      maxWidth: cs.maxWidth,
      paddingLeft: cs.paddingLeft,
      paddingRight: cs.paddingRight,
      marginLeft: cs.marginLeft,
      marginRight: cs.marginRight
    });
  });

  // 2. Audit Top-to-Bottom Section Sequence
  const sections = document.querySelectorAll('header, section, .section, footer, .footer-wrap, .footer-case-wrap');
  sections.forEach((sec, idx) => {
    const r = sec.getBoundingClientRect();
    const cs = window.getComputedStyle(sec);
    geometry.sections.push({
      index: idx,
      tag: sec.tagName.toLowerCase(),
      className: sec.className,
      topRelativeToDoc: Math.round(r.top + window.scrollY),
      height: Math.round(r.height),
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      backgroundColor: cs.backgroundColor
    });
  });

  // 3. Audit Key Headings & Interactive Elements
  const keyEls = document.querySelectorAll('h1, h2, h3, h4, .btn, button, [role="button"], a.btn-click');
  keyEls.forEach(el => {
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    geometry.keyElements.push({
      tag: el.tagName.toLowerCase(),
      text: el.innerText ? el.innerText.trim().replace(/\s+/g, ' ').slice(0, 40) : '',
      x: Math.round(r.left),
      y: Math.round(r.top + window.scrollY),
      width: Math.round(r.width),
      height: Math.round(r.height),
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing
    });
  });

  console.log("=== Route Geometry Audit Report ===");
  console.log(JSON.stringify(geometry, null, 2));
  return geometry;
})();
