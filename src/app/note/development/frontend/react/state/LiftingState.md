# Lifting State Up

Lifting state up is the practice of moving shared state to the closest common ancestor of the components that need it. When two or more sibling components need to share or synchronize data, the state belongs in their parent — not in either child. This is one of the most fundamental patterns in React.

---

## The Core Idea

React data flows in one direction — from parent to child via props. When two components need to share the same piece of state, the solution is to move that state upward to a common parent and pass it down as props.

```
         Parent (owns state)
        /                   \
   ChildA (reads state)   ChildB (reads state)
```

The parent holds the truth. Both children receive what they need as props.

---

## The Problem Without Lifting

Two sibling components each managing their own state cannot stay in sync.

```jsx
// Each input manages its own state — they can never know about each other
function CelsiusInput() {
  const [celsius, setCelsius] = useState(0);
  return <input value={celsius} onChange={(e) => setCelsius(e.target.value)} />;
}

function FahrenheitInput() {
  const [fahrenheit, setFahrenheit] = useState(32);
  return (
    <input value={fahrenheit} onChange={(e) => setFahrenheit(e.target.value)} />
  );
}
```

There is no way for `CelsiusInput` to update `FahrenheitInput` or vice versa.

---

## Solution — Lift the State

Move the shared state into the parent. Both children become controlled components — they receive values and callbacks via props.

```jsx
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0);

  const fahrenheit = (celsius * 9) / 5 + 32;

  function handleCelsiusChange(e) {
    setCelsius(Number(e.target.value));
  }

  function handleFahrenheitChange(e) {
    setCelsius(((Number(e.target.value) - 32) * 5) / 9);
  }

  return (
    <div>
      <label>
        Celsius:
        <input value={celsius} onChange={handleCelsiusChange} type="number" />
      </label>
      <label>
        Fahrenheit:
        <input
          value={fahrenheit}
          onChange={handleFahrenheitChange}
          type="number"
        />
      </label>
    </div>
  );
}
```

There is now a single source of truth — `celsius`. Fahrenheit is derived from it. Both inputs stay synchronized automatically.

---

## Controlled vs. Uncontrolled Children

When state is lifted, child components become controlled — they receive their value via props and report changes via callbacks. They own no state themselves.

```jsx
// Controlled child — no local state
function TemperatureInput({ scale, value, onChange }) {
  return (
    <fieldset>
      <legend>Enter temperature in {scale}:</legend>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="number"
      />
    </fieldset>
  );
}

// Parent owns the state
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0);
  const fahrenheit = (celsius * 9) / 5 + 32;

  return (
    <div>
      <TemperatureInput
        scale="Celsius"
        value={celsius}
        onChange={(val) => setCelsius(Number(val))}
      />
      <TemperatureInput
        scale="Fahrenheit"
        value={fahrenheit}
        onChange={(val) => setCelsius(((Number(val) - 32) * 5) / 9)}
      />
    </div>
  );
}
```

`TemperatureInput` is now generic and reusable — it works for any scale because the parent controls the logic.

---

## Lifting State in Lists

A common scenario: selecting an item from a list where multiple sibling components need to know the selection.

```jsx
function ProductList({ products, selectedId, onSelect }) {
  return (
    <ul>
      {products.map((product) => (
        <li
          key={product.id}
          style={{ fontWeight: selectedId === product.id ? "bold" : "normal" }}
          onClick={() => onSelect(product.id)}
        >
          {product.name}
        </li>
      ))}
    </ul>
  );
}

function ProductDetail({ product }) {
  if (!product) return <p>Select a product to view details.</p>;
  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
    </div>
  );
}

// Parent owns the selected state — both children stay in sync
function ProductPage() {
  const [selectedId, setSelectedId] = useState(null);
  const products = useProducts();

  const selectedProduct = products.find((p) => p.id === selectedId) ?? null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
      <ProductList
        products={products}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <ProductDetail product={selectedProduct} />
    </div>
  );
}
```

---

## Lifting State for Form Coordination

When multiple form sections need to contribute to a single submission, lift the form state to the parent.

```jsx
function PersonalInfo({ values, onChange }) {
  return (
    <>
      <input
        name="name"
        value={values.name}
        onChange={onChange}
        placeholder="Full Name"
      />
      <input
        name="email"
        value={values.email}
        onChange={onChange}
        placeholder="Email"
      />
    </>
  );
}

function AddressInfo({ values, onChange }) {
  return (
    <>
      <input
        name="street"
        value={values.street}
        onChange={onChange}
        placeholder="Street"
      />
      <input
        name="city"
        value={values.city}
        onChange={onChange}
        placeholder="City"
      />
    </>
  );
}

function CheckoutForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitOrder(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <PersonalInfo values={formData} onChange={handleChange} />
      <AddressInfo values={formData} onChange={handleChange} />
      <button type="submit">Place Order</button>
    </form>
  );
}
```

`CheckoutForm` owns all form data. Both sections read from and write to the same object via `handleChange`.

---

## How Far to Lift

Lift state to the **lowest common ancestor** that contains all components needing that state. Do not lift higher than necessary.

```
App
 ├── Header               (does not need cart count)
 ├── ProductCatalog       (needs to add to cart)
 │    └── ProductCard     (needs to add to cart)
 └── CartSidebar          (needs to show cart items)
```

In this example, `App` is the lowest common ancestor of `ProductCatalog` and `CartSidebar`, so cart state lives in `App`. `Header` does not need it, so there is no reason to lift higher than `App`.

---

## When Lifting Becomes Painful

Lifting state works well for shallow trees. As the component tree grows deeper and more components need the same state, you will encounter:

- Prop drilling — passing props through many intermediate layers that do not use the data
- Verbose components — intermediate components accumulate props they never use themselves
- Harder refactoring — moving components requires updating the prop chain

When these problems appear, the next step is the Context API for sharing state without passing props manually at every level, or a dedicated state management library for complex global state.

---

## Summary

Lifting state up is the correct response whenever two sibling components need to share or synchronize data. Move state to their lowest common ancestor, make children controlled by passing values and onChange callbacks as props, and derive any computed values from the single source of truth. Lift only as high as necessary, and reach for Context or a state management library when prop drilling becomes a problem.

---

_Next: [Context API](./ContextAPI.md) — share state across a component tree without passing props at every level._
