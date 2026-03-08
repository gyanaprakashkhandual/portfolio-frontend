# Context API

The Context API provides a way to share values across the component tree without passing props at every level. It is the built-in React solution for avoiding prop drilling when data needs to be accessible by many components at different nesting depths.

---

## The Problem — Prop Drilling

When deeply nested components need access to the same data, props must travel through every intermediate layer — even components that have no use for them.

```jsx
// theme must pass through Layout and Sidebar even though neither uses it
function App() {
  const [theme, setTheme] = useState("light");
  return <Layout theme={theme} setTheme={setTheme} />;
}

function Layout({ theme, setTheme }) {
  return <Sidebar theme={theme} setTheme={setTheme} />;
}

function Sidebar({ theme, setTheme }) {
  return <ThemeToggle theme={theme} setTheme={setTheme} />;
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Toggle theme
    </button>
  );
}
```

`Layout` and `Sidebar` are just middlemen. Context eliminates this.

---

## Core API

```jsx
// 1. Create a context
const MyContext = createContext(defaultValue);

// 2. Provide a value at some level of the tree
<MyContext.Provider value={someValue}>{children}</MyContext.Provider>;

// 3. Consume the value anywhere inside the Provider
const value = useContext(MyContext);
```

---

## Basic Example — Theme Context

```jsx
import { createContext, useContext, useState } from "react";

// Create the context
const ThemeContext = createContext("light");

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer — reads context anywhere in the tree
function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return <button onClick={toggleTheme}>Current theme: {theme}</button>;
}

// App — no props needed between Provider and consumer
function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Sidebar>
          <ThemeToggle />
        </Sidebar>
      </Layout>
    </ThemeProvider>
  );
}
```

`ThemeToggle` reads directly from context. `Layout` and `Sidebar` know nothing about the theme.

---

## Creating a Custom Hook for Context

Encapsulate the `useContext` call in a custom hook. This centralizes error handling and makes the API cleaner.

```jsx
const ThemeContext = createContext(null);

function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

// Usage is cleaner and self-documenting
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}
```

This is the recommended pattern — always create a named hook instead of calling `useContext` directly.

---

## Authentication Context

A practical, complete example of managing auth state with Context.

```jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const user = await loginRequest(email, password);
    setUser(user);
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

// Usage
function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      {user ? (
        <>
          <span>Hello, {user.name}</span>
          <button onClick={logout}>Log Out</button>
        </>
      ) : (
        <a href="/login">Log In</a>
      )}
    </nav>
  );
}
```

---

## Multiple Contexts

Use separate contexts for unrelated concerns. Do not combine everything into one giant context.

```jsx
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Each consumer only subscribes to what it needs
function CheckoutButton() {
  const { user } = useAuth(); // from AuthContext
  const { items } = useCart(); // from CartContext
  // ThemeContext — not needed here, not subscribed
  // ...
}
```

---

## Context with useReducer

For complex state with multiple related actions, pair Context with `useReducer` instead of `useState`.

```jsx
const CartContext = createContext(null);

const initialState = { items: [], total: 0 };

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.item.id);
      const items = existing
        ? state.items.map((i) =>
            i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i,
          )
        : [...state.items, { ...action.item, qty: 1 }];
      return {
        items,
        total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
        total: state.total - action.price,
      };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  function addItem(item) {
    dispatch({ type: "ADD_ITEM", item });
  }

  function removeItem(id, price) {
    dispatch({ type: "REMOVE_ITEM", id, price });
  }

  function clearCart() {
    dispatch({ type: "CLEAR" });
  }

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
```

---

## Performance — Avoiding Unnecessary Re-renders

Every component consuming a context re-renders when the context value changes. Keep context values stable to minimize this.

```jsx
// Every render creates a new object — all consumers re-render unnecessarily
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

```jsx
// Stable with useMemo — only re-renders when theme actually changes
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
```

For even more control, split a context into separate state and dispatch contexts so that components reading state do not re-render when only an action function is called.

```jsx
const StateContext = createContext(null);
const DispatchContext = createContext(null);

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}

// Components that only dispatch do not re-render when state changes
function AddButton() {
  const dispatch = useContext(DispatchContext);
  return <button onClick={() => dispatch({ type: "ADD" })}>Add</button>;
}
```

---

## Default Context Value

The value passed to `createContext` is used only when a component consumes the context outside of any Provider. In practice, always provide a meaningful error via a custom hook instead of relying on this default.

```jsx
// Default value is used if no Provider wraps the consumer
const ThemeContext = createContext("light");

// Better — use a guard in the hook
const ThemeContext = createContext(null);

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
```

---

## When to Use Context

Context is the right tool when:

- Data needs to be accessible at many levels of the tree without prop drilling
- The data changes infrequently or affects a moderate number of consumers
- The data is genuinely global to a section of the app (auth, theme, locale, cart)

Context is not a replacement for a state management library when:

- State changes frequently (every keystroke, animation frame, real-time updates)
- You need middleware, time-travel debugging, or dev tools
- Multiple disconnected sections of the app need to stay in sync with complex update logic

---

## Context vs. Lifting State vs. External State

|               | Lifting State                           | Context API               | Zustand / Redux           |
| ------------- | --------------------------------------- | ------------------------- | ------------------------- |
| Scope         | Local — two or three sibling components | Subtree or global         | Truly global              |
| Prop drilling | Occurs when tree is deep                | Eliminated                | Eliminated                |
| Performance   | Fine for local state                    | Good with memoization     | Optimized by default      |
| Complexity    | Simple                                  | Moderate                  | Higher setup cost         |
| Best for      | Sibling sync, form coordination         | Auth, theme, locale, cart | Large apps, complex logic |

---

## Common Mistakes

```jsx
// Creating a new context value object on every render — causes all consumers to re-render
<MyContext.Provider value={{ user, logout }}>

// Fix — memoize the value
const value = useMemo(() => ({ user, logout }), [user]);
<MyContext.Provider value={value}>

// Using context for state that only one component needs — overkill
// Prefer local useState for single-component state

// Calling useContext without a Provider in the tree — returns the default value silently
// Fix — add a null guard in a custom hook
```

---

## Summary

The Context API eliminates prop drilling by making values accessible to any component in the tree that subscribes to them. Create a context, wrap a section of the tree in a Provider, and consume the value with `useContext` via a custom hook that includes a usage guard. Pair Context with `useReducer` for complex state, memoize the context value to control re-renders, and use separate contexts for unrelated concerns. For high-frequency updates or very complex state, prefer a dedicated state management library.

---

_Next: [State Management with Zustand](./Zustand.md) — lightweight global state without boilerplate._
