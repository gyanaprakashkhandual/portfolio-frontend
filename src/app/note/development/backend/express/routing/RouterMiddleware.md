# Router-Level Middleware

Router-level middleware works exactly like application-level middleware but is bound to an instance of `express.Router()`. It allows you to apply middleware selectively to specific route groups rather than the entire application.

---

## Application vs Router-Level Middleware

```javascript
// Application-level — runs for ALL requests
app.use(morgan('dev'));
app.use(express.json());

// Router-level — runs only for requests matching this router's prefix
const apiRouter = express.Router();
apiRouter.use(authenticate); // Only runs for /api/* routes
```

---

## Basic Usage

```javascript
const express = require('express');
const router = express.Router();

// Middleware for all routes in this router
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

router.get('/', (req, res) => res.json({ message: 'Home' }));
router.get('/about', (req, res) => res.json({ message: 'About' }));

module.exports = router;
```

---

## Route-Specific Middleware

Apply middleware to specific routes within a router:

```javascript
const router = express.Router();

const checkAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Token required' });
  }
  next();
};

const validateId = (req, res, next) => {
  if (isNaN(parseInt(req.params.id))) {
    return res.status(400).json({ error: 'ID must be a number' });
  }
  next();
};

// validateId runs only for /:id routes
router.get('/:id', validateId, (req, res) => res.json({ id: req.params.id }));
router.put('/:id', checkAuth, validateId, (req, res) => res.json({ updated: true }));
router.delete('/:id', checkAuth, validateId, (req, res) => res.status(204).send());

// No middleware on this route
router.get('/', (req, res) => res.json({ items: [] }));
```

---

## Middleware for Specific HTTP Methods

```javascript
router.get('*', (req, res, next) => {
  // Caching headers for all GET requests in this router
  res.setHeader('Cache-Control', 'public, max-age=300');
  next();
});
```

---

## Real-World Pattern — Protected vs Public Routes

A common pattern is to have some routes public and others protected within the same feature:

```javascript
// routes/post.routes.js
const router = express.Router();
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');

// ── Public Routes ──────────────────────────────
router.get('/', postController.getAll);
router.get('/:id', postController.getOne);
router.get('/search', postController.search);

// ── Protected Routes ───────────────────────────
// Apply protect middleware to all routes below this point
router.use(protect);

router.post('/', postController.create);
router.put('/:id', postController.update);
router.delete('/:id', postController.remove);

module.exports = router;
```

> `router.use(protect)` placed midway in the file only affects routes defined after it.

---

## Layered Router Middleware

```javascript
// routes/admin.routes.js
const router = express.Router();
const { protect, requireAdmin, auditLog } = require('../middleware/auth');

// Stack middleware — runs in order for all admin routes
router.use(protect);
router.use(requireAdmin);
router.use(auditLog); // Log all admin actions

router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stats', adminController.getStats);

module.exports = router;
```

---

## Middleware with `router.param()`

`router.param()` scoped to a specific router — doesn't affect the rest of the app:

```javascript
// routes/user.routes.js
const router = express.Router();

// Only runs when :userId appears in THIS router's routes
router.param('userId', async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.targetUser = user;
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/:userId', (req, res) => res.json(req.targetUser));
router.put('/:userId', (req, res) => res.json({ updated: req.targetUser }));

module.exports = router;
```

---

## Middleware Execution Order

The order middleware is registered matters:

```javascript
const router = express.Router();

router.use((req, res, next) => {
  console.log('1 — runs first');
  next();
});

router.get('/test', 
  (req, res, next) => {
    console.log('2 — route middleware');
    next();
  },
  (req, res) => {
    console.log('3 — route handler');
    res.send('done');
  }
);

router.use((req, res, next) => {
  console.log('This only runs if no route matched');
  next();
});
```

---

## Conditional Middleware

Apply middleware conditionally based on the environment or request:

```javascript
// Only apply rate limiter in production
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

if (process.env.NODE_ENV === 'production') {
  router.use(limiter);
}
```

---

*Router-level middleware is the clean, scoped alternative to sprinkling auth and validation checks throughout your application. Define your middleware once at the router level and let it protect the routes that need it.*