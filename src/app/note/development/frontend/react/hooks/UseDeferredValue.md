# useDeferredValue

`useDeferredValue` accepts a value and returns a deferred copy of it. The deferred copy lags behind the original — React updates it when the browser is idle, prioritizing urgent updates first. It is the right tool when you want to keep a part of the UI responsive while an expensive derived render catches up.

---

## Syntax

```js
const deferredValue = useDeferredValue(value);
```

- `value` — any value you want to defer: a string, number, object, or array.
- Returns a deferred copy that initially matches `value` and lags behind during busy renders.
- During the deferred render, `deferredValue` still holds the previous value while React re-renders in the background with the new one.

---

## Basic Example — Responsive Search Input

```jsx
import { useState, useDeferredValue, memo } from "react";

const ResultsList = memo(function ResultsList({ query }) {
  const results = expensiveFilter(allItems, query);

  return (
    <ul>
      {results.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const isStale = query !== deferredQuery;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <ResultsList query={deferredQuery} />
      </div>
    </div>
  );
}
```

The input updates immediately with every keystroke. `ResultsList` receives the deferred query — it re-renders in the background using the latest `deferredQuery`, while the stale results remain visible in the meantime. The user always sees something, and the input never lags.

---

## How It Works

On each render:

1. React renders the component with the current (urgent) value.
2. React schedules a background render using the deferred value.
3. If a new update arrives before the background render finishes, React discards the in-progress render and starts over with the newer deferred value.
4. Once the background render is complete, React commits it to the screen.

This is why wrapping the expensive component in `React.memo` is important — without it, React cannot skip the expensive re-render even if the deferred value has not changed yet.

---

## Showing Stale State to the User

Compare `value` and `deferredValue` to detect when the UI is showing stale content. Use this to give the user a visual cue.

```jsx
const isStale = query !== deferredQuery

<div
  style={{
    opacity: isStale ? 0.5 : 1,
    transition: 'opacity 0.2s ease',
  }}
>
  <ExpensiveList query={deferredQuery} />
</div>
```

The opacity fade tells the user results are refreshing without blocking their interaction.

---

## useDeferredValue with Suspense

When used with Suspense, `useDeferredValue` prevents the fallback from flashing on screen during re-fetches. React shows the stale (previous) content until the deferred render completes — then switches to the new content smoothly.

```jsx
import { Suspense, useState, useDeferredValue } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Suspense fallback={<p>Loading...</p>}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </div>
  );
}
```

Without `useDeferredValue`, typing would flash the Suspense fallback on every keystroke. With it, the old results stay on screen until the new results are ready.

---

## Practical Example — Live Chart

```jsx
import { useState, useDeferredValue, memo } from "react";

const Chart = memo(function Chart({ data }) {
  // Expensive to render — many data points
  return <canvas>{/* render chart with data */}</canvas>;
});

function Dashboard() {
  const [resolution, setResolution] = useState("daily");
  const [chartData, setChartData] = useState(dailyData);

  const deferredData = useDeferredValue(chartData);
  const isUpdating = chartData !== deferredData;

  function changeResolution(res) {
    setResolution(res);
    setChartData(fetchData(res));
  }

  return (
    <div>
      <select onChange={(e) => changeResolution(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      {isUpdating && <p>Updating chart...</p>}

      <Chart data={deferredData} />
    </div>
  );
}
```

---

## useDeferredValue vs useTransition

|                          | `useDeferredValue`                                               | `useTransition`                          |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------------------- |
| What you defer           | A specific value                                                 | A state update                           |
| Where to apply           | Around the value at the consumer                                 | Around the `setState` call at the source |
| Use when                 | You receive a value as a prop or cannot control the state update | You own the state update                 |
| Async support (React 19) | No                                                               | Yes                                      |

Choosing between them:

- If you control the state update, use `useTransition` — it is more explicit.
- If you receive a value from outside (a prop, a library), use `useDeferredValue`.
- If you need to defer async operations (API calls), use `useTransition`.

```jsx
// useTransition — you own the setter
startTransition(() => setQuery(value));

// useDeferredValue — you receive the value
function Results({ query }) {
  const deferredQuery = useDeferredValue(query);
  // ...
}
```

---

## Important: Pair with React.memo

`useDeferredValue` only prevents re-renders of components that can bail out of rendering. Wrap the expensive component in `React.memo` so React can skip re-rendering it when the deferred value has not changed.

```jsx
// Without React.memo — useDeferredValue has no effect on re-renders
<ExpensiveList query={deferredQuery} /> // still re-renders every time

// With React.memo — React skips re-render when deferredQuery is the same
const ExpensiveList = React.memo(function ExpensiveList({ query }) {
  // ...
})

<ExpensiveList query={deferredQuery} /> // only re-renders when deferredQuery changes
```

---

## Common Mistakes

```jsx
// No React.memo on the expensive component — deferred value has no effect
const ExpensiveTable = function({ data }) { /* ... */ } // not memoized
<ExpensiveTable data={deferredData} /> // re-renders every time anyway

// Using useDeferredValue for non-expensive components — unnecessary overhead
const deferredName = useDeferredValue(name)
<p>{deferredName}</p> // rendering a single string is trivial, no need to defer

// Not showing stale feedback to the user
// If the UI is showing old data, always indicate it visually with opacity or a spinner
```

---

## Summary

`useDeferredValue` keeps expensive parts of your UI from blocking urgent interactions by letting them render in the background with a lagged value. Use it at the consumer level when you receive a value you cannot control, pair it with `React.memo` for it to have any effect, and always give users a visual signal when they are seeing stale content. For cases where you own the state update, `useTransition` is the more explicit and powerful choice.

---

_Next: [useSyncExternalStore](./UseSyncExternalStore.md) — subscribe to external data sources safely in concurrent React._
