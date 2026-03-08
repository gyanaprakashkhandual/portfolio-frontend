# React Router

React Router is the standard routing library for React applications. It maps URL paths to components, enables navigation between pages, handles URL parameters and query strings, protects routes behind authentication, and manages navigation programmatically — all while keeping the URL in sync with what the user sees.

---

## Installation

```bash
npm install react-router-dom
```

---

## Setting Up the Router

Wrap your application in `BrowserRouter` at the entry point. This provides routing context to every component in the tree.

```jsx
// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

---

## Defining Routes

Use `Routes` and `Route` to declare which component renders at each path.

```jsx
// App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

The `path="*"` route is a catch-all — it renders when no other route matches.

---

## Navigation with Link and NavLink

Use `Link` for navigation instead of `<a>` tags. `Link` prevents full page reloads and updates the URL client-side.

```jsx
import { Link, NavLink } from "react-router-dom";

function Navigation() {
  return (
    <nav>
      {/* Link — basic navigation */}
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/blog">Blog</Link>

      {/* NavLink — adds an "active" class when the path matches */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          isActive ? "nav-link nav-link--active" : "nav-link"
        }
      >
        Dashboard
      </NavLink>
    </nav>
  );
}
```

`NavLink` receives `{ isActive, isPending }` in its `className` and `style` callbacks, making it easy to style the current route.

---

## URL Parameters

Define dynamic segments in the path with `:paramName`. Read them with `useParams`.

```jsx
// Route definition
<Route path="/users/:userId" element={<UserProfile />} />
<Route path="/products/:category/:productId" element={<ProductDetail />} />

// Inside the component
import { useParams } from "react-router-dom";

function UserProfile() {
  const { userId } = useParams();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function ProductDetail() {
  const { category, productId } = useParams();

  return (
    <div>
      <p>Category: {category}</p>
      <p>Product ID: {productId}</p>
    </div>
  );
}
```

---

## Query Strings

Read and update query parameters with `useSearchParams`. It returns a `URLSearchParams` instance and a setter — similar to `useState`.

```jsx
import { useSearchParams } from "react-router-dom";

function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");

  function handleCategoryChange(newCategory) {
    setSearchParams((prev) => {
      prev.set("category", newCategory);
      prev.set("page", "1"); // reset page when filter changes
      return prev;
    });
  }

  function handleSortChange(newSort) {
    setSearchParams((prev) => {
      prev.set("sort", newSort);
      return prev;
    });
  }

  return (
    <div>
      <div className="filters">
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>

        <select value={sort} onChange={(e) => handleSortChange(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <ProductGrid category={category} sort={sort} page={page} />
    </div>
  );
}
```

Query params appear in the URL (`/products?category=electronics&sort=newest`) making filters bookmarkable and shareable.

---

## Nested Routes and Layouts

Nest routes inside a parent route to share a layout. The parent renders an `Outlet` where child routes appear.

```jsx
import { Routes, Route, Outlet, Link } from "react-router-dom";

// Shared dashboard layout
function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <nav>
          <Link to="/dashboard">Overview</Link>
          <Link to="/dashboard/analytics">Analytics</Link>
          <Link to="/dashboard/settings">Settings</Link>
          <Link to="/dashboard/team">Team</Link>
        </nav>
      </aside>
      <main className="dashboard-content">
        {/* Child routes render here */}
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Nested routes share DashboardLayout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="team" element={<Team />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

The `index` route renders at the parent's exact path (`/dashboard`) with no additional segment.

---

## Programmatic Navigation

Use `useNavigate` to navigate in response to events — form submissions, button clicks, or after an async operation completes.

```jsx
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await login(formData.get("email"), formData.get("password"));
      navigate("/dashboard"); // redirect on success
    } catch {
      setError("Invalid credentials.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}

// Navigate with options
navigate("/dashboard", { replace: true }); // replace history entry — no back button
navigate(-1); // go back one page
navigate(1); // go forward one page
navigate("/profile", { state: { from: "login" } }); // pass state
```

---

## Reading Navigation State and Location

`useLocation` gives you the current URL location object — pathname, search, hash, and state.

```jsx
import { useLocation } from "react-router-dom";

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    analytics.track("page_view", { path: location.pathname });
  }, [location.pathname]);

  return null;
}

