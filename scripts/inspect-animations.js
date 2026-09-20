/**
 * inspect-animations.js
 * 
 * Comprehensive browser console script for inspecting animation frameworks,
 * GSAP ScrollTrigger instances, scroll parallax attributes, WAAPI, and transitions.
 * 
 * Run in DevTools console or evaluate via CDP.
 */
function inspectAnimations() {
  const report = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    frameworks: {
      gsap: typeof window.gsap !== 'undefined',
      scrollTrigger: typeof window.ScrollTrigger !== 'undefined',
      lenis: typeof window.Lenis !== 'undefined' || document.querySelector('[data-lenis-prevent], html.lenis') !== null,
      locomotive: typeof window.LocomotiveScroll !== 'undefined' || document.querySelector('[data-scroll-container]') !== null,
      framerMotion: document.querySelectorAll('[data-framer-name], [style*="--framer"]').length > 0,
      lottie: document.querySelectorAll('lottie-player, dotlottie-player, [data-lottie]').length > 0,
      barba: typeof window.barba !== 'undefined' || document.querySelector('[data-barba="container"]') !== null
    },
    scrollTriggers: [],
    parallaxElements: [],
    waapiAnimations: [],
    cssTransitions: [],
    keyframes: []
  };

  // 1. Inspect GSAP ScrollTrigger Triggers
  if (window.ScrollTrigger && typeof window.ScrollTrigger.getAll === 'function') {
    window.ScrollTrigger.getAll().forEach((st, i) => {
      const triggerEl = st.trigger;
      report.scrollTriggers.push({
        id: st.vars ? st.vars.id || `trigger-${i}` : `trigger-${i}`,
        trigger: triggerEl ? triggerEl.tagName.toLowerCase() + (triggerEl.className ? '.' + triggerEl.className.split(' ').slice(0, 2).join('.') : '') : 'unknown',
        start: st.start,
        end: st.end,
        scrub: st.vars ? st.vars.scrub : null,
        pin: st.vars ? !!st.vars.pin : false
      });
    });
  }

  // 2. Inspect Scroll Parallax Elements ([data-scroll])
  document.querySelectorAll('[data-scroll]').forEach((el, i) => {
    report.parallaxElements.push({
      index: i,
      tag: el.tagName.toLowerCase(),
      className: el.className ? el.className.split(' ').slice(0, 3).join('.') : '',
      speed: el.getAttribute('data-scroll-speed') || '0',
      direction: el.getAttribute('data-scroll-direction') || 'vertical',
      position: el.getAttribute('data-scroll-position') || 'center',
      target: el.getAttribute('data-scroll-target') || null,
      offset: el.getAttribute('data-scroll-offset') || null
    });
  });

  // 3. Inspect WAAPI Active Animations
  if (typeof document.getAnimations === 'function') {
    document.getAnimations().forEach((anim, i) => {
      const effect = anim.effect;
      const timing = effect ? effect.getTiming() : {};
      report.waapiAnimations.push({
        index: i,
        target: effect && effect.target ? effect.target.tagName.toLowerCase() + (effect.target.className ? '.' + effect.target.className.split(' ').slice(0, 2).join('.') : '') : 'unknown',
        duration: timing.duration,
        delay: timing.delay,
        easing: timing.easing,
        iterations: timing.iterations,
        playState: anim.playState
      });
    });
  }

  // 4. Inspect Active CSS Transitions
  document.querySelectorAll('*').forEach(el => {
    if (['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT'].includes(el.tagName)) return;
    const s = window.getComputedStyle(el);
    if (s.transition && s.transition !== 'all 0s ease 0s' && s.transition !== 'none' && !s.transition.startsWith('all 0s')) {
      const selector = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : '');
      report.cssTransitions.push({
        selector,
        transition: s.transition
      });
    }
  });

  // 5. Inspect Style Sheets for Keyframes
  try {
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          if (rule.type === CSSRule.KEYFRAMES_RULE) {
            report.keyframes.push(rule.name);
          }
        });
      } catch (e) {
        // Cross-origin stylesheet access restriction (Level E)
      }
    });
  } catch (e) {}

  console.log("=== Comprehensive Motion & Animation Report ===");
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (typeof window !== 'undefined') {
  inspectAnimations();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { inspectAnimations };
}

