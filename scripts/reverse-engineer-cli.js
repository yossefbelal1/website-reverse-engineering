#!/usr/bin/env node
/**
 * reverse-engineer-cli.js
 * 
 * Master Orchestrator CLI for the Website Reverse Engineering Engine (v2.0.0).
 * 
 * Subcommands:
 *   discover <url>               Run multi-source route discovery
 *   graph <discovered.json>      Build hierarchical route graph and dynamic families
 *   evidence <graph.json>        Collect page-by-page DOM, geometry, and styles
 *   assets <evidence-dir>        Extract and download multi-page media assets
 *   specs <graph.json>           Generate page specifications and global design system
 *   coverage <graph.json>        Audit local workspace route coverage and FOUC status
 *   diff <orig.html> <loc.html>  Run region-based visual regression comparison
 *   repair <graph.json>          Execute autonomous self-healing repair loop
 *   trace <graph.json>           Audit page-spec to implementation traceability
 *   qa <graph.json>              Run all 17 Quality Gates, scorecard, and FINAL_QA.md/json
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
const { compareVisualRegions, generateVisualDiffMarkdown } = require('./visual-diff-engine');
const { runAutonomousRepairLoop } = require('./repair-loop');
const { auditTraceability, generateTraceabilityMarkdown } = require('./verify-traceability');
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
  diff <orig.html> <loc.html>    Run region-based visual & layout regression comparison
                                   Options: --route <path>, --threshold <float>, --outDir <dir>
  repair <graph.json>            Run bounded autonomous self-healing repair loop
                                   Options: --workspace <dir>, --maxRetries <n>, --log <file.json>
  trace <graph.json>             Verify page-spec to code implementation traceability
                                   Options: --specs <dir>, --workspace <dir>, --out <file.md>
  qa <graph.json>                Run 17 Quality Gates, scorecard, block First-Page Mirage
                                   Options: --workspace <dir>, --mode <normal|high-fidelity>, --out <FINAL_QA.md>, --json <FINAL_QA.json>
  pipeline <url>                 Run complete automated discovery, graph, and coverage pipeline
                                   Options: --workspace <dir>, --depth <n>, --mode <normal|high-fidelity>
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

      case 'diff': {
        const origFile = args[1];
        const localFile = args[2];
        if (!origFile || !localFile) {
          console.error("Error: Original HTML and Local HTML files required.");
          process.exit(1);
        }
        const route = getArg('--route', '/');
        const threshold = parseFloat(getArg('--threshold', '0.90'));
        const outDir = getArg('--outDir', './visual-diffs');

        const origHtml = fs.readFileSync(origFile, 'utf8');
        const localHtml = fs.readFileSync(localFile, 'utf8');
        const diffReport = compareVisualRegions(origHtml, localHtml, { threshold });

        const slug = route === '/' ? 'home' : route.replace(/^\/+|\/+$/g, '').replace(/[\/\-_]+/g, '-');
        const routeOutDir = path.join(outDir, slug);
        fs.mkdirSync(routeOutDir, { recursive: true });

        fs.writeFileSync(path.join(routeOutDir, 'diff-report.json'), JSON.stringify(diffReport, null, 2), 'utf8');
        fs.writeFileSync(path.join(routeOutDir, 'VISUAL_DIFF.md'), generateVisualDiffMarkdown(diffReport, route), 'utf8');
        console.log(`[CLI] Visual diff report saved to: ${routeOutDir}`);
        process.exit(diffReport.status === 'PASS' ? 0 : 1);
        break;
      }

      case 'repair': {
        const graphFile = args[1];
        if (!graphFile || graphFile.startsWith('--')) {
          console.error("Error: Route graph JSON file required.");
          process.exit(1);
        }
        const workspace = getArg('--workspace', './');
        const maxRetries = parseInt(getArg('--maxRetries', '3'), 10);
        const logFile = getArg('--log', 'repair-log.json');

        const result = runAutonomousRepairLoop(graphFile, workspace, { maxRetries });
        fs.writeFileSync(logFile, JSON.stringify(result, null, 2), 'utf8');
        console.log(`[CLI] Repair log saved to: ${logFile}`);
        process.exit(result.status === 'RESOLVED' ? 0 : 1);
        break;
      }

      case 'trace': {
        const graphFile = args[1];
        if (!graphFile || graphFile.startsWith('--')) {
          console.error("Error: Route graph JSON file required.");
          process.exit(1);
        }
        const specsDir = getArg('--specs', './specs');
        const workspace = getArg('--workspace', './');
        const outMd = getArg('--out', 'TRACEABILITY_MATRIX.md');

        const report = auditTraceability(graphFile, specsDir, workspace);
        fs.writeFileSync(outMd, generateTraceabilityMarkdown(report), 'utf8');
        console.log(`[CLI] Traceability report saved to: ${outMd}`);
        process.exit(report.traceableRoutes === report.totalRoutes ? 0 : 1);
        break;
      }

      case 'qa': {
        const graphFile = args[1];
        if (!graphFile || graphFile.startsWith('--')) {
          console.error("Error: Route graph JSON file required.");
          process.exit(1);
        }
        const workspace = getArg('--workspace', './');
        const mode = getArg('--mode', 'normal');
        const outMd = getArg('--out', 'FINAL_QA.md');
        const outJson = getArg('--json', 'FINAL_QA.json');

        const result = evaluateQualityGates(graphFile, workspace, { mode });
        fs.writeFileSync(outMd, generateFinalQAMarkdown(result), 'utf8');
        fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');
        console.log(`[CLI] Final QA markdown saved to: ${outMd}`);
        console.log(`[CLI] Final QA machine JSON saved to: ${outJson}`);
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
        const mode = getArg('--mode', 'normal');

        console.log(`=== Running Reverse Engineering Pipeline (${mode.toUpperCase()} MODE) ===`);
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
        const qaResult = evaluateQualityGates('route-graph.json', workspace, { mode });
        fs.writeFileSync('FINAL_QA.md', generateFinalQAMarkdown(qaResult), 'utf8');
        fs.writeFileSync('FINAL_QA.json', JSON.stringify(qaResult, null, 2), 'utf8');

        console.log(`\n=== Pipeline Complete ===`);
        console.log(`Routes Discovered: ${graph.totalRoutes}`);
        console.log(`Dynamic Families: ${graph.totalDynamicFamilies}`);
        console.log(`Route Coverage: ${qaResult.scorecard.routeCoverage}`);
        console.log(`Navigation Coverage: ${qaResult.scorecard.navigationCoverage}`);
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
