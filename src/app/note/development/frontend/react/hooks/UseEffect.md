# useEffect

`useEffect` lets you synchronize a component with an external system — fetching data, setting up subscriptions, managing timers, or directly interacting with the DOM. It runs after React has painted the screen, keeping your component's rendering pure and side-effect-free.

---

## Syntax

```js
useEffect(() => {
  // side effect logic

  return () => {
    // cleanup (optional)
  };
}, [dependencies]);
```

- The first argument is the **effect function** — the code to run.
- The optional return value is a **cleanup function** — runs before the next effect execution or when the component unmounts.
- The second argument is the **dependency array** — controls when the effect re-runs.

---

## Dependency Array Behavior

| Dependency Array     | When the Effect Runs                                    |
| -------------------- | ------------------------------------------------------- |
| Not provided         | After every render                                      |
| `[]` empty array     | Once — after the first render only                      |
| `[a, b]` with values | After the first render, and whenever `a` or `b` changes |

```jsx
// Runs after every render
useEffect(() => {
  document.title = `${count} items`;
});

// Runs once on mount
useEffect(() => {
  console.log("Component mounted");
}, []);

// Runs when count changes
useEffect(() => {
  document.title = `${count} items`;
}, [count]);
```

---

## Fetching Data

Data fetching is one of the most common uses of `useEffect`. Always handle the case where the component unmounts before the request completes to avoid setting state on an unmounted component.

```jsx
import { useState, useEffect } from "react";

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <h2>{user.name}</h2>;
}
```

---

## Cleanup Function

The cleanup function prevents memory leaks and stale state by undoing the effect before it runs again or before the component unmounts.

### Clearing a Timer

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    setSeconds((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

### Removing an Event Listener

```jsx
useEffect(() => {
  function handleResize() {
    setWindowWidth(window.innerWidth);
  }

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);
```

### Cancelling a WebSocket Connection

```jsx
useEffect(() => {
  const socket = new WebSocket("wss://example.com/feed");

  socket.onmessage = (event) => {
    setMessages((prev) => [...prev, event.data]);
  };

  return () => socket.close();
}, []);
```

---

## Rules of useEffect

**Do not write async directly in the effect function.** React expects the effect to return either nothing or a cleanup function — not a Promise.

```jsx
// Wrong — async effect function
useEffect(async () => {
  const data = await fetchData();
  setData(data);
}, []);

// Correct — define async function inside and call it
useEffect(() => {
  async function load() {
    const data = await fetchData();
    setData(data);
  }
  load();
}, []);
```

**Include all reactive values in the dependency array.** Any variable used inside the effect that comes from the component scope (props, state, or derived values) must be listed.

```jsx
// Missing dependency — stale closure bug
useEffect(() => {
  fetchUser(userId); // userId is not in deps — might be stale
}, []);

// Correct
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

---

## Separating Unrelated Effects

Use multiple `useEffect` calls for unrelated concerns. Grouping unrelated side effects into one makes code harder to read and reason about.

```jsx
function Dashboard({ userId, theme }) {
  // Handles data fetching
  useEffect(() => {
    fetchUserData(userId);
  }, [userId]);

  // Handles theme application separately
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);
}
```

---

## Reacting to Prop Changes

```jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;

    let cancelled = false;

    async function search() {
      const data = await fetchResults(query);
      if (!cancelled) setResults(data);
    }

    search();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <ul>
      {results.map((r) => (
        <li key={r.id}>{r.title}</li>
      ))}
    </ul>
  );
}
```

---

## Strict Mode and Double Invocation

In React's `StrictMode` (development only), effects run twice on mount — the effect fires, the cleanup runs, then the effect fires again. This is intentional. React uses this to help you catch effects that are not properly cleaned up.

If your effect breaks when run twice, it means you are missing a cleanup function or your effect has unintended side effects.

```jsx
// This will log twice in StrictMode — expected behavior
useEffect(() => {
  console.log("effect ran");
  return () => console.log("cleanup ran");
}, []);
```

---

## When Not to Use useEffect

Many developers overuse `useEffect`. Here are cases where you do not need it:

- **Deriving state from props or state** — compute it directly during rendering instead.
- **Handling user events** — put that logic inside event handlers, not effects.
- **Transforming data for rendering** — calculate it inline or with `useMemo`.

```jsx
// Unnecessary useEffect
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// Better — derive it directly
const fullName = `${firstName} ${lastName}`;
```

---

## Common Mistakes

```jsx
// Missing dependency — stale closure
useEffect(() => {
  doSomethingWith(value);
}, []); // value should be in deps

// Infinite loop — state update triggers re-render, which triggers effect, repeat
useEffect(() => {
  setCount(count + 1); // no dependency array means it runs after every render
});

// Async effect function — returns a Promise, not a cleanup function
useEffect(async () => {
  await doSomething();
}, []);
```

---

## Summary

`useEffect` is how you reach outside React's rendering cycle to synchronize with the world — APIs, timers, event listeners, DOM manipulation, and more. The key to using it well is understanding the dependency array, always writing cleanup functions when needed, and resisting the urge to use it for logic that belongs in event handlers or derived computations.

---

_Next: [useContext](./UseContext.md) — share data across the component tree without prop drilling._
