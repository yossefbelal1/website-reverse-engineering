/**
 * extract-assets.js
 * 
 * Multi-Page Asset Discovery, Harvesting, and Inventory Engine.
 * Discovers and tracks:
 *  - Images (raster, WebP, AVIF)
 *  - SVGs (inline and linked)
 *  - Fonts (WOFF2, WOFF, TTF)
 *  - Videos (MP4, WebM)
 *  - CSS Background Images
 * 
 * Generates `ASSET_INVENTORY.md` and machine-readable `asset-manifest.json`.
 * 
 * Usage:
 *   node extract-assets.js --evidence ./evidence [--download ./public] [--out ./ASSET_INVENTORY.md]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Download a single binary asset to disk
 */
function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(fileUrl);
    } catch (e) {
      return reject(e);
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const fileStream = fs.createWriteStream(destPath);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.get(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      timeout: 20000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fileStream.close();
        try { fs.unlinkSync(destPath); } catch (e) {}
        const nextUrl = new URL(res.headers.location, fileUrl).toString();
        return downloadFile(nextUrl, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        fileStream.close();
        try { fs.unlinkSync(destPath); } catch (e) {}
        return reject(new Error(`Status ${res.statusCode} for ${fileUrl}`));
      }
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve({ destPath, sizeBytes: fs.statSync(destPath).size });
      });
    });

    req.on('error', (err) => {
      fileStream.close();
      try { fs.unlinkSync(destPath); } catch (e) {}
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      fileStream.close();
      try { fs.unlinkSync(destPath); } catch (e) {}
      reject(new Error(`Timeout downloading ${fileUrl}`));
    });
  });
}

/**
 * Scan evidence directory and aggregate all assets across all routes
 */
function aggregateAssetsFromEvidence(evidenceDir) {
  const assetMap = new Map(); // url -> AssetRecord

  if (!fs.existsSync(evidenceDir)) return [];

  const routeSlugs = fs.readdirSync(evidenceDir);
  for (const slug of routeSlugs) {
    const assetsFile = path.join(evidenceDir, slug, 'assets.json');
    if (!fs.existsSync(assetsFile)) continue;

    try {
      const data = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));

      // 1. Process images
      if (data.images && Array.isArray(data.images)) {
        for (const img of data.images) {
          if (!img.url) continue;
          if (!assetMap.has(img.url)) {
            const urlObj = new URL(img.url);
            const ext = path.extname(urlObj.pathname).replace('.', '').toLowerCase() || 'img';
            assetMap.set(img.url, {
              url: img.url,
              filename: path.basename(urlObj.pathname) || `asset-${assetMap.size}.${ext}`,
              format: ext,
              type: 'image',
              alt: img.alt || '',
              declaredWidth: img.declaredWidth,
              declaredHeight: img.declaredHeight,
              pages: new Set([slug]),
              downloadStatus: 'pending'
            });
          } else {
            assetMap.get(img.url).pages.add(slug);
          }
        }
      }

      // 2. Process fonts
      if (data.fonts && Array.isArray(data.fonts)) {
        for (const font of data.fonts) {
          if (!font.url) continue;
          if (!assetMap.has(font.url)) {
            const urlObj = new URL(font.url);
            const ext = path.extname(urlObj.pathname).replace('.', '').toLowerCase() || 'woff2';
            assetMap.set(font.url, {
              url: font.url,
              filename: path.basename(urlObj.pathname) || `font-${assetMap.size}.${ext}`,
              format: ext,
              type: 'font',
              pages: new Set([slug]),
              downloadStatus: 'pending'
            });
          } else {
            assetMap.get(font.url).pages.add(slug);
          }
        }
      }

      // 3. Process videos
      if (data.videos && Array.isArray(data.videos)) {
        for (const vid of data.videos) {
          if (!vid.src) continue;
          if (!assetMap.has(vid.src)) {
            const urlObj = new URL(vid.src);
            const ext = path.extname(urlObj.pathname).replace('.', '').toLowerCase() || 'mp4';
            assetMap.set(vid.src, {
              url: vid.src,
              filename: path.basename(urlObj.pathname) || `video-${assetMap.size}.${ext}`,
              format: ext,
              type: 'video',
              autoplay: vid.autoplay,
              loop: vid.loop,
              pages: new Set([slug]),
              downloadStatus: 'pending'
            });
          } else {
            assetMap.get(vid.src).pages.add(slug);
          }
        }
      }
    } catch (e) {}
  }

  return Array.from(assetMap.values()).map(a => ({
    ...a,
    pages: Array.from(a.pages)
  }));
}

/**
 * Generates ASSET_INVENTORY.md
 */
