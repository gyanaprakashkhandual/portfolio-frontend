# Introduction to Express.js

Express.js is a minimal, unopinionated, and fast web application framework for Node.js. It provides a thin layer of fundamental web application features without obscuring Node.js features. Since its release in 2010, Express has become the de facto standard for building web servers and APIs with Node.js.

---

## What is Express.js?

Express is a server-side (backend) JavaScript framework that runs on top of Node.js. It simplifies the process of building web applications and RESTful APIs by providing a clean, intuitive API for:

- Handling HTTP requests and responses
- Defining application routes
- Integrating middleware
- Managing application-level and route-level logic

It does not enforce a specific project structure or ORM, making it highly flexible and adaptable to any architecture.

---

## Why Use Express?

**Minimalist by Design** — Express gives you just enough structure to build powerful applications without forcing a rigid architecture on you.

**Huge Ecosystem** — Thousands of compatible npm middleware packages exist for authentication, validation, logging, rate limiting, and more.

**Performance** — Express adds very little overhead on top of Node.js's native HTTP module, keeping it lean and fast.

**Industry Adoption** — Used by companies like IBM, Accenture, Uber, and countless startups. A skill every backend JavaScript developer is expected to have.

**Learning Curve** — One of the easiest frameworks to get started with. You can have a working server in under 10 lines of code.

---

## Core Concepts

### Application

An Express application is created by calling the `express()` function. This `app` object is the central piece of your server.

```javascript
const express = require('express');
const app = express();
```

### Routing

Express allows you to define routes that map HTTP methods and URL paths to handler functions.

```javascript
app.get('/users', (req, res) => {
  res.send('Get all users');
});
```

### Middleware

Middleware functions are functions that have access to the request (`req`), response (`res`), and the `next` middleware function in the request-response cycle. They are the backbone of every Express application.

```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

### Request & Response

Express wraps Node's native `http.IncomingMessage` and `http.ServerResponse` with additional convenience methods, giving you `req` and `res` objects with powerful helpers like `res.json()`, `res.send()`, `req.params`, and `req.body`.

---

## Express in the Node.js Ecosystem

```
Client (Browser / Mobile App)
        │
        ▼
   HTTP Request
        │
        ▼
  Node.js HTTP Module
        │
        ▼
   Express.js App
   ┌────────────────────────┐
   │  Middleware Stack       │
   │  → Logging             │
   │  → Body Parsing        │
   │  → Authentication      │
   │  → Route Handling      │
   │  → Error Handling      │
   └────────────────────────┘
        │
        ▼
   HTTP Response
```

---

## A Minimal Express Server

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

That's it — a fully functional HTTP server in 8 lines.

---

## Express vs Raw Node.js HTTP

Without Express, handling even a simple route requires much more boilerplate:

```javascript
// Raw Node.js
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello' }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000);
```

Express abstracts all of this into clean, readable routing and response methods.

---

## What Express Does NOT Do

It is equally important to know what Express intentionally leaves out:

- **No built-in ORM** — You choose your database layer (Mongoose, Prisma, Sequelize, etc.)
- **No templating engine by default** — You can add EJS, Pug, Handlebars, etc.
- **No validation** — Use libraries like Joi, Zod, or express-validator
- **No authentication** — Use Passport.js, JWT, or custom middleware
- **No folder structure enforcement** — You organize however you like

This is by design. Express is a foundation, not a full-stack solution.

---

## Current Status

Express.js is currently maintained under the OpenJS Foundation. As of 2024, **Express v5** is available, bringing improvements like:

- Native async/await error handling
- Better TypeScript support
- Performance improvements
- Removal of deprecated APIs

> **Note:** The majority of production apps still run on Express v4. Both versions are covered in this documentation series.

---

## Resources

- [Official Express.js Documentation](https://expressjs.com)
- [Express GitHub Repository](https://github.com/expressjs/express)
- [npm Package Page](https://www.npmjs.com/package/express)
- [OpenJS Foundation](https://openjsf.org)

---

*Express.js remains one of the most downloaded npm packages in the world — its simplicity, flexibility, and maturity make it the go-to choice for backend JavaScript development.*