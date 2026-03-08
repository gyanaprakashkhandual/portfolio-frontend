# Project Structure

A well-organized project structure makes a codebase easier to navigate, scale, and maintain. React does not enforce any particular structure — the right one depends on project size, team preferences, and how the application is likely to grow. This document covers the most proven patterns, from small projects to large feature-driven codebases.

---

## Core Principle — Colocation

The most important structural principle in React is colocation: keep files that change together close together. A component's styles, tests, types, and helpers should live next to the component itself — not scattered across distant directories organized by file type.

```
// Colocated — everything related to UserCard lives together
features/users/UserCard/
  UserCard.jsx
  UserCard.module.css
  UserCard.test.jsx
  UserCard.stories.jsx
  useUserCard.js

// Not colocated — related files are scattered by type
components/UserCard.jsx
styles/UserCard.module.css
tests/UserCard.test.jsx
hooks/useUserCard.js
```

When you need to delete or refactor `UserCard`, every relevant file is in one place.

---

## Small Project Structure

For small projects — solo work, prototypes, or apps with fewer than ten pages — a flat structure works well.

```
src/
  components/
    Button.jsx
    Button.module.css
    Card.jsx
    NavBar.jsx
    Footer.jsx
  pages/
    Home.jsx
    About.jsx
    Contact.jsx
  hooks/
    useLocalStorage.js
    useDebounce.js
  utils/
    formatDate.js
    validators.js
  App.jsx
  main.jsx
  index.css
```

Keep it simple. Do not add structure that does not yet exist in the codebase.

---

## Medium Project — Feature-Based Structure

As a project grows, organizing by file type (`components/`, `hooks/`, `utils/`) breaks down. You end up navigating three or four directories to understand one feature. The solution is to group by feature — each feature owns its own components, hooks, utilities, and tests.

```
src/
  features/
    auth/
      components/
        LoginForm.jsx
        LoginForm.test.jsx
        SignUpForm.jsx
        SignUpForm.test.jsx
      hooks/
        useAuth.js
      store/
        authSlice.js
      api/
        authApi.js
      index.js           <- public API for this feature
    dashboard/
      components/
        DashboardLayout.jsx
        StatsPanel.jsx
        ActivityFeed.jsx
      hooks/
        useDashboard.js
      index.js
    products/
      components/
        ProductCard.jsx
        ProductCard.module.css
        ProductCard.test.jsx
        ProductGrid.jsx
        ProductFilters.jsx
      hooks/
        useProducts.js
        useProductFilters.js
      api/
        productsApi.js
      index.js
  shared/
    components/
      Button/
        Button.jsx
        Button.module.css
        Button.test.jsx
        index.js
      Input/
        Input.jsx
        Input.module.css
        index.js
      Modal/
        Modal.jsx
        Modal.module.css
        index.js
    hooks/
      useFetch.js
      useDebounce.js
      useLocalStorage.js
    utils/
      formatDate.js
      formatCurrency.js
      validators.js
    constants/
      routes.js
      config.js
  app/
    App.jsx
    Router.jsx
    store.js             <- Redux or Zustand root store
    queryClient.js
  main.jsx
  index.css
```

---

## Feature Index Files — Public API Pattern

Each feature should expose a public API through an `index.js` file. Other features import from the feature's index, not directly from internal files. This creates a clean boundary and lets you refactor internals without updating imports elsewhere.

```js
// features/auth/index.js — public API for the auth feature
export { LoginForm } from "./components/LoginForm";
export { SignUpForm } from "./components/SignUpForm";
export { useAuth } from "./hooks/useAuth";
export { authReducer } from "./store/authSlice";
```

```jsx
// Importing from the public API — clean and intentional
import { LoginForm, useAuth } from "@/features/auth";

// Not from internal paths — this couples to implementation details
import { LoginForm } from "@/features/auth/components/LoginForm"; // avoid
```

---

## Large Project — Domain-Driven Structure

For very large applications with multiple domains, business areas, or teams, a domain-driven structure groups features by business concern.

```
src/
  domains/
    commerce/
      products/
      cart/
      checkout/
      orders/
    content/
      blog/
      pages/
      media/
    identity/
      auth/
      profile/
      settings/
    admin/
      users/
      analytics/
      config/
  platform/
    components/     <- design system components
    hooks/          <- platform-wide hooks
    utils/          <- shared utilities
    api/            <- base API client and interceptors
    store/          <- root store configuration
  app/
    App.jsx
    Router.jsx
    main.jsx
```

Each domain is independently navigable. A team owning the `commerce` domain knows exactly where their code lives and does not need to understand `content` or `identity` to work effectively.

---

## Component Folder Pattern

For components that are more than a single file, use a folder with an index file.

```
Button/
  index.js           <- re-exports Button for clean imports
  Button.jsx         <- component implementation
  Button.module.css  <- styles
  Button.test.jsx    <- tests
  Button.stories.jsx <- Storybook stories (if used)
  Button.types.js    <- TypeScript types (if not inline)
```

```js
// Button/index.js
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
```

Consumers import from the folder — `import { Button } from "@/shared/components/Button"` — without knowing the internal file structure.

---

## Path Aliases

Configure path aliases to avoid deep relative imports like `../../../../shared/utils/formatDate`. Use `@/` to reference the `src` directory.

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```jsx
// Before — fragile relative paths
import { Button } from "../../../shared/components/Button";
import { formatDate } from "../../../../shared/utils/formatDate";

// After — clean absolute paths
import { Button } from "@/shared/components/Button";
import { formatDate } from "@/shared/utils/formatDate";
```

