# Error Boundaries

Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log them, and display a fallback UI instead of crashing the entire application. Without an Error Boundary, a single unhandled rendering error tears down the whole page. With one, only the affected subtree fails — the rest of the app keeps working.

---

## The Problem They Solve

Before Error Boundaries, a runtime error during rendering would corrupt React's internal state and cause the entire component tree to unmount. Users would see a blank page with no explanation.

```jsx
// A rendering error in one component...
function BrokenWidget({ data }) {
  return <p>{data.user.name}</p>; // throws if data.user is null
}

// ...without an Error Boundary, crashes the entire page
function App() {
  return (
    <div>
      <Header />
      <BrokenWidget data={null} /> {/* this crash takes down Header too */}
      <Footer />
    </div>
  );
}
```

An Error Boundary contains the failure. `Header` and `Footer` continue to render.

---

## How Error Boundaries Work

Error Boundaries are class components that implement `componentDidCatch` and `getDerivedStateFromError`. There is no hook equivalent — they must be class components. In practice, you write one Error Boundary class and reuse it across the app.

```jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Called during rendering when a child throws
  // Return value updates state — triggers the fallback render
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Called after the error is caught — use for logging
  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught:", error);
    console.error("Component stack:", errorInfo.componentStack);

    // Send to an error reporting service
    reportError(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // Render the fallback prop, or a default message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" className="error-fallback">
          <h2>Something went wrong.</h2>
          <p>This section failed to load. Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## Basic Usage

Wrap any subtree you want to protect. The boundary catches errors from any component inside it, regardless of how deeply nested.

```jsx
function App() {
  return (
    <div>
      <Header />

      <ErrorBoundary fallback={<p>The main content failed to load.</p>}>
        <MainContent />
      </ErrorBoundary>

      <ErrorBoundary fallback={<p>The sidebar is temporarily unavailable.</p>}>
        <Sidebar />
      </ErrorBoundary>

      <Footer />
    </div>
  );
}
```

If `MainContent` crashes, `Sidebar`, `Header`, and `Footer` are unaffected.

---

## Granular Boundaries

Place Error Boundaries at multiple levels to contain failures as narrowly as possible. Fine-grained boundaries provide a better user experience — only the broken part fails.

```jsx
function Dashboard() {
  return (
    <div className="dashboard">
      {/* Each widget is independently protected */}
      <ErrorBoundary fallback={<WidgetError name="Revenue Chart" />}>
        <RevenueChart />
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetError name="User Activity" />}>
        <UserActivityFeed />
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetError name="Recent Orders" />}>
        <RecentOrdersTable />
      </ErrorBoundary>
    </div>
  );
}

function WidgetError({ name }) {
  return (
    <div className="widget widget--error" role="alert">
      <p>{name} failed to load.</p>
    </div>
  );
}
```

If `RevenueChart` crashes, the other two widgets remain fully functional.

---

## Adding a Reset Mechanism

Allow users to retry without a full page refresh. Track a `key` prop on the boundary and reset it to force a remount of the failed subtree.

```jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="error-fallback">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message ?? "An unexpected error occurred."}</p>
          <button onClick={this.reset}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

```jsx
// Using the reset-capable boundary
function ProductWidget({ productId }) {
  const [key, setKey] = useState(0);

  return (
    <ErrorBoundary key={key} onError={(error) => logError(error)}>
      <ProductDetails productId={productId} />
      {/* When the boundary resets, key changes — forces remount */}
    </ErrorBoundary>
  );
}
```

Alternatively, pass a `resetKeys` prop — the boundary resets automatically when any of those values change.

```jsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // Reset when resetKeys change — e.g., user navigates to a new product
  componentDidUpdate(prevProps) {
    if (
      this.state.hasError &&
      prevProps.resetKeys?.some((key, i) => key !== this.props.resetKeys?.[i])
    ) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p>Something went wrong.</p>;
    }
    return this.props.children;
  }
}

// Usage — boundary auto-resets when productId changes
<ErrorBoundary resetKeys={[productId]} fallback={<ProductError />}>
  <ProductDetails productId={productId} />
</ErrorBoundary>;
```

---

## react-error-boundary

The `react-error-boundary` library provides a production-ready `ErrorBoundary` component with reset support, render props, and hooks — without writing a class component yourself.

```bash
npm install react-error-boundary
```

```jsx
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => logError(error, info)}
      onReset={() => {
        // Optional: reset app state before retrying
      }}
    >
      <MainContent />
    </ErrorBoundary>
  );
}
```

### useErrorBoundary Hook

`react-error-boundary` also provides `useErrorBoundary` to throw errors from event handlers and async code — errors that Error Boundaries normally cannot catch.

```jsx
import { useErrorBoundary } from "react-error-boundary";

function UserProfile({ userId }) {
  const { showBoundary } = useErrorBoundary();

  async function handleExport() {
    try {
      await exportUserData(userId);
    } catch (error) {
      // Manually route this async error to the nearest Error Boundary
      showBoundary(error);
    }
  }

  return (
    <div>
      <h2>User Profile</h2>
      <button onClick={handleExport}>Export Data</button>
    </div>
  );
}
```

