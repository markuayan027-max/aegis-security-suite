---
name: native-esm-backend-patterns
description: Use when developing, optimizing, or maintaining zero-npm-dependency Node.js native ESM backend servers. Covers HTTP 206 Partial Content video streaming, state persistence, structured routing, graceful process termination, and Cloud SQL integrations.
---

# Native ESM Backend Patterns Skill

## Mission
Ensure performant, hardened, and portable Node.js 20+ backend architectures with zero third-party npm dependencies.

## Key Patterns & Architectural Standards

### 1. HTTP 206 Partial Content Video & Asset Streaming
Browsers require Range header support to play MP4/WebM videos smoothly without buffering the entire file into memory:
```javascript
const stat = fs.statSync(filePath);
const fileSize = stat.size;
const range = req.headers.range;

if (range && (ext === '.mp4' || ext === '.webm')) {
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunksize = (end - start) + 1;
  const file = fs.createReadStream(filePath, { start, end });
  const head = {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': contentType,
  };
  res.writeHead(206, head);
  file.pipe(res);
  return;
}
```

### 2. State Persistence & Safe Parsing
- Keep persistent JSON store file read/write operations atomic or handled with graceful fallbacks (`fs.writeFileSync`).
- Always validate incoming JSON bodies with `try / catch`:
  ```javascript
  function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 5 * 1024 * 1024) { // 5MB limit
          req.destroy();
          reject(new Error('Payload too large'));
        }
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(new Error('Invalid JSON format'));
        }
      });
      req.on('error', reject);
    });
  }
  ```

### 3. Graceful Process Lifecycle
Ensure smooth shutdown on container signals (`SIGTERM`, `SIGINT`):
```javascript
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
```

### 4. CORS & Security Headers
Always include baseline security headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-token');
```
Handle `OPTIONS` preflight with `HTTP 204 No Content`.
