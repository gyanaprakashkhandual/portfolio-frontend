# express.Router()

`express.Router()` creates a mini Express application that can handle its own middleware and routes. It's the essential tool for organizing your application's routes into modular, reusable chunks.

---

## Why Use Router?

Without `Router`, all routes pile up in `app.js`:

```javascript
// ❌ Everything in one file — unmanageable at scale
app.get('/users', ...);
app.post('/users', ...);
app.get('/users/:id', ...);
app.put('/users/:id', ...);
app.delete('/users/:id', ...);
app.get('/products', ...);
app.post('/products', ...);
// ...50 more routes
```

With `Router`, each feature has its own file:

```javascript
// ✅ app.js — clean and organized
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);
```

---

## Basic Usage

### Step 1: Create a Router

```javascript
// routes/user.routes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get all users' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get user ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create user' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update user ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.status(204).send();
});

module.exports = router;
```

### Step 2: Mount the Router in `app.js`

```javascript
// app.js
const express = require('express');
const app = express();

const userRouter = require('./routes/user.routes');

app.use(express.json());
app.use('/api/users', userRouter); // Mount at /api/users

module.exports = app;
```

**Result — These routes are now active:**

```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

---

## Router-Specific Middleware

You can attach middleware to a router that only affects routes in that router:

```javascript
// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');

// This middleware applies to ALL routes in this router
router.use(protect);
router.use(requireAdmin);

router.get('/users', (req, res) => res.json({ users: [] }));
router.get('/stats', (req, res) => res.json({ stats: {} }));

module.exports = router;
```

---

## Router Options

### `mergeParams`

By default, parameters from the parent router are not available in child routers. Use `{ mergeParams: true }` to access parent params:

```javascript
// routes/comment.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // Access parent params

router.get('/', (req, res) => {
  // Can access req.params.postId from parent route
  res.json({ postId: req.params.postId, comments: [] });
});

router.post('/', (req, res) => {
  res.status(201).json({ postId: req.params.postId, comment: req.body });
});

module.exports = router;
```

```javascript
// app.js
const postRouter = require('./routes/post.routes');
const commentRouter = require('./routes/comment.routes');

app.use('/posts', postRouter);

// Mount nested router
app.use('/posts/:postId/comments', commentRouter);
// Now GET /posts/42/comments → req.params.postId = '42'
```

### `strict`

By default, `/users` and `/users/` are treated the same. `{ strict: true }` makes Express differentiate between them:

```javascript
const router = express.Router({ strict: true });
// /users  → matches
// /users/ → does NOT match
```

### `caseSensitive`

By default, routing is case-insensitive. `/Users` and `/users` match the same route. Enable with:

```javascript
const router = express.Router({ caseSensitive: true });
// /Users → does NOT match /users
```

---

## Centralized Route Registration

Create an `index.js` that registers all routes in one place:

```javascript
// routes/index.js
const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/products', require('./product.routes'));
router.use('/orders', require('./order.routes'));

module.exports = router;
```

```javascript
// app.js — super clean
const app = express();
app.use('/api/v1', require('./routes'));
```

All routes are now prefixed with `/api/v1/`.

---

## Full Example — Modular User Routes with Controller

```javascript
// controllers/user.controller.js
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

exports.getAll = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
});

exports.getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, data: user });
});

exports.create = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

exports.update = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, data: user });
});

exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.status(204).send();
});
```

```javascript
// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { validateCreateUser } = require('../middleware/validators');

router
  .route('/')
  .get(userController.getAll)
  .post(protect, validateCreateUser, userController.create);

router
  .route('/:id')
  .get(userController.getOne)
  .put(protect, userController.update)
  .delete(protect, userController.remove);

module.exports = router;
```

---

*`express.Router()` is the cornerstone of scalable Express architecture. Every meaningful Express app beyond the "hello world" stage should use routers to separate concerns and keep code maintainable.*