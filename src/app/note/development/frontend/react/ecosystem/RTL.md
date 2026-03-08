# Testing with React Testing Library

React Testing Library (RTL) is the standard tool for testing React components. Its guiding philosophy is to test components the way users interact with them — finding elements by accessible roles, labels, and text rather than internal implementation details like component state, class names, or CSS selectors. Tests written this way are more resilient to refactoring and catch real user-facing problems.

---

## Installation

```bash
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom vitest jsdom
```

For projects using Jest instead of Vitest, replace `vitest` with `jest` and `@testing-library/jest-dom` handles the rest identically.

### Configuration (Vitest + jsdom)

```js
// vitest.config.js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
});
```

```js
// src/test/setup.js
import "@testing-library/jest-dom";
```

---

## Core Concepts

### render

`render` mounts a component into a virtual DOM and returns query utilities for interacting with it.

```jsx
import { render, screen } from "@testing-library/react";

test("renders a greeting", () => {
  render(<Greeting name="Alice" />);
  expect(screen.getByText("Hello, Alice")).toBeInTheDocument();
});
```

### screen

`screen` exposes all query methods bound to the rendered document. It is the primary way to find elements after rendering.

### userEvent

`@testing-library/user-event` simulates real user interactions — typing, clicking, focusing, and tabbing — more accurately than the lower-level `fireEvent`.

```jsx
import userEvent from "@testing-library/user-event";

test("increments count on click", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  const button = screen.getByRole("button", { name: "Increment" });
  await user.click(button);

  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

Always use `userEvent` over `fireEvent` for interactions that users perform. `userEvent` fires the full event sequence (pointerdown, mousedown, click, focus, input, etc.) that a real browser would.

---

## Queries — Finding Elements

RTL provides three tiers of queries, each returning elements in different ways.

### getBy — Synchronous, Throws if Not Found

Use for elements that should be present right now.

```jsx
screen.getByRole("button", { name: "Submit" });
screen.getByLabelText("Email address");
screen.getByPlaceholderText("Search...");
screen.getByText("Welcome back");
screen.getByDisplayValue("Alice");
screen.getByAltText("Company logo");
screen.getByTitle("Close dialog");
screen.getByTestId("error-banner");
```

### queryBy — Synchronous, Returns null if Not Found

Use when asserting an element is absent.

```jsx
expect(screen.queryByText("Error message")).not.toBeInTheDocument();
expect(screen.queryByRole("dialog")).toBeNull();
```

### findBy — Async, Returns a Promise

Use for elements that appear after an async operation — data fetching, animations, delayed rendering.

```jsx
const successMessage = await screen.findByText("Post published successfully.");
expect(successMessage).toBeInTheDocument();
```

### Query Priority

RTL recommends a priority for which queries to use. Queries higher on this list result in more accessible components and more resilient tests.

```
1. getByRole          — most accessible, mirrors how assistive tech finds elements
2. getByLabelText     — for form fields associated with a label
3. getByPlaceholderText
4. getByText          — for non-interactive text content
5. getByDisplayValue  — for current value of inputs
6. getByAltText       — for images
7. getByTitle         — for title attributes
8. getByTestId        — last resort — ties test to implementation detail
```

---

## Writing Your First Tests

### Testing a Simple Component

```jsx
// Greeting.jsx
function Greeting({ name }) {
  return (
    <div>
      <h1>Hello, {name}</h1>
      <p>Welcome to the application.</p>
    </div>
  );
}
```

```jsx
// Greeting.test.jsx
import { render, screen } from "@testing-library/react";
import Greeting from "./Greeting";

describe("Greeting", () => {
  test("renders the user's name", () => {
    render(<Greeting name="Alice" />);
    expect(
      screen.getByRole("heading", { name: "Hello, Alice" }),
    ).toBeInTheDocument();
  });

  test("renders the welcome message", () => {
    render(<Greeting name="Alice" />);
    expect(screen.getByText("Welcome to the application.")).toBeInTheDocument();
  });
});
```

---

### Testing User Interactions

```jsx
// Counter.jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

```jsx
// Counter.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

describe("Counter", () => {
  test("starts at zero", () => {
    render(<Counter />);
    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });

  test("increments when the increment button is clicked", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "Increment" }));
    await user.click(screen.getByRole("button", { name: "Increment" }));

    expect(screen.getByText("Count: 2")).toBeInTheDocument();
  });

  test("resets to zero", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "Increment" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });
});
```

---

### Testing Forms

```jsx
// LoginForm.jsx
function LoginForm({ onSubmit }) {
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      await onSubmit({ email, password });
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

```jsx
// LoginForm.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  test("calls onSubmit with email and password", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "alice@example.com",
      password: "password123",
    });
  });

  test("shows an error when fields are empty", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "All fields are required.",
    );
  });

  test("shows an error when login fails", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockRejectedValue(new Error("Unauthorized"));

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText("Email"), "wrong@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
  });
});
```

---

### Testing Async Data Fetching

```jsx
// UserList.jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

