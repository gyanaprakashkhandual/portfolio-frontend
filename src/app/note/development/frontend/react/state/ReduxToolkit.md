# State Management with Redux Toolkit

Redux Toolkit (RTK) is the official, opinionated way to write Redux. It eliminates the boilerplate of classic Redux by providing utilities for creating slices, reducers, and async logic with minimal code. RTK includes Immer for immutable updates, Redux Thunk for async actions, and RTK Query for data fetching.

---

## Installation

```bash
npm install @reduxjs/toolkit react-redux
```

---

## Core Concepts

| Concept  | Description                                                                   |
| -------- | ----------------------------------------------------------------------------- |
| Store    | The single container for all global state                                     |
| Slice    | A self-contained unit of state with its reducers and actions                  |
| Reducer  | A function that produces the next state given the current state and an action |
| Action   | A plain object describing what happened — `{ type, payload }`                 |
| Selector | A function that reads a value from the store                                  |
| Thunk    | An async action creator — for API calls and side effects                      |

---

## Creating a Store

```jsx
// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
  },
});

// TypeScript users — infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Providing the Store

Wrap the app in a `Provider` from `react-redux`. Only once — at the root.

```jsx
// main.jsx
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

---

## Creating a Slice

`createSlice` generates action creators and reducers from a single configuration object. Immer is included — you write mutations and RTK handles the immutability.

```jsx
// features/counter/counterSlice.js
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
    step: 1,
  },
  reducers: {
    increment(state) {
      state.value += state.step; // Immer makes this safe
    },
    decrement(state) {
      state.value -= state.step;
    },
    incrementByAmount(state, action) {
      state.value += action.payload;
    },
    setStep(state, action) {
      state.step = action.payload;
    },
    reset(state) {
      state.value = 0;
    },
  },
});

// Export actions and reducer
export const { increment, decrement, incrementByAmount, setStep, reset } =
  counterSlice.actions;

export default counterSlice.reducer;
```

---

## Using the Store in Components

`useSelector` reads state. `useDispatch` sends actions.

```jsx
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement, reset } from "./counterSlice";

function Counter() {
  const value = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <p>Count: {value}</p>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(reset())}>Reset</button>
    </div>
  );
}

function StepControl() {
  const step = useSelector((state) => state.counter.step);
  const dispatch = useDispatch();

  return (
    <label>
      Step:
      <input
        type="number"
        value={step}
        onChange={(e) => dispatch(setStep(Number(e.target.value)))}
      />
    </label>
  );
}
```

---

## Async Logic with createAsyncThunk

`createAsyncThunk` handles async operations — API calls, timers, and any side effects. It automatically dispatches `pending`, `fulfilled`, and `rejected` actions.

```jsx
// features/users/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Define the async thunk
export const fetchUsers = createAsyncThunk("users/fetchAll", async () => {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
});

export const createUser = createAsyncThunk(
  "users/create",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    // fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // createUser
    builder
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;
```

---

## Using Async Thunks in Components

```jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers, createUser } from "./usersSlice";

function UserList() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {items.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

function AddUserForm() {
  const dispatch = useDispatch();

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const result = await dispatch(
      createUser({ name: formData.get("name"), email: formData.get("email") }),
    );

    if (createUser.fulfilled.match(result)) {
      e.target.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" placeholder="Email" required />
      <button type="submit">Add User</button>
    </form>
  );
}
```

---

## Selectors — Keeping Components Clean

Write selector functions to encapsulate state access and derived computations. Keep them in the slice file.

```jsx
// Defined in usersSlice.js — co-located with the slice
export const selectAllUsers = (state) => state.users.items;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUserById = (id) => (state) =>
  state.users.items.find((u) => u.id === id);
export const selectAdminUsers = (state) =>
  state.users.items.filter((u) => u.role === "admin");

// Usage — clean components, no inline state access logic
function AdminList() {
  const admins = useSelector(selectAdminUsers);
  return (
    <ul>
      {admins.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

For expensive computed selectors, use `createSelector` from `reselect` (included with RTK) to memoize the result.

```jsx
import { createSelector } from "@reduxjs/toolkit";

const selectUsers = (state) => state.users.items;
const selectFilter = (state) => state.users.filter;

// Recomputes only when selectUsers or selectFilter changes
export const selectFilteredUsers = createSelector(
  [selectUsers, selectFilter],
  (users, filter) =>
    users.filter((u) => u.name.toLowerCase().includes(filter.toLowerCase())),
);
```

---

## RTK Query — Data Fetching

RTK Query is a powerful data fetching and caching layer built into RTK. It eliminates manual loading/error state management for server data.

```jsx
// app/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["User", "Post"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"], // re-fetches getUsers automatically
    }),
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} = api;
```

Register the API reducer and middleware in the store:

```jsx
// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./apiSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
```

Use the generated hooks in components:

```jsx
function UserList() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;

  return (
    <>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button
        disabled={isCreating}
        onClick={() =>
          createUser({ name: "New User", email: "new@example.com" })
        }
      >
        Add User
      </button>
    </>
  );
}
```

---

## Redux Toolkit vs. Zustand

|                  | Redux Toolkit                             | Zustand                           |
| ---------------- | ----------------------------------------- | --------------------------------- |
| Setup            | Store, slices, Provider                   | Single `create` call, no Provider |
| Boilerplate      | Moderate                                  | Minimal                           |
| Structure        | Strict — slices, reducers, actions        | Flexible                          |
| DevTools         | Built-in, excellent                       | Via middleware                    |
| Data fetching    | RTK Query (powerful, built-in)            | Manual or with TanStack Query     |
| Async            | `createAsyncThunk`                        | Plain async functions             |
| Team conventions | Enforces patterns — great for large teams | Unopinionated                     |
| Best for         | Large apps, teams needing consistency     | Small to medium apps              |

---

## Common Mistakes

```jsx
// Mutating state outside of Immer (outside a slice reducer)
// RTK only allows mutations inside createSlice reducers — not in components
dispatch({ type: "counter/increment", payload: state.count++ }); // wrong

// Using useSelector without a specific selector — selects everything, re-renders always
const state = useSelector((state) => state); // bad

// Specific selector — re-renders only when counter.value changes
const value = useSelector((state) => state.counter.value); // correct

// Dispatching thunks without handling rejection
dispatch(fetchUsers()); // fire and forget — errors are silently swallowed

// Check the result if the outcome matters
const result = await dispatch(fetchUsers());
if (fetchUsers.rejected.match(result)) {
  console.error("Fetch failed:", result.error);
}
```

---

## Folder Structure

A conventional feature-based structure for Redux Toolkit projects:

```
src/
  app/
    store.js
    apiSlice.js
  features/
    auth/
      authSlice.js
      authSelectors.js
      LoginForm.jsx
      NavBar.jsx
    cart/
      cartSlice.js
      cartSelectors.js
      CartIcon.jsx
      CartDrawer.jsx
    users/
      usersSlice.js
      UserList.jsx
      UserDetail.jsx
```

Slice files co-locate reducers, actions, and selectors. Components live next to the feature they belong to.

---

## Summary

Redux Toolkit is the modern standard for Redux. Use `createSlice` to define state and reducers together, `createAsyncThunk` for API calls, and `createSelector` for memoized derived data. RTK Query replaces manual data fetching entirely by generating hooks with built-in caching, invalidation, and loading states. The strict structure and excellent DevTools integration make RTK especially valuable for large teams and complex applications.

---

_Back to: [State Management Overview]_
