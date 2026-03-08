# Higher-Order Components (HOC)

A Higher-Order Component is a function that takes a component and returns a new component with additional behavior. HOCs are a pattern for reusing component logic — they wrap a component to inject props, lifecycle behavior, or data without modifying the original.

---

## Syntax

```js
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

A HOC is just a function. It accepts a component, extends it in some way, and returns a new component.

---

## Basic HOC

The simplest possible HOC — wraps a component and passes through all props.

```jsx
function withLogging(WrappedComponent) {
  return function LoggedComponent(props) {
    console.log("Rendering:", WrappedComponent.displayName || WrappedComponent.name);
    return <WrappedComponent {...props} />;
  };
}

// Usage
function UserCard({ name }) {
  return <div>{name}</div>;
}

const LoggedUserCard = withLogging(UserCard);

// LoggedUserCard logs on every render and renders UserCard exactly as before
```

The `{...props}` spread ensures the wrapped component receives all its original props unchanged.

---

## HOC for Authentication

A common real-world use: redirect unauthenticated users before rendering a protected component.

```jsx
import { Navigate } from "react-router-dom";

function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <WrappedComponent {...props} />;
  };
}

// Usage
function Dashboard({ user }) {
  return <div>Welcome, {user.name}</div>;
}

const ProtectedDashboard = withAuth(Dashboard);
```

`Dashboard` has zero knowledge of authentication. `withAuth` handles the concern entirely.

---

## HOC for Data Fetching

Inject fetched data as props into any component.

```jsx
function withData(WrappedComponent, fetchData) {
  return function DataComponent(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      fetchData()
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return <WrappedComponent {...props} data={data} />;
  };
}

// Usage
function UserList({ data }) {
  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

const fetchUsers = () => fetch("/api/users").then((r) => r.json());

const UserListWithData = withData(UserList, fetchUsers);
```

---

## HOC for Loading States

```jsx
function withLoadingSpinner(WrappedComponent) {
  return function WithSpinner({ isLoading, ...props }) {
    if (isLoading) {
      return (
        <div className="spinner-container">
          <div className="spinner" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Usage
const UserCardWithSpinner = withLoadingSpinner(UserCard);

function App() {
  const { data, isLoading } = useUserData();

  return <UserCardWithSpinner isLoading={isLoading} user={data} />;
}
```

---

## Composing Multiple HOCs

HOCs compose naturally. The result of one HOC can be passed to another.

```jsx
const EnhancedComponent = withAuth(withLogging(withData(UserDashboard, fetchUser)));
```

Reading from right to left: `UserDashboard` gets data injected, then logging, then auth protection.

For cleaner composition, use a utility like `compose`:

```jsx
function compose(...fns) {
  return (component) => fns.reduceRight((acc, fn) => fn(acc), component);
}

const enhance = compose(withAuth, withLogging, withErrorBoundary);
const EnhancedDashboard = enhance(Dashboard);
```

---

## Setting displayName for DevTools

HOCs create anonymous wrapper components that are hard to identify in React DevTools. Always set `displayName`.

```jsx
function withAuth(WrappedComponent) {
  function AuthenticatedComponent(props) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <WrappedComponent {...props} />;
  }

  // Makes DevTools show "withAuth(Dashboard)" instead of "AuthenticatedComponent"
  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthenticatedComponent;
}
```

---

## Forwarding Refs Through HOCs

HOCs break `ref` forwarding by default. Use `forwardRef` to preserve it.

```jsx
function withBorder(WrappedComponent) {
  const WithBorder = forwardRef(function (props, ref) {
    return (
      <div style={{ border: "2px solid blue" }}>
        <WrappedComponent {...props} ref={ref} />
      </div>
    );
  });

  WithBorder.displayName = `withBorder(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithBorder;
}
```

---

## Common Mistakes

```jsx
// ❌ Never define a HOC inside a render/component body — creates a new component type on every render
function Parent() {
  const Enhanced = withAuth(Child); // recreated every render — all state is lost
  return <Enhanced />;
}

// ✅ Define HOCs at module level
const EnhancedChild = withAuth(Child);

function Parent() {
  return <EnhancedChild />;
}

// ❌ Forgetting to pass props through — breaks the wrapped component
function withSomething(WrappedComponent) {
  return function (props) {
    return <WrappedComponent />; // lost all props!
  };
}

// ✅ Always spread props
function withSomething(WrappedComponent) {
  return function (props) {
    return <WrappedComponent {...props} />;
  };
}
```

---

## HOC vs. Custom Hook

HOCs and custom hooks often solve the same problem. Prefer custom hooks in most cases — they are simpler and don't add wrapper components to the tree.

| | HOC | Custom Hook |
|---|---|---|
| **Wraps** | A component | Logic only |
| **Adds DOM nodes** | Yes (wrapper element) | No |
| **Composability** | Nesting wrappers | Simple function calls |
| **TypeScript** | Complex to type | Straightforward |
| **Best for** | Wrapping class components, injecting JSX (loading states) | Sharing stateful logic in function components |

```jsx
// HOC approach
const UserCardWithSpinner = withLoadingSpinner(UserCard);

// Custom Hook approach (often simpler)
function UserCard() {
  const { data, isLoading } = useUserData();
  if (isLoading) return <Spinner />;
  return <div>{data.name}</div>;
}
```

Use HOCs when you need to wrap a component with JSX, inject rendered UI, or enhance class components. Prefer hooks for pure logic sharing.

---

## Real-World Example — withPermission

```jsx
function withPermission(WrappedComponent, requiredRole) {
  function PermissionGuard(props) {
    const { user } = useAuth();

    if (!user.roles.includes(requiredRole)) {
      return (
        <div className="access-denied">
          <p>You don't have permission to view this content.</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  }

  PermissionGuard.displayName = `withPermission(${
    WrappedComponent.displayName || WrappedComponent.name
  }, ${requiredRole})`;

  return PermissionGuard;
}

// Usage
const AdminPanel = withPermission(AdminPanelBase, "admin");
const EditorTools = withPermission(EditorToolsBase, "editor");
```

---

## Summary

Higher-Order Components are functions that wrap a component and return an enhanced version. They are ideal for cross-cutting concerns like authentication, logging, permission guards, and injecting loading states. Always pass through props with `{...props}`, set a `displayName` for DevTools, use `forwardRef` when refs matter, and define HOCs at module level — never inside render. For pure logic sharing in function components, prefer custom hooks.

---

_Next: [Render Props](./RenderProps.md) — share behavior by passing a render function as a prop._