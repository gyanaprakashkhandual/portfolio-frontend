# Your First Express Server

In this guide, you'll build a complete, functional Express server step by step — understanding what every line does and why it's there. By the end, you'll have a working API with multiple routes, proper error handling, and solid foundational patterns.

---

## The Absolute Minimum

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(3000);
```

This works, but it's not production-ready. Let's build it properly.

---

## A Production-Ready First Server

```javascript
// index.js
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────
app.use(express.json());                          // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // Parse form data

// ─── Routes ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to my Express API',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

---

## Breaking Down Each Part

### 1. `require('dotenv').config()`

Loads your `.env` file into `process.env` before anything else runs. Must be the first line.

### 2. `const app = express()`

Creates your Express application instance. This `app` object is the heart of everything — you attach middleware, routes, and listeners to it.

### 3. `app.use(express.json())`

A built-in middleware that parses incoming requests with `Content-Type: application/json` and puts the parsed data on `req.body`. Without this, `req.body` is `undefined` for JSON requests.

### 4. Route Handlers

```javascript
app.get('/path', (req, res) => { ... });
```

- `app.get` — Listens for HTTP GET requests
- `/path` — The URL path to match
- `(req, res)` — The request and response objects
- `res.json()` — Sends a JSON response and ends the response cycle

### 5. The 404 Handler

Placed **after all routes** — if no route matched the request, this catches it. The `app.use()` without a path matches everything.

### 6. The Error Handler

The **4-parameter signature `(err, req, res, next)`** is what tells Express this is an error-handling middleware. It must be placed last. Any middleware calling `next(err)` will jump directly here.

### 7. `app.listen(PORT, callback)`

Starts the HTTP server on the specified port. The callback fires once the server is ready.

---

## HTTP Methods Overview

Express supports all standard HTTP methods:

```javascript
app.get('/users', handler);      // Read
app.post('/users', handler);     // Create
app.put('/users/:id', handler);  // Replace
app.patch('/users/:id', handler);// Update partially
app.delete('/users/:id', handler);// Delete
app.all('/path', handler);       // Match ALL methods
```

---

## Building a Simple REST Endpoint

Let's create a simple in-memory "users" API to demonstrate all HTTP methods:

```javascript
const express = require('express');
const app = express();
app.use(express.json());

// In-memory data store
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];
let nextId = 3;

// GET /users — Get all users
app.get('/users', (req, res) => {
  res.json({ success: true, data: users });
});

// GET /users/:id — Get one user
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// POST /users — Create a user
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }
  const newUser = { id: nextId++, name, email };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// PUT /users/:id — Update a user
app.put('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
  users[index] = { id: users[index].id, ...req.body };
  res.json({ success: true, data: users[index] });
});

// DELETE /users/:id — Delete a user
app.delete('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
  users.splice(index, 1);
  res.status(204).send();  // 204 No Content
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Testing Your Server

**Using curl:**

```bash
# GET all users
curl http://localhost:3000/users

# POST a new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie", "email": "charlie@example.com"}'

# DELETE a user
curl -X DELETE http://localhost:3000/users/1
```

**Using Postman or Thunder Client (VS Code extension)** — Recommended for GUI-based API testing.

---

## Common First-Server Mistakes

**Forgetting `express.json()` middleware**

```javascript
// ❌ req.body is undefined
app.post('/users', (req, res) => {
  console.log(req.body); // undefined!
});

// ✅ Add middleware first
app.use(express.json());
```

**Not ending the response**

```javascript
// ❌ Causes timeout — response never sent
app.get('/', (req, res) => {
  const data = getUsers();
  // forgot to call res.send() or res.json()
});
```

**Route order matters**

```javascript
// ❌ The wildcard catches /users before the specific route
app.get('*', (req, res) => res.send('Catch all'));
app.get('/users', (req, res) => res.send('Users')); // Never reached!

// ✅ Specific routes first, wildcards last
app.get('/users', (req, res) => res.send('Users'));
app.get('*', (req, res) => res.send('Catch all'));
```

---

*Your first Express server is a milestone. The patterns established here — middleware before routes, 404 after routes, error handler last — are the foundation of every Express application you'll build.*