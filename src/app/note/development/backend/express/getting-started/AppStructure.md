# Application Structure

A well-organized Express application is easier to maintain, scale, and test. This guide covers the most common and battle-tested folder structures — from simple projects to large-scale production applications.

---

## Why Structure Matters

Express is unopinionated — it doesn't enforce any folder structure. This freedom is powerful, but it can lead to spaghetti code if you're not intentional from the start. A good structure:

- Separates concerns (routing, business logic, data access)
- Makes it easy to onboard new developers
- Scales gracefully as the project grows
- Enables effective unit and integration testing

---

## Level 1 — Simple / Beginner

For small apps, scripts, or proof-of-concept projects.

```
my-app/
├── index.js          ← Entry point (server + routes all in one)
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

Everything lives in `index.js`. Fine for learning, but grows unwieldy quickly.

---

## Level 2 — Organized by Type (Most Common)

The standard structure for most Express apps. Files are grouped by their **type** (routes, controllers, models, etc.).

```
my-app/
├── src/
│   ├── routes/
│   │   ├── index.js         ← Main router (registers all sub-routers)
│   │   ├── user.routes.js
│   │   ├── product.routes.js
│   │   └── auth.routes.js
│   │
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── product.controller.js
│   │   └── auth.controller.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   └── product.model.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── config/
│   │   ├── db.js            ← Database connection
│   │   └── env.js           ← Validated environment variables
│   │
│   └── utils/
│       ├── ApiError.js
│       └── asyncHandler.js
│
├── app.js            ← Express app setup (no listen call)
├── server.js         ← Starts the server (calls app.listen)
├── .env
├── .env.example
├── .gitignore
└── package.json
```

### Why separate `app.js` from `server.js`?

```javascript
// app.js — Pure Express app (no server binding)
const express = require('express');
const app = express();

app.use(express.json());
// ...routes and middleware

module.exports = app;
```

```javascript
// server.js — Starts the server
const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

This separation allows you to import `app` in tests without actually starting a server — critical for `supertest` integration testing.

---

## Level 3 — Feature-Based (Domain-Driven)

For large applications with many features, organize by **feature/domain** instead of by type:

```
my-app/
├── src/
│   ├── features/
│   │   ├── users/
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.model.js
│   │   │   └── user.validation.js
│   │   │
│   │   ├── products/
│   │   │   ├── product.routes.js
│   │   │   ├── product.controller.js
│   │   │   ├── product.service.js
│   │   │   └── product.model.js
│   │   │
│   │   └── auth/
│   │       ├── auth.routes.js
│   │       ├── auth.controller.js
│   │       └── auth.service.js
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   │
│   └── index.js       ← Register all feature routers
│
├── app.js
├── server.js
└── package.json
```

**Advantage:** Everything related to a feature is co-located. Adding, removing, or modifying a feature is contained to one folder.

---

## The Role of Each Layer

### Routes
Define URL endpoints and delegate to controllers. No business logic here.

```javascript
// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', protect, userController.createUser);

module.exports = router;
```

### Controllers
Handle the HTTP layer — parse `req`, call services, send `res`. No direct database calls.

```javascript
// controllers/user.controller.js
const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.status(200).json({ success: true, data: users });
});
```

### Services
Contain the **business logic**. Interact with models. No HTTP awareness.

```javascript
// services/user.service.js
const User = require('../models/user.model');

exports.findAll = async () => {
  return await User.find().select('-password');
};

exports.findById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  return user;
};
```

### Models
Define the data schema and interact with the database.

### Middleware
Reusable functions that run before route handlers (auth, logging, validation).

---

## The `config/env.js` Pattern

Validate all environment variables at startup so your app fails fast with a clear error:

```javascript
// config/env.js
const required = ['PORT', 'DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: parseInt(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
};
```

---

## The `asyncHandler` Utility

Avoid repeating `try/catch` in every controller:

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
```

Usage:

```javascript
// Instead of this:
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Write this:
app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));
```

---

## Registering Routes in `app.js`

```javascript
// app.js
const express = require('express');
const app = express();

const userRoutes = require('./src/routes/user.routes');
const productRoutes = require('./src/routes/product.routes');
const authRoutes = require('./src/routes/auth.routes');
const errorMiddleware = require('./src/middleware/error.middleware');

app.use(express.json());

// Mount routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auth', authRoutes);

// Error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
```

---

## Summary

| Project Size | Recommended Structure |
|---|---|
| Small / Learning | Single `index.js` |
| Medium | Organized by type (routes/controllers/models) |
| Large / Team | Feature-based / domain-driven |

Regardless of structure, always keep these rules:
- Separate `app.js` from `server.js`
- Controllers handle HTTP, services handle business logic
- Validate environment variables at startup
- Use `asyncHandler` to avoid try/catch repetition

---

*The best structure is the one your team can navigate intuitively. Start simple, and refactor as complexity grows — don't over-engineer from day one.*