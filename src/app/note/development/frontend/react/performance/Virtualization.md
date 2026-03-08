# Virtualization

Virtualization is a technique for rendering only the items currently visible in a scrollable list — not the entire dataset. Instead of creating thousands of DOM nodes, a virtualized list creates a small, fixed number of nodes and recycles them as the user scrolls. The result is a list that renders in milliseconds regardless of how many items it contains.

---

## The Problem With Large Lists

Rendering thousands of DOM nodes at once has real consequences:

- Initial render is slow — React must create and mount every element
- Memory usage grows with the list size
- Scrolling becomes sluggish as the browser manages thousands of nodes
- Layout and paint operations take longer

```jsx
// Rendering 10,000 rows — creates 10,000 DOM nodes immediately
function SlowList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

With 10,000 items, even a fast machine renders this slowly. A virtualized list renders the same data instantly by keeping only ~20-30 DOM nodes alive at any time.

---

## How Virtualization Works

A virtualized list:

1. Measures the visible area (the viewport)
2. Calculates which items are within the visible range based on scroll position
3. Renders only those items, positioned absolutely using calculated offsets
4. Maintains a total container height equal to all items — so the scrollbar behaves correctly
5. Recycles or swaps DOM nodes as the user scrolls

```
Viewport (600px tall)
┌─────────────────────┐
│ Item 47             │  <- rendered
│ Item 48             │  <- rendered
│ Item 49             │  <- rendered
│ Item 50             │  <- rendered
│ Item 51             │  <- rendered
└─────────────────────┘
         ↑ scroll position

