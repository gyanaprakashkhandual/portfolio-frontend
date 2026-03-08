# Introduction to React

React is a declarative, component-based JavaScript library for building user interfaces. Developed and maintained by Meta (formerly Facebook), React has become one of the most widely adopted front-end libraries in the world — powering everything from small personal projects to large-scale production applications.

---

## What is React?

React is a **UI library** — not a full framework — that focuses on one thing: building composable, reusable user interfaces. It introduces a component model where each piece of your UI is an isolated, self-contained unit that manages its own structure, logic, and appearance.

React works with any back-end and pairs seamlessly with modern tooling, making it flexible enough to power SPAs, server-rendered apps, static sites, native mobile apps (via React Native), and more.

> **Current Version:** React 19 — the latest major release introducing Server Components, Server Actions, new hooks, and significant improvements to the developer experience.

---

## Why React?

**Declarative** — You describe _what_ your UI should look like for a given state. React handles the DOM updates efficiently behind the scenes, so you never have to manually touch the DOM.

**Component-Based** — UIs are built from small, independent components that compose into complex interfaces. Each component encapsulates its own logic and rendering, making code easier to reason about, test, and reuse.

**Learn Once, Write Anywhere** — The same React concepts apply whether you're building for the web, mobile (React Native), or desktop. Your mental model transfers across platforms.

**Massive Ecosystem** — React has one of the largest ecosystems in front-end development — with mature libraries for routing, state management, data fetching, animation, testing, and more.

**React 19** — The latest version brings first-class support for Server Components, a new Actions API for async state transitions, improved ref handling, built-in document metadata management, and three new hooks (`useActionState`, `useFormStatus`, `useOptimistic`).

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm**, **yarn**, or **pnpm**

### Creating a New React App

The recommended way to start a new React project is through a framework that supports React 19:

**Using Vite (recommended for SPAs)**

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

**Using Next.js (recommended for full-stack / SSR)**

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

**Using React directly (manual setup)**

```bash
npm install react react-dom
```

---

## Your First React Component

Every React application is built from components. Here is a minimal example:

```jsx
// App.jsx

function Greeting({ name }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Welcome to React 19.</p>
    </div>
  );
}

export default function App() {
  return <Greeting name="Developer" />;
}
```

**What's happening here:**

- `Greeting` is a **functional component** — a plain JavaScript function that returns JSX.
- `{ name }` is a **prop** — data passed into the component from its parent.
- `App` is the **root component** that composes smaller components together.

---

## Rendering to the DOM

React renders your component tree into a real DOM node using `ReactDOM`:

```jsx
// main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`StrictMode` is a development tool that helps you catch potential issues early by intentionally double-invoking certain lifecycle methods and flagging deprecated APIs.

---

## Project Structure

A typical Vite-based React project looks like this:

```
my-app/
├── public/               # Static assets served as-is
├── src/
│   ├── assets/           # Images, fonts, and other assets
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page-level components (if using routing)
│   ├── App.jsx           # Root application component
│   └── main.jsx          # Entry point — mounts React to the DOM
├── index.html            # HTML shell
├── vite.config.js        # Vite configuration
└── package.json
```

---

## Core Concepts at a Glance

| Concept               | Description                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **JSX**               | HTML-like syntax that compiles to `React.createElement()` calls                               |
| **Components**        | Reusable UI building blocks defined as functions                                              |
| **Props**             | Read-only data passed from parent to child components                                         |
| **State**             | Local, mutable data managed within a component via hooks                                      |
| **Hooks**             | Functions like `useState`, `useEffect` that let you use React features in function components |
| **Context**           | A way to share data across the component tree without prop drilling                           |
| **Server Components** | React 19 — components that render on the server with zero client-side JS                      |

---

## What's New in React 19

React 19 is a landmark release that fundamentally expands what React can do:

**Server Components** — Render components on the server. They can fetch data directly, access backend resources, and ship zero JavaScript to the client.

**Server Actions** — Define async server-side functions that can be called directly from client components, simplifying form handling and data mutations.

**New Hooks:**

- `useActionState` — Manages state transitions driven by async actions (e.g., form submissions).
- `useFormStatus` — Reads the pending state of a parent `<form>` submission.
- `useOptimistic` — Shows an optimistic UI update instantly while an async operation completes.

**Ref as a Prop** — `ref` can now be passed as a regular prop to function components — no more `forwardRef` wrapper needed.

**Document Metadata** — `<title>`, `<meta>`, and `<link>` tags rendered inside components are automatically hoisted to `<head>`.

**Asset Loading** — Stylesheets, fonts, and scripts can be preloaded declaratively from within components using built-in primitives.

---

## React vs Other Frameworks

| Feature           | React          | Vue                | Angular                 | Svelte             |
| ----------------- | -------------- | ------------------ | ----------------------- | ------------------ |
| Type              | Library        | Framework          | Full Framework          | Compiler           |
| Language          | JSX / JS / TS  | Template / JS / TS | TypeScript              | Svelte syntax      |
| Learning Curve    | Medium         | Low–Medium         | High                    | Low                |
| SSR Support       | Yes (Next.js)  | Yes (Nuxt)         | Yes (Angular Universal) | Yes (SvelteKit)    |
| Server Components | Yes (React 19) | No                 | No                      | No                 |
| Ecosystem Size    | Very Large     | Large              | Large                   | Growing            |
| Rendering Model   | Virtual DOM    | Virtual DOM        | Incremental DOM         | No VDOM (compiled) |

---

## Resources

- [Official React Documentation](https://react.dev) — The definitive guide, maintained by the React team
- [React GitHub](https://github.com/facebook/react) — Source code, issues, and release notes
- [React 19 Release Blog](https://react.dev/blog/2024/12/05/react-19) — Full breakdown of everything new in React 19
- [Vite](https://vitejs.dev) — Fast build tool recommended for React SPAs
- [Next.js](https://nextjs.org) — Full-stack React framework with built-in SSR and Server Components

---

_React's philosophy is simple: build your UI out of components, keep data flowing in one direction, and let React handle the DOM. Whether you're building a simple form or a complex data-driven application, React gives you the tools to do it cleanly and at scale._
