# useLayoutEffect

`useLayoutEffect` has the same signature as `useEffect` but fires synchronously after all DOM mutations and before the browser paints. This makes it the right choice when you need to read layout from the DOM and immediately apply a change — preventing a visible flicker that `useEffect` would cause.

---

## Syntax

```js
useLayoutEffect(() => {
  // DOM reads and synchronous mutations

  return () => {
    // cleanup
  };
}, [dependencies]);
```

The API is identical to `useEffect`. The only difference is timing.

---

## useEffect vs useLayoutEffect — Timing

| Hook              | When It Fires                              | Blocks Paint |
| ----------------- | ------------------------------------------ | ------------ |
| `useEffect`       | After the browser paints                   | No           |
| `useLayoutEffect` | After DOM mutations, before browser paints | Yes          |

The sequence on a render is:

1. React updates the DOM.
2. `useLayoutEffect` fires — synchronously.
3. The browser paints the screen.
4. `useEffect` fires — asynchronously.

---

## When to Use useLayoutEffect

Use `useLayoutEffect` when:

- You need to **read DOM measurements** (dimensions, scroll position, bounding boxes) and immediately apply a visual change based on them.
- You are **positioning a tooltip, popover, or dropdown** relative to a trigger element and need the position calculated before the user sees it.
- You are **synchronously setting a CSS variable or class** based on DOM state.
- You have **a visual flicker** with `useEffect` that goes away with `useLayoutEffect`.

For everything else, use `useEffect`. It does not block painting and keeps the UI more responsive.

---

## Practical Example — Measuring DOM Size

```jsx
import { useState, useRef, useLayoutEffect } from "react";

function MeasuredPanel({ children }) {
  const panelRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    const { width, height } = node.getBoundingClientRect();
    setDimensions({ width, height });
  }, []); // runs after mount, before first paint

  return (
    <div ref={panelRef}>
      <p>Width: {dimensions.width}px</p>
      <p>Height: {dimensions.height}px</p>
      {children}
    </div>
  );
}
```

If this used `useEffect`, the component would render once with `0 x 0`, paint to the screen, then update — causing a brief flicker. `useLayoutEffect` prevents that by applying the measurement before the paint.

---

## Practical Example — Tooltip Positioning

```jsx
import { useRef, useState, useLayoutEffect } from "react";

function Tooltip({ targetRef, text }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!targetRef.current || !tooltipRef.current) return;

    const target = targetRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();

    setPosition({
      top: target.top - tooltip.height - 8,
      left: target.left + target.width / 2 - tooltip.width / 2,
    });
  }, [targetRef]);

  return (
    <div
      ref={tooltipRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
      }}
    >
      {text}
    </div>
  );
}
```

The tooltip is positioned before the browser paints — the user never sees it jump from a wrong position to the correct one.

---

## Practical Example — Syncing Scroll Position

```jsx
import { useRef, useLayoutEffect } from "react";

function ChatWindow({ messages }) {
  const bottomRef = useRef(null);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.map((msg) => (
        <div key={msg.id} className="message">
          {msg.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
```

Scrolling before paint means the user never sees the un-scrolled state, even briefly.

---

## Server-Side Rendering Warning

`useLayoutEffect` does not run on the server. If your app uses server-side rendering (Next.js, Remix), React will warn you when `useLayoutEffect` is used in a component that renders on the server, because there is no DOM to read from.

To handle this, either:

**Option 1 — Use useEffect as a fallback**

```jsx
import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
```

**Option 2 — Guard with isMounted state**

```jsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null; // render nothing on server
```

**Option 3 — Move the component to client-only rendering**

In Next.js, mark the component with `'use client'` and ensure it only mounts in the browser context.

---

## Cleanup

Like `useEffect`, `useLayoutEffect` supports a cleanup function. It runs before the next effect execution or when the component unmounts — also synchronously.

```jsx
useLayoutEffect(() => {
  const observer = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    setSize({ width, height });
  });

  observer.observe(ref.current);

  return () => observer.disconnect();
}, []);
```

---

## Common Mistakes

```jsx
// Using useLayoutEffect for non-visual side effects — unnecessary
useLayoutEffect(() => {
  fetch("/api/data").then(setData);
}, []); // does not involve DOM reads — use useEffect instead

// Ignoring the SSR warning — breaks server rendering
useLayoutEffect(() => {
  document.title = "Page Title";
}, []); // use useIsomorphicLayoutEffect or move to useEffect

// Heavy computation inside useLayoutEffect — blocks painting
useLayoutEffect(() => {
  const result = expensiveComputation(); // blocks the browser from painting
  setResult(result);
}, [data]);
// Move heavy computation out of useLayoutEffect and only do DOM reads inside it
```

---

## Summary

`useLayoutEffect` is a surgical tool for the specific situation where you need to read the DOM and synchronously react to it before the user sees the screen. Default to `useEffect` for all side effects — use `useLayoutEffect` only when you observe a visible flicker or need guaranteed synchronous DOM access. Be mindful of server-side rendering and use an isomorphic wrapper when necessary.

---

_Next: [useImperativeHandle](./UseImperativeHandle.md) — control what a parent component can access via a child's ref._
