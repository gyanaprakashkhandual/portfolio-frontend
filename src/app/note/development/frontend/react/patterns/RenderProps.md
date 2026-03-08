# Render Props

The Render Props pattern is a technique for sharing logic between components by passing a **function as a prop**. The function receives data or state from the provider component and returns JSX. This gives the parent complete control over what gets rendered while the child handles the behavior.

---

## Syntax

```jsx
<DataProvider render={(data) => <DisplayComponent data={data} />} />
```

Or more commonly, using `children` as the function:

```jsx
<DataProvider>
  {(data) => <DisplayComponent data={data} />}
</DataProvider>
```

The second form — **function as children** — is the most widely used variant.

---

## Basic Example

```jsx
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handleMouseMove(event) {
    setPosition({ x: event.clientX, y: event.clientY });
  }

  return (
    <div onMouseMove={handleMouseMove} style={{ height: "100vh" }}>
      {render(position)}
    </div>
  );
}

// Usage — total control over what gets rendered
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <p>
          Mouse is at {x}, {y}
        </p>
      )}
    />
  );
}
```

`MouseTracker` owns the event listener and position state. The caller decides what to do with that position.

---

## Function as Children

Using `children` as the render function is idiomatic React and reads more naturally.

```jsx
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}>
      {children(position)}
    </div>
  );
}

// Usage
function App() {
  return (
    <MouseTracker>
      {({ x, y }) => <p>Position: {x}, {y}</p>}
    </MouseTracker>
  );
}
```

---

## Data Fetching with Render Props

A classic use case — encapsulating fetch logic and giving callers full rendering control.

```jsx
function DataFetcher({ url, children }) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then((r) => r.json())
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }));
  }, [url]);

  return children(state);
}

// Usage — caller handles all rendering decisions
function UserProfile({ userId }) {
  return (
    <DataFetcher url={`/api/users/${userId}`}>
      {({ data, loading, error }) => {
        if (loading) return <p>Loading user...</p>;
        if (error) return <p>Failed to load user.</p>;
        return (
          <div>
            <h2>{data.name}</h2>
            <p>{data.email}</p>
          </div>
        );
      }}
    </DataFetcher>
  );
}
```

---

## Toggle Component

Encapsulate toggle logic and let the caller decide what "on" and "off" look like.

```jsx
function Toggle({ children }) {
  const [on, setOn] = useState(false);

  const toggle = () => setOn((prev) => !prev);

  return children({ on, toggle });
}

// Usage
function App() {
  return (
    <Toggle>
      {({ on, toggle }) => (
        <div>
          <button onClick={toggle}>{on ? "Hide" : "Show"} Details</button>
          {on && <p>Here are the details you requested.</p>}
        </div>
      )}
    </Toggle>
  );
}
```

The `Toggle` component works with any UI. It doesn't care about buttons, modals, accordions, or anything else — it just manages a boolean.

---

## Form State Management

```jsx
function FormManager({ initialValues, onSubmit, children }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  function handleChange(field) {
    return (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      {children({ values, errors, handleChange })}
    </form>
  );
}

// Usage
function ContactForm() {
  return (
    <FormManager
      initialValues={{ name: "", email: "" }}
      onSubmit={(values) => console.log(values)}
    >
      {({ values, handleChange }) => (
        <>
          <input value={values.name} onChange={handleChange("name")} placeholder="Name" />
          <input value={values.email} onChange={handleChange("email")} placeholder="Email" />
          <button type="submit">Send</button>
        </>
      )}
    </FormManager>
  );
}
```

---

## Render Props vs. Custom Hooks

Render props and custom hooks solve the same problem. In modern React (hooks era), custom hooks are almost always the cleaner solution.

| | Render Props | Custom Hook |
|---|---|---|
| **Logic sharing** | Via function prop | Via hook call |
| **JSX flexibility** | Caller renders anything | Caller renders anything |
| **Component tree** | Adds a wrapper node | No extra nodes |
| **Readability** | Can lead to deep nesting | Flat and linear |
| **Testability** | Requires rendering | Can test hook in isolation |

```jsx
// Render Props
function App() {
  return (
    <MouseTracker>
      {({ x, y }) => <Cursor x={x} y={y} />}
    </MouseTracker>
  );
}

// Custom Hook (equivalent, cleaner)
function App() {
  const { x, y } = useMousePosition();
  return <Cursor x={x} y={y} />;
}
```

Use render props when the shared logic must also **render something** (like an overlay or wrapper element), or when working with class components that can't use hooks.

---

## Avoiding Callback Recreation

When a function-as-children is defined inline, it recreates on every parent render. This can cause unnecessary re-renders in the child. Stabilize with `useCallback` when performance matters.

```jsx
function App() {
  // Recreated on every render
  return (
    <DataFetcher url="/api/users">
      {({ data }) => <UserList users={data} />}
    </DataFetcher>
  );
}

// Stabilized version
function App() {
  const renderUsers = useCallback(
    ({ data }) => <UserList users={data} />,
    [] // stable — only if UserList itself doesn't need to update
  );

  return <DataFetcher url="/api/users">{renderUsers}</DataFetcher>;
}
```

---

## Common Mistakes

```jsx
// ❌ Forgetting to call children as a function
function Provider({ children }) {
  const data = useSomeData();
  return <div>{children}</div>; // children is a function — this renders nothing useful
}

// ✅ Call children with the data
function Provider({ children }) {
  const data = useSomeData();
  return <div>{children(data)}</div>;
}

// ❌ Mixing render prop and children patterns
<Provider render={fn} children={fn2} /> // ambiguous — pick one

// ✅ Use one consistent pattern — prefer children
<Provider>{(data) => <Display data={data} />}</Provider>
```

---

## Summary

The Render Props pattern separates **what behavior a component has** from **what it renders**. The provider component owns state and logic; the caller owns the UI. This produces highly reusable components that work with any presentation. In modern React, custom hooks often replace render props for pure logic sharing — but render props remain valuable when a component needs to also inject JSX or when class components are involved.

---

_Next: [Compound Components](./CompoundComponents.md) — build expressive multi-part component APIs that share implicit state._