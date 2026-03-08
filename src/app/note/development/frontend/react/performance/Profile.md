# Profiling

Profiling is the process of measuring where your React application spends its time. Before optimizing anything — adding `React.memo`, `useMemo`, or virtualization — you must measure first. Profiling tells you what is actually slow and where to focus. Optimizing without measuring leads to wasted effort and unnecessary complexity.

---

## The Golden Rule

Never optimize without measuring. A component that looks expensive may render in under a millisecond. A component that looks simple may be the actual bottleneck. Profile first, then optimize exactly what the data shows.

---

## React DevTools Profiler

The React DevTools browser extension includes a Profiler tab that records renders, shows how long each component took, and highlights which components re-rendered unnecessarily.

### Installation

Install the React Developer Tools extension for Chrome or Firefox from the browser's extension store. Once installed, a Profiler tab appears in the browser DevTools panel when you open a React application.

### Recording a Profile

1. Open DevTools and navigate to the Profiler tab
2. Click the record button (circle icon)
3. Interact with the part of the app you want to measure — click buttons, navigate, scroll
4. Click the record button again to stop
5. Inspect the results

### Reading the Flame Graph

The flame graph shows every component that rendered during the recorded session. Each bar represents one component render.

- Width represents render duration — wider means slower
- Color represents relative cost — gray means the component did not re-render, other colors indicate it rendered
- Hovering over a bar shows the component name, render time, and how many times it rendered

```
App            ███████████████████████ 24ms
  Header       ██ 2ms
  MainContent  ████████████████ 18ms
    UserList   ██████████████ 15ms
      UserCard ████ 4ms  (rendered 50 times)
      UserCard ████ 4ms
      ...
```

In this example, `UserList` with its many `UserCard` renders is the hotspot.

### The Ranked Chart

The ranked chart sorts all components by total render time in descending order — the slowest components appear at the top. This is the fastest way to find what to optimize.

### Why Did This Render

Click on any component bar in the flame graph and look at the right panel. React DevTools shows the reason for each re-render:

- Props changed — shows which prop changed and its old vs new value
- State changed — shows which state variable changed
- Context changed — shows that a consumed context value changed
- Parent re-rendered — the component re-rendered because its parent did, even if its own props and state were unchanged

This last case — parent re-rendered — is exactly what `React.memo` prevents.

---

## The Profiler API

React exposes a `Profiler` component for measuring programmatically in code — useful in CI pipelines, performance dashboards, or when DevTools is not convenient.

```jsx
import { Profiler } from "react";

function onRenderCallback(
  id, // the "id" prop of the Profiler
  phase, // "mount" or "update"
  actualDuration, // time spent rendering the committed update (ms)
  baseDuration, // estimated time to render the entire subtree without memoization (ms)
  startTime, // when React started rendering this update
  commitTime, // when React committed this update
) {
  console.log({ id, phase, actualDuration, baseDuration });
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MainContent />
    </Profiler>
  );
}
```

Wrap individual subtrees to measure them independently.

```jsx
function Dashboard() {
  return (
    <div>
      <Profiler id="UserList" onRender={onRenderCallback}>
        <UserList />
      </Profiler>

      <Profiler id="ChartPanel" onRender={onRenderCallback}>
        <ChartPanel />
      </Profiler>
    </div>
  );
}
```

### Key Profiler Fields

`actualDuration` is the most useful field — it shows how long the render actually took. A high value is a signal to investigate.

`baseDuration` represents how long the subtree would take if nothing was memoized. Comparing `actualDuration` to `baseDuration` tells you how effective your memoization is. If they are nearly equal, memoization is not helping.

---

## Browser Performance Tools

The browser's built-in Performance tab provides a lower-level view — useful for measuring paint, layout, and JavaScript execution.

### Recording in Chrome DevTools

1. Open DevTools and go to the Performance tab
2. Click Record
3. Interact with the app
4. Click Stop

### What to Look For

**Long Tasks** — any JavaScript task that blocks the main thread for more than 50ms appears highlighted in red. These are the tasks making the UI feel unresponsive.

**Layout Thrashing** — alternating reads and writes to the DOM (reading `offsetHeight`, then setting a style, then reading again) forces multiple layout recalculations. React avoids this by batching DOM writes, but third-party code may still cause it.

**Paint and Composite** — excessive repaints, especially during scroll or animation, indicate non-composited animations or layout-triggering CSS properties being animated.

### The React DevTools in the Performance Tab

When React DevTools is installed, React annotates the browser's Performance timeline with component names and render phases. You can see exactly which user interaction triggered which React renders and how long each phase took.

---

## Identifying Common Performance Problems

### Problem — Unnecessary Re-renders

Symptom: DevTools shows a component re-rendering on every parent update even though its props did not change.

Diagnosis: Click the component in the flame graph. The right panel says "Parent re-rendered."

Solution: Wrap the component in `React.memo`. Stabilize any object or function props with `useMemo` and `useCallback`.

