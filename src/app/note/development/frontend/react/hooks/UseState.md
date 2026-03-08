# useState

`useState` is the most fundamental React hook. It lets you add local, reactive state to a function component — whenever the state changes, React re-renders the component with the updated value.

---

## Syntax

```js
const [state, setState] = useState(initialValue);
```

- `state` — the current value of the state variable.
- `setState` — the function used to update the state and trigger a re-render.
- `initialValue` — the value React uses on the very first render. It can be a primitive, object, array, or a function (lazy initializer).

---

## Basic Usage

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

---

## Updating State

### Replacing State

For primitives like numbers, strings, and booleans, you pass the new value directly:

```jsx
const [name, setName] = useState("Alice");

setName("Bob"); // replaces 'Alice' with 'Bob'
```

### Functional Updates

When the new state depends on the previous state, always use the functional form. This guarantees you are working with the most recent state value, even if multiple updates are batched.

```jsx
const [count, setCount] = useState(0);

// Unsafe — reads stale state in some cases
setCount(count + 1);

// Safe — always uses the latest state
setCount((prev) => prev + 1);
```

---

## State with Objects

React does not automatically merge object state the way class components did with `this.setState`. You must spread the existing state manually when updating a single field.

```jsx
function ProfileForm() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
  });

  function handleChange(field, value) {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <form>
      <input
        value={profile.name}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="Name"
      />
      <input
        value={profile.email}
        onChange={(e) => handleChange("email", e.target.value)}
        placeholder="Email"
      />
      <textarea
        value={profile.bio}
        onChange={(e) => handleChange("bio", e.target.value)}
        placeholder="Bio"
      />
    </form>
  );
}
```

---

## State with Arrays

Arrays in state should be treated as immutable. Never mutate them directly — always return a new array.

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);

  function addTodo(text) {
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
  }

  function removeTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
            {todo.text}
          </span>
          <button onClick={() => toggleTodo(todo.id)}>Toggle</button>
          <button onClick={() => removeTodo(todo.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## Lazy Initialization

If computing the initial state is expensive, pass a function instead of a value. React will only call it once on the first render, not on every re-render.

```jsx
function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  return saved ?? "light";
}

// This function is called on every re-render — wasteful
const [theme, setTheme] = useState(getInitialTheme());

// This function is called once — correct
const [theme, setTheme] = useState(() => getInitialTheme());
```

---

## State Does Not Update Immediately

`setState` does not mutate the state variable synchronously. The new value is available only on the next render.

```jsx
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);
  console.log(count); // still logs the old value, not the updated one
}
```

If you need the updated value immediately after setting it, store it in a local variable first:

```jsx
function handleClick() {
  const next = count + 1;
  setCount(next);
  console.log(next); // correct
}
```

---

## Multiple State Variables

Prefer multiple `useState` calls for unrelated pieces of state. This keeps updates isolated and the code readable.

```jsx
function UserSettings() {
  const [username, setUsername] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Each piece of state is independent and easy to update
}
```

Group state into an object only when the fields are closely related and always update together.

---

## Common Mistakes

```jsx
// Mutating state directly — never do this
const [items, setItems] = useState([]);
items.push("new item"); // wrong — does not trigger re-render
setItems([...items, "new item"]); // correct

// Forgetting to spread object state
setProfile({ name: "Alice" }); // wrong — wipes out email and bio
setProfile((prev) => ({ ...prev, name: "Alice" })); // correct

// Using stale state in an updater
setCount(count + 1); // may be stale in async or batched contexts
setCount((prev) => prev + 1); // always safe
```

---

## Summary

`useState` is the foundation of interactivity in React. It stores a value, provides a setter function to update it, and automatically re-renders the component when the value changes. Keep state minimal, prefer functional updates when the new value depends on the old one, and treat objects and arrays as immutable.

---

_Next: [useEffect](./UseEffect.md) — run side effects in response to state and prop changes._
