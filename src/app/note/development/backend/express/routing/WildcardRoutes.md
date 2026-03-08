# Wildcard & Optional Routes

Wildcard and optional routes give you flexible path matching — catching ranges of URLs, making segments optional, and handling catch-all fallbacks. These are essential for 404 handlers, file servers, and SPAs.

---

## Wildcard Routes

### `*` — Match Anything

The `*` wildcard matches any characters in a URL segment:

```javascript
// Matches any path
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
```

```javascript
// Matches: /files/anything/here/document.pdf
app.get('/files/*', (req, res) => {
  console.log(req.params[0]); // 'anything/here/document.pdf'
  res.json({ path: req.params[0] });
});
```

### Named Wildcards

```javascript
// Express 5 syntax — named wildcard
app.get('/files/:path(*)', (req, res) => {
  res.json({ filePath: req.params.path });
});
```

---

## Optional Parameters

Append `?` to a parameter name to make it optional:

```javascript
// Both /users and /users/123 match
app.get('/users/:id?', (req, res) => {
  if (req.params.id) {
    res.json({ user: { id: req.params.id } });
  } else {
    res.json({ users: [] });
  }
});
```

### Optional Path Segments

```javascript
// Matches: /blog, /blog/2024, /blog/2024/03
app.get('/blog/:year?/:month?/:slug?', (req, res) => {
  const { year, month, slug } = req.params;
  res.json({ year, month, slug });
});
```

---

## Pattern-Based Routes

Express supports simple patterns using `+`, `?`, and `*` directly in the path string:

```javascript
// ? — Makes the preceding character optional
app.get('/colou?r', handler); // Matches: /color OR /colour

// + — One or more of the preceding character
app.get('/aaa+b', handler); // Matches: /aaab, /aaaab, /aaaaab

// * — Any characters in this position
app.get('/ab*cd', handler); // Matches: /abcd, /abXcd, /abANYTHINGcd

// Parentheses for grouping
app.get('/ab(cd)?e', handler); // Matches: /abe OR /abcde
```

> **Express v5 Note:** Pattern-based route strings (`?`, `+`, `*` in paths) are **deprecated** in Express v5. Use explicit parameters or regex instead.

---

## Regular Expression Routes

For precise matching, pass a regex directly:

```javascript
// Only match numeric IDs
app.get(/^\/users\/(\d+)$/, (req, res) => {
  const id = req.params[0]; // Captured group
  res.json({ id: parseInt(id) });
});

// Match /files/*.pdf
app.get(/^\/files\/(.+\.pdf)$/, (req, res) => {
  res.json({ file: req.params[0] });
});
```

---

## The 404 Catch-All

Always place your catch-all last — after all other routes:

```javascript
// All specific routes above...
app.get('/users', ...);
app.get('/products', ...);

// 404 catch-all — must be LAST
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});
```

---

## Serving a SPA (Single Page Application)

A common use case for wildcards — serve `index.html` for all unmatched routes so the frontend router can handle navigation:

```javascript
const path = require('path');

// Serve static files from build folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes
app.use('/api', require('./routes'));

// Catch-all: serve index.html for any unmatched GET request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

> Only apply the SPA catch-all to GET requests, and only after your API routes. Otherwise API 404s will return HTML instead of JSON.

---

## Wildcard with Middleware

```javascript
// Apply middleware to all /admin/* routes
app.use('/admin/*', requireAdmin, (req, res, next) => {
  console.log(`Admin accessing: ${req.path}`);
  next();
});
```

---

## Practical Examples

### File Download Server

```javascript
app.get('/download/:filename(*)', (req, res) => {
  const { filename } = req.params;
  const safePath = path.join(__dirname, 'uploads', filename);

  // Security: prevent path traversal
  if (!safePath.startsWith(path.join(__dirname, 'uploads'))) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.download(safePath, (err) => {
    if (err) res.status(404).json({ error: 'File not found' });
  });
});
```

### Versioned API Fallback

```javascript
// Match /api/v1/... and /api/v2/...
app.use('/api/v:version', (req, res, next) => {
  const supportedVersions = ['1', '2'];
  if (!supportedVersions.includes(req.params.version)) {
    return res.status(400).json({
      error: `API version ${req.params.version} not supported`,
      supported: supportedVersions,
    });
  }
  next();
});
```

---

*Use wildcards sparingly and purposefully — for 404 handlers, SPA fallbacks, and file serving. Specific routes are always preferable to wildcards for predictability and security.*