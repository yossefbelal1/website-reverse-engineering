/**
 * test-end-to-end-pipeline.js
 * 
 * End-to-End Integration Test for the Entire Reverse Engineering Engine.
 * Tests against the realistic multi-page test fixture:
 * 1. Spins up local fixture server (7 routes + assets)
 * 2. Runs route discovery
 * 3. Builds route graph & verifies dynamic family clustering (/work/:slug)
 * 4. Gathers page evidence across all routes
 * 5. Extracts and catalogs assets
 * 6. Generates per-route specifications
 * 7. Performs visual region diffing across key pages
 * 8. Audits traceability from spec to implementation
 * 9. Evaluates all 17 Quality Gates & verifies 100% scorecard metrics
 * 10. Runs negative verification to confirm incomplete implementations fail
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createFixtureServer } = require('../fixtures/server');
const { discoverRoutes } = require('../scripts/discover-routes');
const { buildRouteGraph } = require('../scripts/build-route-graph');
const { collectAllPageEvidence } = require('../scripts/collect-page-evidence');
const { aggregateAssetsFromEvidence } = require('../scripts/extract-assets');
const { generateAllSpecs } = require('../scripts/generate-page-specs');
const { auditWorkspaceCoverage } = require('../scripts/audit-route-coverage');
const { compareVisualRegions } = require('../scripts/visual-diff-engine');
const { auditTraceability } = require('../scripts/verify-traceability');
const { evaluateQualityGates } = require('../scripts/run-quality-gates');

async function runTests() {
  console.log('--- Running Full End-to-End Pipeline Test ---');

  const fixtureDir = path.join(__dirname, '..', 'fixtures', 'realistic-site');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-pipeline-'));
  const evidenceDir = path.join(tempDir, 'evidence');
  const specsDir = path.join(tempDir, 'specs');
  const graphFile = path.join(tempDir, 'route-graph.json');

  let serverInstance = null;
  const PORT = 4042;

  try {
    // Step 1: Start local fixture server
    const { server, url } = await createFixtureServer(fixtureDir, PORT);
    serverInstance = server;
    console.log(`  ✔ Fixture server listening at ${url}`);

    // Step 2: Discover routes from running server
    console.log('  Step 1/8: Discovering routes...');
    const discovered = await discoverRoutes(url, { depth: 3 });
    assert.ok(discovered.routes.length >= 7, `Expected at least 7 routes, found ${discovered.routes.length}`);
    console.log(`  ✔ Discovered ${discovered.routes.length} routes across site`);

    // Step 3: Build route graph and cluster dynamic routes
    console.log('  Step 2/8: Building route graph and detecting dynamic clusters...');
    const graph = buildRouteGraph(discovered);
    fs.writeFileSync(graphFile, JSON.stringify(graph, null, 2), 'utf8');

    assert.strictEqual(graph.totalRoutes, 7, 'Route graph should have 7 canonical routes');
    assert.ok(graph.totalDynamicFamilies >= 1, 'Should identify at least 1 dynamic route family');
    
    // Check dynamic pattern /work/:slug
    const workFamily = graph.dynamicFamilies.find(f => f.template === '/work/:slug');
    assert.ok(workFamily, 'Should identify /work/:slug as a dynamic route family');
    assert.strictEqual(workFamily.instances.length, 3, 'Dynamic family should have 3 instances');
    console.log('  ✔ Route graph and dynamic clustering verified (/work/:slug with 3 routes)');

    // Step 4: Collect page evidence for each route
    console.log('  Step 3/8: Collecting deep page evidence...');
    await collectAllPageEvidence(graphFile, evidenceDir);
    for (const node of graph.nodes) {
      const slug = node.pathname === '/' ? 'home' : node.pathname.replace(/^\/+|\/+$/g, '').replace(/[\/\-_]+/g, '-');
      const domJson = path.join(evidenceDir, slug, 'dom.json');
      assert.ok(fs.existsSync(domJson), `Evidence dom.json missing for ${node.pathname}`);
    }
    console.log('  ✔ Collected evidence for all 7 routes');

    // Step 5: Extract assets
    console.log('  Step 4/8: Extracting and cataloging assets...');
    const assets = aggregateAssetsFromEvidence(evidenceDir);
    assert.ok(assets.length > 0, 'Asset extraction should find styles/fonts/images');
    console.log(`  ✔ Extracted ${assets.length} assets`);

    // Step 6: Generate page specifications
    console.log('  Step 5/8: Generating page specs...');
    generateAllSpecs(graphFile, evidenceDir, specsDir);
    for (const node of graph.nodes) {
      const slug = node.pathname === '/' ? 'home' : node.pathname.replace(/^\/+|\/+$/g, '').replace(/[\/\-_]+/g, '-');
      const specFile = path.join(specsDir, `PAGE_SPEC_${slug}.md`);
      assert.ok(fs.existsSync(specFile), `Spec missing for ${node.pathname}`);
    }
    console.log('  ✔ Generated specifications for all 7 routes');

    // Step 7: Audit route coverage on the fixture implementation
    console.log('  Step 6/8: Auditing workspace route coverage...');
    const coverage = auditWorkspaceCoverage(graphFile, fixtureDir);
    assert.strictEqual(coverage.metrics.totalDiscovered, 7);
    assert.strictEqual(coverage.metrics.totalImplemented, 7);
    assert.strictEqual(coverage.metrics.routesWithBrokenLinks, 0);
    assert.strictEqual(coverage.metrics.foucSafeCount, 7);
    assert.strictEqual(coverage.metrics.overallStatus, 'PASS');
    console.log('  ✔ Workspace route coverage 100% verified, 0 broken links, 0 FOUC');

    // Step 8: Visual comparison of pages
    console.log('  Step 7/8: Verifying visual regions across pages...');
    const homeHtml = fs.readFileSync(path.join(fixtureDir, 'index.html'), 'utf8');
    const aboutHtml = fs.readFileSync(path.join(fixtureDir, 'about', 'index.html'), 'utf8');
    const workHtml = fs.readFileSync(path.join(fixtureDir, 'work', 'index.html'), 'utf8');

    // Compare identical pages (self-comparison should be 100%)
    const homeDiff = compareVisualRegions(homeHtml, homeHtml);
    assert.strictEqual(homeDiff.status, 'PASS');
    assert.strictEqual(homeDiff.overallSimilarity, 1.0);

    const aboutDiff = compareVisualRegions(aboutHtml, aboutHtml);
    assert.strictEqual(aboutDiff.status, 'PASS');
    assert.strictEqual(aboutDiff.overallSimilarity, 1.0);

    const workDiff = compareVisualRegions(workHtml, workHtml);
    assert.strictEqual(workDiff.status, 'PASS');
    assert.strictEqual(workDiff.overallSimilarity, 1.0);
    console.log('  ✔ Visual regions validated on /, /about, /work');

    // Step 9: Audit Traceability
    console.log('  Step 8/8: Verifying traceability from specs to code...');
    const traceReport = auditTraceability(graphFile, specsDir, fixtureDir);
    assert.strictEqual(traceReport.traceableRoutes, 7);
    assert.strictEqual(traceReport.traceabilityRate, '100.0%');
    console.log('  ✔ Traceability confirmed at 100.0%');

    // Step 10: Quality Gate Evaluation (High-Fidelity Mode)
    const qaResult = evaluateQualityGates(graphFile, fixtureDir, { mode: 'high-fidelity' });
    assert.strictEqual(qaResult.overallStatus, 'PASS');
    assert.strictEqual(qaResult.scorecard.routeCoverage, '100.0%');
    assert.strictEqual(qaResult.scorecard.navigationCoverage, '100.0%');
    assert.strictEqual(qaResult.scorecard.foucPreventionCoverage, '100.0%');
    assert.strictEqual(qaResult.scorecard.criticalFailures, 0);
    console.log('  ✔ Quality Gates in High-Fidelity mode passed with 0 critical failures');

    // Step 11: Negative Test - incomplete workspace fails
    const badWorkspace = path.join(tempDir, 'broken-workspace');
    fs.mkdirSync(badWorkspace, { recursive: true });
    fs.copyFileSync(path.join(fixtureDir, 'index.html'), path.join(badWorkspace, 'index.html'));
    fs.copyFileSync(path.join(fixtureDir, 'styles.css'), path.join(badWorkspace, 'styles.css'));

    const badQaResult = evaluateQualityGates(graphFile, badWorkspace);
    assert.strictEqual(badQaResult.overallStatus, 'FAIL');
    assert.ok(badQaResult.scorecard.criticalFailures > 0);
    console.log('  ✔ Negative test confirmed: incomplete workspace triggers strict FAIL');

    console.log('\n--- ALL PIPELINE INTEGRATION TESTS PASSED ---\n');
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
