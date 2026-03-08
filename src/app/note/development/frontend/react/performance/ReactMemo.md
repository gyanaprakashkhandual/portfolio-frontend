# React.memo

`React.memo` is a higher-order component that prevents a function component from re-rendering when its props have not changed. It is the primary tool for skipping unnecessary child re-renders when a parent updates.

---

## The Problem It Solves

By default, when a parent component re-renders, every child component re-renders too — regardless of whether its props changed.

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveChild name="Alice" />
    </>
  );
}

function ExpensiveChild({ name }) {
  console.log("ExpensiveChild rendered");
  return <p>Hello, {name}</p>;
}
```

Every time the button is clicked, `ExpensiveChild` re-renders even though `name` never changes. `React.memo` prevents this.

---

## Basic Usage

Wrap a component with `React.memo` to memoize it. React skips re-rendering the component if its props are the same as the last render.

```jsx
const ExpensiveChild = React.memo(function ExpensiveChild({ name }) {
  console.log("ExpensiveChild rendered");
  return <p>Hello, {name}</p>;
});

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveChild name="Alice" />{" "}
      {/* does not re-render when count changes */}
    </>
  );
}
```

React performs a shallow comparison of props between renders. If all props are equal, the previous render output is reused.

---

## Shallow Comparison

`React.memo` uses shallow equality by default. Primitive values (strings, numbers, booleans) compare by value. Objects, arrays, and functions compare by reference.

```jsx
// Primitives — stable across renders — memo works correctly
<MemoizedChild name="Alice" count={5} isActive={true} />

// New object on every render — memo never skips
<MemoizedChild config={{ theme: "dark" }} />

// New array on every render — memo never skips
<MemoizedChild items={[1, 2, 3]} />

// New function on every render — memo never skips
<MemoizedChild onClick={() => console.log("click")} />
```

For non-primitive props, stabilize references with `useMemo` and `useCallback` to make `React.memo` effective.

---

## Stabilizing Object Props with useMemo

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState("dark");

  // Without useMemo — new object on every render — Child always re-renders
  const config = { theme, fontSize: 16 };

  // With useMemo — same reference unless theme changes — Child skips re-render
  const config = useMemo(() => ({ theme, fontSize: 16 }), [theme]);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
      <MemoizedChild config={config} />
    </>
  );
}

const MemoizedChild = React.memo(function Child({ config }) {
  console.log("Child rendered");
  return <div style={{ fontSize: config.fontSize }}>Theme: {config.theme}</div>;
});
```

`MemoizedChild` now re-renders only when `theme` changes, not when `count` changes.

---

## Stabilizing Function Props with useCallback

Functions defined inside a component create a new reference on every render. Wrap them in `useCallback` when passing to memoized children.

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");

  // New function reference on every render without useCallback
  const handleDelete = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []); // stable — setTodos is always the same reference

  return (
    <>
      <FilterBar filter={filter} onChange={setFilter} />
      {todos.map((todo) => (
        <MemoizedTodoItem key={todo.id} todo={todo} onDelete={handleDelete} />
      ))}
    </>
  );
}

const MemoizedTodoItem = React.memo(function TodoItem({ todo, onDelete }) {
  console.log("TodoItem rendered:", todo.id);
  return (
    <li>
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
});
```

Without `useCallback`, a new `handleDelete` function is created on every render, causing every `MemoizedTodoItem` to re-render even when nothing changed for that item.

---

## Custom Comparison Function

Pass a second argument to `React.memo` to define your own comparison logic. Return `true` to skip re-render, `false` to allow it.

```jsx
function arePropsEqual(prevProps, nextProps) {
  // Only re-render when the user's id or name changes
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.name === nextProps.user.name
  );
}

