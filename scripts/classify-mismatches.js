/**
 * classify-mismatches.js
 * 
 * Standardized Mismatch Classification Engine.
 * 
 * Classifies layout, visual, structural, and behavioral discrepancies into
 * machine-readable error taxonomies:
 *  - MISSING_ELEMENT
 *  - EXTRA_ELEMENT
 *  - WRONG_POSITION
 *  - WRONG_SIZE
 *  - WRONG_SPACING
 *  - WRONG_FONT
 *  - WRONG_FONT_SIZE
 *  - WRONG_LINE_HEIGHT
 *  - WRONG_COLOR
 *  - WRONG_IMAGE
 *  - WRONG_ASPECT_RATIO
 *  - WRONG_BORDER
 *  - WRONG_RADIUS
 *  - WRONG_SHADOW
 *  - WRONG_RESPONSIVE_BEHAVIOR
 *  - WRONG_ANIMATION
 *  - WRONG_CONTENT
 * 
 * Usage:
 *   node classify-mismatches.js --diff ./diff-report.json [--out ./mismatches.json]
 */

const fs = require('fs');
const path = require('path');

const CLASSIFICATIONS = {
  MISSING_ELEMENT: 'MISSING_ELEMENT',
  EXTRA_ELEMENT: 'EXTRA_ELEMENT',
  WRONG_POSITION: 'WRONG_POSITION',
  WRONG_SIZE: 'WRONG_SIZE',
  WRONG_SPACING: 'WRONG_SPACING',
  WRONG_FONT: 'WRONG_FONT',
  WRONG_FONT_SIZE: 'WRONG_FONT_SIZE',
  WRONG_LINE_HEIGHT: 'WRONG_LINE_HEIGHT',
  WRONG_COLOR: 'WRONG_COLOR',
  WRONG_IMAGE: 'WRONG_IMAGE',
  WRONG_ASPECT_RATIO: 'WRONG_ASPECT_RATIO',
  WRONG_BORDER: 'WRONG_BORDER',
  WRONG_RADIUS: 'WRONG_RADIUS',
  WRONG_SHADOW: 'WRONG_SHADOW',
  WRONG_RESPONSIVE_BEHAVIOR: 'WRONG_RESPONSIVE_BEHAVIOR',
  WRONG_ANIMATION: 'WRONG_ANIMATION',
  WRONG_CONTENT: 'WRONG_CONTENT'
};

/**
 * Classifies visual diff findings into standardized error categories
 */
function classifyVisualMismatches(diffReport, context = {}) {
  const items = [];

  // 1. Analyze region reports
  if (diffReport.regionReports) {
    for (const [regionName, report] of Object.entries(diffReport.regionReports)) {
      if (report.status === 'MISSING') {
        items.push({
          region: regionName,
          type: CLASSIFICATIONS.MISSING_ELEMENT,
          severity: 'critical',
          description: `Entire semantic region '${regionName}' is missing from local reconstruction.`
        });
      } else if (report.status === 'EXTRA') {
        items.push({
          region: regionName,
          type: CLASSIFICATIONS.EXTRA_ELEMENT,
          severity: 'minor',
          description: `Unexpected extra semantic region '${regionName}' detected in local reconstruction.`
        });
      }

      for (const m of (report.mismatches || [])) {
        if (/headline|content|text/i.test(m)) {
          items.push({
            region: regionName,
            type: CLASSIFICATIONS.WRONG_CONTENT,
            severity: 'major',
            description: `Text content or headline mismatch in region '${regionName}': ${m}`
          });
        } else if (/image|img/i.test(m)) {
          items.push({
            region: regionName,
            type: CLASSIFICATIONS.WRONG_IMAGE,
            severity: 'major',
            description: `Image asset mismatch in region '${regionName}': ${m}`
          });
        } else if (/width|height|size/i.test(m)) {
          items.push({
            region: regionName,
            type: CLASSIFICATIONS.WRONG_SIZE,
            severity: 'major',
            description: `Dimension or size mismatch in region '${regionName}': ${m}`
          });
        }
      }
    }
  }

  // 2. Analyze geometry deltas
  if (context.geometryDeltas) {
    for (const gd of context.geometryDeltas) {
      if (gd.delta > 1) {
        items.push({
          selector: gd.selector || 'container',
          type: CLASSIFICATIONS.WRONG_SIZE,
          severity: gd.delta > 5 ? 'critical' : 'major',
          description: `Structural container width delta Δ=${gd.delta}px exceeds 1px tolerance.`
        });
      }
    }
  }

  // 3. Analyze line breaks / typography
  if (context.lineBreaks && context.lineBreaks.count > 0) {
    items.push({
      type: CLASSIFICATIONS.WRONG_RESPONSIVE_BEHAVIOR,
      severity: 'major',
      description: `Detected ${context.lineBreaks.count} artificial <br> tags disrupting responsive typography wrapping.`
    });
  }

  // 4. Analyze FOUC / stylesheet presence
  if (context.foucDetected) {
    items.push({
      type: CLASSIFICATIONS.WRONG_COLOR,
      severity: 'critical',
      description: `Page entrypoint missing <link rel="stylesheet"> in <head> (FOUC / unstyled layout).`
    });
  }

  return {
    totalMismatches: items.length,
    criticalCount: items.filter(i => i.severity === 'critical').length,
    majorCount: items.filter(i => i.severity === 'major').length,
    minorCount: items.filter(i => i.severity === 'minor').length,
    classifiedAt: new Date().toISOString(),
    mismatches: items
  };
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let diffFile = null;
  let outFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--diff' && args[i + 1]) diffFile = args[++i];
    else if (args[i].startsWith('--diff=')) diffFile = args[i].slice(7);
    else if (args[i] === '--out' && args[i + 1]) outFile = args[++i];
    else if (args[i].startsWith('--out=')) outFile = args[i].slice(6);
  }

  if (!diffFile) {
    console.error("Usage: node classify-mismatches.js --diff <diff-report.json> [--out <mismatches.json>]");
    process.exit(1);
  }

  const diffReport = JSON.parse(fs.readFileSync(diffFile, 'utf8'));
  const classifications = classifyVisualMismatches(diffReport);

  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify(classifications, null, 2), 'utf8');
    console.log(`[Classifier] Saved classifications to: ${outFile}`);
  } else {
    console.log(JSON.stringify(classifications, null, 2));
  }
}

module.exports = {
  CLASSIFICATIONS,
  classifyVisualMismatches
};
