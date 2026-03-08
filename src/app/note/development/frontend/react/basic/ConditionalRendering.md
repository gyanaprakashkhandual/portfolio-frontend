# Conditional Rendering

Conditional rendering is how React shows or hides parts of the UI based on state, props, or other conditions. React uses standard JavaScript logic — `if` statements, ternary operators, and logical operators — to decide what to render.

---

## if Statement

The most straightforward approach. Use a regular `if` statement before the return to decide what JSX to return.

```jsx
function StatusMessage({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>Welcome back!</h1>;
  }

  return <h1>Please sign in.</h1>;
}
```

This works well when the two outcomes are significantly different and each needs its own full JSX block.

---

## Ternary Operator

For inline conditional rendering inside JSX, the ternary operator is the standard choice. It works wherever an expression is valid.

```jsx
function Dashboard({ isLoading, user }) {
  return (
    <div>
      <h1>Dashboard</h1>
      {isLoading ? <p>Loading your data...</p> : <p>Welcome, {user.name}</p>}
    </div>
  );
}
```

Ternary operators can be nested, but deeply nested ternaries hurt readability. Extract a variable or a helper function when logic becomes complex.

```jsx
// Hard to read — deeply nested ternary
{
  isLoading ? <Spinner /> : hasError ? <Error /> : <Content />;
}

// Cleaner — extract the logic
function renderContent({ isLoading, hasError }) {
  if (isLoading) return <Spinner />;
  if (hasError) return <Error />;
  return <Content />;
}

// Or use a variable
const content = isLoading ? <Spinner /> : hasError ? <Error /> : <Content />;
return <div>{content}</div>;
```

---

## Logical AND Operator

Use `&&` to render something only when a condition is true. When the left side is truthy, the right side renders. When the left side is falsy, nothing renders.

```jsx
function Notification({ message, count }) {
  return (
    <div>
      {message && <p className="alert">{message}</p>}
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  );
}
```

The expression short-circuits — if `message` is falsy, the `<p>` is never evaluated or rendered.

One important gotcha: do not use a number directly as the left operand. If the number is `0`, React renders the literal character `"0"` — not nothing.

```jsx
// Bug — renders "0" when items.length is 0
{
  items.length && <ItemList items={items} />;
}

// Correct — convert to a boolean explicitly
{
  items.length > 0 && <ItemList items={items} />;
}
{
  !!items.length && <ItemList items={items} />;
}
```

---

## Logical OR Operator

Use `||` to provide a fallback value when the left side is falsy.

```jsx
function UserGreeting({ name }) {
  return <h2>Hello, {name || "Guest"}</h2>;
}

// name = "Alice"  -> "Hello, Alice"
// name = ""       -> "Hello, Guest"
// name = null     -> "Hello, Guest"
```

For more nuanced fallbacks (where `0` or `""` should not trigger the default), prefer the nullish coalescing operator `??`.

```jsx
// ?? only falls back on null and undefined — not 0 or ""
<p>{score ?? "No score yet"}</p>
```

---

## Returning null

Returning `null` from a component renders nothing and leaves no DOM node. This is the standard way to completely hide a component.

```jsx
function ErrorBanner({ error }) {
  if (!error) return null;

  return (
    <div className="error-banner">
      <strong>Error:</strong> {error}
    </div>
  );
}

// When error is null or undefined — renders nothing at all
<ErrorBanner error={null} />

// When error is a string — renders the banner
<ErrorBanner error="Something went wrong." />
```

Returning `null` does not affect lifecycle methods or hooks — the component still mounts and its hooks still run.

---

## Assigning JSX to Variables

Extract conditional JSX into a variable before the return statement. This keeps the JSX clean and the logic explicit.

```jsx
function UserProfile({ user, isLoading, error }) {
  let content;

  if (isLoading) {
    content = <p>Loading profile...</p>;
  } else if (error) {
    content = <p className="error">Failed to load: {error.message}</p>;
  } else {
    content = (
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    );
  }

  return (
    <section className="profile">
      <h1>User Profile</h1>
      {content}
    </section>
  );
}
```