const UserCard = React.memo(function UserCard({ user, onSelect }) {
  return (
    <div onClick={() => onSelect(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}, arePropsEqual);
```

The custom comparator ignores `user.email` and `onSelect` changes — the component only re-renders when `id` or `name` changes. Use this carefully and only when the default shallow comparison is inadequate for a specific, measured reason.

---

## When React.memo Is Effective

`React.memo` provides the most benefit when:

- The component renders frequently due to a parent that updates often
- The component is visually expensive — renders complex JSX, manages large lists, or does heavy computation
- Its props genuinely stay the same across many of the parent's re-renders
- All non-primitive props are stabilized with `useMemo` and `useCallback`

---

## When React.memo Is Not Worth It

`React.memo` adds a comparison cost on every render. It is not always beneficial.

Avoid it when:

- The component is cheap to render — the comparison overhead may cost more than re-rendering
- Props change on almost every render — the comparison runs but never skips
- The component is not in a hot re-render path — no performance problem exists to solve
- Props include objects or functions that are not stabilized — memo never skips anyway

---

## React.memo vs. useMemo vs. useCallback

These three tools are often used together but serve distinct purposes.

|               | What it memoizes            | Use case                                              |
| ------------- | --------------------------- | ----------------------------------------------------- |
| `React.memo`  | A component's render output | Skip re-rendering a child when props are unchanged    |
| `useMemo`     | A computed value            | Avoid expensive recalculation; stabilize object props |
| `useCallback` | A function reference        | Stabilize function props passed to memoized children  |

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // useMemo — stable object reference
  const options = useMemo(() => ({ count, doubled: count * 2 }), [count]);

  // useCallback — stable function reference
  const handleReset = useCallback(() => setCount(0), []);

  return (
    // React.memo — Child skips render when options and handleReset are unchanged
    <MemoizedChild options={options} onReset={handleReset} />
  );
}
```

---

## Real-World Example — Data Table Row

```jsx
const TableRow = React.memo(function TableRow({
  row,
  isSelected,
  onSelect,
  onEdit,
}) {
  return (
    <tr
      className={isSelected ? "row--selected" : ""}
      onClick={() => onSelect(row.id)}
    >
      <td>{row.name}</td>
      <td>{row.email}</td>
      <td>{row.role}</td>
      <td>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.id);
          }}
        >
          Edit
        </button>
      </td>
    </tr>
  );
});

function DataTable({ rows }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = useCallback((id) => setSelectedId(id), []);
  const handleEdit = useCallback((id) => openEditModal(id), []);

  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <TableRow
            key={row.id}
            row={row}
            isSelected={selectedId === row.id}
            onSelect={handleSelect}
            onEdit={handleEdit}
          />
        ))}
      </tbody>
    </table>
  );
}
```

When `selectedId` changes, only the two affected rows re-render — the newly selected row and the previously selected row. All other rows skip.

---

## Common Mistakes

```jsx
// Wrapping every component in React.memo by default — unnecessary overhead
const SimpleLabel = React.memo(function SimpleLabel({ text }) {
  return <span>{text}</span>; // too cheap to memoize — not worth it
});

// Memoizing a component but passing unstabilized props — memo never skips
const MemoizedChild = React.memo(Child);

function Parent() {
  // New object every render — MemoizedChild always re-renders
  return <MemoizedChild style={{ color: "red" }} />;
}

// Fix — stabilize the prop
const style = useMemo(() => ({ color: "red" }), []);
return <MemoizedChild style={style} />;

// Using React.memo without profiling first — optimizing before measuring
// Always confirm a real performance problem with the React DevTools Profiler
// before adding React.memo
```

---

## Summary

`React.memo` prevents a component from re-rendering when its props have not changed. It uses shallow prop comparison by default and accepts a custom comparator as a second argument. It works best when paired with `useMemo` for stable object props and `useCallback` for stable function props. Apply it selectively — only to components that are actually expensive and in a proven hot-render path. Measure first with the React DevTools Profiler, then optimize.

---

_Next: [Code Splitting](./CodeSplitting.md) — reducing initial bundle size by loading code only when it is needed._
