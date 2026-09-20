/**
 * run-all-tests.js
 * 
 * Master Test Runner for the Website Reverse Engineering Engine.
 * Executes all unit and integration test suites:
 *  1. test-route-discovery.js
 *  2. test-dynamic-routes.js
 *  3. test-route-graph.js
 *  4. test-coverage-and-gates.js
 *  5. test-geometry-and-visuals.js
 *  6. test-first-page-mirage-regression.js
 *  7. test-false-pass-prevention.js
 *  8. test-repair-loop.js
 *  9. test-end-to-end-pipeline.js
 */

const { runTests: runDiscoveryTests } = require('./test-route-discovery');
const { runTests: runDynamicTests } = require('./test-dynamic-routes');
const { runTests: runGraphTests } = require('./test-route-graph');
const { runTests: runCoverageTests } = require('./test-coverage-and-gates');
const { runTests: runGeometryTests } = require('./test-geometry-and-visuals');
const { runTests: runMirageTests } = require('./test-first-page-mirage-regression');
const { runTests: runFalsePassTests } = require('./test-false-pass-prevention');
const { runTests: runRepairLoopTests } = require('./test-repair-loop');
const { runTests: runE2ETests } = require('./test-end-to-end-pipeline');

async function main() {
  console.log('===========================================================');
  console.log(' Website Reverse Engineering Engine - Test Suite Execution ');
  console.log('===========================================================\n');

  let failedSuites = 0;

  const suites = [
    { name: 'Route Discovery & Normalization', fn: runDiscoveryTests },
    { name: 'Dynamic Route Clustering', fn: runDynamicTests },
    { name: 'Route Graph & Hierarchy', fn: runGraphTests },
    { name: 'Route Coverage & Hard Quality Gates', fn: runCoverageTests },
    { name: 'Geometry Delta & Visual Verification', fn: runGeometryTests },
    { name: 'First-Page Mirage Regression', fn: runMirageTests },
    { name: 'False-Pass Prevention & Negative Assertions', fn: runFalsePassTests },
    { name: 'Autonomous Self-Healing Repair Loop', fn: runRepairLoopTests },
    { name: 'End-to-End Multi-Page Pipeline Integration', fn: runE2ETests }
  ];

  for (const suite of suites) {
    try {
      await suite.fn();
    } catch (err) {
      console.error(`❌ Suite Failed: ${suite.name}`);
      console.error(err);
      failedSuites++;
    }
  }

  console.log('===========================================================');
  if (failedSuites === 0) {
    console.log(` ✅ ALL ${suites.length} TEST SUITES PASSED! Engine is verified and healthy.`);
    console.log('===========================================================');
    process.exit(0);
  } else {
    console.error(` ❌ ${failedSuites} / ${suites.length} TEST SUITE(S) FAILED!`);
    console.log('===========================================================');
    process.exit(1);
  }
}

main();
