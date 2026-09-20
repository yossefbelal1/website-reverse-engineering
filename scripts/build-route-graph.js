/**
 * build-route-graph.js
 * 
 * Takes raw discovered routes and constructs:
 * 1. Dynamic Route Clustering (parameterized templates like /work/:slug, /projecten/:slug)
 * 2. Hierarchical Parent-Child Route Graph with depth and navigation topology
 * 3. Machine-readable `route-graph.json`
 * 4. Human-readable `ROUTE_INVENTORY.md`
 * 
 * Usage:
 *   node build-route-graph.js --input ./discovered.json [--out ./route-graph.json] [--md ./ROUTE_INVENTORY.md]
 */

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

/**
 * Detects whether a path segment looks like a dynamic parameter:
 * - Slugs with hyphens (e.g. "move-to-dream", "iphone-15-pro")
 * - Numeric IDs (e.g. "123", "4567")
 * - UUIDs or hashes
 * - Or when grouped under a common parent where multiple variations occur
 */
function isParametricSegment(segment) {
  if (!segment) return false;
  // Pure digits: /products/123
  if (/^\d+$/.test(segment)) return true;
  // UUID: /items/550e8400-e29b-41d4-a716-446655440000
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;
  // Year or date: 2024, 2026-09
  if (/^\d{4}(-\d{2})?$/.test(segment)) return true;
  return false;
}

/**
 * Clusters a list of pathnames into dynamic route families and static routes
 */
function clusterRoutes(pathnames) {
  // Map of prefix -> Set of instances
  // For example: /projecten -> Set(['alquion', 'ausems', 'limelight'])
  const prefixMap = new Map();
  const rawSegmentsList = pathnames.map(p => ({
    pathname: p,
    segments: p.split('/').filter(Boolean)
  }));

  // Group by segment lengths and base prefixes
  for (const item of rawSegmentsList) {
    if (item.segments.length >= 2) {
      const parentPrefix = '/' + item.segments.slice(0, -1).join('/');
      const leaf = item.segments[item.segments.length - 1];
      if (!prefixMap.has(parentPrefix)) {
        prefixMap.set(parentPrefix, []);
      }
      prefixMap.get(parentPrefix).push({ pathname: item.pathname, leaf });
    }
  }

  const dynamicFamilies = new Map(); // template -> { template, parent, instances, examples }
  const dynamicPathnames = new Set();

  for (const [parentPrefix, items] of prefixMap.entries()) {
    // If 2 or more siblings exist under parentPrefix, OR if leaf is numeric/UUID, cluster into a dynamic template
    const hasParametricLeaves = items.some(i => isParametricSegment(i.leaf));
    if (items.length >= 2 || hasParametricLeaves) {
      const template = `${parentPrefix}/:slug`;
      dynamicFamilies.set(template, {
        template,
        parent: parentPrefix,
        parameterName: 'slug',
        totalInstances: items.length,
        instances: items.map(i => i.pathname),
        examples: items.map(i => i.pathname).slice(0, 5) // Keep up to 5 representative examples
      });
      items.forEach(i => dynamicPathnames.add(i.pathname));
    }
  }

  return {
    dynamicFamilies: Array.from(dynamicFamilies.values()),
    dynamicPathnames
  };
}

/**
 * Builds the hierarchical route graph
 */
