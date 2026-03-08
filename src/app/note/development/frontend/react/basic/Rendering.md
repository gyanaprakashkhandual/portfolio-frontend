# Rendering Elements

Rendering is the process by which React turns your component tree into actual DOM nodes on the screen. Understanding how React decides what to render and when to update helps you write more predictable and performant applications.

---

## The Root DOM Node

Every React application has a single root DOM node — a real HTML element that React controls. Everything inside it is managed by React.

```html
<!-- index.html -->
<div id="root"></div>
```

```jsx
// main.jsx
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
```

`createRoot` takes the real DOM node and returns a React root. Calling `.render()` on the root kicks off the initial render of the entire component tree.

---

## How Rendering Works

React rendering happens in two phases.

The **render phase** is where React calls your component functions and builds a new tree of React elements (a virtual DOM). This phase is pure — no side effects occur here.

The **commit phase** is where React compares the new tree to the previous one (reconciliation) and applies only the minimal set of changes to the real DOM.

```
Component functions run
         |
         v
React elements tree (virtual DOM)
         |
         v
Diffing against previous tree
         |
         v
Only changed DOM nodes are updated
```

This is why React is fast — it never rewrites the entire DOM. It surgically updates only what changed.

---

## What Triggers a Re-render

A component re-renders when:

- Its own state changes via `useState` or `useReducer`
- Its parent re-renders and passes new props
- A context it subscribes to changes

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // When count changes, Parent re-renders.
  // Child re-renders because Parent re-renders and passes a new prop.
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child value={count} />
    </>
  );
}

function Child({ value }) {
  return <p>Value: {value}</p>;
}
```

Re-rendering a component does not necessarily mean the DOM updates. React re-renders (calls the function) first, then diffs the output to decide if the real DOM needs to change.

---

## React Elements Are Immutable

A React element is a plain object that describes what you want on screen at a given moment. Once created, you cannot change its children or attributes — you produce a new element to describe the updated state.

```jsx
// This element describes a heading at one point in time
const element = <h1>Hello, World</h1>;

// To update the UI, you produce a new element
const updatedElement = <h1>Hello, Alice</h1>;
```

React compares the new element to the previous one and only updates the text node in the DOM — not the entire `<h1>`.

---

## The Virtual DOM and Reconciliation

The virtual DOM is a lightweight JavaScript representation of the real DOM. When state or props change, React creates a new virtual DOM tree and diffs it against the previous one. This process is called **reconciliation**.

React uses a set of heuristics to make this diffing fast:

- Two elements of different types produce entirely different trees. React destroys the old tree and builds a new one.
- Elements of the same type are compared attribute by attribute — only changed attributes update the DOM.
- List items use the `key` prop to match elements across renders.

```jsx
// Before update
<div className="card">
  <p>Hello</p>
</div>

// After update — only the text node changes, not the div or p
<div className="card">
  <p>Hello, Alice</p>
</div>
```

---

## Conditional Rendering and the DOM

When a component conditionally renders different elements, React may destroy and recreate subtrees. Element type changes always cause a remount.

```jsx
function StatusPanel({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn
        ? <UserDashboard />   // rendered when true
        : <LoginPrompt />     // rendered when false
      }
    </div>
  );
}
```

When `isLoggedIn` flips, the previously rendered component unmounts and the new one mounts. State inside the unmounted component is lost.

---

## Rendering Lists

React renders arrays of elements. Each element in an array must have a unique `key` prop so React can track items across re-renders.

```jsx
const products = [
  { id: 1, name: "Keyboard" },
  { id: 2, name: "Mouse" },
  { id: 3, name: "Monitor" },
];

function ProductList() {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

Without `key`, React cannot efficiently reconcile list items when the list order changes or items are inserted or removed. Always use a stable, unique identifier — not the array index when the list can reorder.

---

## Rendering null and Conditionals

Returning `null` from a component renders nothing. This is the standard way to conditionally show or hide a component.

```jsx
function Notification({ message }) {
  if (!message) return null; // renders nothing — no DOM node

  return (
    <div className="notification">
      {message}
    </div>
  );
}

// Usage
<Notification message={error} />    // renders if error is truthy
<Notification message={null} />     // renders nothing
```

`null`, `undefined`, `false`, and empty strings are all valid return values that render nothing. Be careful with `0` — it is a falsy value but React does render it as the character `"0"`.

```jsx
// Bug — renders "0" when count is 0
{count && <Badge count={count} />}

// Correct — explicit boolean coercion
{count > 0 && <Badge count={count} />}
```

---

## StrictMode and Double Rendering

In development, wrapping your app in `<React.StrictMode>` causes component functions to run twice. This is intentional — it helps surface side effects that are not safe to run more than once.

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Strict mode double-invocation only happens in development. It has no effect on production builds. If you see a side effect triggered twice during development, that is React warning you the effect is impure.

---

## Batching State Updates

React batches multiple state updates that occur in the same event handler into a single re-render. This avoids unnecessary intermediate renders.

```jsx
function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit() {
    setName("Alice");    // does not re-render yet
    setEmail("alice@example.com"); // does not re-render yet
    // React batches both updates — one re-render happens here
  }

  return (
    <button onClick={handleSubmit}>Populate</button>
  );
}
```

In React 18 and later, batching applies everywhere — inside event handlers, `setTimeout`, `Promise` callbacks, and native event listeners. In earlier React versions, batching only occurred inside React event handlers.

---

## Rendering Performance Considerations

Re-rendering is not inherently expensive — React is fast. Optimize only when you measure a real problem.

Common techniques when optimization is needed:

- `React.memo` — skips re-rendering a component when its props have not changed
- `useMemo` — memoizes an expensive computed value
- `useCallback` — memoizes a function reference so it stays stable across renders
- Code splitting with `React.lazy` — avoids loading components until they are needed

```jsx
// React.memo — Child only re-renders when value changes
const Child = React.memo(function Child({ value }) {
  return <p>{value}</p>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  return (
    <>
      <button onClick={() => setOther(other + 1)}>Update Other</button>
      <Child value={count} /> {/* Does not re-render when only other changes */}
    </>
  );
}
```

---

## Summary

React renders by calling component functions to produce a virtual DOM tree, diffing it against the previous tree, and applying only the minimal changes to the real DOM. Re-renders are triggered by state changes, prop changes, or context updates. Returning `null` renders nothing. Lists require stable `key` props for efficient reconciliation. React batches state updates within an event handler into a single re-render. Strict mode double-invokes render functions in development to help detect side effects.

---

_Next: [Event Handling](./EventHandling.md) — responding to user interactions with React's synthetic event system._