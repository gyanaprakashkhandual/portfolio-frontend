# useReducer

`useReducer` is an alternative to `useState` for managing state that involves multiple sub-values or complex update logic. It follows the same pattern as Redux — you dispatch actions, and a pure reducer function determines the next state based on the current state and the action received.

---

## Syntax

```js
const [state, dispatch] = useReducer(reducer, initialState);
```

- `reducer` — a pure function `(state, action) => newState` that defines how state transitions happen.
- `initialState` — the starting value of the state.
- `state` — the current state value.
- `dispatch` — a function you call to send an action to the reducer.

---

## Basic Example

```jsx
import { useReducer } from "react";

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: 0 };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
```

---

## Actions with Payload

Actions can carry additional data via a `payload` property, letting the reducer handle dynamic updates.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "set_name":
      return { ...state, name: action.payload };
    case "set_age":
      return { ...state, age: action.payload };
    case "reset":
      return initialState;
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

// Dispatching with payload
dispatch({ type: "set_name", payload: "Alice" });
dispatch({ type: "set_age", payload: 30 });
```

---

## Managing a Complex Form

`useReducer` shines when a piece of state has many related fields that change together — such as a form with validation state.

```jsx
const initialState = {
  username: "",
  email: "",
  password: "",
  errors: {},
  isSubmitting: false,
};

function formReducer(state, action) {
  switch (action.type) {
    case "field_change":
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: "" },
      };
    case "set_errors":
      return { ...state, errors: action.payload, isSubmitting: false };
    case "submit_start":
      return { ...state, isSubmitting: true, errors: {} };
    case "submit_success":
      return { ...initialState };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function SignupForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  function handleChange(e) {
    dispatch({
      type: "field_change",
      field: e.target.name,
      value: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "submit_start" });

    const errors = validate(state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "set_errors", payload: errors });
      return;
    }

    await submitForm(state);
    dispatch({ type: "submit_success" });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={state.username}
        onChange={handleChange}
        placeholder="Username"
      />
      {state.errors.username && <p>{state.errors.username}</p>}

      <input
        name="email"
        value={state.email}
        onChange={handleChange}
        placeholder="Email"
      />
      {state.errors.email && <p>{state.errors.email}</p>}

      <input
        name="password"
        type="password"
        value={state.password}
        onChange={handleChange}
        placeholder="Password"
      />
      {state.errors.password && <p>{state.errors.password}</p>}

      <button type="submit" disabled={state.isSubmitting}>
        {state.isSubmitting ? "Submitting..." : "Sign Up"}
      </button>
    </form>
  );
}
```

---

## Lazy Initialization

Like `useState`, `useReducer` accepts a third argument — an init function — to compute the initial state lazily. Useful when the initial state requires computation or should be derived from props.

```jsx
function init(initialCount) {
  return { count: initialCount, history: [] };
}

function Counter({ startCount }) {
  const [state, dispatch] = useReducer(reducer, startCount, init);
  // ...
}
```

---

## useReducer vs useState

| Scenario                                         | Prefer       |
| ------------------------------------------------ | ------------ |
| Simple primitive value                           | `useState`   |
| Boolean toggle or counter                        | `useState`   |
| Multiple related fields                          | `useReducer` |
| Next state depends on previous in complex ways   | `useReducer` |
| State transitions have named, meaningful actions | `useReducer` |
| Sharing update logic across multiple handlers    | `useReducer` |

A good rule of thumb: when you find yourself writing several `useState` calls that always update together, or your update logic is growing complex, reach for `useReducer`.

---

## Combining with Context

`useReducer` pairs naturally with `useContext` to create a lightweight global state system without external libraries.

```jsx
// store.jsx
import { createContext, useContext, useReducer } from "react";

const StoreContext = createContext(null);

const initialState = { user: null, cart: [] };

function reducer(state, action) {
  switch (action.type) {
    case "set_user":
      return { ...state, user: action.payload };
    case "add_to_cart":
      return { ...state, cart: [...state.cart, action.payload] };
    case "clear_cart":
      return { ...state, cart: [] };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
```

```jsx
// CartButton.jsx
import { useStore } from "./store";

function CartButton({ product }) {
  const { state, dispatch } = useStore();

  return (
    <div>
      <span>Items in cart: {state.cart.length}</span>
      <button
        onClick={() => dispatch({ type: "add_to_cart", payload: product })}
      >
        Add to Cart
      </button>
    </div>
  );
}
```

---

## Common Mistakes

```jsx
// Mutating state inside the reducer — always return a new object
function reducer(state, action) {
  state.count += 1 // wrong — mutates directly
  return state
}

// Correct
function reducer(state, action) {
  return { ...state, count: state.count + 1 }
}

// Not handling unknown actions
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    // Missing default — silent failure on typos
  }
}

// Always include a default that throws
default:
  throw new Error(`Unknown action: ${action.type}`)
```

---

## Summary

`useReducer` brings structure and predictability to complex state management. By centralizing all state transitions in a single reducer function and expressing changes as explicit actions, your state logic becomes easier to read, test, and debug — especially as your component grows. For large-scale state needs, pair it with `useContext` or reach for a dedicated library like Zustand or Redux Toolkit.

---

_Next: [useRef](./UseRef.md) — access DOM elements and persist values across renders without causing re-renders._
