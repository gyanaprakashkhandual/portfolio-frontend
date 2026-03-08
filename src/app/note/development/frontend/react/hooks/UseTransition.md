# useTransition

`useTransition` lets you mark a state update as non-urgent — a transition — so React can keep the UI responsive while that update is being processed. It separates high-priority updates (like typing) from lower-priority ones (like rendering a filtered list), preventing the UI from feeling sluggish or frozen.

---

## Syntax

```js
const [isPending, startTransition] = useTransition();
```

- `isPending` — a boolean that is `true` while the transition is in progress. Use it to show a loading indicator.
- `startTransition` — a function that wraps the non-urgent state update you want to defer.

---

## The Problem It Solves

When a user interaction triggers an expensive re-render, the UI can become unresponsive — keystrokes are delayed, animations stutter, and the interface feels frozen.

Without `useTransition`, every state update has the same priority:

```jsx
function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(allItems);

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value); // urgent
    setResults(filterItems(value)); // expensive, but treated as equally urgent
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      <ResultsList items={results} />
    </div>
  );
}
```

If `filterItems` is slow, typing feels delayed — React must finish the expensive update before responding to the next keystroke.

---

## Basic Usage

Wrap the non-urgent update inside `startTransition`. React will immediately process the urgent update (the input value), then process the transition in the background.

```jsx
import { useState, useTransition } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(allItems);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value); // urgent — update input immediately

    startTransition(() => {
      setResults(filterItems(value)); // non-urgent — can be deferred
    });
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Updating results...</p>}
      <ResultsList items={results} />
    </div>
  );
}
```

The input now stays responsive while `ResultsList` re-renders in the background.

---

## Tab Navigation Example

`useTransition` is ideal for tab switching where each tab renders a large amount of content.

```jsx
import { useState, useTransition } from "react";

const tabs = ["Home", "Posts", "Analytics", "Settings"];

function TabContainer() {
  const [activeTab, setActiveTab] = useState("Home");
  const [isPending, startTransition] = useTransition();

  function selectTab(tab) {
    startTransition(() => {
      setActiveTab(tab);
    });
  }

  return (
    <div>
      <nav>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => selectTab(tab)}
            style={{ fontWeight: activeTab === tab ? "bold" : "normal" }}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
        <TabContent tab={activeTab} />
      </div>
    </div>
  );
}
```

The tab buttons remain interactive even while `TabContent` is re-rendering. The opacity fade signals to the user that content is loading without blocking their interactions.

---

## useTransition with Suspense

`useTransition` integrates with React Suspense. When a transition triggers a component that suspends (e.g., lazy-loaded data), React stays on the old screen — keeping it visible and interactive — until the new screen is ready.

```jsx
import { Suspense, useState, useTransition, lazy } from "react";

const PostsTab = lazy(() => import("./PostsTab"));
const HomeTab = lazy(() => import("./HomeTab"));

function App() {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();

  const tabMap = { home: <HomeTab />, posts: <PostsTab /> };

  return (
    <div>
      <button onClick={() => startTransition(() => setTab("home"))}>
        Home
      </button>
      <button onClick={() => startTransition(() => setTab("posts"))}>
        Posts
      </button>

      <Suspense fallback={<p>Loading...</p>}>
        <div style={{ opacity: isPending ? 0.5 : 1 }}>{tabMap[tab]}</div>
      </Suspense>
    </div>
  );
}
```

Without `useTransition`, clicking a tab would immediately show the Suspense fallback (spinner), then replace it with content — a jarring experience. With `useTransition`, the current tab stays visible with a dimmed opacity until the next tab is fully ready.

---

## useTransition in React 19 — Async Actions

In React 19, `startTransition` can wrap async functions. This means you can use it for server mutations and data fetching, with `isPending` tracking the async operation.

```jsx
import { useState, useTransition } from "react";

function LikeButton({ postId }) {
  const [likes, setLikes] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    startTransition(async () => {
      const updatedLikes = await likePost(postId);
      setLikes(updatedLikes);
    });
  }

  return (
    <button onClick={handleLike} disabled={isPending}>
      {isPending ? "Liking..." : `Like (${likes})`}
    </button>
  );
}
```

---

## isPending — Giving Users Feedback

The `isPending` flag is your signal to communicate that something is happening. Use it to show a spinner, dim content, or disable buttons — without blocking the UI entirely.

```jsx
// Dimming stale content
<div style={{ opacity: isPending ? 0.5 : 1 }}>
  <ExpensiveComponent />
</div>;

// Showing a loading indicator
{
  isPending && <Spinner />;
}

// Disabling actions during transition
<button disabled={isPending}>Submit</button>;
```

---

## useTransition vs useDeferredValue

Both hooks improve responsiveness, but they work differently:

|                          | `useTransition`               | `useDeferredValue`                              |
| ------------------------ | ----------------------------- | ----------------------------------------------- |
| What you control         | The state update              | The value passed to a component                 |
| Where to apply           | Around the `setState` call    | Around the value used for rendering             |
| Use when                 | You own the state update code | You receive a value as a prop or from a library |
| Async support (React 19) | Yes                           | No                                              |

```jsx
// useTransition — you control the setter
startTransition(() => setResults(filter(query)));

// useDeferredValue — you receive the value
const deferredQuery = useDeferredValue(query);
const results = filter(deferredQuery);
```

---

## Common Mistakes

```jsx
// Wrapping the wrong update in startTransition
startTransition(() => {
  setInputValue(e.target.value); // wrong — this IS the urgent update
});

// Not showing feedback — user has no indication something is happening
startTransition(() => setTab("posts"));
// Always use isPending to give the user a visual signal

// Using useTransition for trivial updates — not worth the overhead
startTransition(() => setIsOpen(true)); // a simple boolean toggle is not expensive

// Expecting synchronous behavior — updates inside transitions are async
startTransition(() => setResults(data));
console.log(results); // still shows old results — transition hasn't completed
```

---

## Summary

`useTransition` is a performance tool that lets you tell React which updates are urgent and which can wait. Wrap expensive, non-urgent state updates in `startTransition` to keep your UI responsive — then use `isPending` to communicate progress to the user. In React 19, it also supports async actions, making it useful for server mutations and data fetching flows.

---

_Next: [useDeferredValue](./UseDeferredValue.md) — defer a specific value to keep rendering responsive without controlling the state update._