This is especially readable when there are three or more possible states.

---

## Switching on a Value

When a value has many discrete states, a `switch` statement or an object map is cleaner than chained ternaries.

```jsx
function OrderStatus({ status }) {
  const statusMap = {
    pending: <span className="badge badge--yellow">Pending</span>,
    shipped: <span className="badge badge--blue">Shipped</span>,
    delivered: <span className="badge badge--green">Delivered</span>,
    cancelled: <span className="badge badge--red">Cancelled</span>,
  };

  return statusMap[status] ?? <span className="badge">Unknown</span>;
}
```

Object maps are concise and easy to extend — adding a new status only requires one line.

Alternatively, use a `switch` statement when each case requires more logic than a single expression:

```jsx
function renderStep(step) {
  switch (step) {
    case 1:
      return <PersonalInfoStep />;
    case 2:
      return <AddressStep />;
    case 3:
      return <PaymentStep />;
    case 4:
      return <ConfirmationStep />;
    default:
      return null;
  }
}
```

---

## Conditional CSS Classes

A very common pattern — applying different class names based on state or props.

```jsx
function Button({ variant = "default", isActive, isDisabled, children }) {
  const className = [
    "btn",
    `btn--${variant}`,
    isActive ? "btn--active" : "",
    isDisabled ? "btn--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={className} disabled={isDisabled}>
      {children}
    </button>
  );
}
```

For projects with many conditional classes, the `clsx` or `classnames` library simplifies this further:

```jsx
import clsx from "clsx";

function Button({ variant, isActive, isDisabled, children }) {
  return (
    <button
      className={clsx("btn", `btn--${variant}`, {
        "btn--active": isActive,
        "btn--disabled": isDisabled,
      })}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}
```

---

## Show / Hide vs. Mount / Unmount

Two different approaches to conditional rendering have different effects.

**Mount / Unmount** — the component is added to or removed from the DOM entirely. State is lost when unmounted. This is what `&&` and ternary produce.

```jsx
{
  isOpen && <Modal />;
} // Modal unmounts (and loses state) when isOpen is false
```

**Show / Hide** — the component stays mounted but is visually hidden using CSS. State is preserved.

```jsx
<Modal style={{ display: isOpen ? "block" : "none" }} />
<Modal className={isOpen ? "" : "hidden"} />
```

Use mount/unmount when you want a clean slate each time the component appears. Use show/hide when you need to preserve internal state or when avoiding the cost of remounting is important.

---

## Skeleton and Loading States

A common real-world pattern — show placeholder content while data is loading.

```jsx
function ArticleCard({ article, isLoading }) {
  if (isLoading) {
    return (
      <div className="card card--skeleton">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--body" />
        <div className="skeleton skeleton--body" />
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{article.title}</h2>
      <p>{article.excerpt}</p>
      <a href={article.url}>Read more</a>
    </div>
  );
}
```

---

## Common Mistakes

```jsx
// Rendering "0" instead of nothing
{
  count && <Badge>{count}</Badge>;
} // renders "0" when count is 0
{
  count > 0 && <Badge>{count}</Badge>;
} // correct

// Using ternary where if statement is clearer
// For two completely different JSX trees, early returns with if are more readable
function Panel({ status }) {
  // Cleaner than one large ternary
  if (status === "loading") return <Skeleton />;
  if (status === "error") return <ErrorView />;
  return <Content />;
}

// Showing content via CSS but expecting state to reset
// If you hide with display:none, state persists — intentional or not
// If you need fresh state each open, use mount/unmount instead
```

---

## Summary

React has no special conditional rendering syntax — it uses ordinary JavaScript. Return different JSX from an `if` statement for completely different outcomes. Use the ternary operator for inline either/or choices. Use `&&` to show something only when a condition is true, but guard against `0` being rendered. Return `null` to render nothing. Assign JSX to variables for clarity when dealing with multiple states, and use object maps or `switch` for many discrete values. Understand the difference between mounting/unmounting and showing/hiding to manage state correctly.

---

_Next: [Lists and Keys](./ListsKeys.md) — rendering dynamic collections and helping React track items efficiently._