function buildRouteGraph(routesData) {
  const routes = Array.isArray(routesData) ? routesData : (routesData.routes || []);
  const target = routesData.target || (routes[0] ? new URL(routes[0].url).origin : '');

  // Extract all unique pathnames
  const pathnames = Array.from(new Set(routes.map(r => r.pathname || new URL(r.url).pathname)));
  
  // Cluster into dynamic families
  const { dynamicFamilies, dynamicPathnames } = clusterRoutes(pathnames);

  // Index routes by pathname
  const routeMap = new Map();
  for (const r of routes) {
    const p = r.pathname || new URL(r.url).pathname;
    routeMap.set(p, r);
  }

  // Node builder
  const nodes = [];
  for (const pathname of pathnames) {
    const rawRecord = routeMap.get(pathname) || {};
    const segments = pathname.split('/').filter(Boolean);
    const depth = segments.length;
    
    // Determine parent path
    let parentPath = null;
    if (pathname !== '/') {
      parentPath = depth === 1 ? '/' : '/' + segments.slice(0, -1).join('/');
    }

    const isDynamicInstance = dynamicPathnames.has(pathname);
    let dynamicTemplate = null;
    if (isDynamicInstance) {
      for (const fam of dynamicFamilies) {
        if (fam.instances.includes(pathname)) {
          dynamicTemplate = fam.template;
          break;
        }
      }
    }

    // Determine priority
    let priority = 'medium';
    if (pathname === '/') priority = 'critical';
    else if (depth === 1) priority = 'high';
    else if (isDynamicInstance) priority = 'medium';

    nodes.push({
      pathname,
      url: rawRecord.url || `${target}${pathname}`,
      depth,
      parentPath,
      isDynamic: isDynamicInstance,
      dynamicTemplate,
      type: isDynamicInstance ? 'dynamic-instance' : (pathname === '/' ? 'root' : 'static'),
      priority,
      sources: rawRecord.sources || [],
      contexts: rawRecord.contexts || [],
      status: 'discovered',
      implementationStatus: 'pending',
      verificationStatus: 'unverified'
    });
  }

  // Build tree structure
  const nodeLookup = new Map(nodes.map(n => [n.pathname, { ...n, children: [] }]));
  const rootNodes = [];

  for (const node of nodeLookup.values()) {
    if (node.pathname === '/') {
      rootNodes.push(node);
    } else if (node.parentPath && nodeLookup.has(node.parentPath)) {
      nodeLookup.get(node.parentPath).children.push(node);
    } else {
      // Direct root child or orphan
      rootNodes.push(node);
    }
  }

  return {
    target,
    totalRoutes: nodes.length,
    totalDynamicFamilies: dynamicFamilies.length,
    dynamicFamilies,
    nodes,
    tree: rootNodes,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generates markdown ROUTE_INVENTORY.md from route graph
 */
function generateRouteInventoryMarkdown(graph) {
  let md = `# Route Inventory & Architecture Specification\n\n`;
  md += `**Target Website**: \`${graph.target}\`  \n`;
  md += `**Total Discovered Routes**: \`${graph.totalRoutes}\`  \n`;
  md += `**Dynamic Route Families**: \`${graph.totalDynamicFamilies}\`  \n`;
  md += `**Generated At**: \`${graph.generatedAt}\`  \n\n`;
  md += `---\n\n`;

  // Dynamic Route Families Section
  if (graph.dynamicFamilies && graph.dynamicFamilies.length > 0) {
    md += `## 1. Dynamic Route Families\n\n`;
    md += `| Template | Parameter | Total Instances | Discovered Examples | Parent Route |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    for (const fam of graph.dynamicFamilies) {
      const exStr = fam.examples.map(e => `\`${e}\``).join(', ');
      md += `| \`${fam.template}\` | \`${fam.parameterName}\` | ${fam.totalInstances} | ${exStr} | \`${fam.parent}\` |\n`;
    }
    md += `\n---\n\n`;
  }

  // Complete Route Inventory Table
  md += `## 2. Complete Route Inventory & Verification Matrix\n\n`;
  md += `| # | Route Path | Type | Priority | Dynamic Template | Discovery Source | Implemented | Verified | QA Status |\n`;
  md += `|---|------------|------|----------|------------------|------------------|-------------|----------|-----------|\n`;

  // Sort: / first, then priority (critical -> high -> medium), then alphabetically
  const sorted = [...graph.nodes].sort((a, b) => {
    if (a.pathname === '/') return -1;
    if (b.pathname === '/') return 1;
    const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (pOrder[a.priority] !== pOrder[b.priority]) {
      return pOrder[a.priority] - pOrder[b.priority];
    }
    return a.pathname.localeCompare(b.pathname);
  });

  sorted.forEach((node, idx) => {
    const srcStr = node.sources.length > 0 ? node.sources.join(', ') : 'crawl';
    const dynStr = node.dynamicTemplate ? `\`${node.dynamicTemplate}\`` : '-';
    md += `| ${idx + 1} | \`${node.pathname}\` | \`${node.type}\` | **${node.priority.toUpperCase()}** | ${dynStr} | ${srcStr} | [ ] | [ ] | PENDING |\n`;
  });

  md += `\n---\n\n`;
  md += `## 3. Route Hierarchy Tree\n\n`;
  md += `\`\`\`text\n`;

  function renderTree(node, indent = '') {
    md += `${indent}${node.pathname === '/' ? '/' : path.basename(node.pathname)} (${node.type})\n`;
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => renderTree(child, indent + '  ├── '));
    }
  }

  graph.tree.forEach(root => renderTree(root));
  md += `\`\`\`\n\n`;

  md += `---\n\n`;
  md += `> [!IMPORTANT]\n`;
  md += `> **First-Page Mirage Prevention Rule**:\n`;
  md += `> Project sign-off strictly requires 100% of the routes listed in this inventory to be implemented, navigable, and verified with $\\Delta \\le 1\\text{px}$ container geometry.\n`;

  return md;
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let inputFile = null;
  let outFile = null;
  let outMd = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) inputFile = args[++i];
    else if (args[i].startsWith('--input=')) inputFile = args[i].slice(8);
    else if (args[i] === '--out' && args[i + 1]) outFile = args[++i];
    else if (args[i].startsWith('--out=')) outFile = args[i].slice(6);
    else if (args[i] === '--md' && args[i + 1]) outMd = args[++i];
    else if (args[i].startsWith('--md=')) outMd = args[i].slice(5);
    else if (!inputFile && !args[i].startsWith('--')) inputFile = args[i];
  }

  if (!inputFile) {
    console.error("Usage: node build-route-graph.js --input <discovered.json> [--out <route-graph.json>] [--md <ROUTE_INVENTORY.md>]");
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const graph = buildRouteGraph(rawData);

  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify(graph, null, 2), 'utf8');
    console.log(`[RouteGraph] Saved route graph JSON to: ${outFile}`);
  } else {
    console.log(JSON.stringify(graph, null, 2));
  }

  if (outMd) {
    const mdContent = generateRouteInventoryMarkdown(graph);
    fs.writeFileSync(outMd, mdContent, 'utf8');
    console.log(`[RouteGraph] Saved ROUTE_INVENTORY.md to: ${outMd}`);
  }
}

module.exports = {
  buildRouteGraph,
  clusterRoutes,
  generateRouteInventoryMarkdown,
  isParametricSegment
};
