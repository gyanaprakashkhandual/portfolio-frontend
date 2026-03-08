# Express vs Fastify vs Koa

Choosing the right Node.js web framework is an important architectural decision. This guide compares the three most popular options — Express, Fastify, and Koa — across performance, ecosystem, developer experience, and use cases.

---

## The Contenders

| | Express | Fastify | Koa |
|---|---|---|---|
| **Created** | 2010 | 2016 | 2013 |
| **Creator** | TJ Holowaychuk | Matteo Collina, Tomas Della Vedova | TJ Holowaychuk |
| **GitHub Stars** | ~65k | ~32k | ~35k |
| **Weekly Downloads** | ~35M | ~9M | ~1.5M |
| **Philosophy** | Minimal, unopinionated | Performance-first, schema-driven | Modern, async-first |

---

## Express.js

The industry standard. Express has the largest ecosystem, the most tutorials, and the most production deployments of any Node.js framework.

### Strengths

- **Massive ecosystem** — Thousands of compatible middleware packages
- **Community & support** — Answers to almost any problem are a Google search away
- **Simplicity** — Extremely easy to learn and get started with
- **Flexibility** — No opinions on structure, ORM, or validation
- **Industry adoption** — Expected knowledge for most Node.js backend roles

### Weaknesses

- **Callback-based origins** — Async/await support is functional but not native in v4
- **Performance** — Slower than Fastify due to less optimized routing and serialization
- **No built-in validation** — Must rely on third-party libraries
- **Error handling** — Async errors not automatically caught in v4

### When to Choose Express

- Your team already knows it
- You need maximum npm ecosystem compatibility
- You're building a standard REST API
- Hiring developers who know Node.js (they know Express)
- Prototyping quickly

```javascript
// Express
const express = require('express');
const app = express();

app.use(express.json());

app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
```

---

## Fastify

Fastify is built for **raw performance**. It uses JSON Schema for validation and serialization, which enables it to be significantly faster than Express on throughput benchmarks.

### Strengths

- **Performance** — Benchmarks show 2–3x more requests/second than Express
- **Built-in validation** — JSON Schema validation out of the box
- **Fast serialization** — Uses `fast-json-stringify` instead of `JSON.stringify`
- **TypeScript support** — First-class TypeScript types
- **Plugin system** — Clean, scoped plugin architecture with lifecycle hooks
- **Active development** — Modern codebase, async-first

### Weaknesses

- **Steeper learning curve** — Schema-driven approach takes time to master
- **Smaller ecosystem** — Fewer middleware and plugins vs Express
- **Schema verbosity** — Defining schemas for every route can feel tedious

### When to Choose Fastify

- Performance is a critical requirement
- You're building high-throughput APIs (millions of requests/day)
- You want built-in validation without extra libraries
- You're starting fresh with TypeScript

```javascript
// Fastify
const fastify = require('fastify')({ logger: true });

const schema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' }
      }
    }
  }
};

fastify.get('/users/:id', { schema }, async (request, reply) => {
  const user = await User.findById(request.params.id);
  return user; // No res.json() needed — Fastify handles serialization
});
```

---

## Koa

Koa was created by the same team as Express as a "next generation" framework. It uses `async/await` natively and has a very thin core — even thinner than Express.

### Strengths

- **Modern async/await** — Built on async middleware from day one
- **Elegant middleware model** — "Onion" middleware (before + after control)
- **Smaller core** — Even more minimal than Express
- **`ctx` object** — Combines `req` and `res` into a single context object

### Weaknesses

- **Small ecosystem** — Far fewer middleware packages than Express
- **No built-in router** — Must install `@koa/router` separately
- **Community** — Much smaller community and fewer tutorials
- **Adoption** — Significantly less industry adoption

### When to Choose Koa

- You want maximum control over every layer
- You love the async/await-first design
- You're building an internal tool or specialized server

```javascript
// Koa
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

// Koa's "onion" middleware — runs both before AND after downstream
app.use(async (ctx, next) => {
  const start = Date.now();
  await next(); // downstream
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`); // after downstream
});

router.get('/users/:id', async (ctx) => {
  const user = await User.findById(ctx.params.id);
  ctx.body = user; // Sets response body and status 200
});

app.use(router.routes());
```

---

## Head-to-Head Comparison

### Performance (Requests/second — approximate)

```
Fastify     ~75,000 req/s
Koa         ~45,000 req/s
Express     ~35,000 req/s
```

> These numbers vary wildly based on hardware, payload size, and benchmark methodology. For most applications, this difference is irrelevant — your bottleneck is the database, not the framework.

### Middleware Model

**Express** — Linear pipeline, left to right:

```
Request → MW1 → MW2 → Route Handler → Response
```

**Koa** — Onion model, before + after:

```
Request → MW1.before → MW2.before → Handler → MW2.after → MW1.after → Response
```

**Fastify** — Hook-based lifecycle:

```
Request → onRequest → preHandler → Handler → onSend → Response
```

### Error Handling

```javascript
// Express v4 — Must wrap async with try/catch or asyncHandler
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Express v5 — async errors auto-forwarded to error handler
app.get('/users', async (req, res) => {
  const users = await User.find(); // Error auto-caught
  res.json(users);
});

// Koa — try/catch in middleware, or use koa-onerror
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
  }
});

// Fastify — setErrorHandler
fastify.setErrorHandler((error, request, reply) => {
  reply.status(500).send({ error: error.message });
});
```

---

## Summary Decision Guide

```
Need maximum ecosystem + hiring ease?         → Express
Performance is a hard requirement?            → Fastify
Want async-first with minimal core?           → Koa
Building a serious TypeScript API?            → Fastify
Team already knows a framework?               → Stick with it
```

---

## The Bottom Line

For the vast majority of applications — CRUD APIs, authentication services, microservices — Express is perfectly capable and the pragmatic choice. The performance difference between frameworks only becomes relevant at very high scale, and by then you have much bigger architectural concerns.

Learn Express deeply first. Once you understand routing, middleware, and the request/response lifecycle, switching to Fastify or Koa is straightforward.

---

*The best framework is the one your team ships quality software with consistently. Don't optimize for benchmark numbers — optimize for developer productivity and maintainability.*