// Reading state passed via navigate()
function WelcomePage() {
  const location = useLocation();
  const from = location.state?.from;

  return (
    <div>
      {from === "login" && <p>You have successfully signed in.</p>}
      <h1>Welcome</h1>
    </div>
  );
}
```

---

## Protected Routes

Wrap protected routes in a component that checks authentication and redirects if the user is not logged in.

```jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!user) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

// Role-based access
function RequireRole({ role }) {
  const { user } = useAuth();

  if (!user?.roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* All child routes require authentication */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin routes require "admin" role */}
        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

After login, redirect the user to where they originally intended to go:

```jsx
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/dashboard";

  async function handleLogin(credentials) {
    await login(credentials);
    navigate(from, { replace: true }); // send them where they were going
  }
}
```

---

## Redirects

Use the `Navigate` component for declarative redirects inside JSX.

```jsx
import { Navigate } from "react-router-dom";

// Simple redirect
<Route path="/old-path" element={<Navigate to="/new-path" replace />} />;

// Conditional redirect
function HomePage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}
```

---

## Lazy-Loaded Routes

Combine React Router with `React.lazy` and `Suspense` to code-split each route into its own chunk.

```jsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

Each page loads its JavaScript only when the user navigates to it.

---

## useRouteError and Error Boundaries

React Router v6.4+ supports route-level error boundaries via the `errorElement` prop. When a component throws during render, the `errorElement` renders instead.

```jsx
import { useRouteError } from "react-router-dom";

function RouteErrorPage() {
  const error = useRouteError();

  return (
    <div className="error-page">
      <h1>Something went wrong</h1>
      <p>
        {error?.statusText ?? error?.message ?? "An unexpected error occurred."}
      </p>
      <a href="/">Return to Home</a>
    </div>
  );
}

// Attach to routes
<Route
  path="/dashboard"
  element={<Dashboard />}
  errorElement={<RouteErrorPage />}
/>;
```

---

## Common Hooks Reference

| Hook              | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `useNavigate`     | Navigate programmatically                       |
| `useParams`       | Read URL dynamic segments                       |
| `useSearchParams` | Read and update query strings                   |
| `useLocation`     | Access current location, state, and pathname    |
| `useMatch`        | Test if the current URL matches a pattern       |
| `useRouteError`   | Read the error thrown in a route's errorElement |

---

## Common Mistakes

```jsx
// Using <a href> instead of <Link> — causes a full page reload
<a href="/about">About</a>    // wrong
<Link to="/about">About</Link> // correct

// Reading params with window.location instead of useParams
const id = window.location.pathname.split("/").pop(); // fragile and wrong
const { id } = useParams(); // correct

// Placing <Routes> inside a component that also uses hooks conditionally
// Routes must have a stable structure — do not render them conditionally

// Forgetting <Outlet> in a layout route — child routes render nowhere
function Layout() {
  return <div className="layout"><Sidebar /></div>; // children never appear
}

// Correct
function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <Outlet /> // child routes render here
    </div>
  );
}
```

---

## Summary

React Router maps URL paths to components using `Routes` and `Route`. Use `Link` and `NavLink` for navigation, `useParams` for URL segments, `useSearchParams` for query strings, and `useNavigate` for programmatic navigation. Nest routes inside layout components and use `Outlet` to render child routes. Protect routes by wrapping them in guard components that check authentication and redirect with `Navigate`. Combine with `React.lazy` and `Suspense` for automatic code splitting per route.

---

_Next: [Data Fetching with TanStack Query](./TanstackQuery.md) — server state management with caching, background refetching, and automatic synchronization._
