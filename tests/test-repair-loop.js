/**
 * test-repair-loop.js
 * 
 * Tests the Autonomous Self-Healing Repair Engine:
 * Validates that an imperfect workspace with missing routes, FOUC traps, and broken links
 * is automatically inspected, diagnosed, repaired in place, and re-verified to reach PASS.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { runAutonomousRepairLoop } = require('../scripts/repair-loop');

function runTests() {
  console.log('--- Running Autonomous Repair Loop Tests ---');

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repair-test-'));

  try {
    // 1. Setup mock route-graph with 3 routes
    const graphPath = path.join(tempDir, 'route-graph.json');
    const mockGraph = {
      target: 'https://example.com',
      totalRoutes: 3,
      totalDynamicFamilies: 0,
      nodes: [
        { pathname: '/', url: 'https://example.com/', priority: 'critical' },
        { pathname: '/work', url: 'https://example.com/work', priority: 'high' },
        { pathname: '/contact', url: 'https://example.com/contact', priority: 'high' }
      ]
    };
    fs.writeFileSync(graphPath, JSON.stringify(mockGraph, null, 2), 'utf8');

    // 2. Setup intentionally broken workspace
    // - / is implemented
    fs.writeFileSync(path.join(tempDir, 'index.html'), `
<!DOCTYPE html>
<html><head><link rel="stylesheet" href="/styles.css"></head>
<body><h1>Home</h1></body></html>`, 'utf8');

    // - /work has NO stylesheet in head (FOUC trap)
    fs.mkdirSync(path.join(tempDir, 'work'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'work', 'index.html'), `
<!DOCTYPE html>
<html><head><title>Work</title></head>
<body><h1>Work</h1><a href="/missing-dest">Broken Link</a></body></html>`, 'utf8');

    // - /contact is COMPLETELY MISSING!

    console.log('  Initial state: /contact missing, /work has FOUC and broken link.');

    // 3. Run Autonomous Repair Loop
    const repairResult = runAutonomousRepairLoop(graphPath, tempDir, { maxRetries: 3 });

    // 4. Assert: Status must be RESOLVED!
    assert.strictEqual(repairResult.status, 'RESOLVED');
    assert.ok(repairResult.totalIterations <= 2);

    // 5. Verify physical repairs on disk
    // A. /contact was created
    const contactFile = path.join(tempDir, 'contact', 'index.html');
    assert.strictEqual(fs.existsSync(contactFile), true, 'Repair loop should create missing /contact');

    // B. /work has <link rel="stylesheet">
    const workHtml = fs.readFileSync(path.join(tempDir, 'work', 'index.html'), 'utf8');
    assert.ok(workHtml.includes('<link rel="stylesheet"'), 'Repair loop should inject stylesheet into <head>');

    // C. Broken link in /work was repaired
    assert.ok(!workHtml.includes('/missing-dest'), 'Repair loop should fix broken link target');

    console.log('  ✔ Autonomous repair loop successfully fixed missing routes, FOUC, and broken links.');
    console.log('All Autonomous Repair Loop Tests Passed Successfully!\n');

  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
