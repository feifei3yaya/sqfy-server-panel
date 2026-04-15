const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const port = Number(process.env.PORT || 80);
const rootDir = path.join(__dirname, 'dist');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

const sendFile = (filePath, res) => {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const requestPath = decodeURIComponent(requestUrl.pathname);
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const resolvedPath = path.join(rootDir, safePath);

  if (!resolvedPath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const serveIndex = () => {
    const indexPath = path.join(rootDir, 'index.html');
    fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
      if (indexErr) {
        res.writeHead(500);
        res.end('index.html not found');
        return;
      }
      sendFile(indexPath, res);
    });
  };

  fs.stat(resolvedPath, (err, stat) => {
    if (!err && stat.isFile()) {
      sendFile(resolvedPath, res);
      return;
    }

    if (!err && stat.isDirectory()) {
      const indexPath = path.join(resolvedPath, 'index.html');
      fs.stat(indexPath, (indexErr, indexStat) => {
        if (!indexErr && indexStat.isFile()) {
          sendFile(indexPath, res);
          return;
        }
        serveIndex();
      });
      return;
    }

    serveIndex();
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static site is running on port ${port}`);
});
