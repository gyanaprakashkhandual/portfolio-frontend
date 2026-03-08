# Modular & Nested Routes

Modular routes break your application's routes into separate files organized by feature. Nested routes represent hierarchical resource relationships (e.g., comments belonging to a post). Together, they enable large-scale Express applications to remain organized and maintainable.

---

## Modular Routes — Organizing by Feature

### Project Structure

```
src/
├── routes/
│   ├── index.js           ← Aggregates all routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── product.routes.js
│   └── order.routes.js
├── controllers/
├── middleware/
└── app.js
```

### The Route Aggregator (`routes/index.js`)

```javascript
// routes/index.js
const { Router } = require('express');
const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/products', require('./product.routes'));
router.use('/orders', require('./order.routes'));

module.exports = router;
```

```javascript
// app.js
const express = require('express');
const app = express();

app.use(express.json());
app.use('/api/v1', require('./routes'));

module.exports = app;
```

**All routes now available as:**

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
GET    /api/v1/users
GET    /api/v1/users/:id
GET    /api/v1/products
GET    /api/v1/orders
```

---

## Nested Routes — Hierarchical Resources

Nested routes express ownership or containment relationships between resources. For example, comments belonging to a post: `/posts/:postId/comments`.

### Option 1: Inline Nesting (Simple)

```javascript
// routes/post.routes.js
const { Router } = require('express');
const router = Router();
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');

// Post routes
router.get('/', postController.getAll);
router.post('/', postController.create);
router.get('/:id', postController.getOne);
router.put('/:id', postController.update);
router.delete('/:id', postController.remove);

// Nested comment routes — inline
router.get('/:postId/comments', commentController.getByPost);
router.post('/:postId/comments', commentController.create);
router.delete('/:postId/comments/:commentId', commentController.remove);

module.exports = router;
```

### Option 2: Separate Router with `mergeParams` (Preferred for Large Apps)

Split the comment routes into their own file and link them:

```javascript
// routes/comment.routes.js
const { Router } = require('express');
const router = Router({ mergeParams: true }); // ← Required to access :postId
const commentController = require('../controllers/comment.controller');

router.get('/', commentController.getByPost);     // GET /posts/:postId/comments
router.post('/', commentController.create);       // POST /posts/:postId/comments
router.get('/:id', commentController.getOne);     // GET /posts/:postId/comments/:id
router.put('/:id', commentController.update);     // PUT /posts/:postId/comments/:id
router.delete('/:id', commentController.remove);  // DELETE /posts/:postId/comments/:id

module.exports = router;
```

```javascript
// routes/post.routes.js
const { Router } = require('express');
const router = Router();
const postController = require('../controllers/post.controller');
const commentRouter = require('./comment.routes');

router.get('/', postController.getAll);
router.post('/', postController.create);
router.get('/:id', postController.getOne);
router.put('/:id', postController.update);
router.delete('/:id', postController.remove);

// Mount comment router as nested route
router.use('/:postId/comments', commentRouter);

module.exports = router;
```

Now in the comment controller, `req.params.postId` is available thanks to `mergeParams: true`:

```javascript
// controllers/comment.controller.js
exports.getByPost = asyncHandler(async (req, res) => {
  const { postId } = req.params; // Available due to mergeParams: true
  const comments = await Comment.find({ post: postId });
  res.json({ success: true, data: comments });
});
```

---

## Deep Nesting Example — 3 Levels

```
/organizations/:orgId/projects/:projectId/tasks/:taskId
```

```javascript
// routes/task.routes.js
const router = Router({ mergeParams: true });

router.get('/', taskController.getByProject);
router.post('/', taskController.create);
router.get('/:taskId', taskController.getOne);

module.exports = router;
```

```javascript
// routes/project.routes.js
const router = Router({ mergeParams: true });
const taskRouter = require('./task.routes');

router.get('/', projectController.getByOrg);
router.get('/:projectId', projectController.getOne);
router.use('/:projectId/tasks', taskRouter);

module.exports = router;
```

```javascript
// routes/organization.routes.js
const router = Router();
const projectRouter = require('./project.routes');

router.get('/', orgController.getAll);
router.get('/:orgId', orgController.getOne);
router.use('/:orgId/projects', projectRouter);

module.exports = router;
```

```javascript
// routes/index.js
router.use('/organizations', require('./organization.routes'));
```

**Result:**

```
GET /organizations
GET /organizations/:orgId
GET /organizations/:orgId/projects
GET /organizations/:orgId/projects/:projectId
GET /organizations/:orgId/projects/:projectId/tasks
GET /organizations/:orgId/projects/:projectId/tasks/:taskId
```

---

## Reusing Routes Across Multiple Parents

Sometimes the same resource can be accessed through different parent paths:

```javascript
// routes/comment.routes.js — reusable comment router
const router = Router({ mergeParams: true });

router.get('/', commentController.getComments);
router.post('/', protect, commentController.createComment);

module.exports = router;
```

```javascript
// routes/index.js
const commentRouter = require('./comment.routes');

// Comments can belong to posts OR videos
router.use('/posts/:postId/comments', commentRouter);
router.use('/videos/:videoId/comments', commentRouter);
```

In the controller, check which parent param is available:

```javascript
exports.getComments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.params.postId) filter.post = req.params.postId;
  if (req.params.videoId) filter.video = req.params.videoId;

  const comments = await Comment.find(filter);
  res.json({ success: true, data: comments });
});
```

---

## Adding Middleware to Specific Route Groups

```javascript
// routes/index.js
const { protect, requireAdmin } = require('../middleware/auth');

// Public routes — no auth needed
router.use('/auth', require('./auth.routes'));
router.use('/products', require('./product.routes'));

// Protected routes — require authentication
router.use('/users', protect, require('./user.routes'));
router.use('/orders', protect, require('./order.routes'));

// Admin routes — require admin role
router.use('/admin', protect, requireAdmin, require('./admin.routes'));
```

---

*Modular and nested routes are the difference between a codebase that scales and one that becomes unmaintainable. Keep each resource's routes in its own file, use `mergeParams: true` for nested routers, and use an aggregator `index.js` to keep `app.js` clean.*