# Component Composition

Component Composition is the foundational React pattern for building complex UIs by combining smaller, focused components. Instead of building one large monolithic component, you assemble many smaller pieces together — passing components as children or props to create flexible, reusable structures.

---

## What Is Composition?

In React, composition means building components that **accept other components or elements as input** — either through `children` or through dedicated props. This mirrors how HTML elements nest naturally, and it is the primary way React encourages code reuse.

Composition is preferred over inheritance. React's component model is designed around it.

---

## The `children` Prop

The most natural form of composition. Any content placed between a component's opening and closing tags is passed in as `children`.

```jsx
function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

// Usage
function App() {
  return (
    <Card>
      <h2>Hello World</h2>
      <p>This content is passed as children.</p>
    </Card>
  );
}
```

`Card` has no knowledge of what its children are — it simply renders whatever is passed. This makes it infinitely reusable.

---

## Slot Pattern — Named Composition Props

When a component needs multiple distinct areas for injected content, use dedicated props alongside (or instead of) `children`. This is often called the **slot pattern**.

```jsx
function PageLayout({ header, sidebar, children }) {
  return (
    <div className="layout">
      <header className="layout-header">{header}</header>
      <aside className="layout-sidebar">{sidebar}</aside>
      <main className="layout-main">{children}</main>
    </div>
  );
}

// Usage
function App() {
  return (
    <PageLayout
      header={<NavBar />}
      sidebar={<SideMenu />}
    >
      <ArticleContent />
    </PageLayout>
  );
}
```

`PageLayout` defines the structure. The caller decides what fills each slot.

---

## Specialization

Composition enables creating a **specialized version** of a generic component by pre-filling certain props.

```jsx
function Button({ variant = "default", size = "md", children, ...props }) {
  return (
    <button className={`btn btn--${variant} btn--${size}`} {...props}>
      {children}
    </button>
  );
}

// Specialized versions
function PrimaryButton(props) {
  return <Button variant="primary" {...props} />;
}

function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

// Usage
function App() {
  return (
    <>
      <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
      <DangerButton onClick={handleDelete}>Delete</DangerButton>
    </>
  );
}
```

`PrimaryButton` and `DangerButton` are specialized compositions of `Button`. They don't repeat any logic.

---

## Composing with Render Props

Components can accept **functions as props** to give callers control over how parts of the UI render. This is an advanced form of composition.

```jsx
function List({ items, renderItem }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
function App() {
  const users = [{ name: "Alice", role: "Admin" }, { name: "Bob", role: "Editor" }];

  return (
    <List
      items={users}
      renderItem={(user) => (
        <span>
          <strong>{user.name}</strong> — {user.role}
        </span>
      )}
    />
  );
}
```

`List` handles iteration. The parent decides how each item looks.

---

## Composing Layout Components

Composition shines when building layout systems. Each component owns only its own structural responsibility.

```jsx
function Stack({ gap = 16, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {children}
    </div>
  );
}

function Row({ gap = 8, align = "center", children }) {
  return (
    <div style={{ display: "flex", alignItems: align, gap }}>
      {children}
    </div>
  );
}

// Usage
function ProfileCard({ user }) {
  return (
    <Stack gap={12}>
      <Row>
        <img src={user.avatar} alt={user.name} />
        <h2>{user.name}</h2>
      </Row>
      <p>{user.bio}</p>
    </Stack>
  );
}
```

`Stack` and `Row` know nothing about user data — they only manage layout.

---

## Containment vs. Specialization

React's composition covers two distinct scenarios:

| Pattern | Description | Example |
|---|---|---|
| **Containment** | Component doesn't know its children ahead of time | `Card`, `Modal`, `Layout` |
| **Specialization** | A specific version of a more generic component | `PrimaryButton` from `Button` |

Both use the same composition mechanism — props and children.

---

## Composition vs. Inheritance

React deliberately discourages class inheritance for component reuse. Composition achieves everything inheritance would, with fewer surprises.

```jsx
// ❌ Inheritance approach (avoid in React)
class FancyButton extends Button {
  render() {
    return super.render(); // tightly coupled, fragile
  }
}

// ✅ Composition approach
function FancyButton({ children, ...props }) {
  return (
    <Button className="fancy" {...props}>
      ✨ {children}
    </Button>
  );
}
```

Composition keeps components independent, testable, and replaceable.

---

## When Not to Over-Compose

Composition is powerful but can be misused. Watch for these signs:

- **Prop drilling through many layers** — consider Context instead
- **Too many slot props** — might indicate the component is trying to do too much
- **Wrapper components with no logic** — sometimes a direct render is clearer

Compose when it genuinely simplifies the code. Don't compose just to follow a pattern.

---

## Real-World Example — Modal with Slots

```jsx
function Modal({ title, footer, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// Usage
function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <Modal
      title="Confirm Delete"
      onClose={onCancel}
      footer={
        <>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} className="danger">Delete</button>
        </>
      }
    >
      <p>Are you sure you want to delete this item? This action cannot be undone.</p>
    </Modal>
  );
}
```

`Modal` defines the shell. `ConfirmDeleteModal` fills the slots. Each component has a single, clear responsibility.

---

## Summary

Component Composition is how React achieves reuse, flexibility, and separation of concerns. Use `children` for containment, named props for slots, and specialized wrappers for concrete variants. Prefer composition over inheritance in all cases — it produces smaller, more predictable, and more testable components.

---

_Next: [Higher-Order Components](./HOC.md) — wrap components to inject shared behavior without modifying the original._