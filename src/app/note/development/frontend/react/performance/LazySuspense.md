# Lazy and Suspense

`React.lazy` and `Suspense` are the React APIs for loading components on demand. `React.lazy` wraps a dynamic import so React can load a component's code only when it is first rendered. `Suspense` defines what to show while that code is loading.

---

## React.lazy

`React.lazy` takes a function that returns a dynamic `import()`. The import must resolve to a module with a **default export** that is a React component.

```jsx
import { lazy } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserProfile = lazy(() => import("./components/UserProfile"));
const HeavyChart = lazy(() => import("./components/HeavyChart"));
```

`Dashboard`, `UserProfile`, and `HeavyChart` behave exactly like regular components in JSX — the difference is their code is not included in the initial bundle.

Always define `lazy` calls at module level — never inside a component function.

---

## Suspense

`Suspense` wraps one or more lazy components and renders a `fallback` while their code is loading. The `fallback` can be any valid JSX — a spinner, skeleton, or even just text.

```jsx
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <Suspense fallback={<div className="spinner">Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
```

When `Dashboard` is first rendered, React suspends rendering of that subtree, shows the `fallback`, fetches the chunk, then swaps in `Dashboard` once the code is ready.

---

## Suspense Boundaries

A Suspense boundary catches any component in its subtree that suspends. You can place boundaries at different levels to control granularity.

```jsx
// Single boundary — entire app shows one fallback
function App() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Router />
    </Suspense>
  );
}

// Per-section boundaries — each section has its own loading state
function Layout() {
  return (
    <div className="layout">
      <Suspense fallback={<NavSkeleton />}>
        <LazyNavBar />
      </Suspense>

      <Suspense fallback={<ContentSkeleton />}>
        <LazyMainContent />
      </Suspense>

      <Suspense fallback={<SidebarSkeleton />}>
        <LazySidebar />
      </Suspense>
    </div>
  );
}
```

Fine-grained boundaries load sections independently — the sidebar can load while the nav is still fetching.

---

## Route-Level Lazy Loading

The most common pattern. Each route is a separate chunk that loads only when navigated to.

```jsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner" />
      <p>Loading page...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## Lazy Loading Conditional Components

Load heavy components only when the user explicitly requests them — modals, drawers, and feature panels are good candidates.

```jsx
import { lazy, Suspense, useState } from "react";

const VideoPlayer = lazy(() => import("./components/VideoPlayer"));
const CommentEditor = lazy(() => import("./components/CommentEditor"));
const ShareModal = lazy(() => import("./components/ShareModal"));

function ArticlePage({ article }) {
  const [showVideo, setShowVideo] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);

  return (
    <article>
      <h1>{article.title}</h1>
      <p>{article.body}</p>

      <button onClick={() => setShowVideo(true)}>Watch Video</button>
      <button onClick={() => setShowComments(true)}>Add Comment</button>
      <button onClick={() => setShowShare(true)}>Share</button>

      {showVideo && (
        <Suspense fallback={<p>Loading video player...</p>}>
          <VideoPlayer src={article.videoUrl} />
        </Suspense>
      )}

      {showComments && (
        <Suspense fallback={<p>Loading editor...</p>}>
          <CommentEditor articleId={article.id} />
        </Suspense>
      )}

      {showShare && (
        <Suspense fallback={null}>
          <ShareModal url={article.url} onClose={() => setShowShare(false)} />
        </Suspense>
      )}
    </article>
  );
}
```

The video player, comment editor, and share modal are never downloaded until the user requests each feature.

---

## Skeleton Fallbacks

A skeleton fallback that matches the shape of the content produces a smoother experience than a spinner.

```jsx
function ArticleSkeleton() {
  return (
    <div className="skeleton-wrapper">
      <div
        className="skeleton skeleton--title"
        style={{ width: "60%", height: 32 }}
      />
      <div
        className="skeleton skeleton--line"
        style={{ width: "100%", height: 16, marginTop: 16 }}
      />
      <div
        className="skeleton skeleton--line"
        style={{ width: "90%", height: 16, marginTop: 8 }}
      />
      <div
        className="skeleton skeleton--line"
        style={{ width: "95%", height: 16, marginTop: 8 }}
      />
      <div
        className="skeleton skeleton--line"
        style={{ width: "80%", height: 16, marginTop: 8 }}
      />
    </div>
  );
}

