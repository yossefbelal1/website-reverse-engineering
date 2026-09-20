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
 */

const { runTests: runDiscoveryTests } = require('./test-route-discovery');
const { runTests: runDynamicTests } = require('./test-dynamic-routes');
const { runTests: runGraphTests } = require('./test-route-graph');
const { runTests: runCoverageTests } = require('./test-coverage-and-gates');
const { runTests: runGeometryTests } = require('./test-geometry-and-visuals');

console.log('===========================================================');
console.log(' Website Reverse Engineering Engine - Test Suite Execution ');
console.log('===========================================================\n');

let failedSuites = 0;

const suites = [
  { name: 'Route Discovery & Normalization', fn: runDiscoveryTests },
  { name: 'Dynamic Route Clustering', fn: runDynamicTests },
  { name: 'Route Graph & Hierarchy', fn: runGraphTests },
  { name: 'Route Coverage & Hard Quality Gates', fn: runCoverageTests },
  { name: 'Geometry Delta & Visual Verification', fn: runGeometryTests }
];

for (const suite of suites) {
  try {
    suite.fn();
  } catch (err) {
    console.error(`❌ Suite Failed: ${suite.name}`);
    console.error(err);
    failedSuites++;
  }
}

console.log('===========================================================');
if (failedSuites === 0) {
  console.log(' ✅ ALL 5 TEST SUITES PASSED! Engine is verified and healthy.');
  console.log('===========================================================');
  process.exit(0);
} else {
  console.error(` ❌ ${failedSuites} TEST SUITE(S) FAILED!`);
  console.log('===========================================================');
  process.exit(1);
}
