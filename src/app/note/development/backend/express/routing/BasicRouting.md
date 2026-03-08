# Basic Routing (GET, POST, PUT, DELETE)

Routing refers to how an application responds to a client request for a specific endpoint — a URI (path) and a specific HTTP method (GET, POST, etc.). This guide covers all the core HTTP methods and how to use them in Express.

---

## Route Definition Syntax

```javascript
app.METHOD(PATH, HANDLER);
```

- `app` — An instance of `express()`
- `METHOD` — An HTTP request method in lowercase
- `PATH` — A path on the server
- `HANDLER` — The function executed when the route is matched

---

## HTTP Methods & Their Semantics

### GET — Read Data

Used to retrieve a resource. GET requests should **never modify data** on the server.

```javascript
// Get all users
app.get('/users', (req, res) => {
  res.json({ users: [] });
});

// Get a specific user
app.get('/users/:id', (req, res) => {
  res.json({ user: { id: req.params.id } });
});
```

### POST — Create a Resource

Used to submit data to create a new resource. The body contains the data.

```javascript
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  // Create user in database
  res.status(201).json({ message: 'User created', user: { name, email } });
});
```

### PUT — Replace a Resource

Used to replace an entire resource with the provided data. If the resource doesn't exist, some implementations create it.

```javascript
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;
  // Replace entire user document
  res.json({ message: `User ${id} replaced`, user: { name, email, age } });
});
```

### PATCH — Partially Update a Resource

Used to apply partial modifications to a resource. Only the fields provided in the body are updated.

```javascript
app.patch('/users/:id', (req, res) => {
  const { id } = req.params;
  // Only update fields present in req.body
  res.json({ message: `User ${id} updated`, updates: req.body });
});
```

### DELETE — Remove a Resource

Used to delete a resource.

```javascript
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  // Delete user from database
  res.status(204).send(); // 204 No Content — no body needed
});
```

---

## HTTP Method Summary

| Method | Use Case | Has Body | Idempotent | Safe |
|---|---|---|---|---|
| GET | Retrieve resource | No | Yes | Yes |
| POST | Create resource | Yes | No | No |
| PUT | Replace resource | Yes | Yes | No |
| PATCH | Partial update | Yes | No | No |
| DELETE | Remove resource | Optional | Yes | No |
| HEAD | Like GET but no body | No | Yes | Yes |
| OPTIONS | Describe communication options | No | Yes | Yes |

**Idempotent** — Calling the same request multiple times produces the same result.  
**Safe** — The request doesn't change the server state.

---

## Multiple Handlers for a Route

You can pass multiple handler functions (middleware + handler) to a route:

```javascript
const validateUser = (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  next();
};

const checkPermission = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

app.post('/users', validateUser, checkPermission, (req, res) => {
  res.status(201).json({ message: 'User created' });
});
```

Or pass them as an array:

```javascript
app.post('/users', [validateUser, checkPermission], (req, res) => {
  res.status(201).json({ message: 'User created' });
});
```

---

## Handling All Methods — `app.all()`

`app.all()` matches any HTTP method for a given path. Useful for middleware that should run for all methods on a route:

```javascript
app.all('/admin/*', (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});
```

---

## Response Status Codes by Method

Always return the appropriate HTTP status code:

```javascript
// GET success
res.status(200).json(data);

// POST success (resource created)
res.status(201).json(newResource);

// PUT/PATCH success
res.status(200).json(updatedResource);

// DELETE success (no content)
res.status(204).send();

// DELETE success (with body)
res.status(200).json({ message: 'Deleted successfully' });

// Not Found
res.status(404).json({ error: 'Resource not found' });

// Validation Error
res.status(400).json({ error: 'Invalid request data' });

// Unauthorized
res.status(401).json({ error: 'Authentication required' });

// Forbidden
res.status(403).json({ error: 'Access denied' });
```

---

## Complete CRUD Example

```javascript
const express = require('express');
const app = express();
app.use(express.json());

let products = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Phone', price: 499 },
];
let nextId = 3;

// GET /products
app.get('/products', (req, res) => {
  res.json({ success: true, count: products.length, data: products });
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, data: product });
});

// POST /products
app.post('/products', (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  const product = { id: nextId++, name, price };
  products.push(product);
  res.status(201).json({ success: true, data: product });
});

// PUT /products/:id
app.put('/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  products[index] = { id: products[index].id, name: req.body.name, price: req.body.price };
  res.json({ success: true, data: products[index] });
});

// PATCH /products/:id
app.patch('/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  products[index] = { ...products[index], ...req.body };
  res.json({ success: true, data: products[index] });
});

// DELETE /products/:id
app.delete('/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  products.splice(index, 1);
  res.status(204).send();
});

app.listen(3000);
```

---

## Testing Routes

```bash
# GET all
curl http://localhost:3000/products

# POST
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Tablet","price":699}'

# PUT (full replacement)
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Gaming Laptop","price":1499}'

# PATCH (partial update)
curl -X PATCH http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":899}'

# DELETE
curl -X DELETE http://localhost:3000/products/1
```

---

*Clear, consistent use of HTTP methods is the foundation of a well-designed REST API. Use GET for reads, POST for creates, PUT/PATCH for updates, and DELETE for removes — and always return appropriate status codes.*