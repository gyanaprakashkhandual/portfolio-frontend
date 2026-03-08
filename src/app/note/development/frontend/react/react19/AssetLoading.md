# Asset Loading

React 19 introduces built-in APIs for loading and preloading external resources — stylesheets, scripts, fonts, and other assets — directly from React components. These APIs let React coordinate resource loading with rendering, improving performance without manual `<head>` manipulation or third-party libraries.

---

## The Problem Before React 19

Loading assets in React previously required manipulating the `<head>` element through a framework (like Next.js's `<Head>` component), a third-party library like `react-helmet`, or placing tags directly in the HTML template. There was no first-class React primitive for it.

```jsx
// Old approach — framework-specific, not portable
import Head from "next/head";

function MyPage() {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/styles/page.css" />
        <script src="/analytics.js" async />
      </Head>
      <main>Content</main>
    </>
  );
}
```

React 19 brings these capabilities directly into React itself, making them framework-agnostic.

---

## Resource Loading APIs

React 19 exposes a set of functions from `react-dom` for loading and preloading resources. These APIs are imperative — you call them in response to render or interaction, and React handles deduplication, placement in `<head>`, and ordering.

```jsx
import {
  prefetchDNS,
  preconnect,
  preload,
  preinit,
  preloadModule,
  preinitModule,
} from "react-dom";
```

---

## prefetchDNS

Resolves the DNS for a domain in advance. Use this for domains you are likely to connect to soon but have not started fetching from yet.

```jsx
import { prefetchDNS } from "react-dom";

function App() {
  // Resolves DNS for the API domain as early as possible
  prefetchDNS("https://api.example.com");

  return <Main />;
}
```

This inserts `<link rel="dns-prefetch" href="https://api.example.com">` into `<head>`.

---

## preconnect

Establishes a TCP connection (and TLS handshake for HTTPS) to a server in advance. More aggressive than `prefetchDNS` — use when you are certain a connection is imminent.

```jsx
import { preconnect } from "react-dom";

function App() {
  preconnect("https://fonts.googleapis.com");
  preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });

  return <Main />;
}
```

Inserts `<link rel="preconnect" href="...">` into `<head>`.

---

## preload

Fetches a resource and stores it in the browser cache for later use. The resource is not executed or applied — just downloaded. Use for stylesheets, fonts, scripts, or images that will definitely be needed soon.

```jsx
import { preload } from "react-dom";

function ProductPage({ product }) {
  // Preload the hero image as soon as we know the product
  preload(product.heroImageUrl, { as: "image" });

  // Preload a font used on this page
  preload("https://fonts.gstatic.com/s/inter/v13/font.woff2", {
    as: "font",
    crossOrigin: "anonymous",
  });

  return (
    <article>
      <img src={product.heroImageUrl} alt={product.name} />
      <h1>{product.name}</h1>
    </article>
  );
}
```

The `as` option tells the browser what type of resource is being preloaded — important for correct prioritization. Values include `"image"`, `"font"`, `"style"`, `"script"`, `"fetch"`, and `"document"`.

---

## preinit

Fetches and executes a script, or fetches and applies a stylesheet — immediately. Unlike `preload`, `preinit` both downloads and activates the resource.

```jsx
import { preinit } from "react-dom";

function AnalyticsDashboard() {
  // Fetch and execute a third-party analytics script
  preinit("https://analytics.example.com/tracker.js", { as: "script" });

  // Fetch and apply a stylesheet
  preinit("/styles/dashboard.css", { as: "style" });

  return <DashboardContent />;
}
```

Use `preinit` when you need the resource active before the component renders — for critical styles or initialization scripts.

---

## preloadModule and preinitModule

`preloadModule` and `preinitModule` are the ES module equivalents of `preload` and `preinit`.

```jsx
import { preloadModule, preinitModule } from "react-dom";

function AdvancedEditor() {
  // Preload a heavy ES module without executing it yet
  preloadModule("/modules/syntax-highlighter.js");

  // Load and execute an ES module immediately
  preinitModule("/modules/editor-core.js");

  return <EditorContainer />;
}
```

---

## Stylesheets with Precedence

React 19 adds first-class support for stylesheets with the `precedence` prop on `<link>` elements rendered inside components. React deduplicates stylesheets by `href` and orders them by `precedence`.

```jsx
function ThemeProvider({ theme, children }) {
  return (
    <>
      {/* Base styles — lowest precedence */}
      <link rel="stylesheet" href="/styles/base.css" precedence="default" />

      {/* Theme styles — applied after base */}
      <link
        rel="stylesheet"
        href={`/styles/themes/${theme}.css`}
        precedence="theme"
      />

      {children}
    </>
  );
}

function PremiumFeature() {
  return (
    <>
      {/* Component-specific styles — highest precedence */}
      <link
        rel="stylesheet"
        href="/styles/premium.css"
        precedence="component"
      />
      <div className="premium-feature">Premium content</div>
    </>
  );
}
```

If both `ThemeProvider` and `PremiumFeature` render `/styles/base.css`, React inserts it only once. Precedence determines order in `<head>`: `"default"` before `"theme"` before `"component"`.

React also delays rendering a component until its associated stylesheet has loaded, preventing a flash of unstyled content.

---

## Scripts with async

React 19 deduplicates `<script>` elements with the same `src`. If the same script is rendered by multiple components, it is inserted into `<head>` only once.

```jsx
function GoogleMapsEmbed({ location }) {
  return (
    <>
      <script src="https://maps.googleapis.com/maps/api/js?key=API_KEY" async />
      <div id="map" data-location={location} />
    </>
  );
}

// Even if GoogleMapsEmbed renders many times on a page,
// the script tag is only inserted into <head> once
```

---

## Combining Preloading with Lazy Loading

A common pattern: preload a module's assets while the module itself loads lazily.

```jsx
import { lazy, Suspense } from "react";
import { preload } from "react-dom";

const VideoPlayer = lazy(() => import("./VideoPlayer"));

function ArticlePage({ article }) {
  // Preload the video poster image as soon as the article renders
  if (article.videoUrl) {
    preload(article.posterUrl, { as: "image" });
  }

  return (
    <article>
      <h1>{article.title}</h1>
      <p>{article.body}</p>

      {article.videoUrl && (
        <Suspense fallback={<div>Loading player...</div>}>
          <VideoPlayer src={article.videoUrl} poster={article.posterUrl} />
        </Suspense>
      )}
    </article>
  );
}
```

The poster image starts downloading immediately when the article renders. By the time `VideoPlayer` finishes loading lazily, the poster is already cached.

---

## Using Preloads on Interaction

Trigger preloads on hover or focus to load resources right before the user needs them.

```jsx
import { preload, preinit } from "react-dom";

function NavItem({ href, label, styles, script }) {
  function handleMouseEnter() {
    // Start loading the next page's styles and scripts on hover
    if (styles) preload(styles, { as: "style" });
    if (script) preload(script, { as: "script" });
  }

  return (
    <a href={href} onMouseEnter={handleMouseEnter}>
      {label}
    </a>
  );
}
```

By the time the user clicks, the resources are already downloaded.

---

## Resource Deduplication

All React 19 resource APIs deduplicate automatically. Calling `preload` or `preinit` multiple times with the same URL has no additional effect — the resource is only fetched once.

```jsx
function ComponentA() {
  preload("/fonts/inter.woff2", { as: "font", crossOrigin: "anonymous" });
  return <p>Component A</p>;
}

function ComponentB() {
  preload("/fonts/inter.woff2", { as: "font", crossOrigin: "anonymous" });
  return <p>Component B</p>;
}

// Even if both render simultaneously, the font is only preloaded once
function App() {
  return (
    <>
      <ComponentA />
      <ComponentB />
    </>
  );
}
```

---

## API Reference Summary

| API                     | Effect                                | Use When                                 |
| ----------------------- | ------------------------------------- | ---------------------------------------- |
| `prefetchDNS(href)`     | DNS resolution only                   | You may connect to this domain soon      |
| `preconnect(href)`      | DNS + TCP + TLS                       | Connection is imminent                   |
| `preload(href, { as })` | Downloads, does not execute           | Resource needed soon but not immediately |
| `preinit(href, { as })` | Downloads and executes or applies     | Resource needed immediately              |
| `preloadModule(href)`   | Downloads ES module, does not execute | ES module needed soon                    |
| `preinitModule(href)`   | Downloads and executes ES module      | ES module needed immediately             |

---

## Common Mistakes

```jsx
// Using preinit for a resource you only want to cache — it executes immediately
preinit("/scripts/heavy-lib.js", { as: "script" }); // loads and runs now
// If you just want to download it for later:
preload("/scripts/heavy-lib.js", { as: "script" }); // correct

// Missing the "as" option on preload — browser cannot prioritize correctly
preload("/fonts/inter.woff2"); // wrong — missing { as: "font" }
preload("/fonts/inter.woff2", { as: "font", crossOrigin: "anonymous" }); // correct

// Using precedence on a stylesheet that is already globally loaded in HTML
// React will insert a duplicate — only use precedence for stylesheets
// managed by React itself, not those already in your HTML template

// Calling preload inside a useEffect — too late, effect runs after paint
useEffect(() => {
  preload("/critical-font.woff2", { as: "font" }); // font loads too late
}, []);

// Call preload directly in the component body or Server Component — before render
function Page() {
  preload("/critical-font.woff2", { as: "font" }); // correct — fires early
  return <Content />;
}
```

---

## Summary

React 19's asset loading APIs — `prefetchDNS`, `preconnect`, `preload`, `preinit`, `preloadModule`, and `preinitModule` — give components direct control over when external resources are fetched and applied. All APIs deduplicate automatically. Use `preload` to cache resources in advance without applying them, `preinit` to fetch and apply immediately, and `prefetchDNS` / `preconnect` to establish connections early. Stylesheet `precedence` lets React order and deduplicate CSS without framework-specific tooling. Call these APIs in the component body or on user interaction — not inside `useEffect` — for the earliest possible effect.

---

_Next: [Document Metadata](./DocumentMetadata.md) — managing page title, description, and meta tags directly from React components._