---

## Naming Conventions

Consistent naming makes files predictable. Apply these conventions across the entire project.

```
Components:        PascalCase       UserCard.jsx, NavBar.jsx
Hooks:             camelCase        useAuth.js, useDebounce.js
Utilities:         camelCase        formatDate.js, validators.js
Constants:         camelCase        routes.js, config.js
Types:             PascalCase       UserTypes.ts, ApiTypes.ts
Test files:        *.test.jsx       UserCard.test.jsx
Story files:       *.stories.jsx    Button.stories.jsx
Style modules:     *.module.css     Button.module.css
```

Keep file names and the component or function they export in sync. `UserCard.jsx` should export `UserCard`. Mismatched names cause confusion and make searching harder.

---

## API Layer

Centralize all data fetching functions in an `api/` directory or within each feature. Keep fetch logic out of components — components should call API functions, not construct URLs and headers themselves.

```js
// features/products/api/productsApi.js
const BASE_URL = "/api/products";

export async function fetchProducts({ category, sort, page } = {}) {
  const params = new URLSearchParams({ category, sort, page });
  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

export async function fetchProductById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error(`Product ${id} not found`);
  return response.json();
}

export async function createProduct(data) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create product");
  return response.json();
}
```

When using TanStack Query, API functions slot directly into `queryFn` — the separation is clean.

---

## Constants and Configuration

Define constants and configuration in dedicated files. Never hardcode values that appear in multiple places.

```js
// shared/constants/routes.js
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PRODUCTS: "/products",
  PRODUCT: (id) => `/products/${id}`,
  ADMIN: "/admin",
};

// shared/constants/config.js
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  APP_NAME: "My Application",
  DEFAULT_PAGE_SIZE: 20,
  MAX_FILE_SIZE_MB: 5,
};
```

```jsx
// Usage — no magic strings
import { ROUTES } from "@/shared/constants/routes";

<Link to={ROUTES.DASHBOARD}>Dashboard</Link>
<Link to={ROUTES.PRODUCT(product.id)}>{product.name}</Link>
```

---

## Types Directory (TypeScript Projects)

For shared types used across multiple features, keep a top-level `types/` directory. Feature-specific types live inside the feature.

```
src/
  types/
    api.ts         <- API response shapes
    common.ts      <- shared utility types
    index.ts       <- barrel export
  features/
    products/
      products.types.ts   <- Product-specific types
```

```ts
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  field?: string;
}
```

---

## Environment Variables

Keep environment variables in `.env` files and document them in `.env.example`.

```bash
# .env.local — local development (never committed)
VITE_API_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxx

# .env.production
VITE_API_BASE_URL=https://api.myapp.com

# .env.example — committed to the repo, documents what is needed
VITE_API_BASE_URL=
VITE_STRIPE_PUBLIC_KEY=
```

Access environment variables through a config file, not directly throughout the codebase:

```js
// shared/constants/config.js
export const CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  stripeKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
};
```

---

## What Goes Where — Quick Reference

| File type                     | Location                                 |
| ----------------------------- | ---------------------------------------- |
| Page components               | `pages/` or `features/[name]/pages/`     |
| Reusable UI components        | `shared/components/`                     |
| Feature-specific components   | `features/[name]/components/`            |
| Global hooks                  | `shared/hooks/`                          |
| Feature hooks                 | `features/[name]/hooks/`                 |
| API functions                 | `features/[name]/api/` or `shared/api/`  |
| Redux slices / Zustand stores | `features/[name]/store/` or `app/store/` |
| Utility functions             | `shared/utils/`                          |
| Type definitions              | `types/` or inline in feature files      |
| Constants                     | `shared/constants/`                      |
| Test files                    | Next to the file being tested            |
| Global styles                 | `src/index.css` or `src/styles/`         |
| Component styles              | Next to the component                    |

---

## Common Mistakes

```
// Organizing by file type at scale — forces cross-directory navigation for one feature
components/
  UserCard.jsx
  ProductCard.jsx
  OrderItem.jsx
hooks/
  useUserCard.js      <- why is this separate from UserCard?
  useProductCard.js
tests/
  UserCard.test.jsx   <- now you need three folders open to understand one component

// Deeply nested directories — adds cognitive overhead without benefit
src/components/ui/forms/inputs/text/variants/outlined/OutlinedTextInput.jsx
// Flatten when nesting is more than 3 levels deep

// No index files on feature directories — internal paths leak everywhere
import { LoginForm } from "@/features/auth/components/LoginForm/LoginForm";
// Add an index.js to expose a clean public API

// Inconsistent naming — some files are PascalCase, some are kebab-case
UserCard.jsx
user-profile.jsx  // pick one convention and apply it everywhere
```

---

## Summary

Start simple and add structure only as complexity demands it. Organize by feature, not by file type, as the project grows. Colocate related files — tests, styles, and types next to the component they belong to. Expose feature internals through index files to create clean boundaries. Use path aliases to eliminate fragile relative imports. Apply consistent naming conventions across all files. Keep API functions separate from components, constants in dedicated files, and environment variables behind a config object. The best structure is the one your team navigates instinctively.

---

_Next: [Error Boundaries](./ErrorBoundaries.md) — catching and handling runtime errors gracefully in React component trees._
