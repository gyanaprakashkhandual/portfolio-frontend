# Custom Hooks

Custom hooks are JavaScript functions that start with `use` and can call other hooks. They are the primary mechanism for extracting and reusing **stateful logic** across components — without adding extra components to the tree, without render props, and without higher-order components.

---

## Why Custom Hooks

When multiple components share the same stateful logic — managing a form, tracking window size, fetching data — duplicating that logic creates maintenance problems. A custom hook lets you extract that logic into a single place and use it anywhere.

```jsx
// Without a custom hook — duplicated in every component that needs it
function ComponentA() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return <p>Width: {windowWidth}</p>;
}

// With a custom hook — write once, use everywhere
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return width;
}

function ComponentA() {
  const width = useWindowWidth();
  return <p>Width: {width}</p>;
}
```

---

## Rules of Custom Hooks

Custom hooks follow the same rules as built-in hooks:

- Must start with `use` — this is how React identifies hooks and enforces the rules
- Must only be called at the **top level** of a function component or another hook
- Must not be called inside conditions, loops, or nested functions

```jsx
// ❌ Does not start with "use" — React can't identify it as a hook
function fetchData(url) { ... }

// ✅ Starts with "use" — React treats it correctly
function useFetchData(url) { ... }
```

---

## Data Fetching Hook

A hook that encapsulates fetch logic, loading state, and error handling.

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true; // prevent state updates on unmounted components
    };
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <h2>{user.name}</h2>;
}
```

---

## Local Storage Hook

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setValue(value) {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("useLocalStorage error:", error);
    }
  }

  return [storedValue, setValue];
}

// Usage — same API as useState, but persisted
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  );
}
```

---

## Debounce Hook

```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage — debounce a search input before making API calls
function SearchBox() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const { data } = useFetch(`/api/search?q=${debouncedQuery}`);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ResultsList results={data} />
    </>
  );
}
```

---

## Form Hook

```jsx
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function reset() {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }

  return { values, errors, touched, handleChange, handleBlur, reset };
}

// Usage
function SignUpForm() {
  const { values, handleChange, handleBlur, reset } = useForm({
    email: "",
    password: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitting:", values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

---

## Toggle Hook

A simple utility hook with a clean API.

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Usage
function Modal() {
  const { value: isOpen, toggle, setFalse: close } = useToggle();

  return (
    <>
      <button onClick={toggle}>Open Modal</button>
      {isOpen && (
        <dialog>
          <p>Modal content</p>
          <button onClick={close}>Close</button>
        </dialog>
      )}
    </>
  );
}
```

---

## Returning Multiple Values

Custom hooks can return arrays (like `useState`), objects, or single values depending on what makes the most sense for the API.

```jsx
// Array — for hooks with a primary value and setter (mirrors useState)
function useToggle(init) {
  const [state, setState] = useState(init);
  const toggle = useCallback(() => setState((v) => !v), []);
  return [state, toggle]; // destructure positionally
}

const [isOpen, toggleOpen] = useToggle(false);

// Object — for hooks with multiple named values
function useFetch(url) {
  // ...
  return { data, loading, error }; // destructure by name
}

const { data, loading } = useFetch("/api/users");
```

Use **arrays** when the hook's primary output is a value and a setter. Use **objects** when the hook returns multiple distinct, named pieces.

---

## Testing Custom Hooks

Custom hooks can be tested with `@testing-library/react` using `renderHook`.

```jsx
import { renderHook, act } from "@testing-library/react";
import { useToggle } from "./useToggle";

test("toggles state correctly", () => {
  const { result } = renderHook(() => useToggle(false));

  expect(result.current.value).toBe(false);

  act(() => {
    result.current.toggle();
  });

  expect(result.current.value).toBe(true);
});
```

---

## Common Mistakes

```jsx
// ❌ Calling a hook conditionally
function useConditionalData(enabled) {
  if (!enabled) return null; // hooks can't be called after a conditional return
  const [data, setData] = useState(null); // this breaks the rules of hooks
}

// ✅ Conditionally use the result, not the hook itself
function useConditionalData(enabled) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    fetchData().then(setData);
  }, [enabled]);

  return enabled ? data : null;
}

// ❌ Missing cleanup in effects — causes memory leaks
function useInterval(callback, delay) {
  useEffect(() => {
    setInterval(callback, delay); // leaked interval
  }, [delay]);
}

// ✅ Always return cleanup
function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

---

## Summary

Custom hooks are the cleanest way to share stateful logic in React. Any logic involving hooks — data fetching, subscriptions, timers, form handling, local storage — can be extracted into a `use`-prefixed function and reused across components. They produce no extra nodes, compose naturally, and are easy to test in isolation. Reach for custom hooks before HOCs or render props whenever the goal is sharing behavior, not injecting JSX.

---

_Next: [Forwarding Refs](./ForwardingRefs.md) — pass refs through component boundaries to access underlying DOM nodes._