function generateAssetInventoryMarkdown(assets) {
  let md = `# Asset Inventory & Multi-Page Media Manifest\n\n`;
  md += `Total Assets Cataloged: \`${assets.length}\`  \n`;
  md += `Generated At: \`${new Date().toISOString()}\`  \n\n`;
  md += `---\n\n`;

  const images = assets.filter(a => a.type === 'image');
  const fonts = assets.filter(a => a.type === 'font');
  const videos = assets.filter(a => a.type === 'video');

  // Images Table
  md += `## 1. Images & Visual Media (${images.length})\n\n`;
  md += `| # | Filename | Format | Dimensions | Used on Pages | Original URL |\n`;
  md += `|---|----------|--------|------------|---------------|--------------|\n`;
  images.forEach((img, idx) => {
    const dim = (img.declaredWidth && img.declaredHeight) ? `${img.declaredWidth}x${img.declaredHeight}` : 'auto';
    const pagesStr = img.pages.map(p => `\`${p}\``).join(', ');
    md += `| ${idx + 1} | \`${img.filename}\` | \`${img.format}\` | ${dim} | ${pagesStr} | [Link](${img.url}) |\n`;
  });
  md += `\n---\n\n`;

  // Fonts Table
  if (fonts.length > 0) {
    md += `## 2. Web Fonts (${fonts.length})\n\n`;
    md += `| # | Filename | Format | Pages | URL |\n`;
    md += `|---|----------|--------|-------|-----|\n`;
    fonts.forEach((f, idx) => {
      md += `| ${idx + 1} | \`${f.filename}\` | \`${f.format}\` | ${f.pages.join(', ')} | [Link](${f.url}) |\n`;
    });
    md += `\n---\n\n`;
  }

  // Videos Table
  if (videos.length > 0) {
    md += `## 3. Video Assets (${videos.length})\n\n`;
    md += `| # | Filename | Format | Autoplay | Pages | URL |\n`;
    md += `|---|----------|--------|----------|-------|-----|\n`;
    videos.forEach((v, idx) => {
      md += `| ${idx + 1} | \`${v.filename}\` | \`${v.format}\` | ${v.autoplay ? 'Yes' : 'No'} | ${v.pages.join(', ')} | [Link](${v.url}) |\n`;
    });
    md += `\n---\n\n`;
  }

  return md;
}

// Standalone CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let evidenceDir = './evidence';
  let downloadDir = null;
  let outMd = null;
  let outJson = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--evidence' && args[i + 1]) evidenceDir = args[++i];
    else if (args[i].startsWith('--evidence=')) evidenceDir = args[i].slice(11);
    else if (args[i] === '--download' && args[i + 1]) downloadDir = args[++i];
    else if (args[i].startsWith('--download=')) downloadDir = args[i].slice(11);
    else if (args[i] === '--out' && args[i + 1]) outMd = args[++i];
    else if (args[i].startsWith('--out=')) outMd = args[i].slice(6);
    else if (args[i] === '--json' && args[i + 1]) outJson = args[++i];
    else if (args[i].startsWith('--json=')) outJson = args[i].slice(7);
  }

  const assets = aggregateAssetsFromEvidence(evidenceDir);
  console.log(`[Assets] Found ${assets.length} unique assets across evidence directory.`);

  if (downloadDir) {
    console.log(`[Assets] Downloading assets into: ${downloadDir}`);
    (async () => {
      for (let i = 0; i < assets.length; i++) {
        const a = assets[i];
        const dest = path.join(downloadDir, a.type === 'font' ? 'fonts' : (a.type === 'video' ? 'videos' : 'images'), a.filename);
        try {
          await downloadFile(a.url, dest);
          a.downloadStatus = 'downloaded';
          a.localPath = dest;
          console.log(`[Assets] [${i + 1}/${assets.length}] Downloaded: ${a.filename}`);
        } catch (e) {
          a.downloadStatus = 'failed';
          console.warn(`[Assets] [${i + 1}/${assets.length}] Failed ${a.url}: ${e.message}`);
        }
      }

      if (outJson) fs.writeFileSync(outJson, JSON.stringify(assets, null, 2), 'utf8');
      if (outMd) fs.writeFileSync(outMd, generateAssetInventoryMarkdown(assets), 'utf8');
    })();
  } else {
    if (outJson) fs.writeFileSync(outJson, JSON.stringify(assets, null, 2), 'utf8');
    if (outMd) fs.writeFileSync(outMd, generateAssetInventoryMarkdown(assets), 'utf8');
    else console.log(JSON.stringify(assets, null, 2));
  }
}

module.exports = {
  aggregateAssetsFromEvidence,
  downloadFile,
  generateAssetInventoryMarkdown
};
