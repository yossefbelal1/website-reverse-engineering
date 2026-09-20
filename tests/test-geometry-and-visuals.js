/**
 * test-geometry-and-visuals.js
 * 
 * Unit tests for container geometry delta calculation, section height cadence,
 * and artificial line break detection.
 */

const assert = require('assert');
const {
  compareContainers,
  compareSections,
  auditArtificialLineBreaks
} = require('../scripts/verify-geometry-and-visuals');

function runTests() {
  console.log('--- Running Geometry & Visual Verification Tests ---');

  // Test 1: Container Width Delta Comparison (Δ <= 1px)
  const refContainers = [
    { selector: '.container', width: 1360, maxWidth: '1360px' },
    { selector: '.hero-wrap', width: 1440, maxWidth: 'none' },
    { selector: '.card-grid', width: 1200, maxWidth: '1200px' }
  ];

  const localContainersMatch = [
    { selector: '.container', width: 1360, maxWidth: '1360px' },   // 0px delta -> PASS
    { selector: '.hero-wrap', width: 1441, maxWidth: 'none' },     // 1px delta -> PASS
    { selector: '.card-grid', width: 1200, maxWidth: '1200px' }    // 0px delta -> PASS
  ];

  const matchResults = compareContainers(refContainers, localContainersMatch);
  assert.strictEqual(matchResults.every(r => r.status === 'PASS'), true);
  console.log('  ✔ Container comparison: Δ <= 1px yields PASS');

  const localContainersFail = [
    { selector: '.container', width: 1350, maxWidth: '1360px' },   // 10px delta -> FAIL
    { selector: '.hero-wrap', width: 1440, maxWidth: 'none' },
    { selector: '.card-grid', width: 1200, maxWidth: '1200px' }
  ];

  const failResults = compareContainers(refContainers, localContainersFail);
  assert.strictEqual(failResults[0].status, 'FAIL');
  assert.strictEqual(failResults[0].delta, 10);
  console.log('  ✔ Container comparison: Δ = 10px strictly triggers FAIL');

  // Test 2: Section Height Cadence Comparison (Δ <= 2px)
  const refSections = [
    { tag: 'header', className: 'header-main', height: 80 },
    { tag: 'section', className: 'hero-section', height: 820 },
    { tag: 'footer', className: 'footer-wrap', height: 600 }
  ];

  const localSections = [
    { tag: 'header', className: 'header-main', height: 80 },       // 0px delta -> PASS
    { tag: 'section', className: 'hero-section', height: 822 },    // 2px delta -> PASS
    { tag: 'footer', className: 'footer-wrap', height: 600 }       // 0px delta -> PASS
  ];

  const secResults = compareSections(refSections, localSections);
  assert.strictEqual(secResults.every(s => s.status === 'PASS'), true);
  console.log('  ✔ Section height comparison: Δ <= 2px yields PASS');

  // Test 3: Artificial Line Break (<br>) Detection
  const badHtml = `
    <h1>Crafting Digital<br>Experiences</h1>
    <p>We build award-winning websites with surgical<br>precision.</p>
  `;
  const badResult = auditArtificialLineBreaks(badHtml);
  assert.strictEqual(badResult.count, 2);
  assert.strictEqual(badResult.violations[0].tag, 'h1');
  console.log('  ✔ Artificial line break audit: correctly caught 2 violating <br> tags');

  const cleanHtml = `
    <h1>Crafting Digital Experiences</h1>
    <p>We build award-winning websites with surgical precision.</p>
  `;
  const cleanResult = auditArtificialLineBreaks(cleanHtml);
  assert.strictEqual(cleanResult.count, 0);
  console.log('  ✔ Clean typography: 0 artificial line breaks verified');

  console.log('All Geometry & Visual Verification Tests Passed Successfully!\n');
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
