#!/usr/bin/env node
/**
 * reverse-engineer-cli.js
 * 
 * Master Orchestrator CLI for the Website Reverse Engineering Engine.
 * 
 * Subcommands:
 *   discover <url>               Run multi-source route discovery
 *   graph <discovered.json>      Build hierarchical route graph and dynamic families
 *   evidence <graph.json>        Collect page-by-page DOM, geometry, and styles
 *   assets <evidence-dir>        Extract and download multi-page media assets
 *   specs <graph.json>           Generate page specifications and global design system
 *   coverage <graph.json>        Audit local workspace route coverage and FOUC status
 *   verify <orig.json> <loc.json> Perform container-first geometry verification
 *   qa <graph.json>              Run all 17 Quality Gates and generate FINAL_QA.md
 *   pipeline <url>               Run full end-to-end discovery, graph, and QA pipeline
 */

const fs = require('fs');
const path = require('path');
const { discoverRoutes } = require('./discover-routes');
const { buildRouteGraph, generateRouteInventoryMarkdown } = require('./build-route-graph');
const { collectAllPageEvidence } = require('./collect-page-evidence');
const { aggregateAssetsFromEvidence, generateAssetInventoryMarkdown } = require('./extract-assets');
const { generateAllSpecs } = require('./generate-page-specs');
const { auditWorkspaceCoverage, generateCoverageMarkdown } = require('./audit-route-coverage');
const { evaluateQualityGates, generateFinalQAMarkdown } = require('./run-quality-gates');