```jsx
// UserList.test.jsx
import { render, screen } from "@testing-library/react";
import UserList from "./UserList";

beforeEach(() => {
  vi.spyOn(global, "fetch");
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("shows loading state initially", () => {
  global.fetch.mockResolvedValue({
    json: () => Promise.resolve([]),
  });

  render(<UserList />);

  expect(screen.getByText("Loading users...")).toBeInTheDocument();
});

test("renders users after loading", async () => {
  global.fetch.mockResolvedValue({
    json: () =>
      Promise.resolve([
        { id: 1, name: "Alice Johnson" },
        { id: 2, name: "Bob Smith" },
      ]),
  });

  render(<UserList />);

  expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
  expect(screen.getByText("Bob Smith")).toBeInTheDocument();
});

test("shows error when fetch fails", async () => {
  global.fetch.mockRejectedValue(new Error("Network error"));

  render(<UserList />);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Failed to load users.",
  );
});
```

---

## Wrapping with Providers

Components that depend on context providers (router, query client, auth) need those providers in tests. Create a custom `renderWithProviders` wrapper.

```jsx
// src/test/utils.jsx
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // do not retry failed queries in tests
        gcTime: Infinity,
      },
    },
  });
}

export function renderWithProviders(ui, { route = "/" } = {}) {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}
```

```jsx
// Using the custom renderer
import { renderWithProviders } from "../test/utils";
import { screen } from "@testing-library/react";

test("renders dashboard at /dashboard route", async () => {
  renderWithProviders(<App />, { route: "/dashboard" });
  expect(
    await screen.findByRole("heading", { name: "Dashboard" }),
  ).toBeInTheDocument();
});
```

---

## Mocking Modules

Mock modules that make network requests, access the file system, or have external dependencies.

```jsx
// Mocking a named export
vi.mock("../api/users", () => ({
  fetchUsers: vi.fn(),
}));

import { fetchUsers } from "../api/users";

test("renders users from API", async () => {
  fetchUsers.mockResolvedValue([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);

  render(<UserList />);

  expect(await screen.findByText("Alice")).toBeInTheDocument();
  expect(screen.getByText("Bob")).toBeInTheDocument();
});
```

---

## jest-dom Matchers Reference

`@testing-library/jest-dom` extends the matcher set with DOM-specific assertions.

```jsx
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeEnabled();
expect(element).toBeDisabled();
expect(element).toBeChecked();
expect(element).toHaveValue("alice@example.com");
expect(element).toHaveTextContent("Submit");
expect(element).toHaveAttribute("href", "/home");
expect(element).toHaveClass("btn--primary");
expect(element).toHaveFocus();
expect(element).toBeRequired();
```

---

## What Not to Test

RTL encourages testing behavior, not implementation. Avoid these patterns.

```jsx
// Testing internal state — implementation detail, not user-facing
expect(component.state.count).toBe(1); // meaningless to the user

// Selecting by class name — breaks when styles are refactored
screen.getByClassName("card__title"); // avoid

// Snapshot testing large components — snapshots break constantly and verify nothing meaningful
expect(container).toMatchSnapshot(); // use sparingly, only for small stable outputs

// Testing that a function was defined — not useful
expect(typeof handleClick).toBe("function");
```

Instead, test what the user sees and what they can do:

```jsx
// What does the user see after clicking?
await user.click(screen.getByRole("button", { name: "Add to Cart" }));
expect(screen.getByText("Item added to cart")).toBeInTheDocument();

// Can the user submit the form?
await user.type(screen.getByLabelText("Email"), "test@test.com");
await user.click(screen.getByRole("button", { name: "Subscribe" }));
expect(handleSubscribe).toHaveBeenCalledWith("test@test.com");
```

---

## Common Mistakes

```jsx
// Using fireEvent instead of userEvent — does not simulate real user behavior
fireEvent.click(button); // fires a single click event
await user.click(button); // fires the full browser event sequence — prefer this

// Not awaiting userEvent calls — interactions are async
user.click(button); // missing await — test may pass incorrectly
await user.click(button); // correct

// Using getBy for elements that load asynchronously — throws before the element appears
screen.getByText("Alice Johnson"); // throws if data has not loaded yet
await screen.findByText("Alice Johnson"); // correct — waits for the element

// Selecting by test ID when a semantic query works — hides accessibility issues
screen.getByTestId("submit-btn");
screen.getByRole("button", { name: "Submit" }); // better — tests accessibility too

// Not cleaning up between tests — RTL does this automatically with modern setup,
// but ensure your setup file imports @testing-library/jest-dom
```

---

## Summary

React Testing Library tests components from the user's perspective. Use `render` to mount components, `screen` queries to find elements by accessible roles and labels, and `userEvent` to simulate real interactions. Prefer `getByRole` and `getByLabelText` over `getByTestId`. Use `findBy` queries for async content and `queryBy` to assert absence. Wrap components in a custom `renderWithProviders` helper when they depend on context. Test what the user sees and can do — not internal state, class names, or implementation details. Components that are easy to test with RTL are almost always more accessible and better designed.

---

_Back to: [Ecosystem Overview]_
