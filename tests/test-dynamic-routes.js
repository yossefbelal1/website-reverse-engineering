/**
 * test-dynamic-routes.js
 * 
 * Unit tests for dynamic route parameter detection, route family clustering,
 * and representative example selection.
 */

const assert = require('assert');
const { clusterRoutes, isParametricSegment } = require('../scripts/build-route-graph');

function runTests() {
  console.log('--- Running Dynamic Route Clustering Tests ---');

  // Test 1: Parametric Segment Detection
  assert.strictEqual(isParametricSegment('12345'), true);
  assert.strictEqual(isParametricSegment('550e8400-e29b-41d4-a716-446655440000'), true);
  assert.strictEqual(isParametricSegment('2024'), true);
  assert.strictEqual(isParametricSegment('about'), false);
  assert.strictEqual(isParametricSegment('contact'), false);
  console.log('  ✔ Parametric segment detection: numeric IDs, UUIDs, dates');

  // Test 2: Dynamic Route Family Clustering
  const samplePaths = [
    '/',
    '/about',
    '/contact',
    '/work',
    '/work/alquion',
    '/work/ausems',
    '/work/limelight',
    '/work/move-to-dream',
    '/work/yoga-website',
    '/services',
    '/services/branding',
    '/services/web-design'
  ];

  const { dynamicFamilies, dynamicPathnames } = clusterRoutes(samplePaths);

  // Must detect 2 dynamic families: /work/:slug and /services/:slug
  assert.strictEqual(dynamicFamilies.length, 2);

  const workFamily = dynamicFamilies.find(f => f.template === '/work/:slug');
  assert.ok(workFamily, 'Should find /work/:slug dynamic family');
  assert.strictEqual(workFamily.totalInstances, 5);
  assert.strictEqual(workFamily.examples.length, 5);
  assert.strictEqual(workFamily.parent, '/work');

  const servicesFamily = dynamicFamilies.find(f => f.template === '/services/:slug');
  assert.ok(servicesFamily, 'Should find /services/:slug dynamic family');
  assert.strictEqual(servicesFamily.totalInstances, 2);

  // Static routes must not be marked dynamic
  assert.strictEqual(dynamicPathnames.has('/about'), false);
  assert.strictEqual(dynamicPathnames.has('/contact'), false);
  assert.strictEqual(dynamicPathnames.has('/'), false);

  // Dynamic instances must be correctly flagged
  assert.strictEqual(dynamicPathnames.has('/work/alquion'), true);
  assert.strictEqual(dynamicPathnames.has('/work/limelight'), true);
  assert.strictEqual(dynamicPathnames.has('/services/branding'), true);

  console.log('  ✔ Dynamic route clustering: /work/:slug (5 items) and /services/:slug (2 items)');
  console.log('All Dynamic Route Clustering Tests Passed Successfully!\n');
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
