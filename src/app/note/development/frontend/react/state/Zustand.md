# State Management with Zustand

Zustand is a minimal, fast global state management library for React. It uses a hook-based API, requires no providers or boilerplate, and components subscribe only to the specific slices of state they use — avoiding unnecessary re-renders.

---

## Installation

```bash
npm install zustand
```

---

## Core Concepts

A Zustand store is created with `create`. It returns a hook that any component can call to read state or trigger actions. No Provider is required.

```jsx
import { create } from "zustand";

const useStore = create((set) => ({
  // state
  count: 0,

  // actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

`set` merges the returned object into the existing state — you only need to specify what changed.

---

## Reading State in Components

Pass a selector function to the store hook. The component re-renders only when the selected value changes.

```jsx
function Counter() {
  const count = useStore((state) => state.count);

  return <p>Count: {count}</p>;
}

function Controls() {
  const increment = useStore((state) => state.increment);
  const decrement = useStore((state) => state.decrement);
  const reset = useStore((state) => state.reset);

  return (
    <>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </>
  );
}
```

`Counter` re-renders when `count` changes. `Controls` does not re-render when `count` changes because it only selects the action functions, which are stable.

---

## A Complete Store — Shopping Cart

```jsx
import { create } from "zustand";

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,

  addItem(product) {
    const existing = get().items.find((i) => i.id === product.id);

    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        ),
        total: state.total + product.price,
      }));
    } else {
      set((state) => ({
        items: [...state.items, { ...product, qty: 1 }],
        total: state.total + product.price,
      }));
    }
  },

  removeItem(id) {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;

    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      total: state.total - item.price * item.qty,
    }));
  },

  clearCart() {
    set({ items: [], total: 0 });
  },
}));
```

`get` gives you access to the current state inside an action — useful when the new state depends on reading the current state before updating it.

---

## Using the Cart Store

```jsx
function CartIcon() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.qty, 0),
  );

  return <span>Cart ({itemCount})</span>;
}

function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addItem(product)}>Add to Cart</button>
    </div>
  );
}

function CartSummary() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {item.name} x{item.qty} — ${item.price * item.qty}
        </div>
      ))}
      <strong>Total: ${total.toFixed(2)}</strong>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}
```

No Provider wraps the app. Every component reads from the same store directly.

---

## Derived State

Compute derived values inside the selector to keep components clean.

```jsx
// Compute what you need inside the selector — not in the component
function CartBadge() {
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.qty, 0),
  );

  return count > 0 ? <span className="badge">{count}</span> : null;
}

function CartTotal() {
  const formattedTotal = useCartStore((state) => `$${state.total.toFixed(2)}`);

  return <p>Total: {formattedTotal}</p>;
}
```

---

## Async Actions

Zustand actions are plain functions — call async code directly inside them.

```jsx
const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  async fetchUser(id) {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`/api/users/${id}`);
      const user = await response.json();
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearUser() {
    set({ user: null, error: null });
  },
}));

// Usage
function UserProfile({ userId }) {
  const { user, loading, error, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return null;

  return <h2>{user.name}</h2>;
}
```

---

## Splitting Stores

Keep related state together in focused stores rather than one giant store. Stores are cheap to create.

```jsx
// auth.store.js
export const useAuthStore = create((set) => ({
  user: null,
  login: async (credentials) => {
    /* ... */
  },
  logout: () => set({ user: null }),
}));

// cart.store.js
export const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));

// ui.store.js
export const useUIStore = create((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

Each store is independent, focused, and easy to reason about.

---

## Middleware

### persist — Save State to localStorage

```jsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: "light",
      language: "en",
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "app-settings", // localStorage key
    },
  ),
);
```

State is automatically saved to localStorage and restored on page load.

### devtools — Redux DevTools Integration

```jsx
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () =>
        set((state) => ({ count: state.count + 1 }), false, "increment"),
    }),
    { name: "CounterStore" },
  ),
);
```

The third argument to `set` is the action name shown in DevTools — making debugging much clearer.

### Combining Middleware

```jsx
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

const useStore = create(
  devtools(
    persist(
      (set) => ({
        theme: "light",
        setTheme: (theme) => set({ theme }),
      }),
      { name: "theme-store" },
    ),
    { name: "ThemeStore" },
  ),
);
```

---

## Selecting Multiple Values

When you need multiple values from a store, select each individually or use a shallow equality check.

```jsx
import { useShallow } from "zustand/react/shallow";

// Each selector is independent — fine for a small number of values
function Component() {
  const count = useStore((state) => state.count);
  const name = useStore((state) => state.name);
}

// useShallow — select multiple values as an object without causing unnecessary re-renders
function Component() {
  const { count, name } = useStore(
    useShallow((state) => ({ count: state.count, name: state.name })),
  );
}
```

Without `useShallow`, selecting `{ count, name }` creates a new object every render, which triggers a re-render even when the values haven't changed.

---

## Reading State Outside React

Zustand stores expose a `getState` method for reading state outside of components — useful in utility functions, API handlers, or event listeners.

```jsx
// Access state anywhere without a hook
const { user } = useAuthStore.getState();

// Subscribe to changes outside React
const unsubscribe = useCartStore.subscribe((state) =>
  console.log("Cart updated:", state.items),
);
```

---

## Zustand vs. Context API vs. Redux Toolkit

|             | Zustand                                  | Context API              | Redux Toolkit                    |
| ----------- | ---------------------------------------- | ------------------------ | -------------------------------- |
| Setup       | Minimal — no Provider                    | Provider required        | Store, slices, Provider          |
| Boilerplate | Very low                                 | Low                      | Moderate                         |
| Performance | Component-level subscriptions            | Re-renders all consumers | Component-level subscriptions    |
| Async       | Plain async functions                    | Manual in hooks          | `createAsyncThunk`               |
| DevTools    | Yes, via middleware                      | No                       | Yes, built-in                    |
| Persistence | Yes, via middleware                      | Manual                   | Yes, via middleware              |
| Best for    | Small to large apps needing global state | Auth, theme, locale      | Very large apps, strict patterns |

---

## Common Mistakes

```jsx
// Selecting the entire state — component re-renders on any state change
const state = useStore((state) => state); // bad
const everything = useStore(); // bad

// Use specific selectors
const count = useStore((state) => state.count); // correct

// Mutating state directly inside set — Zustand does not use Immer by default
set((state) => {
  state.count++; // mutation — do not do this without Immer middleware
});

// Correct — return a new object
set((state) => ({ count: state.count + 1 }));

// Selecting a new object without useShallow — causes re-renders on every call
const { a, b } = useStore((s) => ({ a: s.a, b: s.b })); // new object each time

// Fix with useShallow
const { a, b } = useStore(useShallow((s) => ({ a: s.a, b: s.b })));
```

---

## Summary

Zustand is a pragmatic global state library with almost no setup cost. Define a store with `create`, select slices with targeted selectors, and write actions as plain synchronous or async functions. No Provider, no reducers, no action creators. Use `persist` for localStorage integration, `devtools` for debugging, and `useShallow` when selecting multiple values as an object. Split large stores into focused, per-domain stores for maintainability.

---

_Next: [State Management with Redux Toolkit](./ReduxToolkit.md) — structured global state with slices, reducers, and async thunks._
