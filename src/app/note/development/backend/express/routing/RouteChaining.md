# Route Chaining & app.route()

Route chaining allows you to define multiple HTTP method handlers for the same path in a concise, DRY way using `app.route()` or `router.route()`. It avoids repetition and keeps related route logic grouped together.

---

## The Problem Without Chaining

```javascript
// ❌ Repetitive — same path written 4 times
app.get('/users/:id', userController.getOne);
app.put('/users/:id', userController.update);
app.patch('/users/:id', userController.partialUpdate);
app.delete('/users/:id', userController.remove);
```

---

## Using `app.route()`

```javascript
// ✅ Clean — path defined once
app.route('/users/:id')
  .get(userController.getOne)
  .put(userController.update)
  .patch(userController.partialUpdate)
  .delete(userController.remove);
```

The path is defined once, and each `.get()`, `.post()`, etc. chains off it. This is the native Express approach for grouping handlers.

---

## Common Pattern — Resource Routes

Every REST resource typically has two URL shapes:

```javascript
// Collection: /users
app.route('/users')
  .get(userController.getAll)   // GET  /users     — list
  .post(userController.create); // POST /users     — create

// Individual: /users/:id
app.route('/users/:id')
  .get(userController.getOne)      // GET    /users/:id  — read
  .put(userController.replace)     // PUT    /users/:id  — replace
  .patch(userController.update)    // PATCH  /users/:id  — partial update
  .delete(userController.remove);  // DELETE /users/:id  — delete
```

---

## Using `router.route()` (Preferred in Modular Apps)

In practice, you'll use `router.route()` inside a Router file, not `app.route()`:

```javascript
// routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, requireAdmin } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validators');

router
  .route('/')
  .get(productController.getAll)
  .post(protect, requireAdmin, validateProduct, productController.create);

router
  .route('/:id')
  .get(productController.getOne)
  .put(protect, requireAdmin, validateProduct, productController.replace)
  .patch(protect, requireAdmin, productController.update)
  .delete(protect, requireAdmin, productController.remove);

module.exports = router;
```

---

## Adding Middleware to Chained Routes

You can include middleware in the chain — they apply only to that specific method:

```javascript
router
  .route('/articles')
  .get(articleController.getAll)                         // No auth for reading
  .post(protect, validateArticle, articleController.create); // Auth required to create

router
  .route('/articles/:id')
  .get(articleController.getOne)                          // Public
  .put(protect, checkOwnership, articleController.update) // Auth + ownership
  .delete(protect, checkOwnership, articleController.remove);
```

---

## Comparison: Manual vs Chained

```javascript
// Manual — works but verbose
router.get('/', controller.getAll);
router.post('/', protect, controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', protect, controller.update);
router.delete('/:id', protect, controller.remove);

// Chained — same result, cleaner
router.route('/').get(controller.getAll).post(protect, controller.create);
router.route('/:id')
  .get(controller.getOne)
  .put(protect, controller.update)
  .delete(protect, controller.remove);
```

---

## Real-World Complete Example

```javascript
// routes/order.routes.js
const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  cancelOrder,
  deleteOrder,
} = require('../controllers/order.controller');
const { protect, requireAdmin } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validators');

// /orders
router
  .route('/')
  .get(protect, getOrders)
  .post(protect, validateOrder, createOrder);

// /orders/:id
router
  .route('/:id')
  .get(protect, getOrder)
  .put(protect, validateOrder, updateOrder)
  .delete(protect, requireAdmin, deleteOrder);

// /orders/:id/cancel — custom action
router.patch('/:id/cancel', protect, cancelOrder);

module.exports = router;
```

---

## When NOT to Chain

Chaining works best when the handlers for each method are in a controller. If you're writing inline functions, sometimes it's cleaner not to chain:

```javascript
// Acceptable inline — short and clear
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/version', (req, res) => res.json({ version: '1.0.0' }));
```

---

*Use `router.route()` for all resource-style routes. It eliminates path duplication, makes the intent immediately clear, and keeps related handlers physically adjacent in the code — a win for readability and maintainability.*