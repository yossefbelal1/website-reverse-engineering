/**
 * interaction-crawler.js
 * 
 * Browser console script for auditing interactive elements, detecting
 * pointer-events blocking, inspecting hover states, and cataloging transitions.
 * 
 * Run in DevTools console or evaluate via CDP.
 */
function auditInteractions() {
  const report = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    totalInteractive: 0,
    blockedElements: [],
    interactiveElements: []
  };

  const selectors = [
    'a[href]',
    'button',
    '[role="button"]',
    'input',
    'textarea',
    'select',
    '.btn',
    '.btn-click',
    '.magnetic',
    '[data-strength]',
    '.playpauze'
  ];

  const elements = Array.from(new Set(document.querySelectorAll(selectors.join(', '))));
  report.totalInteractive = elements.length;

  elements.forEach((el, index) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return; // Hidden element

    const cs = window.getComputedStyle(el);
    const cx = Math.round(r.left + r.width / 2);
    const cy = Math.round(r.top + r.height / 2);

    // Test pointer events reachability
    let topEl = null;
    let isReachable = false;
    if (cx >= 0 && cx <= window.innerWidth && cy >= 0 && cy <= window.innerHeight) {
      topEl = document.elementFromPoint(cx, cy);
      isReachable = topEl === el || el.contains(topEl);
    } else {
      isReachable = true; // Off-screen, cannot test elementFromPoint directly
    }

    const entry = {
      index,
      tag: el.tagName.toLowerCase(),
      href: el.getAttribute('href') || null,
      text: el.innerText ? el.innerText.trim().replace(/\s+/g, ' ').slice(0, 30) : null,
      selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''),
      bounds: { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) },
      isReachable,
      topElementBlocking: isReachable ? null : (topEl ? topEl.tagName.toLowerCase() + (topEl.className ? '.' + topEl.className.split(' ').slice(0, 2).join('.') : '') : null),
      cursor: cs.cursor,
      pointerEvents: cs.pointerEvents,
      hasMagnetic: el.classList.contains('magnetic') || el.hasAttribute('data-strength'),
      transition: cs.transition !== 'all 0s ease 0s' ? cs.transition : null
    };

    if (!isReachable) {
      report.blockedElements.push(entry);
    }
    report.interactiveElements.push(entry);
  });

  console.log("=== Interaction Crawler Report ===");
  console.log(`Total Interactive: ${report.totalInteractive} | Blocked: ${report.blockedElements.length}`);
  if (report.blockedElements.length > 0) {
    console.warn("WARNING: Detected elements blocked from pointer events:", report.blockedElements);
  }
  return report;
}

if (typeof window !== 'undefined') {
  auditInteractions();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { auditInteractions };
}

