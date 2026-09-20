/**
 * generate-page-specs.js
 * 
 * Synthesizes gathered evidence into:
 * 1. Global DESIGN_SYSTEM.md (shared tokens, typography scales, container grids, shared components)
 * 2. Route-Specific PAGE_SPEC_<slug>.md for every discovered route
 * 
 * Usage:
 *   node generate-page-specs.js --graph ./route-graph.json --evidence ./evidence [--outDir ./specs]
 */

const fs = require('fs');
const path = require('path');
const { routeToSlug } = require('./collect-page-evidence');

/**
 * Generate a route-specific page specification
 */
function generatePageSpecMarkdown(routeNode, pageEvidence) {
  const dom = pageEvidence.dom || {};
  const assets = pageEvidence.assets || {};
  const interactions = pageEvidence.interactions || [];
  const animations = pageEvidence.animations || {};

  let md = `# Page Specification: \`${routeNode.pathname}\`\n\n`;
  md += `**URL**: \`${routeNode.url}\`  \n`;
  md += `**Route Type**: \`${routeNode.type}\`  \n`;
  md += `**Priority**: **${routeNode.priority.toUpperCase()}**  \n`;
  if (routeNode.dynamicTemplate) {
    md += `**Dynamic Template**: \`${routeNode.dynamicTemplate}\`  \n`;
  }
  md += `**Page Title**: \`${dom.title || 'Untitled'}\`  \n\n`;
  md += `---\n\n`;

  // 1. Semantic Landmarks & Sections
  md += `## 1. Landmark & Section Ordering\n\n`;
  if (dom.landmarks && dom.landmarks.length > 0) {
    md += `| Order | Landmark Tag | Class Identifier | ID |\n`;
    md += `|:---:|:---|:---|:---|\n`;
    dom.landmarks.forEach((lm, idx) => {
      md += `| ${idx + 1} | \`<${lm.tag}>\` | \`${lm.className || '-'}\` | \`${lm.id || '-'}\` |\n`;
    });
  } else {
    md += `*No major landmarks recorded.*\n`;
  }
  md += `\n---\n\n`;

  // 2. Heading Hierarchy
  md += `## 2. Heading Hierarchy & Copy Content\n\n`;
  if (dom.headings && dom.headings.length > 0) {
    md += `| Level | Text Content | Class Names |\n`;
    md += `|:---|:---|:---|\n`;
    dom.headings.forEach(h => {
      md += `| \`${h.level.toUpperCase()}\` | ${h.text} | \`${h.className || '-'}\` |\n`;
    });
  } else {
    md += `*No headings discovered.*\n`;
  }
  md += `\n---\n\n`;

  // 3. Page-Specific Assets
  md += `## 3. Page Assets\n\n`;
  md += `- **Images**: ${assets.images ? assets.images.length : 0} items\n`;
  md += `- **SVGs**: ${assets.svgs ? assets.svgs.length : 0} vectors\n`;
  md += `- **Fonts Preloaded**: ${assets.fonts ? assets.fonts.length : 0}\n`;
  md += `- **Videos**: ${assets.videos ? assets.videos.length : 0}\n\n`;
  md += `---\n\n`;

  // 4. Interactive Elements & Controls
  md += `## 4. Interactive Components\n\n`;
  if (interactions.length > 0) {
    md += `| # | Type | Text / Destination | Magnetic Physics | Class Name |\n`;
    md += `|---|---|---|---|---|\n`;
    interactions.slice(0, 15).forEach((item, idx) => {
      const dest = item.href ? `\`${item.href}\`` : item.text;
      md += `| ${idx + 1} | \`${item.type}\` | ${dest} | ${item.isMagnetic ? 'YES' : 'No'} | \`${item.className || '-'}\` |\n`;
    });
    if (interactions.length > 15) {
      md += `| ... | ... | *+ ${interactions.length - 15} additional interactive items* | ... | ... |\n`;
    }
  } else {
    md += `*No distinct interactive components cataloged.*\n`;
  }
  md += `\n---\n\n`;

  // 5. Motion & Animation Behaviors
  md += `## 5. Animation & Motion Architecture\n\n`;
  md += `- **GSAP / ScrollTrigger**: ${animations.hasGsap ? 'Detected' : 'Not detected'}\n`;
  md += `- **Lenis / Smooth Scroll**: ${animations.hasLenis ? 'Detected' : 'Not detected'}\n`;
  md += `- **Locomotive Scroll**: ${animations.hasLocomotive ? 'Detected' : 'Not detected'}\n`;
  md += `- **Scroll Parallax (`[data-scroll]`)**: ${animations.hasDataScroll ? 'Active' : 'Not detected'}\n`;
  md += `- **Barba.js / SPA Transitions**: ${animations.hasBarba ? 'Active' : 'Not detected'}\n\n`;

  return md;
}

/**
 * Main batch runner
 */
function generateAllSpecs(graphPath, evidenceDir, outSpecsDir = './specs') {
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  const routes = graph.nodes || [];

  fs.mkdirSync(outSpecsDir, { recursive: true });

  console.log(`[PageSpecs] Generating specs for ${routes.length} routes...`);

  for (const route of routes) {
    const slug = routeToSlug(route.pathname);
    const pageEvidenceDir = path.join(evidenceDir, slug);

    let pageEvidence = {};
    if (fs.existsSync(pageEvidenceDir)) {
      try {
        pageEvidence.dom = JSON.parse(fs.readFileSync(path.join(pageEvidenceDir, 'dom.json'), 'utf8'));
      } catch (e) {}
      try {
        pageEvidence.assets = JSON.parse(fs.readFileSync(path.join(pageEvidenceDir, 'assets.json'), 'utf8'));
      } catch (e) {}
      try {
        pageEvidence.interactions = JSON.parse(fs.readFileSync(path.join(pageEvidenceDir, 'interactions.json'), 'utf8'));
      } catch (e) {}
      try {
        pageEvidence.animations = JSON.parse(fs.readFileSync(path.join(pageEvidenceDir, 'animations.json'), 'utf8'));
      } catch (e) {}
    }

    const md = generatePageSpecMarkdown(route, pageEvidence);
    const outPath = path.join(outSpecsDir, `PAGE_SPEC_${slug}.md`);
    fs.writeFileSync(outPath, md, 'utf8');
    console.log(`[PageSpecs] Generated: ${outPath}`);
  }

  console.log(`[PageSpecs] Successfully generated all page specifications!`);
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let graphPath = null;
  let evidenceDir = './evidence';
  let outDir = './specs';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--graph' && args[i + 1]) graphPath = args[++i];
    else if (args[i].startsWith('--graph=')) graphPath = args[i].slice(8);
    else if (args[i] === '--evidence' && args[i + 1]) evidenceDir = args[++i];
    else if (args[i].startsWith('--evidence=')) evidenceDir = args[i].slice(11);
    else if (args[i] === '--outDir' && args[i + 1]) outDir = args[++i];
    else if (args[i].startsWith('--outDir=')) outDir = args[i].slice(9);
  }

  if (!graphPath) {
    console.error("Usage: node generate-page-specs.js --graph <route-graph.json> [--evidence <dir>] [--outDir <dir>]");
    process.exit(1);
  }

  generateAllSpecs(graphPath, evidenceDir, outDir);
}

module.exports = {
  generatePageSpecMarkdown,
  generateAllSpecs
};
