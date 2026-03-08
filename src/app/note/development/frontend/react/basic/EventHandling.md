# Event Handling

React handles user interactions — clicks, key presses, form submissions, mouse movements — through event handlers. React's event system is built on top of the browser's native events but normalizes them across browsers using synthetic events.

---

## Adding Event Handlers

Event handlers are passed as props using camelCase names. You pass the function itself — not a call to the function.

```jsx
function Button() {
  function handleClick() {
    console.log("Button clicked");
  }

  return <button onClick={handleClick}>Click Me</button>;
}
```

The key rule: pass the function reference, not a function call.

```jsx
// Correct — passes a function reference
<button onClick={handleClick}>

// Wrong — calls the function immediately during render
<button onClick={handleClick()}>
```

---

## Inline Event Handlers

For simple logic, you can define handlers inline using arrow functions.

```jsx
function App() {
  return (
    <div>
      <button onClick={() => console.log("clicked")}>Log Click</button>
      <button onClick={() => alert("Hello!")}>Alert</button>
    </div>
  );
}
```

Inline handlers are convenient but recreate the function on every render. For complex logic or when passing handlers to memoized children, define the function separately.

---

## The Event Object

React passes a synthetic event object to every handler. It has the same interface as native browser events.

```jsx
function SearchInput() {
  function handleChange(event) {
    console.log(event.target.value); // the current input value
    console.log(event.target.name); // the input's name attribute
    console.log(event.type); // "change"
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      console.log("Enter pressed");
    }
    if (event.key === "Escape") {
      event.target.blur();
    }
  }

  return (
    <input
      name="search"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Search..."
    />
  );
}
```

---

## Common Event Types

```jsx
function EventExamples() {
  return (
    <div
      onMouseEnter={() => console.log("mouse entered")}
      onMouseLeave={() => console.log("mouse left")}
    >
      {/* Mouse events */}
      <button onClick={(e) => console.log("click", e)}>Click</button>
      <button onDoubleClick={() => console.log("double click")}>
        Double Click
      </button>
      <button onMouseDown={() => console.log("mouse down")}>Mouse Down</button>

      {/* Keyboard events */}
      <input
        onKeyDown={(e) => console.log("key down:", e.key)}
        onKeyUp={(e) => console.log("key up:", e.key)}
      />

      {/* Form events */}
      <input onChange={(e) => console.log("value:", e.target.value)} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("submitted");
        }}
      >
        <button type="submit">Submit</button>
      </form>

      {/* Focus events */}
      <input
        onFocus={() => console.log("focused")}
        onBlur={() => console.log("blurred")}
      />
    </div>
  );
}
```

---

## Preventing Default Behavior

Use `event.preventDefault()` to stop the browser's default action — most commonly for form submissions and link navigation.

```jsx
function LoginForm() {
  function handleSubmit(event) {
    event.preventDefault(); // stops the page from reloading
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");
    login(email, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Log In</button>
    </form>
  );
}

// Preventing link navigation
function App() {
  return (
    <a
      href="/dashboard"
      onClick={(e) => {
        e.preventDefault();
        console.log("link click intercepted");
      }}
    >
      Go to Dashboard
    </a>
  );
}
```

---

## Stopping Event Propagation

Events bubble up the DOM tree. Use `event.stopPropagation()` to prevent a parent's handler from also firing.

```jsx
function Card({ onClick, children }) {
  return (
    <div className="card" onClick={onClick}>
      {children}
    </div>
  );
}

function DeleteButton({ onDelete }) {
  function handleClick(event) {
    event.stopPropagation(); // prevents Card's onClick from firing
    onDelete();
  }

  return (
    <button onClick={handleClick} className="delete-btn">
      Delete
    </button>
  );
}

function App() {
  return (
    <Card onClick={() => console.log("card clicked")}>
      <p>Card content</p>
      <DeleteButton onDelete={() => console.log("deleted")} />
    </Card>
  );
}
```

Clicking `DeleteButton` calls `onDelete` but does not also trigger the `Card` click handler.

---

## Passing Arguments to Event Handlers

To pass extra data to a handler, wrap it in an arrow function.

```jsx
function ProductList({ products, onDelete, onSelect }) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name}
          <button onClick={() => onSelect(product.id)}>View</button>
          <button onClick={() => onDelete(product.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

The arrow function captures `product.id` from the closure and passes it when the event fires.

---

## Updating State on Events

The most common use of event handlers is updating state.

```jsx
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

function TextInput() {
  const [value, setValue] = useState("");

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something"
      />
      <p>You typed: {value}</p>
    </div>
  );
}
```

---

## Event Handler Naming Conventions

By convention, event handler props exposed from a component start with `on`, and the function implementations start with `handle`.

```jsx
// Component props use "on" prefix
function Button({ onClick, onHover }) {
  return (
    <button onClick={onClick} onMouseEnter={onHover}>
      Button
    </button>
  );
}

// Handler implementations use "handle" prefix
function App() {
  function handleButtonClick() { ... }
  function handleButtonHover() { ... }

  return (
    <Button
      onClick={handleButtonClick}
      onHover={handleButtonHover}
    />
  );
}
```

This convention makes it immediately clear which props are event callbacks and which functions are handlers.

---

## Event Delegation

React does not attach event listeners directly to each DOM element. Instead, it attaches a single listener at the root of the document and routes events to the correct handler. This is called event delegation and is handled automatically — you never configure it yourself.

This means:

- Event handling is efficient regardless of how many elements you render
- Dynamically added elements automatically work with React's event system
- Calling `event.stopPropagation()` stops propagation within React's tree — but native DOM listeners outside React may still fire

---

## useCallback for Stable Handler References

When passing event handlers to memoized child components, wrap them in `useCallback` to keep their reference stable across renders.

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // Without useCallback — new function reference on every render
  // With useCallback — stable reference, Child does not re-render unnecessarily
  const handleClick = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []); // no dependencies — function never changes

  return (
    <>
      <p>Count: {count}</p>
      <MemoizedChild onClick={handleClick} />
    </>
  );
}

const MemoizedChild = React.memo(function Child({ onClick }) {
  return <button onClick={onClick}>Click</button>;
});
```

Only use `useCallback` when the child is wrapped in `React.memo` and the handler's identity genuinely matters. Do not add it everywhere by default.

---

## Common Mistakes

```jsx
// Calling the function instead of passing it
<button onClick={handleClick()}>   // handleClick runs on render, not on click
<button onClick={handleClick}>     // correct

// Forgetting preventDefault on form submit
<form onSubmit={handleSubmit}>     // page reloads on submit if not prevented

function handleSubmit(e) {
  e.preventDefault();              // required to control form behavior
}

// Creating a handler inside a loop without a closure
items.forEach((item, index) => {
  button.onclick = handleClick;    // all buttons share the same reference
});

// Correct — use an arrow function to capture the variable
{items.map((item) => (
  <button key={item.id} onClick={() => handleClick(item.id)}>
    {item.name}
  </button>
))}
```

---

## Summary

React event handlers are passed as camelCase props and receive synthetic event objects that mirror native browser events. Use `event.preventDefault()` to stop default browser behavior and `event.stopPropagation()` to prevent event bubbling. Wrap handlers in arrow functions to pass arguments. Follow the `onEvent` / `handleEvent` naming convention for clarity. For handlers passed to memoized children, use `useCallback` to maintain stable references.

---

_Next: [Conditional Rendering](./ConditionalRendering.md) — showing and hiding parts of the UI based on state and props._
