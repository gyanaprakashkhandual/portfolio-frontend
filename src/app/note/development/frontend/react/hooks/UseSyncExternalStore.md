# useSyncExternalStore

`useSyncExternalStore` is a hook for subscribing to external data stores — such as browser APIs, third-party state libraries, or any data source that lives outside React. It ensures your component stays in sync with the store safely, even in concurrent rendering mode.

---

## Syntax

```js
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

- `subscribe` — a function that accepts a callback and registers it as a listener on the external store. Must return an unsubscribe function.
- `getSnapshot` — a function that returns the current value from the store. React calls this on every render to check whether the component needs to update.
- `getServerSnapshot` — optional. Returns the initial snapshot for server-side rendering.

---

## Why It Exists

Before `useSyncExternalStore`, developers subscribed to external stores using `useEffect` and `useState`. This approach is fragile in concurrent React — React may render a component multiple times before committing, and a store update arriving between renders can leave the UI in a torn state (different parts of the UI reflecting different versions of the store).

`useSyncExternalStore` was introduced specifically to solve this. It is the correct, safe way for libraries and custom hooks to read from non-React state.

---

## Basic Example — Window Width

```jsx
import { useSyncExternalStore } from "react";

function subscribeToWindowSize(callback) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getWindowWidth() {
  return window.innerWidth;
}

function useWindowWidth() {
  return useSyncExternalStore(subscribeToWindowSize, getWindowWidth);
}

function ResponsiveComponent() {
  const width = useWindowWidth();

  return (
    <p>
      {width >= 768 ? "Desktop layout" : "Mobile layout"} — {width}px
    </p>
  );
}
```

---

## Custom Store Example

Here is a minimal observable store built from scratch and connected to React using `useSyncExternalStore`.

```js
// store.js

function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(updater) {
    state = typeof updater === "function" ? updater(state) : updater;
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, setState, subscribe };
}

export const counterStore = createStore({ count: 0 });
```

```jsx
// CounterDisplay.jsx
import { useSyncExternalStore } from "react";
import { counterStore } from "./store";

function useCounter() {
  return useSyncExternalStore(counterStore.subscribe, counterStore.getState);
}

function CounterDisplay() {
  const { count } = useCounter();

  return (
    <div>
      <p>Count: {count}</p>
      <button
        onClick={() => counterStore.setState((s) => ({ count: s.count + 1 }))}
      >
        Increment
      </button>
    </div>
  );
}
```

---

## Subscribing to Browser APIs

`useSyncExternalStore` works well with browser APIs that have their own event systems.

### Online/Offline Status

```jsx
import { useSyncExternalStore } from "react";

function subscribeToNetwork(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribeToNetwork,
    () => navigator.onLine,
    () => true, // assume online on server
  );
}

function NetworkBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="banner banner--offline">
      You are offline. Some features may be unavailable.
    </div>
  );
}
```

### Local Storage

```jsx
import { useSyncExternalStore, useCallback } from "react";

function createLocalStorageStore(key, defaultValue) {
  function getSnapshot() {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function subscribe(callback) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }

  function setValue(value) {
    localStorage.setItem(key, JSON.stringify(value));
    // Manually notify same-tab subscribers
    window.dispatchEvent(new Event("storage"));
  }

  return { getSnapshot, subscribe, setValue };
}

const themeStore = createLocalStorageStore("theme", "light");

function usePersistedTheme() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
  );
  return [theme, themeStore.setValue];
}
```

---

## Server-Side Rendering with getServerSnapshot

When your app renders on the server, `window` and browser APIs do not exist. The third argument — `getServerSnapshot` — provides a safe fallback value for SSR.

```jsx
const isOnline = useSyncExternalStore(
  subscribeToNetwork,
  () => navigator.onLine, // client snapshot
  () => true, // server snapshot — assume online
);
```

```jsx
const width = useSyncExternalStore(
  subscribeToWindowSize,
  () => window.innerWidth, // client snapshot
  () => 1024, // server snapshot — assume desktop
);
```

If you omit `getServerSnapshot` and the hook is called during SSR, React will throw an error.

---

## getSnapshot Must Be Stable and Pure

React calls `getSnapshot` frequently — during every render. It must:

- Return the same value if the store has not changed.
- Not create a new object or array on every call — this causes an infinite re-render loop because React compares snapshots by reference.

```jsx
// Problematic — new object reference every call, causes infinite loop
function getSnapshot() {
  return { count: store.count }; // new object each time
}

// Correct — return a primitive or a stable reference
function getSnapshot() {
  return store.count; // primitive comparison works fine
}

// If you must return an object, cache it
let cachedSnapshot;
let cachedState;

function getSnapshot() {
  if (store.state !== cachedState) {
    cachedState = store.state;
    cachedSnapshot = { ...store.state };
  }
  return cachedSnapshot;
}
```

---

## Common Mistakes

```jsx
// Creating subscribe function inline — new reference each render, causes issues
useSyncExternalStore(
  (cb) => {
    window.addEventListener("resize", cb);
    return () => window.removeEventListener("resize", cb);
  },
  () => window.innerWidth,
);
// Define subscribe outside the component or with useCallback

// Returning a new object from getSnapshot every call
function getSnapshot() {
  return { value: store.value }; // infinite loop
}

// Missing getServerSnapshot in an SSR app — throws on the server
useSyncExternalStore(subscribe, getClientSnapshot); // missing third arg
```

---

## When to Use useSyncExternalStore

Use it when:

- Integrating with a third-party state library (most already use it internally — Redux, Zustand, Valtio).
- Subscribing to browser APIs that emit events (resize, online/offline, geolocation, media queries).
- Building a custom observable store outside React's state system.
- Writing a library that needs to read external data safely in concurrent mode.

Do not use it for:

- State that can live inside React — use `useState` or `useReducer`.
- Simple derived values — compute them during rendering.

---

## Summary

`useSyncExternalStore` is the canonical, safe way to subscribe to data sources outside React. It handles concurrent rendering correctly, prevents UI tearing, and supports server-side rendering through the optional `getServerSnapshot`. While most application developers will not call it directly — libraries handle it for you — it is essential knowledge for anyone building custom stores, browser API wrappers, or state management utilities.

---

_Next: [useInsertionEffect](./UseInsertionEffect.md) — inject styles into the DOM before layout effects run._
