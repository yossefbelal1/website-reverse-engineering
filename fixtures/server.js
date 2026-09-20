/**
 * server.js
 * 
 * Lightweight, zero-dependency static HTTP server for serving the realistic test fixture.
 * 
 * Usage:
 *   node fixtures/server.js [--port 4040]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};

function createFixtureServer(rootDir, port = 4040) {
  const server = http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      let pathname = decodeURIComponent(parsedUrl.pathname);

      // Handle clean routes: try pathname, pathname/index.html, pathname.html
      let filePath = path.join(rootDir, pathname);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
      } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        if (ext === '.xml' || ext === '.txt') {
          let content = fs.readFileSync(filePath, 'utf8');
          content = content.replace(/127\.0\.0\.1:\d+/g, `127.0.0.1:${port}`);
          res.end(content);
        } else {
          fs.createReadStream(filePath).pipe(res);
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Not Found</h1>');
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Internal Server Error: ${err.message}`);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port, url: `http://127.0.0.1:${port}` });
    });
  });
}

if (require.main === module) {
  const port = parseInt(process.argv[2] || '4040', 10);
  const rootDir = path.join(__dirname, 'realistic-site');
  createFixtureServer(rootDir, port).then(({ url }) => {
    console.log(`[FixtureServer] Realistic site running at: ${url}`);
  });
}

module.exports = { createFixtureServer };