const LazyArticle = lazy(() => import("./components/Article"));

function ArticlePage({ id }) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <LazyArticle id={id} />
    </Suspense>
  );
}
```

---

## Named Exports with lazy

`React.lazy` requires the module to have a default export. For modules that only export named components, use `.then()` to reshape the module.

```jsx
// Module with only a named export
// components/Charts.jsx
export function BarChart({ data }) { ... }
export function LineChart({ data }) { ... }

// Wrap to produce a default export
const BarChart = lazy(() =>
  import("./components/Charts").then((module) => ({
    default: module.BarChart,
  }))
);

const LineChart = lazy(() =>
  import("./components/Charts").then((module) => ({
    default: module.LineChart,
  }))
);
```

---

## Error Boundaries with Suspense

If a lazy component fails to load — network error, chunk not found — React throws an error. Pair Suspense with an Error Boundary to handle load failures gracefully.

```jsx
import { Component, lazy, Suspense } from "react";

class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-state">
          <p>Failed to load this section.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Dashboard />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
```

The Error Boundary catches the chunk-load failure. The retry button resets the boundary, triggering another load attempt.

---

## Suspense with Data Fetching (React 18+)

In React 18, `Suspense` is not limited to lazy-loaded components — it also works with libraries that support the Suspense data-fetching protocol (such as TanStack Query with the `suspense` option, or Relay).

```jsx
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

function UserProfile({ userId }) {
  // useSuspenseQuery suspends the component until data is ready
  const { data: user } = useSuspenseQuery({
    queryKey: ["user", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
  });

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserProfile userId={1} />
    </Suspense>
  );
}
```

The component reads data synchronously — if it is not ready, the component suspends and the `Suspense` boundary shows the fallback until the fetch resolves.

---

## useTransition with Suspense

`useTransition` lets you mark a state update as non-urgent so the current UI stays visible while the new lazy content loads — instead of immediately switching to the Suspense fallback.

```jsx
import { lazy, Suspense, useState, useTransition } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reports = lazy(() => import("./pages/Reports"));

function App() {
  const [page, setPage] = useState("dashboard");
  const [isPending, startTransition] = useTransition();

  function navigateTo(nextPage) {
    startTransition(() => {
      setPage(nextPage);
    });
  }

  return (
    <div>
      <nav style={{ opacity: isPending ? 0.6 : 1 }}>
        <button onClick={() => navigateTo("dashboard")}>Dashboard</button>
        <button onClick={() => navigateTo("reports")}>Reports</button>
      </nav>

      <Suspense fallback={<PageLoader />}>
        {page === "dashboard" ? <Dashboard /> : <Reports />}
      </Suspense>
    </div>
  );
}
```

With `useTransition`, clicking "Reports" keeps the Dashboard visible (dimmed slightly to indicate loading) until the Reports chunk is ready. Without it, the fallback spinner would appear immediately.

---

## Common Mistakes

```jsx
// Defining lazy inside a component — new lazy reference on every render
function App() {
  const Dashboard = lazy(() => import("./Dashboard")); // wrong
  return <Dashboard />;
}

// Always define at module level
const Dashboard = lazy(() => import("./Dashboard")); // correct

function App() {
  return <Dashboard />;
}

// Lazy component without a Suspense boundary — React throws
function App() {
  return <LazyComponent />; // Error: A React component suspended without a Suspense boundary
}

// Correct — always wrap in Suspense
function App() {
  return (
    <Suspense fallback={<Loader />}>
      <LazyComponent />
    </Suspense>
  );
}

// Using a non-default export directly with lazy
const Chart = lazy(() => import("./Charts")); // works only if Charts has a default export

// If only named exports exist, reshape the module
const Chart = lazy(() =>
  import("./Charts").then((m) => ({ default: m.BarChart })),
);
```

---

## Summary

`React.lazy` wraps a dynamic import so a component's code is fetched only when the component is first rendered. `Suspense` defines the fallback UI shown while that code is loading. Place Suspense boundaries at route level for the broadest impact and at individual component level for heavy conditional features. Use skeleton fallbacks for smoother UX. Wrap Suspense in an Error Boundary to handle chunk-load failures. Pair with `useTransition` to keep the previous UI visible while new content loads. Never define `lazy` calls inside a component function.

---

_Next: [Virtualization](./Virtualization.md) — rendering only the visible portion of large lists for dramatic performance gains._
