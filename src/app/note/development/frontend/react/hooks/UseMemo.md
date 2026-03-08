# useMemo

`useMemo` memoizes the result of an expensive computation so it is only recalculated when its dependencies change. On every other render, React returns the cached result — skipping the computation entirely.

---

## Syntax

```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

- The first argument is a function that returns the value you want to memoize.
- The second argument is the dependency array — the computation re-runs only when one of these values changes.
- React returns the cached result on renders where the dependencies have not changed.

---

## Basic Example

```jsx
import { useState, useMemo } from "react";

function ProductList({ products, filterText }) {
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [products, filterText]);

  return (
    <ul>
      {filteredProducts.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

Without `useMemo`, the filter runs on every render — including renders caused by unrelated state changes. With it, the filter only runs when `products` or `filterText` actually changes.

---

## When to Use useMemo

`useMemo` is worth adding when:

- A computation is genuinely expensive (sorting or filtering large arrays, complex math, data transformations).
- The result is used as a prop to a memoized child component (`React.memo`) and you want to preserve referential stability.
- A value is used as a dependency in another hook like `useEffect` or `useCallback` and you want to prevent spurious re-runs.

```jsx
// Expensive sort — only re-run when items or sortKey changes
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
}, [items, sortKey]);
```

---

## Referential Stability

In JavaScript, objects and arrays are compared by reference. Even if the contents are the same, a new array or object created during render is a new reference — which breaks memoized children or causes effects to re-run unnecessarily.

`useMemo` solves this by returning the same reference as long as the dependencies have not changed.

```jsx
// Without useMemo — new array reference on every render
const options = categories.filter((c) => c.active)

// With useMemo — same reference unless categories changes
const options = useMemo(
  () => categories.filter((c) => c.active),
  [categories]
)

// Now this memoized child won't re-render unnecessarily
<FilterPanel options={options} />
```

---

## useMemo with React.memo

`useMemo` and `React.memo` are frequently used together. `React.memo` prevents a child component from re-rendering when its props have not changed. But if a prop is an object or array recreated on every render, `React.memo` has no effect — the reference is always new. `useMemo` fixes that.

```jsx
const chartData = useMemo(() => buildChartData(rawData), [rawData])

// React.memo only works correctly when chartData reference is stable
<Chart data={chartData} />
```

```jsx
const Chart = React.memo(function Chart({ data }) {
  // Only re-renders when data reference changes
  return <canvas>{/* render chart */}</canvas>;
});
```

---

## Computing Derived State

A common pattern is using `useMemo` to derive display-ready data from raw state — replacing a `useEffect` + `useState` combination with a simpler inline computation.

```jsx
function OrderSummary({ orders }) {
  const summary = useMemo(() => {
    const total = orders.reduce((sum, o) => sum + o.amount, 0);
    const count = orders.length;
    const average = count > 0 ? total / count : 0;
    const largest = Math.max(...orders.map((o) => o.amount));

    return { total, count, average, largest };
  }, [orders]);

  return (
    <div>
      <p>Total orders: {summary.count}</p>
      <p>Total value: ${summary.total.toFixed(2)}</p>
      <p>Average order: ${summary.average.toFixed(2)}</p>
      <p>Largest order: ${summary.largest.toFixed(2)}</p>
    </div>
  );
}
```

---

## When Not to Use useMemo

`useMemo` has a cost — it allocates memory for the cached value and runs comparison logic on every render. For cheap computations, this overhead can exceed any benefit.

Do not use `useMemo` for:

- Simple arithmetic or string operations
- Reading a single property from an object
- Filtering a small array of a few items
- Any computation that runs in microseconds

```jsx
// Not worth memoizing — trivially fast
const fullName = useMemo(
  () => `${firstName} ${lastName}`,
  [firstName, lastName],
);

// Just compute it directly
const fullName = `${firstName} ${lastName}`;
```

The React team recommends adding `useMemo` only when you have identified a real performance problem — not preemptively.

---

## useMemo vs useCallback

These two hooks are closely related:

- `useMemo` memoizes the **return value** of a function.
- `useCallback` memoizes the **function itself**.

```jsx
// useMemo — memoizes the computed result (an array)
const filtered = useMemo(() => items.filter(pred), [items, pred]);

// useCallback — memoizes the function reference
const handleClick = useCallback(() => doSomething(id), [id]);
```

`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

---

## Common Mistakes

```jsx
// Missing dependency — stale cached value
const result = useMemo(() => process(data), []); // data changes are ignored

// Memoizing something trivial — unnecessary overhead
const doubled = useMemo(() => count * 2, [count]);
const doubled = count * 2; // just do this

// Mutating inside useMemo — breaks memoization guarantees
const list = useMemo(() => {
  items.push(newItem); // mutates the original — wrong
  return items;
}, [items]);

// Correct
const list = useMemo(() => [...items, newItem], [items, newItem]);
```

---

## Summary

`useMemo` is a targeted performance optimization for expensive computations and referential stability. Use it when filtering or transforming large datasets, when a memoized child needs a stable prop reference, or when a computed value feeds into a `useEffect` dependency array. Avoid it for trivial computations — the overhead is real and the benefit is only present when the computation is genuinely costly.

---

_Next: [useCallback](./UseCallback.md) — memoize function references to prevent unnecessary child re-renders._
