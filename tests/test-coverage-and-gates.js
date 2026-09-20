/**
 * test-coverage-and-gates.js
 * 
 * Unit tests for Route Coverage, Navigation Integrity, FOUC Detection,
 * and Hard Quality Gate Enforcement (blocking First-Page Mirage).
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { auditRouteImplementation, auditWorkspaceCoverage } = require('../scripts/audit-route-coverage');
const { evaluateQualityGates } = require('../scripts/run-quality-gates');

function runTests() {
  console.log('--- Running Route Coverage & Quality Gates Tests ---');

  // Create a temporary mock workspace
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rev-eng-test-'));

  try {
    // Setup mock routes
    // 1. Home page with stylesheet in head and links to /about and /work
    fs.writeFileSync(path.join(tempDir, 'index.html'), `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <h1>Home</h1>
  <a href="/about">About</a>
  <a href="/work">Work</a>
</body>
</html>
`, 'utf8');

    // 2. About page WITH stylesheet (FOUC safe)
    fs.mkdirSync(path.join(tempDir, 'about'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'about', 'index.html'), `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <h1>About</h1>
  <a href="/">Home</a>
</body>
</html>
`, 'utf8');

    // 3. Work page WITHOUT stylesheet in head (FOUC trap!)
    fs.mkdirSync(path.join(tempDir, 'work'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'work', 'index.html'), `
<!DOCTYPE html>
<html>
<head>
  <title>Work</title>
</head>
<body>
  <h1>Work</h1>
  <a href="/non-existent">Broken Link</a>
</body>
</html>
`, 'utf8');

    // Test 1: Single Route Audits
    const homeAudit = auditRouteImplementation({ pathname: '/' }, tempDir);
    assert.strictEqual(homeAudit.implemented, true);
    assert.strictEqual(homeAudit.hasStylesheetInHead, true);
    assert.strictEqual(homeAudit.brokenLinks.length, 0);
    console.log('  ✔ Home audit: implemented, FOUC-safe, 0 broken links');

    const workAudit = auditRouteImplementation({ pathname: '/work' }, tempDir);
    assert.strictEqual(workAudit.implemented, true);
    assert.strictEqual(workAudit.hasStylesheetInHead, false); // FOUC trap caught!
    assert.strictEqual(workAudit.brokenLinks.includes('/non-existent'), true); // Broken link caught!
    console.log('  ✔ Work audit: detected missing stylesheet in <head> and broken navigation link');

    // Test 2: Create mock route-graph.json containing home, about, work, and /contact (which is missing)
    const mockGraphPath = path.join(tempDir, 'route-graph.json');
    const mockGraph = {
      target: 'https://example.com',
      totalRoutes: 4,
      totalDynamicFamilies: 0,
      nodes: [
        { pathname: '/', url: 'https://example.com/', priority: 'critical' },
        { pathname: '/about', url: 'https://example.com/about', priority: 'high' },
        { pathname: '/work', url: 'https://example.com/work', priority: 'high' },
        { pathname: '/contact', url: 'https://example.com/contact', priority: 'high' } // Missing!
      ]
    };
    fs.writeFileSync(mockGraphPath, JSON.stringify(mockGraph, null, 2), 'utf8');

    // Test 3: Coverage Report with Missing Route
    const covReport = auditWorkspaceCoverage(mockGraphPath, tempDir);
    assert.strictEqual(covReport.metrics.totalDiscovered, 4);
    assert.strictEqual(covReport.metrics.totalImplemented, 3);
    assert.strictEqual(covReport.metrics.overallStatus, 'FAIL');
    console.log('  ✔ Coverage matrix: strictly reports FAIL when 1 route is missing (3/4)');

    // Test 4: Hard Quality Gates Enforcement (First-Page Mirage Block)
    const qaResult = evaluateQualityGates(mockGraphPath, tempDir);
    assert.strictEqual(qaResult.overallStatus, 'FAIL');

    const qg01 = qaResult.gates.find(g => g.id === 'QG-01');
    assert.strictEqual(qg01.status, 'FAIL');
    assert.strictEqual(qg01.failureClass, 'PAGE_IMPLEMENTATION_FAILURE');

    const qg16 = qaResult.gates.find(g => g.id === 'QG-16');
    assert.strictEqual(qg16.status, 'FAIL');
    assert.strictEqual(qg16.failureClass, 'NAVIGATION_FAILURE');
    console.log('  ✔ Quality Gates: First-Page Mirage successfully blocked (QG-01 & QG-16 FAIL)');

    // Test 5: Fix the workspace by adding /contact and fixing /work
    fs.mkdirSync(path.join(tempDir, 'contact'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'contact', 'index.html'), `
<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="/style.css"></head>
<body><h1>Contact</h1><a href="/">Home</a></body>
</html>`, 'utf8');

    // Fix /work
    fs.writeFileSync(path.join(tempDir, 'work', 'index.html'), `
<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="/style.css"></head>
<body><h1>Work</h1><a href="/about">About</a></body>
</html>`, 'utf8');

    // Re-evaluate quality gates
    const passingQA = evaluateQualityGates(mockGraphPath, tempDir);
    assert.strictEqual(passingQA.metrics ? passingQA.metrics.overallStatus : passingQA.overallStatus, 'PASS');
    const fixedQG01 = passingQA.gates.find(g => g.id === 'QG-01');
    assert.strictEqual(fixedQG01.status, 'PASS');
    console.log('  ✔ Quality Gates: All 4 routes implemented, FOUC-safe, navigable -> PASS!');

    console.log('All Coverage & Quality Gate Tests Passed Successfully!\n');
  } finally {
    // Clean up temporary workspace
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
