# Compound Components

Compound Components is a pattern for building multi-part component APIs that feel like a single cohesive unit. The parent component manages shared state and the child components access it implicitly — no prop drilling required. The result is an expressive, declarative API that gives consumers fine-grained layout control.

---

## The Problem It Solves

Without compound components, a `Select` or `Tabs` component often ends up accepting a mountain of props:

```jsx
// ❌ Prop-heavy approach — rigid, hard to customize layout
<Select
  options={options}
  value={value}
  onChange={setValue}
  placeholder="Choose..."
  labelKey="name"
  valueKey="id"
  searchable
  clearable
/>
```

With compound components, the consumer composes the parts themselves:

```jsx
// ✅ Compound approach — flexible, readable, natural
<Select value={value} onChange={setValue}>
  <Select.Trigger placeholder="Choose..." />
  <Select.Options>
    {options.map((opt) => (
      <Select.Option key={opt.id} value={opt.id}>{opt.name}</Select.Option>
    ))}
  </Select.Options>
</Select>
```

---

## How It Works

The parent component creates a **shared context** and its child components read from it. Sub-components are attached as **static properties** of the parent, making their relationship explicit.

---

## Basic Example — Tabs

```jsx
import { createContext, useContext, useState } from "react";

const TabsContext = createContext(null);

function Tabs({ defaultTab, children }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list" role="tablist">{children}</div>;
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`tab ${isActive ? "tab--active" : ""}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className="tab-panel">
      {children}
    </div>
  );
}

// Attach sub-components as static properties
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
```

**Usage:**

```jsx
function App() {
  return (
    <Tabs defaultTab="profile">
      <Tabs.List>
        <Tabs.Tab value="profile">Profile</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="profile">
        <ProfileContent />
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <SettingsContent />
      </Tabs.Panel>
      <Tabs.Panel value="billing">
        <BillingContent />
      </Tabs.Panel>
    </Tabs>
  );
}
```

`Tabs` manages state. The consumer controls layout and composition freely.

---

## Accordion Example

```jsx
const AccordionContext = createContext(null);

function Accordion({ children }) {
  const [openItem, setOpenItem] = useState(null);

  function toggle(id) {
    setOpenItem((prev) => (prev === id ? null : id));
  }

  return (
    <AccordionContext.Provider value={{ openItem, toggle }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, children }) {
  return <div className="accordion-item">{children}</div>;
}

function AccordionTrigger({ id, children }) {
  const { openItem, toggle } = useContext(AccordionContext);
  const isOpen = openItem === id;

  return (
    <button
      className="accordion-trigger"
      aria-expanded={isOpen}
      onClick={() => toggle(id)}
    >
      {children}
      <span>{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}

function AccordionContent({ id, children }) {
  const { openItem } = useContext(AccordionContext);

  if (openItem !== id) return null;

  return <div className="accordion-content">{children}</div>;
}

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
```

**Usage:**

```jsx
function FAQ() {
  return (
    <Accordion>
      <Accordion.Item id="q1">
        <Accordion.Trigger id="q1">What is React?</Accordion.Trigger>
        <Accordion.Content id="q1">
          React is a JavaScript library for building user interfaces.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item id="q2">
        <Accordion.Trigger id="q2">What are hooks?</Accordion.Trigger>
        <Accordion.Content id="q2">
          Hooks let you use state and other React features in function components.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

---

## Guarding Against Misuse

Sub-components used outside the parent won't have access to the context. Add a guard to produce clear error messages.

```jsx
function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error(
      "Tabs sub-components must be used within a <Tabs> parent component."
    );
  }

  return context;
}

// Use inside each sub-component
function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useTabsContext(); // throws clearly if used wrong
  // ...
}
```

---

## Flexible vs. Controlled

Compound components can support both uncontrolled (internal state) and controlled (external state) modes.

```jsx
function Tabs({ value, defaultTab, onChange, children }) {
  const isControlled = value !== undefined;
  const [internalTab, setInternalTab] = useState(defaultTab);

  const activeTab = isControlled ? value : internalTab;

  function setActiveTab(tab) {
    if (!isControlled) setInternalTab(tab);
    onChange?.(tab);
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

// Uncontrolled
<Tabs defaultTab="profile">...</Tabs>

// Controlled
<Tabs value={activeTab} onChange={setActiveTab}>...</Tabs>
```

---

## Common Mistakes

```jsx
// ❌ Accessing context outside the parent
function StandaloneTab() {
  const { activeTab } = useContext(TabsContext); // undefined — no parent Tabs
  return <button>{activeTab}</button>;
}

// ✅ Always render sub-components inside the parent
<Tabs defaultTab="a">
  <Tabs.Tab value="a">Tab A</Tabs.Tab>
</Tabs>

// ❌ Using index or positional matching instead of context
// — fragile and breaks reordering

// ✅ Use IDs / values passed as props and matched via context
```

---

## When to Use Compound Components

Compound components are the right choice when:

- The component has **multiple visual parts** that must share state (tabs, modals, dropdowns, accordions)
- Consumers need **layout flexibility** — they want to arrange the parts themselves
- The API would otherwise require **many configuration props**
- You're building a **design system** or shared component library

Avoid the pattern for simple, single-responsibility components — the context overhead isn't worth it.

---

## Summary

Compound Components let you build rich, multi-part UIs with clean, expressive APIs. The parent owns state via Context; sub-components consume it implicitly. Attach sub-components as static properties, guard against out-of-context usage with helpful errors, and support both controlled and uncontrolled usage when needed. The result is a component that feels natural to use and gives consumers full layout freedom.

---

_Next: [Custom Hooks](./CustomHooks.md) — extract and reuse stateful logic as standalone hooks._