---

## What Error Boundaries Cannot Catch

Error Boundaries only catch errors that occur during rendering, in lifecycle methods, and in constructors of class components. They do not catch:

```jsx
// Event handlers — use try/catch inside the handler
function Button() {
  function handleClick() {
    try {
      doSomethingDangerous();
    } catch (error) {
      setError(error.message); // handle locally or use showBoundary()
    }
  }

  return <button onClick={handleClick}>Click</button>;
}

// Async code — Error Boundaries do not catch Promise rejections
async function loadData() {
  const data = await fetch("/api/data").then((r) => r.json()); // if this throws, boundary misses it
}

// Use useErrorBoundary from react-error-boundary, or handle locally with try/catch

// Errors in the Error Boundary itself
// Errors in server-side rendering
```

For async errors, either handle them with `try/catch` and local state, or use `useErrorBoundary`'s `showBoundary` to route them to the nearest boundary.

---

## Route-Level Error Boundaries

Place a boundary at each route to prevent one broken page from affecting others.

```jsx
import { ErrorBoundary } from "react-error-boundary";
import { Routes, Route, useLocation } from "react-router-dom";

function RouteErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="page-error" role="alert">
      <h1>Page Error</h1>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Retry</button>
      <a href="/">Return to Home</a>
    </div>
  );
}

function App() {
  const location = useLocation();

  return (
    // resetKeys={[location.pathname]} resets the boundary on navigation
    <ErrorBoundary
      FallbackComponent={RouteErrorFallback}
      resetKeys={[location.pathname]}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </ErrorBoundary>
  );
}
```

---

## Error Reporting

Use `componentDidCatch` or the `onError` prop to send errors to a monitoring service like Sentry, Datadog, or LogRocket.

```jsx
import * as Sentry from "@sentry/react";

// Option 1 — Sentry's built-in Error Boundary
function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorPage />} showDialog>
      <MainContent />
    </Sentry.ErrorBoundary>
  );
}

// Option 2 — Custom boundary with manual Sentry reporting
class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  // ...
}

// Option 3 — react-error-boundary onError prop
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => {
    Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    });
  }}
>
  <App />
</ErrorBoundary>;
```

---

## Development vs. Production Behavior

In development, React re-throws errors after the Error Boundary catches them so they appear in the browser's error overlay. This is intentional — it helps you see the error during development. The fallback UI still renders underneath the overlay.

In production, errors are caught silently by the boundary. Users see the fallback UI. The error overlay does not appear. This is the correct behavior — always test Error Boundary fallback UIs in a production build to confirm they look right.

---

## Common Mistakes

```jsx
// Putting everything under one top-level Error Boundary
// If the layout itself errors, users see nothing useful
<ErrorBoundary>
  <EntireApp />    // too coarse — one error hides everything
</ErrorBoundary>

// No reset mechanism — users must manually reload to recover
<ErrorBoundary fallback={<p>Something broke. Please reload.</p>}>
  <Widget />       // add a retry button so users can recover without a reload
</ErrorBoundary>

// Expecting Error Boundaries to catch async errors
async function fetchData() {
  const data = await api.get("/data"); // if this throws, the boundary misses it
}
// Use try/catch with local error state or showBoundary() for async failures

// Not logging errors — catching them silently loses valuable diagnostic information
componentDidCatch(error) {
  // no logging — you will never know what is breaking in production
}
// Always call your error reporting service in componentDidCatch
```

---

## Error Boundary Placement Strategy

Think of Error Boundaries like circuit breakers. Place them at every level where an independent failure is acceptable.

```
App
 └── ErrorBoundary (route level — resets on navigation)
      └── Route components
           ├── ErrorBoundary (feature level — protects sidebar from main content)
           │    └── Dashboard
           │         ├── ErrorBoundary (widget level — each widget independent)
           │         │    └── RevenueChart
           │         └── ErrorBoundary (widget level)
           │              └── ActivityFeed
           └── ErrorBoundary (feature level)
                └── UserProfile
```

A single boundary per app is not enough. A boundary wrapping every single component is overkill. Identify the natural failure domains in your UI and place boundaries there.

---

## Summary

Error Boundaries are class components that catch rendering errors and display a fallback instead of crashing the whole app. Use `getDerivedStateFromError` to update state and trigger the fallback, and `componentDidCatch` to log errors to a monitoring service. Place boundaries at route level, feature level, and around individual widgets to contain failures as narrowly as possible. Add a reset mechanism so users can recover without a full reload. Use `react-error-boundary` to avoid writing the class boilerplate yourself. Error Boundaries do not catch async errors or event handler errors — use `try/catch` or `useErrorBoundary` for those cases.

---

_Next: [Accessibility](./Accessibility.md) — building React applications that work for everyone._
