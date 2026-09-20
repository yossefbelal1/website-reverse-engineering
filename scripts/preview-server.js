/**
 * preview-server.js
 * 
 * Production-grade, zero-dependency local static HTTP server for previewing
 * reconstructed websites (such as benchmark-workspace) with clean URL routing,
 * correct MIME types, and CORS support.
 * 
 * Usage:
 *   node scripts/preview-server.js [--dir ./benchmark-workspace] [--port 3000] [--host 127.0.0.1]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function resolveStaticPath(rootDir, pathname) {
  let cleanPath = pathname.replace(/^\/+/, '');
  let filePath = path.join(rootDir, cleanPath);

  // 1. Direct file match
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  // 2. Directory with index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const idx = path.join(filePath, 'index.html');
    if (fs.existsSync(idx) && fs.statSync(idx).isFile()) {
      return idx;
    }
  }

  // 3. Clean route without .html extension (e.g. /about -> about.html or about/index.html)
  const withHtml = `${filePath}.html`;
  if (fs.existsSync(withHtml) && fs.statSync(withHtml).isFile()) {
    return withHtml;
  }

  const asDirIndex = path.join(filePath, 'index.html');
  if (fs.existsSync(asDirIndex) && fs.statSync(asDirIndex).isFile()) {
    return asDirIndex;
  }

  return null;
}

function startPreviewServer(options = {}) {
  const rootDir = path.resolve(options.dir || './benchmark-workspace');
  const port = parseInt(options.port || process.env.PORT || '3000', 10);
  const host = options.host || '127.0.0.1';

  if (!fs.existsSync(rootDir)) {
    throw new Error(`[PreviewServer] Directory does not exist: ${rootDir}`);
  }

  const server = http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://${host}:${port}`);
      let pathname = decodeURIComponent(parsedUrl.pathname);

      // Support programmatic shutdown endpoint
      if (pathname === '/_shutdown') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'shutting down' }));
        console.log('[PreviewServer] Shutdown request received. Closing server...');
        setTimeout(() => {
          server.close(() => {
            console.log('[PreviewServer] Server stopped successfully.');
            process.exit(0);
          });
        }, 100);
        return;
      }

      const filePath = resolveStaticPath(rootDir, pathname);

      if (filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Content-Type-Options': 'nosniff'
        });

        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;padding:2rem;"><h1>404 Not Found</h1><p>Route <code>${pathname}</code> was not found in <code>${rootDir}</code>.</p></body></html>`);
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Internal Server Error: ${err.message}`);
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, host, () => {
      const url = `http://${host}:${port}`;
      console.log(`[PreviewServer] Serving '${rootDir}'`);
      console.log(`[PreviewServer] Local URL: ${url}`);
      resolve({ server, port, host, url, rootDir });
    });
  });
}

// Standalone execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let dir = './benchmark-workspace';
  let port = 3000;
  let host = '127.0.0.1';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && args[i + 1]) dir = args[++i];
    else if (args[i].startsWith('--dir=')) dir = args[i].slice(6);
    else if (args[i] === '--port' && args[i + 1]) port = parseInt(args[++i], 10);
    else if (args[i].startsWith('--port=')) port = parseInt(args[i].slice(7), 10);
    else if (args[i] === '--host' && args[i + 1]) host = args[++i];
    else if (args[i].startsWith('--host=')) host = args[i].slice(7);
  }

  startPreviewServer({ dir, port, host }).then(({ url, port }) => {
    console.log(`\n===========================================================`);
    console.log(`🚀 LOCAL PREVIEW SERVER ACTIVE`);
    console.log(`   URL:  ${url}`);
    console.log(`   PORT: ${port}`);
    console.log(`   Press Ctrl+C or send GET ${url}/_shutdown to stop`);
    console.log(`===========================================================\n`);
  }).catch((err) => {
    console.error(`[PreviewServer Error] Failed to start:`, err.message);
    process.exit(1);
  });
}

module.exports = { startPreviewServer, resolveStaticPath, MIME_TYPES };
