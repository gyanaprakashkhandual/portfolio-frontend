# Route Parameters

Route parameters are named URL segments used to capture values at a specific position in the URL. They are the primary way to identify a specific resource in a RESTful API.

---

## Basic Route Parameters

Define a route parameter with a colon (`:`) prefix:

```javascript
app.get('/users/:id', (req, res) => {
  console.log(req.params.id); // '123'
  res.json({ userId: req.params.id });
});
```

**Request:** `GET /users/123`  
**`req.params`:** `{ id: '123' }`

> **Important:** Route parameters are always strings. If you need a number, parse it explicitly: `parseInt(req.params.id)` or `Number(req.params.id)`.

---

## Multiple Parameters

```javascript
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId });
});
```

**Request:** `GET /users/42/posts/7`  
**`req.params`:** `{ userId: '42', postId: '7' }`

---

## Optional Parameters

Use `?` to make a parameter optional:

```javascript
app.get('/users/:id/profile/:section?', (req, res) => {
  const { id, section = 'overview' } = req.params;
  res.json({ userId: id, section });
});
```

**Request:** `GET /users/1/profile` → `{ userId: '1', section: 'overview' }`  
**Request:** `GET /users/1/profile/settings` → `{ userId: '1', section: 'settings' }`

---

## Route Parameter Validation with `app.param()`

`app.param()` lets you define a callback that runs whenever a specific named parameter is present. Use it to validate or preload resources:

```javascript
// This runs whenever :userId is in the route
app.param('userId', async (req, res, next, id) => {
  // Validate it's a valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.user = user; // Attach to req for downstream handlers
    next();
  } catch (err) {
    next(err);
  }
});

// Now req.user is already loaded in all routes with :userId
app.get('/users/:userId', (req, res) => {
  res.json(req.user);
});

app.put('/users/:userId', (req, res) => {
  // req.user already loaded by app.param
  res.json({ updated: req.user });
});
```

---

## Parameter Patterns with Regular Expressions

You can restrict what a parameter matches using regex:

```javascript
// Only match numeric IDs
app.get('/users/:id(\\d+)', (req, res) => {
  res.json({ id: parseInt(req.params.id) });
});

// Only match slugs (letters, numbers, hyphens)
app.get('/posts/:slug([a-z0-9-]+)', (req, res) => {
  res.json({ slug: req.params.slug });
});
```

**Request:** `GET /users/abc` — Does NOT match (not numeric)  
**Request:** `GET /users/123` — Matches ✓

---

## Wildcard Parameters

Capture multiple path segments with `*`:

```javascript
app.get('/files/*', (req, res) => {
  console.log(req.params[0]); // 'documents/reports/2024.pdf'
  res.json({ path: req.params[0] });
});
```

**Request:** `GET /files/documents/reports/2024.pdf`  
**`req.params[0]`:** `'documents/reports/2024.pdf'`

---

## Real-World Example — Nested Resources

```javascript
const express = require('express');
const app = express();
app.use(express.json());

// Preload post by ID
app.param('postId', async (req, res, next, id) => {
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Post ID must be a number' });
  }
  // Simulate DB lookup
  req.post = { id: parseInt(id), title: 'Sample Post', userId: 1 };
  next();
});

// GET /posts/:postId/comments
app.get('/posts/:postId/comments', (req, res) => {
  res.json({
    post: req.post,
    comments: [
      { id: 1, text: 'Great post!' },
      { id: 2, text: 'Thanks for sharing.' },
    ],
  });
});

// POST /posts/:postId/comments
app.post('/posts/:postId/comments', (req, res) => {
  const newComment = { id: Date.now(), ...req.body, postId: req.post.id };
  res.status(201).json({ comment: newComment });
});

// DELETE /posts/:postId/comments/:commentId
app.delete('/posts/:postId/comments/:commentId', (req, res) => {
  const { commentId } = req.params;
  res.status(204).send();
});

app.listen(3000);
```

---

## Common Patterns

### Converting Parameter to Number

```javascript
app.get('/products/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID must be a valid number' });
  }
  req.productId = id; // Attach as number
  next();
});
```

### Slug-based Routes (Blog/CMS)

```javascript
app.get('/blog/:year/:month/:slug', (req, res) => {
  const { year, month, slug } = req.params;
  res.json({
    year: parseInt(year),
    month: parseInt(month),
    slug,
  });
});
```

**Request:** `GET /blog/2024/03/my-first-post`  
**Result:** `{ year: 2024, month: 3, slug: 'my-first-post' }`

---

## `req.params` vs `req.query` vs `req.body`

```
URL: /users/42/posts?page=2&limit=10
Body: { "status": "published" }

req.params → { id: '42' }           ← From the URL path
req.query  → { page: '2', limit: '10' } ← From the query string
req.body   → { status: 'published' }    ← From the request body
```

---

*Route parameters are the backbone of RESTful resource identification. Use `app.param()` for resource preloading — it removes duplication when the same parameter appears across multiple routes.*