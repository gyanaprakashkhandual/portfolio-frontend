# useContext

`useContext` lets a component read and subscribe to a React Context. It solves the problem of **prop drilling** — passing data through many layers of components that do not need it, just to get it to a deeply nested component that does.

---

## Syntax

```js
const value = useContext(SomeContext);
```

- `SomeContext` — the context object created by `React.createContext()`.
- Returns the current context value provided by the nearest matching `Provider` above in the tree.

---

## Creating and Using Context

Context involves three steps: creating the context, providing a value, and consuming it.

### Step 1 — Create the Context

```js
// ThemeContext.js
import { createContext } from "react";

export const ThemeContext = createContext("light"); // 'light' is the default value
```

### Step 2 — Provide a Value

Wrap the part of your component tree that needs access to the context with a `Provider`. Any component inside it can read the value.

```jsx
import { useState } from "react";
import { ThemeContext } from "./ThemeContext";
import App from "./App";

function Root() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <App />
    </ThemeContext.Provider>
  );
}
```

### Step 3 — Consume the Value

Any component inside the provider — no matter how deeply nested — can read the context value directly without receiving it as a prop.

```jsx
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

function Header() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <header className={`header header--${theme}`}>
      <span>Current theme: {theme}</span>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
    </header>
  );
}
```

---

## Real-World Pattern — Context with a Custom Hook

Wrapping context in a custom hook is the cleanest and most reusable pattern. It hides the implementation detail, provides a descriptive error if used outside a provider, and gives consumers a clean API.

```jsx
// ThemeContext.jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
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

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

```jsx
// main.jsx
import { ThemeProvider } from "./ThemeContext";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
```

```jsx
// Any component in the tree
import { useTheme } from "./ThemeContext";

function Toolbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <span>Theme: {theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}
```

---

## Authentication Context Example

A common real-world use case for context is managing authenticated user state globally.

```jsx
// AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(email, password) {
    const data = await fakeAuthApi(email, password);
    setUser(data.user);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

```jsx
// Navbar.jsx
import { useAuth } from "./AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      {user ? (
        <>
          <span>Hello, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
```

---

## Default Context Value

The default value passed to `createContext()` is only used when a component reads the context but has no matching `Provider` above it in the tree. This is useful for testing components in isolation.

```jsx
// This component works even without a Provider — uses the default
const LangContext = createContext("en");

function LanguageDisplay() {
  const lang = useContext(LangContext);
  return <p>Language: {lang}</p>;
}
```

---

## Re-rendering Behavior

Every component that calls `useContext(SomeContext)` will re-render whenever the context value changes. If a Provider's value is an object defined inline, it creates a new reference on every render, causing all consumers to re-render unnecessarily.

```jsx
// Causes unnecessary re-renders — new object reference every render
<ThemeContext.Provider value={{ theme, toggleTheme }}>

// Better — memoize the value
import { useMemo } from 'react'

const value = useMemo(() => ({ theme, toggleTheme }), [theme])

<ThemeContext.Provider value={value}>
```

---

## When to Use Context

Context is a good fit for:

- Global UI state — theme, language, color scheme
- Authentication — current user, session data
- App-wide settings or configuration
- Avoiding deep prop drilling across many layers

Context is not the right tool for:

- Frequently changing values like real-time data or rapidly updating state — use a dedicated state manager instead
- State that is only shared between a parent and one or two children — regular props are simpler

---

## Common Mistakes

```jsx
// Forgetting the Provider — component gets the default value silently
function App() {
  return <UserCard /> // useContext reads the default, no error thrown
}

// Should be
function App() {
  return (
    <UserContext.Provider value={user}>
      <UserCard />
    </UserContext.Provider>
  )
}

// Inline object value causing unnecessary re-renders
<Ctx.Provider value={{ a, b }}> // new object every render
// Use useMemo or move the value outside the component if it's static
```

---

## Summary

`useContext` is the clean solution to prop drilling. Pair it with `createContext` and a custom hook for a maintainable, error-safe API. Keep context values stable with `useMemo` when they are objects, and reach for a dedicated state management library when your global state grows complex or updates at high frequency.

---

_Next: [useReducer](./UseReducer.md) — manage complex state transitions with a reducer function._
