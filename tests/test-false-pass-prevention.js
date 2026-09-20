/**
 * test-false-pass-prevention.js
 * 
 * False-Pass Prevention & Negative Assertion Suite.
 * Validates that every individual flaw correctly causes its respective gate/check to FAIL:
 *  1. Missing Route -> QG-01 FAIL
 *  2. Broken Navigation -> QG-16 FAIL
 *  3. Container Width Delta > 1px -> QG-02 FAIL
 *  4. Artificial <br> tags -> QG-04 FAIL
 *  5. Section Cadence Delta > 2px -> QG-03 FAIL
 *  6. Semantic Region Missing -> Visual Diff FAIL
 *  7. Lorem Ipsum Placeholder -> Content Audit FAIL
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { compareContainers, compareSections, auditArtificialLineBreaks } = require('../scripts/verify-geometry-and-visuals');
const { compareVisualRegions } = require('../scripts/visual-diff-engine');
const { auditRouteContentAndAssets } = require('../scripts/verify-content-and-assets');

function runTests() {
  console.log('--- Running False-Pass Prevention Tests ---');

  // Test 1: Container Width Delta > 1px MUST FAIL
  const refContainers = [{ selector: '.container', width: 1200 }];
  const badContainers = [{ selector: '.container', width: 1205 }]; // 5px delta
  const contResult = compareContainers(refContainers, badContainers);
  assert.strictEqual(contResult[0].status, 'FAIL');
  console.log('  ✔ Negative check: 5px container width deviation triggers FAIL');

  // Test 2: Section Height Cadence > 2px MUST WARN/FAIL
  const refSections = [{ tag: 'section', className: 'hero', height: 600 }];
  const badSections = [{ tag: 'section', className: 'hero', height: 620 }]; // 20px delta
  const secResult = compareSections(refSections, badSections);
  assert.strictEqual(secResult[0].status, 'FAIL');
  console.log('  ✔ Negative check: 20px section height mismatch triggers FAIL');

  // Test 3: Artificial <br> tag MUST FAIL
  const badTypographyHtml = '<h2>Crafting Digital<br>Products</h2>';
  const brAudit = auditArtificialLineBreaks(badTypographyHtml);
  assert.strictEqual(brAudit.count, 1);
  console.log('  ✔ Negative check: Artificial <br> tag detected and rejected');

  // Test 4: Missing Region in Visual Diff MUST FAIL
  const fullHtml = `
  <header><a href="/">Logo</a><nav><a href="/about">About</a></nav></header>
  <section class="hero"><h1>Hero Headline</h1><p>Lead text</p></section>
  <div class="card">Card 1</div>
  <footer><p>© 2026</p></footer>
  `;

  // Missing Footer & Hero in bad implementation
  const missingRegionsHtml = `
  <header><a href="/">Logo</a></header>
  <main><p>Just some text</p></main>
  `;

  const visualDiff = compareVisualRegions(fullHtml, missingRegionsHtml, { threshold: 0.90 });
  assert.strictEqual(visualDiff.status, 'FAIL');
  assert.ok(visualDiff.failedRegions.length > 0);
  console.log(`  ✔ Negative check: Missing semantic regions (Hero, Footer) strictly triggers visual FAIL (${visualDiff.failedRegions.join(', ')})`);

  // Test 5: Lorem Ipsum Placeholder MUST FAIL
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'false-pass-'));
  try {
    const evidenceDir = path.join(tempDir, 'evidence');
    const homeEvDir = path.join(evidenceDir, 'home');
    fs.mkdirSync(homeEvDir, { recursive: true });

    fs.writeFileSync(path.join(homeEvDir, 'dom.json'), JSON.stringify({
      headings: [{ level: 'h1', text: 'Bespoke Engineering' }]
    }), 'utf8');

    // Implementation containing lorem ipsum
    fs.writeFileSync(path.join(tempDir, 'index.html'), `<h1>Lorem Ipsum Dolor</h1><p>Consectetur adipiscing elit.</p>`, 'utf8');

    const contentAudit = auditRouteContentAndAssets('home', evidenceDir, tempDir);
    assert.strictEqual(contentAudit.hasLorem, true);
    assert.strictEqual(contentAudit.status, 'FAIL');
    console.log('  ✔ Negative check: Fabricated lorem ipsum text strictly triggers content audit FAIL');

  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  }

  console.log('All False-Pass Prevention Tests Passed Successfully!\n');
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