```jsx
// Before
function Parent() {
  const [count, setCount] = useState(0);
  const config = { theme: "dark" }; // new object every render

  return <ExpensiveChild config={config} />;
}

// After
function Parent() {
  const [count, setCount] = useState(0);
  const config = useMemo(() => ({ theme: "dark" }), []);

  return <MemoizedExpensiveChild config={config} />;
}

const MemoizedExpensiveChild = React.memo(ExpensiveChild);
```

### Problem — Expensive Computation on Every Render

Symptom: A component renders quickly in terms of JSX but the flame graph shows it taking a long time. The computation is happening synchronously inside the render.

Diagnosis: Identify the expensive function call. Wrap it in `useMemo`.

```jsx
// Before — filters and sorts on every render
function FilteredList({ items, filter }) {
  const filtered = items
    .filter((item) => item.category === filter)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ul>
      {filtered.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// After — recomputes only when items or filter changes
function FilteredList({ items, filter }) {
  const filtered = useMemo(
    () =>
      items
        .filter((item) => item.category === filter)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items, filter],
  );

  return (
    <ul>
      {filtered.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### Problem — Large List Render

Symptom: Initial render takes a very long time. The flame graph shows hundreds or thousands of list item components all rendering at mount.

Diagnosis: The component count is proportional to the list size.

Solution: Virtualize the list. See [Virtualization](./Virtualization.md).

### Problem — Context Re-renders

Symptom: Many unrelated components re-render when something in context changes.

Diagnosis: Components consuming a large context object re-render when any part of it changes — even the parts they do not use.

Solution: Split the context into smaller, more focused contexts. Memoize the context value. Move infrequently changing values into a separate context from frequently changing ones.

```jsx
// One large context — everything re-renders when anything changes
const AppContext = createContext({ user, theme, cart, notifications });

// Split — each consumer only subscribes to what it needs
const UserContext = createContext(user);
const ThemeContext = createContext(theme);
const CartContext = createContext(cart);
```

---

## Measuring With User Timing API

For production monitoring or custom performance dashboards, use the browser's `performance` API.

```jsx
function measureRender(componentName, renderFn) {
  const markStart = `${componentName}-render-start`;
  const markEnd = `${componentName}-render-end`;
  const measure = `${componentName}-render`;

  performance.mark(markStart);
  const result = renderFn();
  performance.mark(markEnd);
  performance.measure(measure, markStart, markEnd);

  const entry = performance.getEntriesByName(measure)[0];
  console.log(`${componentName} rendered in ${entry.duration.toFixed(2)}ms`);

  return result;
}
```

Entries created with `performance.measure` appear in the browser Performance timeline under "User Timing" and can be sent to an analytics service for production monitoring.

---

## Profiling in Production

The React DevTools Profiler only works in development builds. For production profiling, use the profiling build of React.

With Create React App:

```bash
# Build with profiling enabled
npx react-scripts build --profile
```

With Vite, add the alias to `vite.config.js`:

```js
export default defineConfig({
  resolve: {
    alias: {
      "react-dom$": "react-dom/profiling",
      "scheduler/tracing": "scheduler/tracing-profiling",
    },
  },
});
```

This enables the `Profiler` component callback in the production bundle. The devtools themselves still require the DevTools extension, but the production profiling build is significantly smaller than the full development build.

---

## Performance Optimization Workflow

Follow this process when a performance problem is reported or suspected.

First, reproduce the problem reliably. A performance problem you cannot reproduce consistently cannot be fixed reliably.

Second, profile with React DevTools. Record a session that includes the slow interaction. Identify which components render, how long they take, and why they re-render.

Third, look at the ranked chart. Focus on the components with the highest `actualDuration` — those are your bottlenecks.

Fourth, apply one fix at a time. Change one thing, then profile again to confirm the improvement.

Fifth, measure the result. A 10ms render becoming 2ms is a meaningful win. Adding `React.memo` to a component that already renders in 0.5ms is noise.

---

## Common Mistakes

```jsx
// Optimizing before measuring — adding memo everywhere by default
const SimpleLabel = React.memo(({ text }) => <span>{text}</span>);
// If this renders in 0.1ms, React.memo adds overhead with zero benefit

// Measuring in development and concluding production is equally slow
// Development builds include extra checks — production is typically 2-3x faster
// Always profile the production build for representative numbers

// Ignoring the "why did this render" panel — guessing instead of reading the data
// The DevTools panel tells you exactly why each component re-rendered
// Read it before making any change

// Memoizing the wrong thing — the actual bottleneck is elsewhere
// Profile first, then the data shows you exactly what to fix
```

---

## Summary

Profiling is the essential first step before any performance optimization. Use the React DevTools Profiler to record renders, identify slow components in the ranked chart, and read the "why did this render" panel to understand the cause. Use the `Profiler` API component for programmatic measurement and CI integration. Cross-reference with the browser's Performance tab for paint and layout analysis. Apply fixes one at a time and measure again after each change. The most common problems — unnecessary re-renders, unstabilized props, expensive inline computations, and large lists — all have well-established solutions, but only profiling tells you which one you actually need.

---

_Back to: [Performance Overview]_
