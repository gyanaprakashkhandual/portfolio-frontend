# useCallback

`useCallback` memoizes a function definition so it is not recreated on every render. It returns the same function reference as long as its dependencies have not changed — which matters when passing callbacks to memoized child components or using them as effect dependencies.

---

## Syntax

```js
const memoizedFn = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

- The first argument is the function you want to memoize.
- The second argument is the dependency array — the function is recreated only when one of these values changes.
- React returns the cached function reference on renders where the dependencies have not changed.

---

## Why Function References Matter

In JavaScript, functions are objects. A function defined inside a component body is a new reference on every render — even if the logic is identical.

```jsx
function Parent() {
  const handleClick = () => console.log("clicked"); // new reference each render

  return <Child onClick={handleClick} />;
}
```

If `Child` is wrapped in `React.memo`, it still re-renders on every parent render because `onClick` is always a new reference. `useCallback` fixes this.

---

## Basic Example

```jsx
import { useState, useCallback } from "react";
import React from "react";

const Button = React.memo(function Button({ label, onClick }) {
  console.log(`Rendering: ${label}`);
  return <button onClick={onClick}>{label}</button>;
});

function Counter() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState("light");

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []); // no deps — function never changes

  const decrement = useCallback(() => {
    setCount((prev) => prev - 1);
  }, []);

  return (
    <div className={theme}>
      <p>Count: {count}</p>
      <Button label="Increment" onClick={increment} />
      <Button label="Decrement" onClick={decrement} />
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
    </div>
  );
}
```

Toggling the theme re-renders `Counter`, but `Button` components do not re-render because `increment` and `decrement` references remain stable.

---

## useCallback with Dependencies

When a callback depends on state or props, include those values in the dependency array. Using the functional update form of `setState` can reduce the dependencies you need.

```jsx
function SearchBox({ onSearch }) {
  const [query, setQuery] = useState("");

  // Recreated whenever query changes
  const handleSearch = useCallback(() => {
    onSearch(query);
  }, [query, onSearch]);

  // Better — use functional setState to avoid depending on query
  const handleSearch = useCallback(() => {
    setQuery((current) => {
      onSearch(current);
      return current;
    });
  }, [onSearch]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}
```

---

## Passing Stable Callbacks to Child Components

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([]);

  const addTodo = useCallback((text) => {
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }, []);

  const removeTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return (
    <div>
      <AddTodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onRemove={removeTodo} />
    </div>
  );
}
```

Because `addTodo`, `toggleTodo`, and `removeTodo` are stable references, memoized child components like `AddTodoForm` and `TodoList` only re-render when their own data changes.

---

## useCallback as an Effect Dependency

If a function is used inside a `useEffect`, including it as a dependency is required by the rules of hooks. Without `useCallback`, the function recreates on every render, causing the effect to run on every render too.

```jsx
function DataFetcher({ userId }) {
  const [data, setData] = useState(null);

  const fetchUser = useCallback(async () => {
    const result = await fetch(`/api/users/${userId}`);
    const json = await result.json();
    setData(json);
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // stable ref — effect runs only when userId changes

  return data ? <p>{data.name}</p> : <p>Loading...</p>;
}
```

---

## useCallback vs useMemo

|          | `useCallback`                            | `useMemo`                                                |
| -------- | ---------------------------------------- | -------------------------------------------------------- |
| Memoizes | A function reference                     | A computed value                                         |
| Returns  | The function itself                      | The result of calling the function                       |
| Use for  | Stable callbacks for children or effects | Expensive computations or stable object/array references |

They are related — `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

---

## When Not to Use useCallback

`useCallback` has overhead. It allocates memory for the cached function and runs dependency comparisons on every render. For callbacks that are not passed to memoized children or used in effect dependency arrays, it provides no benefit.

```jsx
// Not worth it — this handler is only used inline, not passed to memoized children
const handleChange = useCallback((e) => {
  setValue(e.target.value);
}, []);

// Just write it directly
const handleChange = (e) => setValue(e.target.value);
```

Apply `useCallback` only when you can identify a real re-render problem, not as a default pattern for every function in your component.

---

## Common Mistakes

```jsx
// Missing dependency — stale closure
const handleSave = useCallback(() => {
  saveData(userId) // userId not in deps — uses stale value
}, [])

// Correct
const handleSave = useCallback(() => {
  saveData(userId)
}, [userId])

// useCallback without React.memo on the child — no benefit
const fn = useCallback(() => doThing(), [])
<Child onClick={fn} /> // Child always re-renders anyway without React.memo

// Wrapping every function unnecessarily — adds overhead with no gain
const add = useCallback((a, b) => a + b, []) // pure math, no benefit
```

---

## Summary

`useCallback` is a referential stability tool. Its primary value is preventing unnecessary re-renders of memoized children and avoiding accidental infinite loops when functions are used in effect dependency arrays. Use it with `React.memo` as a pair — one without the other rarely accomplishes anything. And like all memoization hooks, apply it when you have a real performance problem, not as a default habit.

---

_Next: [useLayoutEffect](./UseLayoutEffect.md) — run effects synchronously after DOM mutations but before the browser paints._
