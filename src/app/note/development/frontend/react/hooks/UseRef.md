# useRef

`useRef` returns a mutable ref object whose `.current` property persists across renders. Unlike state, changing a ref does not trigger a re-render. It serves two primary purposes: accessing DOM elements directly, and storing any mutable value that needs to persist between renders without causing updates.

---

## Syntax

```js
const ref = useRef(initialValue);
```

- Returns an object `{ current: initialValue }`.
- The `current` property can be read and written freely.
- The object itself is stable — the same reference is returned on every render.

---

## Accessing DOM Elements

The most common use of `useRef` is attaching to a DOM element to read or imperatively control it — focusing an input, measuring dimensions, or triggering animations.

```jsx
import { useRef } from "react";

function SearchBar() {
  const inputRef = useRef(null);

  function handleFocus() {
    inputRef.current.focus();
  }

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="Search..." />
      <button onClick={handleFocus}>Focus Input</button>
    </div>
  );
}
```

React sets `ref.current` to the DOM node when the component mounts and resets it to `null` when it unmounts.

---

## Storing Mutable Values

Refs are ideal for storing values that you need to remember across renders but that should not trigger a re-render when they change — like timer IDs, previous prop values, or flags.

### Storing a Timer ID

```jsx
import { useState, useRef } from "react";

function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  function start() {
    if (intervalRef.current) return; // already running
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }

  function stop() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function reset() {
    stop();
    setSeconds(0);
  }

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### Tracking Previous State

```jsx
import { useState, useRef, useEffect } from "react";

function usePrevious(value) {
  const ref = useRef(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}
```

### Preventing a Double Fetch on Mount

```jsx
function DataLoader() {
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchData().then(setData);
  }, []);
}
```

---

## Ref vs State

|                              | `useRef`                  | `useState`      |
| ---------------------------- | ------------------------- | --------------- |
| Triggers re-render on change | No                        | Yes             |
| Persists across renders      | Yes                       | Yes             |
| Mutable directly             | Yes (`ref.current = x`)   | No (use setter) |
| Use for                      | DOM access, timers, flags | UI-driving data |

The key distinction: if changing a value should update the UI, use state. If it should not, use a ref.

---

## Forwarding Refs to Child Components

By default, you cannot attach a ref to a custom component — only to native DOM elements. In React 19, refs can be passed as a plain prop. In earlier versions, `forwardRef` was required.

```jsx
// React 19 — ref as a regular prop
function FancyInput({ ref, ...props }) {
  return <input ref={ref} className="fancy-input" {...props} />
}

// Usage
const inputRef = useRef(null)
<FancyInput ref={inputRef} placeholder="Type here" />
```

```jsx
// React 18 and earlier — forwardRef wrapper
import { forwardRef } from "react";

const FancyInput = forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy-input" {...props} />;
});
```

---

## Callback Refs

Instead of passing a ref object, you can pass a callback function as the `ref` prop. React calls it with the DOM node when the element mounts and with `null` when it unmounts.

```jsx
function MeasuredBox() {
  const [height, setHeight] = useState(0);

  const measuredRef = (node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  };

  return (
    <div>
      <div ref={measuredRef} className="box">
        Some content here
      </div>
      <p>Box height: {height}px</p>
    </div>
  );
}
```

---

## useImperativeHandle

When you expose a ref from a child component, you can use `useImperativeHandle` to control exactly what the parent can access — rather than exposing the raw DOM node.

```jsx
import { useRef, useImperativeHandle } from "react";

function VideoPlayer({ ref }) {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play() {
      videoRef.current.play();
    },
    pause() {
      videoRef.current.pause();
    },
    seek(time) {
      videoRef.current.currentTime = time;
    },
  }));

  return <video ref={videoRef} src="/video.mp4" />;
}

// Parent usage
function App() {
  const playerRef = useRef(null);

  return (
    <div>
      <VideoPlayer ref={playerRef} />
      <button onClick={() => playerRef.current.play()}>Play</button>
      <button onClick={() => playerRef.current.pause()}>Pause</button>
    </div>
  );
}
```

---

## Common Mistakes

```jsx
// Reading ref.current during render — unreliable, may be null
function Component() {
  const ref = useRef(null);
  console.log(ref.current.value); // wrong — DOM isn't attached yet during render

  return <input ref={ref} />;
}

// Correct — access ref.current inside effects or event handlers
useEffect(() => {
  console.log(ref.current.value);
}, []);

// Using ref when state is needed — UI won't update
const count = useRef(0);
count.current += 1; // changing this won't re-render the component
// Use useState if the value drives the UI
```

---

## Summary

`useRef` fills two important roles: direct DOM access for imperative operations, and a stable container for mutable values that should not drive re-renders. Use it for timers, previous values, flags, and any interaction that bypasses React's declarative data flow. When a value does need to update the UI, always prefer `useState`.

---

_Next: [useMemo](./UseMemo.md) — memoize expensive computations to optimize rendering performance._
