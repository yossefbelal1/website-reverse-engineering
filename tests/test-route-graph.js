/**
 * test-route-graph.js
 * 
 * Unit tests for route graph generation, hierarchical parent-child relationships,
 * and ROUTE_INVENTORY.md generation.
 */

const assert = require('assert');
const { buildRouteGraph, generateRouteInventoryMarkdown } = require('../scripts/build-route-graph');

function runTests() {
  console.log('--- Running Route Graph Generation Tests ---');

  const rawDiscovered = {
    target: 'https://example.com',
    totalRoutes: 6,
    routes: [
      { pathname: '/', url: 'https://example.com/', type: 'root', sources: ['sitemap.xml'] },
      { pathname: '/about', url: 'https://example.com/about', type: 'static', sources: ['nav'] },
      { pathname: '/work', url: 'https://example.com/work', type: 'static', sources: ['nav'] },
      { pathname: '/work/project-1', url: 'https://example.com/work/project-1', type: 'dynamic-candidate', sources: ['crawl'] },
      { pathname: '/work/project-2', url: 'https://example.com/work/project-2', type: 'dynamic-candidate', sources: ['crawl'] },
      { pathname: '/contact', url: 'https://example.com/contact', type: 'static', sources: ['nav'] }
    ]
  };

  const graph = buildRouteGraph(rawDiscovered);

  // Test 1: Node Counts
  assert.strictEqual(graph.totalRoutes, 6);
  assert.strictEqual(graph.totalDynamicFamilies, 1);
  assert.strictEqual(graph.dynamicFamilies[0].template, '/work/:slug');
  console.log('  ✔ Graph metadata and dynamic family detection');

  // Test 2: Parent-Child Hierarchies
  const rootNode = graph.nodes.find(n => n.pathname === '/');
  assert.ok(rootNode);
  assert.strictEqual(rootNode.depth, 0);
  assert.strictEqual(rootNode.priority, 'critical');

  const workProj = graph.nodes.find(n => n.pathname === '/work/project-1');
  assert.ok(workProj);
  assert.strictEqual(workProj.parentPath, '/work');
  assert.strictEqual(workProj.isDynamic, true);
  assert.strictEqual(workProj.dynamicTemplate, '/work/:slug');
  console.log('  ✔ Parent-child hierarchy links: /work/project-1 -> parent: /work');

  // Test 3: Tree Construction
  assert.strictEqual(graph.tree.length > 0, true);
  const rootTree = graph.tree.find(t => t.pathname === '/');
  assert.ok(rootTree);
  assert.ok(rootTree.children.length > 0);
  console.log('  ✔ Tree structure traversal');

  // Test 4: Markdown Generation
  const md = generateRouteInventoryMarkdown(graph);
  assert.ok(md.includes('# Route Inventory & Architecture Specification'));
  assert.ok(md.includes('`/work/:slug`'));
  assert.ok(md.includes('CRITICAL'));
  assert.ok(md.includes('First-Page Mirage Prevention Rule'));
  console.log('  ✔ ROUTE_INVENTORY.md generation with markdown tables and warning alerts');

  console.log('All Route Graph Tests Passed Successfully!\n');
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
