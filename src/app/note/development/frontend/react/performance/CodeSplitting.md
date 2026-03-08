# Code Splitting

Code splitting is the practice of breaking a JavaScript bundle into smaller chunks that are loaded on demand instead of all at once. It reduces the amount of code the browser must download, parse, and execute before the page becomes interactive.

---

## The Problem — Large Bundles

Without code splitting, every route, feature, and library in your app ships in a single JavaScript file. A user visiting the login page downloads the code for the dashboard, admin panel, charts library, and everything else — most of which they may never use.

```
Single bundle (500KB)
  ├── Login page code
  ├── Dashboard code
  ├── Admin panel code
  ├── Chart library (200KB)
  └── PDF export library (80KB)
```

With code splitting, only what is needed right now loads first. Everything else loads on demand.

```
Initial bundle (80KB)
  └── Login page code

Dashboard chunk (180KB)    — loads when user navigates to /dashboard
Admin chunk (120KB)        — loads when user navigates to /admin
```

---

## Dynamic import()

The foundation of code splitting in JavaScript is the dynamic `import()` syntax. Unlike a static `import` at the top of the file, a dynamic import returns a Promise and loads the module only when called.

```jsx
// Static import — always included in the bundle
import HeavyLibrary from "./HeavyLibrary";

// Dynamic import — loaded on demand
const HeavyLibrary = await import("./HeavyLibrary");
```

React provides `React.lazy` and `Suspense` to make dynamic imports work seamlessly with components. For full details on those APIs, see [Lazy and Suspense](./LazySuspense.md).

---

## Route-Based Code Splitting

The most impactful place to split code is at route boundaries. Each route becomes its own chunk — users only load the code for pages they visit.

```jsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Each route is a separate chunk
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );
}
```

A user visiting `/dashboard` never downloads the code for `/admin` unless they navigate there.

---

## Component-Level Code Splitting

Split heavy components that are conditionally rendered — modals, drawers, rich text editors, chart dashboards.

```jsx
import { lazy, Suspense, useState } from "react";

const RichTextEditor = lazy(() => import("./components/RichTextEditor"));
const ChartDashboard = lazy(() => import("./components/ChartDashboard"));
const PdfExporter = lazy(() => import("./components/PdfExporter"));

function ArticlePage({ article }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showExporter, setShowExporter] = useState(false);

  return (
    <div>
      <h1>{article.title}</h1>
      <p>{article.content}</p>

      <button onClick={() => setIsEditing(true)}>Edit Article</button>
      <button onClick={() => setShowCharts(true)}>View Analytics</button>
      <button onClick={() => setShowExporter(true)}>Export PDF</button>

      {isEditing && (
        <Suspense fallback={<p>Loading editor...</p>}>
          <RichTextEditor content={article.content} />
        </Suspense>
      )}

      {showCharts && (
        <Suspense fallback={<p>Loading charts...</p>}>
          <ChartDashboard articleId={article.id} />
        </Suspense>
      )}

      {showExporter && (
        <Suspense fallback={<p>Preparing exporter...</p>}>
          <PdfExporter article={article} />
        </Suspense>
      )}
    </div>
  );
}
```

The rich text editor, charts library, and PDF exporter are never loaded unless the user explicitly requests them.

---

## Splitting Third-Party Libraries

Large third-party libraries are the most common source of bundle bloat. Splitting them into vendor chunks keeps them cached separately from your application code — a library chunk only re-downloads when the library version changes, not every time you deploy.

In Vite, configure `manualChunks` in `vite.config.js`:

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group vendor libraries into a separate chunk
          vendor: ["react", "react-dom"],
          charts: ["recharts"],
          editor: ["@tiptap/core", "@tiptap/react"],
          pdf: ["jspdf", "html2canvas"],
        },
      },
    },
  },
});
```

In webpack, use `SplitChunksPlugin` (included by default in Create React App and Next.js):

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
};
```

---

## Prefetching and Preloading

Once the initial page is interactive, you can preload chunks the user is likely to need next — before they click.

```jsx
// Prefetch on hover — loads in the background when the user hovers over a link
function NavLink({ to, label, chunkImport }) {
  function handleMouseEnter() {
    // Triggers the import but doesn't render the component yet
    chunkImport();
  }

  return (
    <a href={to} onMouseEnter={handleMouseEnter}>
      {label}
    </a>
  );
}

// Usage
const importDashboard = () => import("./pages/Dashboard");

<NavLink to="/dashboard" label="Dashboard" chunkImport={importDashboard} />;
```

When the user hovers over "Dashboard", the chunk begins downloading. By the time they click, it is likely already cached.

Webpack also supports magic comments for declarative prefetch and preload hints:

```jsx
// Prefetch — low priority, loads during idle time
const Dashboard = lazy(
  () => import(/* webpackPrefetch: true */ "./pages/Dashboard"),
);

// Preload — high priority, loads in parallel with current chunk
const CriticalModal = lazy(
  () => import(/* webpackPreload: true */ "./components/CriticalModal"),
);
```

---

## Named Exports with lazy

`React.lazy` requires a default export. When a module only has named exports, create a thin wrapper.

```jsx
// UserProfile.jsx — named export
export function UserProfile({ user }) {
  return <div>{user.name}</div>;
}

// Create a re-export file or inline wrapper
const UserProfile = lazy(() =>
  import("./UserProfile").then((module) => ({ default: module.UserProfile })),
);
```

---

## Analyzing Bundle Size

Before and after splitting, visualize your bundle to see what is large and what is duplicated.

For Vite, use `rollup-plugin-visualizer`:

```bash
npm install --save-dev rollup-plugin-visualizer
```

```js
// vite.config.js
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer({ open: true })],
});
```

For webpack, use `webpack-bundle-analyzer`:

```bash
npm install --save-dev webpack-bundle-analyzer
```

Running the build generates an interactive treemap showing exactly what is in each chunk and how large it is.

---

## Code Splitting Checklist

Work through this list when auditing a React application for splitting opportunities.

- Each top-level route is lazy-loaded
- Heavy conditionally-rendered components (modals, editors, dashboards) are lazy-loaded
- Large third-party libraries are in separate vendor chunks
- Libraries only used on specific pages are not in the shared bundle
- Bundle analyzer has been run and the largest chunks have been reviewed
- Prefetch hints are in place for routes the user is likely to visit next

---

## Common Mistakes

```jsx
// Placing lazy imports inside a component — recreates the lazy reference on every render
function App() {
  const Dashboard = lazy(() => import("./Dashboard")); // wrong — inside component
  return <Dashboard />;
}

// Always define lazy imports at module level — outside any component
const Dashboard = lazy(() => import("./Dashboard")); // correct

function App() {
  return <Dashboard />;
}

// Forgetting Suspense — lazy components must have a Suspense boundary above them
function App() {
  return <LazyComponent />; // throws if no Suspense ancestor
}

// Correct
function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyComponent />
    </Suspense>
  );
}

// Over-splitting — splitting every small component adds network overhead
// Split at meaningful boundaries: routes, heavy libraries, rarely-used features
```

---

## Summary

Code splitting reduces initial load time by breaking the bundle into chunks loaded on demand. Apply it at route boundaries for the broadest impact, then at the component level for heavy conditional features. Vendor chunks keep library code separately cached. Use bundle analyzer tools to find opportunities, and prefetch likely next routes once the page is interactive. Always define `lazy` imports at module level and wrap lazy components in `Suspense` with an appropriate fallback.

---

_Next: [Lazy and Suspense](./LazySuspense.md) — the React APIs that power component-level code splitting._