function printHelp() {
  console.log(`
Website Reverse Engineering Engine v2.0.0
Usage: reverse-engineer <command> [options]

Commands:
  discover <url>                 Discover all reachable routes from sitemaps, robots, DOM, scripts
                                   Options: --depth <n>, --out <file.json>
  graph <discovered.json>        Build route graph, cluster dynamic routes, generate ROUTE_INVENTORY.md
                                   Options: --out <file.json>, --md <ROUTE_INVENTORY.md>
  evidence <graph.json>          Collect structured page evidence for all routes in graph
                                   Options: --out <dir>
  assets <evidence-dir>          Catalog all images, fonts, SVGs, and videos across routes
                                   Options: --download <dir>, --out <ASSET_INVENTORY.md>
  specs <graph.json>             Generate route-specific PAGE_SPEC markdown files
                                   Options: --evidence <dir>, --outDir <dir>
  coverage <graph.json>          Audit local workspace for route completeness, FOUC, and broken links
                                   Options: --workspace <dir>, --out <ROUTE_COVERAGE_MATRIX.md>
  qa <graph.json>                Run 17 Quality Gates, block First-Page Mirage, generate FINAL_QA.md
                                   Options: --workspace <dir>, --out <FINAL_QA.md>
  pipeline <url>                 Run complete automated discovery, graph, and coverage pipeline
                                   Options: --workspace <dir>, --depth <n>
  help                           Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
    process.exit(0);
  }

  // Helper argument parser
  function getArg(flag, defaultValue = null) {
    for (let i = 1; i < args.length; i++) {
      if (args[i] === flag && args[i + 1]) return args[i + 1];
      if (args[i].startsWith(`${flag}=`)) return args[i].slice(flag.length + 1);
    }
    return defaultValue;
  }

  try {
    switch (cmd) {
      case 'discover': {
        const url = args[1];
        if (!url || url.startsWith('--')) {
          console.error("Error: URL required. Example: reverse-engineer discover https://example.com");
          process.exit(1);
        }
        const depth = parseInt(getArg('--depth', '2'), 10);
        const outFile = getArg('--out', null);

        const result = await discoverRoutes(url, { depth });
        if (outFile) {
          fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8');
          console.log(`[CLI] Discovered ${result.totalRoutes} routes saved to: ${outFile}`);
        } else {
          console.log(JSON.stringify(result, null, 2));
        }
        break;
      }

      case 'graph': {
        const inputFile = args[1];
        if (!inputFile || inputFile.startsWith('--')) {
          console.error("Error: Discovered JSON file required.");
          process.exit(1);
        }
        const outFile = getArg('--out', 'route-graph.json');
        const mdFile = getArg('--md', 'ROUTE_INVENTORY.md');

        const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
        const graph = buildRouteGraph(rawData);

        fs.writeFileSync(outFile, JSON.stringify(graph, null, 2), 'utf8');
        fs.writeFileSync(mdFile, generateRouteInventoryMarkdown(graph), 'utf8');
        console.log(`[CLI] Route graph saved to: ${outFile}`);
        console.log(`[CLI] Route inventory saved to: ${mdFile}`);
        break;
      }

      case 'evidence': {
        const graphFile = args[1];
        if (!graphFile || graphFile.startsWith('--')) {
          console.error("Error: Route graph JSON file required.");
          process.exit(1);
        }
        const outDir = getArg('--out', './evidence');
        await collectAllPageEvidence(graphFile, outDir);
        break;
      }

      case 'assets': {
        const evidenceDir = args[1] || getArg('--evidence', './evidence');
        const outMd = getArg('--out', 'ASSET_INVENTORY.md');
        const assets = aggregateAssetsFromEvidence(evidenceDir);
        fs.writeFileSync(outMd, generateAssetInventoryMarkdown(assets), 'utf8');
        console.log(`[CLI] Cataloged ${assets.length} assets to: ${outMd}`);
        break;
      }

      case 'specs': {
        const graphFile = args[1];
        if (!graphFile || graphFile.startsWith('--')) {
          console.error("Error: Route graph JSON file required.");
          process.exit(1);
        }
        const evidenceDir = getArg('--evidence', './evidence');
        const outDir = getArg('--outDir', './specs');
        generateAllSpecs(graphFile, evidenceDir, outDir);
        break;
      }

      case 'coverage': {
        const graphFile = args[1];
        if (!graphFile || graphFile.startsWith('--')) {
          console.error("Error: Route graph JSON file required.");
          process.exit(1);
        }
        const workspace = getArg('--workspace', './');
        const outMd = getArg('--out', 'ROUTE_COVERAGE_MATRIX.md');
        const report = auditWorkspaceCoverage(graphFile, workspace);
        fs.writeFileSync(outMd, generateCoverageMarkdown(report), 'utf8');
        console.log(`[CLI] Route coverage matrix saved to: ${outMd}`);
        process.exit(report.metrics.overallStatus === 'PASS' ? 0 : 1);
        break;
      }

      case 'qa': {
        const graphFile = args[1];
        if (!graphFile || graphFile.startsWith('--')) {
          console.error("Error: Route graph JSON file required.");
          process.exit(1);
        }
        const workspace = getArg('--workspace', './');
        const outMd = getArg('--out', 'FINAL_QA.md');
        const result = evaluateQualityGates(graphFile, workspace);
        fs.writeFileSync(outMd, generateFinalQAMarkdown(result), 'utf8');
        console.log(`[CLI] Final QA report saved to: ${outMd} (Status: ${result.overallStatus})`);
        process.exit(result.overallStatus === 'PASS' ? 0 : 1);
        break;
      }

      case 'pipeline': {
        const targetUrl = args[1];
        if (!targetUrl || targetUrl.startsWith('--')) {
          console.error("Error: Target URL required.");
          process.exit(1);
        }
        const depth = parseInt(getArg('--depth', '2'), 10);
        const workspace = getArg('--workspace', './');

        console.log(`=== Running Reverse Engineering Pipeline ===`);
        console.log(`Target: ${targetUrl}`);
        console.log(`Workspace: ${workspace}\n`);

        // Step 1: Discover
        const discovered = await discoverRoutes(targetUrl, { depth });
        fs.writeFileSync('discovered-routes.json', JSON.stringify(discovered, null, 2), 'utf8');

        // Step 2: Route Graph & Inventory
        const graph = buildRouteGraph(discovered);
        fs.writeFileSync('route-graph.json', JSON.stringify(graph, null, 2), 'utf8');
        fs.writeFileSync('ROUTE_INVENTORY.md', generateRouteInventoryMarkdown(graph), 'utf8');

        // Step 3: Route Coverage & Quality Gates
        const qaResult = evaluateQualityGates('route-graph.json', workspace);
        fs.writeFileSync('FINAL_QA.md', generateFinalQAMarkdown(qaResult), 'utf8');

        console.log(`\n=== Pipeline Complete ===`);
        console.log(`Routes: ${graph.totalRoutes}`);
        console.log(`Dynamic Families: ${graph.totalDynamicFamilies}`);
        console.log(`Coverage Status: ${qaResult.coverage.metrics.overallStatus}`);
        console.log(`Final QA Status: ${qaResult.overallStatus}`);
        process.exit(qaResult.overallStatus === 'PASS' ? 0 : 1);
        break;
      }

      default:
        console.error(`Unknown command: ${cmd}`);
        printHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error(`[CLI Error]`, err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
