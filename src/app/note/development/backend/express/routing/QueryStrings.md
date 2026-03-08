# Query Strings

Query strings are the `?key=value` pairs appended to a URL after the path. They are used to pass optional parameters like filters, pagination, sorting, and search terms. Express parses them automatically and makes them available on `req.query`.

---

## Basics

```javascript
app.get('/products', (req, res) => {
  console.log(req.query);
  res.json(req.query);
});
```

**Request:** `GET /products?category=electronics&inStock=true`  
**`req.query`:** `{ category: 'electronics', inStock: 'true' }`

> All query string values are strings by default. Parse to the correct type as needed.

---

## Common Use Cases

### Filtering

```javascript
app.get('/products', async (req, res) => {
  const { category, minPrice, maxPrice, inStock } = req.query;

  // Build a dynamic filter object
  const filter = {};
  if (category) filter.category = category;
  if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
  if (inStock !== undefined) filter.inStock = inStock === 'true';

  const products = await Product.find(filter);
  res.json({ success: true, count: products.length, data: products });
});
```

**Request:** `GET /products?category=electronics&minPrice=100&maxPrice=500&inStock=true`

---

### Pagination

```javascript
app.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Enforce max limit to prevent abuse
  const safeLimit = Math.min(limit, 100);

  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(safeLimit),
    User.countDocuments(),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      hasNext: page < Math.ceil(total / safeLimit),
      hasPrev: page > 1,
    },
  });
});
```

**Request:** `GET /users?page=2&limit=20`

---

### Sorting

```javascript
app.get('/products', async (req, res) => {
  const { sortBy = 'createdAt', order = 'desc' } = req.query;

  // Whitelist allowed sort fields to prevent injection
  const allowedSortFields = ['name', 'price', 'createdAt', 'updatedAt'];
  if (!allowedSortFields.includes(sortBy)) {
    return res.status(400).json({ error: `Invalid sort field: ${sortBy}` });
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const products = await Product.find().sort({ [sortBy]: sortOrder });

  res.json({ success: true, data: products });
});
```

**Request:** `GET /products?sortBy=price&order=asc`

---

### Search

```javascript
app.get('/users/search', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
  });

  res.json({ success: true, data: users });
});
```

**Request:** `GET /users/search?q=john`

---

## Array Values in Query Strings

Express handles array query params with repeated keys or bracket notation:

```javascript
app.get('/products', (req, res) => {
  console.log(req.query.ids);
});
```

**Repeated keys:** `GET /products?ids=1&ids=2&ids=3`  
**`req.query.ids`:** `['1', '2', '3']`

**Bracket notation:** `GET /products?ids[]=1&ids[]=2&ids[]=3`  
**`req.query.ids`:** `['1', '2', '3']`

```javascript
// Handle both single value and array
const ids = [].concat(req.query.ids || []).map(Number);
```

---

## Nested Object Query Params

```
GET /search?filters[status]=active&filters[role]=admin
```

Express parses this into a nested object:

```javascript
req.query.filters // { status: 'active', role: 'admin' }
```

---

## Complete Example — Search, Filter, Sort, Paginate

```javascript
app.get('/articles', async (req, res) => {
  const {
    q,
    category,
    author,
    page = '1',
    limit = '10',
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  // Build filter
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (author) filter.author = author;

  // Pagination
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(parseInt(limit) || 10, 50);
  const skip = (pageNum - 1) * limitNum;

  // Sort
  const validSortFields = ['createdAt', 'title', 'views'];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortObj = { [safeSortBy]: order === 'asc' ? 1 : -1 };

  const [articles, total] = await Promise.all([
    Article.find(filter).sort(sortObj).skip(skip).limit(limitNum),
    Article.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: articles,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});
```

---

## Type Safety and Validation

Query strings are always strings — validate and parse them:

```javascript
// Utility to safely parse query params
function parseQueryInt(value, defaultValue = 0, min = 0, max = Infinity) {
  const parsed = parseInt(value);
  if (isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

function parseQueryBool(value) {
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
}

// Usage
const page = parseQueryInt(req.query.page, 1, 1, 1000);
const limit = parseQueryInt(req.query.limit, 10, 1, 100);
const isActive = parseQueryBool(req.query.active);
```

---

## Security Considerations

**Never use query params directly in database queries:**

```javascript
// ❌ Dangerous — NoSQL injection risk
User.find({ role: req.query.role });

// ✅ Validate against whitelist first
const allowedRoles = ['user', 'admin', 'moderator'];
if (!allowedRoles.includes(req.query.role)) {
  return res.status(400).json({ error: 'Invalid role' });
}
User.find({ role: req.query.role });
```

---

*Query strings are the correct tool for optional, non-identifying parameters like filters and pagination. Use route parameters for resource identification (`/users/:id`) and query strings for everything optional (`?page=1&limit=10`).*