/**
 * Website Reverse Engineering - Dual Comparison Capture Script
 * 
 * Usage:
 *   node capture-comparison.js --orig="https://original.com/path" --local="http://localhost:5173/path" --out="./comparison"
 * 
 * Requirements:
 *   If puppeteer or playwright is available in the project, it drives headless Chrome.
 *   Otherwise, it exports helper evaluation snippets that can be run directly via Chrome DevTools MCP or console.
 */

const fs = require('fs');
const path = require('path');

// Helper to evaluate visual alignment metrics in browser context
function measureAlignmentMetrics() {
  return {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      scrollHeight: document.documentElement.scrollHeight
    },
    nav: (() => {
      const el = document.querySelector('nav, header, [role="navigation"]');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        top: rect.top,
        height: rect.height,
        position: style.position,
        zIndex: style.zIndex,
        padding: style.padding
      };
    })(),
    hero: (() => {
      const el = document.querySelector('main > *:first-child, section:first-of-type, .hero');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const h1 = el.querySelector('h1');
      return {
        top: rect.top,
        height: rect.height,
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : null,
        h1LineHeight: h1 ? window.getComputedStyle(h1).lineHeight : null
      };
    })(),
    footer: (() => {
      const el = document.querySelector('footer, .footer');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        height: rect.height,
        backgroundColor: style.backgroundColor,
        color: style.color
      };
    })()
  };
}

// Module export & standalone execution
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    measureAlignmentMetrics,
    viewports: [
      { name: '4k', width: 3840, height: 2160 },
      { name: 'qhd', width: 2560, height: 1440 },
      { name: 'macbook_16', width: 1728, height: 1117 },
      { name: 'desktop_standard', width: 1440, height: 900 },
      { name: 'macbook_13', width: 1280, height: 800 },
      { name: 'laptop_small', width: 1024, height: 768 },
      { name: 'tablet_landscape', width: 1024, height: 1366 },
      { name: 'tablet_portrait', width: 768, height: 1024 },
      { name: 'foldable', width: 540, height: 720 },
      { name: 'mobile_large', width: 430, height: 932 },
      { name: 'mobile_standard', width: 390, height: 844 },
      { name: 'mobile_small', width: 320, height: 568 }
    ]
  };
}
