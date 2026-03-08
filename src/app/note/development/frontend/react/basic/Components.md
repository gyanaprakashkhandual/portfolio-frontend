# Components and Props

Components are the building blocks of a React application. Every piece of UI — a button, a form, a page — is a component. Props are how data flows into a component from its parent, making components dynamic and reusable.

---

## What Is a Component

A React component is a JavaScript function that accepts props as input and returns JSX describing what should appear on screen. Components let you split the UI into independent, reusable pieces that can be reasoned about in isolation.

```jsx
function Greeting() {
  return <h1>Hello, World</h1>;
}
```

This is a complete, valid React component. It takes no input and renders a fixed heading.

---

## Function Components

The modern way to write components. A function component is a plain JavaScript function that returns JSX.

```jsx
function WelcomeBanner() {
  return (
    <div className="banner">
      <h1>Welcome to the App</h1>
      <p>Get started by exploring the features below.</p>
    </div>
  );
}
```

Component names must start with a capital letter. React uses this to distinguish components from native HTML elements.

---

## Props — Passing Data to Components

Props (short for properties) are the arguments passed to a component. The parent component passes them as JSX attributes and the child receives them as an object.

```jsx
function UserCard({ name, email, role }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>{email}</p>
      <span className="badge">{role}</span>
    </div>
  );
}

// Usage — props are passed as attributes
function App() {
  return (
    <UserCard name="Alice Johnson" email="alice@example.com" role="Admin" />
  );
}
```

Destructuring props in the function signature keeps the code readable. You can also receive props as a single object:

```jsx
function UserCard(props) {
  return <h2>{props.name}</h2>;
}
```

---

## Default Props

Provide fallback values for props that are optional using default parameter syntax.

```jsx
function Button({ label = "Click Me", variant = "primary", size = "md" }) {
  return (
    <button className={`btn btn--${variant} btn--${size}`}>
      {label}
    </button>
  );
}

// All props are optional — defaults are used when not provided
<Button />
<Button label="Submit" />
<Button label="Delete" variant="danger" size="lg" />
```

---

## The children Prop

Any content placed between a component's opening and closing tags is passed as `children`. This enables component composition.

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Usage — anything inside Card becomes children
function App() {
  return (
    <Card title="User Profile">
      <p>Name: Alice Johnson</p>
      <p>Role: Administrator</p>
      <button>Edit Profile</button>
    </Card>
  );
}
```

---

## Props Are Read-Only

A component must never modify its own props. Props flow one direction — from parent to child. If a value needs to change, it belongs in state, not props.

```jsx
// Wrong — mutating props directly
function Counter({ count }) {
  count = count + 1; // never do this
  return <p>{count}</p>;
}

// Correct — use local state or receive a callback from the parent
function Counter({ initialCount, onCountChange }) {
  const [count, setCount] = useState(initialCount);

  function increment() {
    const next = count + 1;
    setCount(next);
    onCountChange?.(next);
  }

  return (
    <>
      <p>{count}</p>
      <button onClick={increment}>Increment</button>
    </>
  );
}
```

---

## Passing Different Data Types as Props

Props can carry any JavaScript value — strings, numbers, booleans, objects, arrays, and functions.

```jsx
function DataDisplay({
  title, // string
  count, // number
  isActive, // boolean
  tags, // array
  config, // object
  onAction, // function
}) {
  return (
    <div>
      <h2>{title}</h2>
      <p>Count: {count}</p>
      <p>Status: {isActive ? "Active" : "Inactive"}</p>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <button onClick={onAction}>Trigger</button>
    </div>
  );
}

// Usage
<DataDisplay
  title="Dashboard"
  count={42}
  isActive={true}
  tags={["react", "frontend", "javascript"]}
  config={{ theme: "dark" }}
  onAction={() => console.log("action triggered")}
/>;
```

Note that all non-string values must be passed inside curly braces.

---

## Composing Components

Break complex UIs into smaller, focused components and compose them together.

```jsx
function Avatar({ src, alt, size = 48 }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ borderRadius: "50%" }}
    />
  );
}

function UserInfo({ name, title }) {
  return (
    <div>
      <strong>{name}</strong>
      <p>{title}</p>
    </div>
  );
}

function UserCard({ user }) {
  return (
    <div className="user-card">
      <Avatar src={user.avatarUrl} alt={user.name} size={64} />
      <UserInfo name={user.name} title={user.title} />
    </div>
  );
}

function TeamList({ members }) {
  return (
    <section>
      <h2>Team Members</h2>
      {members.map((member) => (
        <UserCard key={member.id} user={member} />
      ))}
    </section>
  );
}
```

Each component has a single, clear responsibility. They compose naturally into a larger feature.

---

## Prop Spreading

Pass through props you don't specifically handle using the spread operator.

```jsx
function Input({ label, error, ...inputProps }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input {...inputProps} className={error ? "input--error" : "input"} />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// inputProps receives type, placeholder, value, onChange — passed through to the input
<Input
  label="Email"
  error={errors.email}
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>;
```

---

## Rendering Components

Components render inside other components. The top of the tree is typically the root component passed to `ReactDOM.createRoot`.

```jsx
function Header() {
  return (
    <header>
      <h1>My App</h1>
    </header>
  );
}

function Main() {
  return (
    <main>
      <p>Main content here.</p>
    </main>
  );
}

function Footer() {
  return (
    <footer>
      <p>2025 My App</p>
    </footer>
  );
}

function App() {
  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

// Entry point
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

---

## Component Reusability

A well-designed component works in multiple contexts without modification. Design components to accept the data they need as props rather than hard-coding values.

```jsx
// Not reusable — hard-coded content
function AliceCard() {
  return <div>Alice Johnson — Admin</div>;
}

// Reusable — data comes from props
function UserCard({ name, role }) {
  return <div>{name} — {role}</div>;
}

// Works for anyone
<UserCard name="Alice Johnson" role="Admin" />
<UserCard name="Bob Smith" role="Editor" />
<UserCard name="Carol White" role="Viewer" />
```

---

## Common Mistakes

```jsx
// Lowercase component name — treated as a DOM element, not a component
function userCard() { ... }      // wrong
<userCard name="Alice" />        // React looks for a <userCard> HTML element

function UserCard() { ... }      // correct
<UserCard name="Alice" />        // React calls the UserCard function

// Modifying props
function Badge({ count }) {
  count++;                       // wrong — props are read-only
  return <span>{count}</span>;
}

// Forgetting to pass required data as props
function App() {
  return <UserCard />;           // name and role are undefined inside UserCard
}

// Use default values or validate with PropTypes / TypeScript
function UserCard({ name = "Unknown", role = "Guest" }) { ... }
```

---

## Summary

Components are JavaScript functions that accept props and return JSX. Props are read-only data passed from parent to child — they can carry any JavaScript value including strings, numbers, booleans, arrays, objects, and functions. The `children` prop enables composition. Design components to be focused and reusable by accepting their data as props rather than hard-coding it. Always capitalize component names so React can distinguish them from HTML elements.

---

_Next: [Rendering Elements](./Rendering.md) — how React updates the DOM efficiently using the virtual DOM._
