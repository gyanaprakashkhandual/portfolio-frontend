# Lists and Keys

Rendering lists is one of the most common tasks in React. The `map` method transforms an array of data into an array of JSX elements. The `key` prop tells React how to identify each item across renders — making list updates fast and correct.

---

## Rendering a Basic List

Use `Array.map()` to render a collection of items. Each item becomes a JSX element.

```jsx
function FruitList() {
  const fruits = ["Apple", "Banana", "Cherry", "Date"];

  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}
```

The `map` call lives inside JSX curly braces. Each iteration returns a `<li>` element.

---

## The key Prop

The `key` prop is a special prop that React uses internally to identify which items have changed, been added, or been removed. Without keys, React re-renders entire lists from scratch when anything changes.

```jsx
function UserList({ users }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} — {user.email}
        </li>
      ))}
    </ul>
  );
}
```

Keys must be unique among siblings. They do not need to be globally unique. Keys are not passed to the component as a prop — they are only used by React.

---

## Why Keys Matter

Without keys, React uses position to track elements. When items reorder or the list changes, React cannot distinguish which item is which and may:

- Destroy and recreate components unnecessarily
- Mix up component state between items
- Produce incorrect animations and transitions

```jsx
// Before reorder
[
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Carol" },
][
  // After removing Alice
  ({ id: 2, name: "Bob" }, { id: 3, name: "Carol" })
];
```

With `key={user.id}`, React knows `id: 2` moved to position 0 — it updates the DOM minimally. Without keys, React sees position 0 changed and may destroy the component at position 0 entirely.

---

## Keys Must Be Stable and Unique

A key should come from the data itself — typically a database ID or a unique slug. It must be stable across renders.

```jsx
// Correct — stable database ID
{
  users.map((user) => <UserCard key={user.id} user={user} />);
}

// Correct — unique slug
{
  articles.map((article) => (
    <ArticleCard key={article.slug} article={article} />
  ));
}

// Correct — unique combination when no single field is unique
{
  orderItems.map((item) => (
    <OrderItem key={`${item.orderId}-${item.productId}`} item={item} />
  ));
}
```

---

## Why Not to Use Index as Key

Using the array index as a key is tempting but causes bugs when the list can reorder, filter, or have items added or removed.

```jsx
// Problematic when list order can change
{
  items.map((item, index) => <li key={index}>{item.name}</li>);
}
```

When an item is added to the beginning of the list, every item's index shifts. React sees key `0` is now different and re-renders everything — and may mix up component-level state (like input values) between items.

```jsx
// Safe to use index only when ALL of the following are true:
// 1. The list is static — items never reorder or get inserted/removed
// 2. Items have no identity — they are purely derived from their position
// 3. No list item has its own stateful child components

{
  staticTabs.map((tab, index) => <Tab key={index} label={tab.label} />);
}
```

---

## Rendering Lists of Components

Pass item data as props to child components rather than building complex JSX inline.

```jsx
function ProductCard({ product }) {
  return (
    <div className="card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span>${product.price.toFixed(2)}</span>
    </div>
  );
}

function ProductGrid({ products }) {
  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

`key` goes on the outermost element returned inside `map` — which in this case is `<ProductCard>`.

---

## Filtering and Transforming Lists

Chain `filter`, `sort`, and other array methods before `map` to shape the data before rendering.

```jsx
function ActiveUserList({ users }) {
  const activeUsers = users
    .filter((user) => user.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (activeUsers.length === 0) {
    return <p>No active users found.</p>;
  }

  return (
    <ul>
      {activeUsers.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

## Rendering Nested Lists

Each level of a nested list needs its own keys — unique among that level's siblings.

```jsx
function CategoryList({ categories }) {
  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>
          <strong>{category.name}</strong>
          <ul>
            {category.items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
```

`category.id` is unique among categories. `item.id` is unique among that category's items. They are independent scopes.

---

## Keys on Fragments

When rendering fragments in a list, use the explicit `<Fragment>` syntax to attach a key — shorthand `<>` does not support attributes.

```jsx
import { Fragment } from "react";

function DefinitionList({ terms }) {
  return (
    <dl>
      {terms.map((term) => (
        <Fragment key={term.id}>
          <dt>{term.name}</dt>
          <dd>{term.definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```

Each `<Fragment>` wraps a `<dt>` and `<dd>` pair. Without `Fragment`, you would need to wrap them in a `<div>`, which would break the `<dl>` semantic structure.

---

## Lists with Empty States

Always handle the empty state explicitly to avoid rendering nothing unexpectedly.

```jsx
function TaskList({ tasks }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={task.done ? "task--done" : ""}>
          {task.title}
        </li>
      ))}
    </ul>
  );
}
```

---

## Keyed Lists and State Preservation

Keys directly affect which components mount, unmount, and update. Changing a key forces a component to unmount and remount — resetting all internal state. This can be used intentionally.

```jsx
// Resetting a form when the user changes
// Changing the key forces the form to remount with fresh state
function EditUserPage({ userId }) {
  return <UserForm key={userId} userId={userId} />;
}
```

When `userId` changes, the old `UserForm` unmounts and a new one mounts — all internal form state resets cleanly without any manual cleanup.

---

## Common Mistakes

```jsx
// Missing key — React warns and performance suffers
{
  items.map((item) => <li>{item.name}</li>);
}

// Key on the wrong element — key must be on the outermost element inside map
{
  items.map((item) => (
    <li>
      <span key={item.id}>{item.name}</span> // wrong — key is on the inner
      element
    </li>
  ));
}

// Correct
{
  items.map((item) => (
    <li key={item.id}>
      <span>{item.name}</span>
    </li>
  ));
}

// Using index as key on a list that can change
{
  todos.map((todo, index) => (
    <TodoItem key={index} todo={todo} /> // dangerous if todos can be reordered or filtered
  ));
}

// Using non-unique keys — sibling keys must be unique
{
  items.map((item) => (
    <li key="item">{item.name}</li> // all have the same key — React cannot distinguish them
  ));
}
```

---

## Summary

Use `Array.map()` to render lists and always provide a `key` prop on the outermost element in the iteration. Keys should be stable, unique identifiers from your data — typically database IDs. Avoid using array indexes as keys when the list can change order, gain items, or lose items. Handle empty states explicitly. When you need keys on fragments, use explicit `<Fragment key={...}>` syntax. Understanding how keys affect mounting and unmounting lets you control state preservation and reset intentionally.

---

_Next: [Forms and Controlled Components](./Forms.md) — managing form inputs with React state._