Items 0-46 and 52-10000: not in DOM
Container height: 10000 * itemHeight (so scrollbar is correct)
```

---

## TanStack Virtual (formerly react-virtual)

TanStack Virtual is a headless virtualization library — it provides the math and scroll logic without imposing any DOM structure. You control the markup entirely.

### Installation

```bash
npm install @tanstack/react-virtual
```

### Basic Vertical List

```jsx
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // estimated row height in px
  });

  return (
    // Scrollable container — must have a fixed height and overflow-y: auto
    <div ref={parentRef} style={{ height: 600, overflowY: "auto" }}>
      {/* Total height spacer — keeps the scrollbar accurate */}
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: virtualItem.start,
              left: 0,
              width: "100%",
              height: virtualItem.size,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

Only the items in the visible area render. The total container height ensures the scrollbar behaves as if all 10,000 items were present.

---

## Variable Height Items

When items have different heights, measure each item after it renders and report back to the virtualizer.

```jsx
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

function VariableHeightList({ posts }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // initial estimate — will be corrected on measure
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflowY: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const post = posts[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: virtualItem.start,
                left: 0,
                width: "100%",
              }}
            >
              <div className="post-card">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span>{post.author}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

`measureElement` and `data-index` tell TanStack Virtual the actual measured height of each item after it renders, correcting the estimate and repositioning subsequent items.

---

## react-window

`react-window` is a lighter alternative with a simpler API but less flexibility. It works well for fixed-height lists and grids with predictable item sizes.

### Installation

```bash
npm install react-window
```

### Fixed-Height List

```jsx
import { FixedSizeList } from "react-window";

function Row({ index, style, data }) {
  return (
    <div style={style} className="list-row">
      {data[index].name}
    </div>
  );
}

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={600} // visible height of the list
      width="100%" // list width
      itemCount={items.length}
      itemSize={50} // exact height of each row in px
      itemData={items} // passed to each Row as data prop
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Variable-Height List

```jsx
import { VariableSizeList } from "react-window";
import { useRef, useCallback } from "react";

function VariableList({ items }) {
  const listRef = useRef(null);
  const heightCache = useRef({});

  const getItemSize = useCallback(
    (index) => heightCache.current[index] ?? 80,
    [],
  );

  function Row({ index, style }) {
    return (
      <div style={style}>
        <div className="post-card">
          <h3>{items[index].title}</h3>
          <p>{items[index].excerpt}</p>
        </div>
      </div>
    );
  }

  return (
    <VariableSizeList
      ref={listRef}
      height={600}
      width="100%"
      itemCount={items.length}
      itemSize={getItemSize}
    >
      {Row}
    </VariableSizeList>
  );
}
```

### Grid with react-window

```jsx
import { FixedSizeGrid } from "react-window";

function Cell({ columnIndex, rowIndex, style, data }) {
  const item = data[rowIndex * 4 + columnIndex]; // 4 columns

  return (
    <div style={style} className="grid-cell">
      {item ? <ProductCard product={item} /> : null}
    </div>
  );
}

function ProductGrid({ products }) {
  return (
    <FixedSizeGrid
      columnCount={4}
      columnWidth={220}
      rowCount={Math.ceil(products.length / 4)}
      rowHeight={300}
      height={600}
      width={880}
      itemData={products}
    >
      {Cell}
    </FixedSizeGrid>
  );
}
```

---

## Choosing Between Libraries

|                      | TanStack Virtual                                    | react-window                                 |
| -------------------- | --------------------------------------------------- | -------------------------------------------- |
| API style            | Headless — you control all markup                   | Declarative — prescribes structure           |
| Variable heights     | Built-in measurement                                | Manual cache needed                          |
| Horizontal scrolling | Yes                                                 | Yes                                          |
| Grid support         | Yes                                                 | Yes (`FixedSizeGrid`, `VariableSizeGrid`)    |
| Bundle size          | ~5KB                                                | ~6KB                                         |
| Flexibility          | High — any layout                                   | Moderate                                     |
| Best for             | Custom layouts, variable heights, complex use cases | Simple fixed-height lists and standard grids |

---

## When to Virtualize

Virtualization adds complexity. Apply it when you have a real performance problem, not as a default.

Use virtualization when:

- The list has more than 100-200 items and scrolling or initial render is noticeably slow
- Each item renders a non-trivial component (images, complex layout, nested components)
- The list is user-facing and interactive — not a background process

Do not virtualize when:

- The list is short — 50 items or fewer rarely needs it
- Items load with pagination — you never render all items at once anyway
- The list does not scroll — virtualization requires a scrollable container

---

## Combining Virtualization with Other Patterns

### With React.memo

Memoize the row component to avoid re-renders when the list data has not changed for that row.

```jsx
const MemoizedRow = React.memo(function Row({ index, style, data }) {
  return (
    <div style={style}>
      <UserCard user={data[index]} />
    </div>
  );
});
```

### With Infinite Scroll

Load more data as the user approaches the end of the list.

```jsx
function InfiniteList({ fetchNextPage, hasNextPage, isFetchingNextPage }) {
  const items = useAllLoadedItems();
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });

  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1);
    if (!lastItem) return;

    if (
      lastItem.index >= items.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualizer.getVirtualItems(), hasNextPage, isFetchingNextPage]);

  return (
    <div ref={parentRef} style={{ height: 600, overflowY: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: virtualItem.start,
              width: "100%",
              height: virtualItem.size,
            }}
          >
            {virtualItem.index < items.length ? (
              <ListItem item={items[virtualItem.index]} />
            ) : (
              <p>Loading more...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Common Mistakes

```jsx
// No fixed height on the scroll container — virtualizer cannot calculate visible range
<div style={{ overflowY: "auto" }}>  // missing height — won't work
  <VirtualizedList />
</div>

// Correct — scrollable container must have an explicit height
<div style={{ height: 600, overflowY: "auto" }}>
  <VirtualizedList />
</div>

// Forgetting the total size spacer — scrollbar will be too short
<div>
  {virtualizer.getVirtualItems().map(...)}
  {/* missing height spacer — scrollbar jumps as you scroll */}
</div>

// Correct — always include the total size container
<div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
  {virtualizer.getVirtualItems().map(...)}
</div>

// Virtualizing a short list — adds complexity with no performance benefit
// Profile first — if the list is fast, don't virtualize
```

---

## Summary

Virtualization renders only the items visible in the viewport, keeping the DOM lean regardless of dataset size. TanStack Virtual is the flexible, headless choice with built-in variable-height measurement. `react-window` is lighter and simpler for fixed-height lists and grids. Always provide a fixed height on the scroll container and a total-size spacer for an accurate scrollbar. Combine virtualization with `React.memo` to prevent unnecessary row re-renders. Profile before adding virtualization — apply it only when you have a real, measured performance problem with large lists.

---

_Next: [Profiling](./Profiling.md) — measuring React performance with the built-in Profiler and DevTools._
