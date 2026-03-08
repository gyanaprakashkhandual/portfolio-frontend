# Forms and Controlled Components

Forms in React work differently from plain HTML forms. In HTML, form elements maintain their own internal state. In React, you typically manage form state yourself using `useState` — making React the single source of truth for every input's value. This is called a controlled component.

---

## Controlled vs. Uncontrolled Components

An **uncontrolled component** lets the DOM manage its own state. You read the value only when needed, typically via a `ref`.

A **controlled component** has its value driven by React state. Every keystroke updates the state, and the state feeds back into the input.

```jsx
// Uncontrolled — DOM owns the value
function UncontrolledInput() {
  const ref = useRef(null);

  function handleSubmit() {
    console.log(ref.current.value); // read on demand
  }

  return <input ref={ref} defaultValue="initial" />;
}

// Controlled — React owns the value
function ControlledInput() {
  const [value, setValue] = useState("");

  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

Controlled components are the React-idiomatic approach. They let you validate, transform, or react to input as the user types.

---

## Basic Controlled Form

```jsx
import { useState } from "react";

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ name, email, message });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button type="submit">Send Message</button>
    </form>
  );
}
```

`e.preventDefault()` stops the browser from reloading the page on submit.

---

## Managing Multiple Inputs with a Single State Object

When a form has many fields, group them into a single state object and use the input's `name` attribute to update the right field.

```jsx
function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    registerUser(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
      />
      <input
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <button type="submit">Register</button>
    </form>
  );
}
```

The computed property `[name]` dynamically targets the correct field using the input's `name` attribute. A single `handleChange` function handles all inputs.

---

## Checkboxes

Checkboxes use the `checked` prop instead of `value`, and read `e.target.checked` in the handler.

```jsx
function PreferencesForm() {
  const [preferences, setPreferences] = useState({
    newsletter: false,
    smsAlerts: false,
    darkMode: true,
  });

  function handleCheckboxChange(e) {
    const { name, checked } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: checked }));
  }

  return (
    <form>
      <label>
        <input
          type="checkbox"
          name="newsletter"
          checked={preferences.newsletter}
          onChange={handleCheckboxChange}
        />
        Subscribe to newsletter
      </label>

      <label>
        <input
          type="checkbox"
          name="smsAlerts"
          checked={preferences.smsAlerts}
          onChange={handleCheckboxChange}
        />
        Receive SMS alerts
      </label>

      <label>
        <input
          type="checkbox"
          name="darkMode"
          checked={preferences.darkMode}
          onChange={handleCheckboxChange}
        />
        Dark mode
      </label>
    </form>
  );
}
```

---

## Radio Buttons

Radio buttons use the `value` and `checked` props. Only the button whose value matches the selected state should have `checked={true}`.

```jsx
function ShippingForm() {
  const [shipping, setShipping] = useState("standard");

  return (
    <fieldset>
      <legend>Shipping Method</legend>

      <label>
        <input
          type="radio"
          name="shipping"
          value="standard"
          checked={shipping === "standard"}
          onChange={(e) => setShipping(e.target.value)}
        />
        Standard (5-7 days) — Free
      </label>

      <label>
        <input
          type="radio"
          name="shipping"
          value="express"
          checked={shipping === "express"}
          onChange={(e) => setShipping(e.target.value)}
        />
        Express (2-3 days) — $9.99
      </label>

      <label>
        <input
          type="radio"
          name="shipping"
          value="overnight"
          checked={shipping === "overnight"}
          onChange={(e) => setShipping(e.target.value)}
        />
        Overnight — $24.99
      </label>
    </fieldset>
  );
}
```

---

## Select Dropdowns

The `<select>` element uses `value` on the `<select>` itself, not on the individual `<option>` elements.

```jsx
function CountrySelect() {
  const [country, setCountry] = useState("us");

  return (
    <div>
      <label htmlFor="country">Country</label>
      <select
        id="country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
        <option value="ca">Canada</option>
        <option value="au">Australia</option>
      </select>
      <p>Selected: {country}</p>
    </div>
  );
}
```

For a multi-select, use `multiple` on the `<select>` and manage the value as an array.

---

## Form Validation

Validate on change, on blur, or on submit depending on how immediate the feedback should be.

```jsx
function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function validate(fields) {
    const newErrors = {};

    if (!fields.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(fields.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!fields.password) {
      newErrors.password = "Password is required.";
    } else if (fields.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    return newErrors;
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate({ email, password }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate({ email, password });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ email: true, password: true });
      return;
    }

    signIn({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleBlur}
        />
        {touched.email && errors.email && (
          <p className="error">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={handleBlur}
        />
        {touched.password && errors.password && (
          <p className="error">{errors.password}</p>
        )}
      </div>

      <button type="submit">Sign In</button>
    </form>
  );
}
```

Show errors only after a field has been touched (`onBlur`) to avoid showing errors before the user has had a chance to fill in the form.

---

## Resetting a Form

Reset controlled form state by setting all values back to their initial state.

```jsx
function FeedbackForm() {
  const initialState = { name: "", rating: "5", comment: "" };
  const [form, setForm] = useState(initialState);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitFeedback(form);
    setForm(initialState); // reset after submission
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Your name"
      />
      <select name="rating" value={form.rating} onChange={handleChange}>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} stars
          </option>
        ))}
      </select>
      <textarea name="comment" value={form.comment} onChange={handleChange} />
      <button type="submit">Submit</button>
      <button type="button" onClick={() => setForm(initialState)}>
        Reset
      </button>
    </form>
  );
}
```

---

## Uncontrolled Forms with FormData

For simple forms where you only need values on submit, uncontrolled forms with the native `FormData` API can be lighter than managing state for every field.

```jsx
function SimpleContactForm() {
  function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.target);

    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
    };

    sendMessage(payload);
    e.target.reset(); // resets the form using native browser reset
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <button type="submit">Send</button>
    </form>
  );
}
```

This approach works well for straightforward forms without real-time validation. For complex validation, conditional fields, or computed values, controlled components give you more control.

---

## Common Mistakes

```jsx
// Forgetting defaultValue vs value
// value makes it controlled — must pair with onChange
<input value="hello" />                  // controlled but read-only — no onChange
<input value={val} onChange={handler} /> // correct controlled input

// defaultValue sets initial value for uncontrolled inputs — not controlled
<input defaultValue="hello" />           // uncontrolled — DOM manages the value

// Forgetting e.preventDefault on form submit
<form onSubmit={handleSubmit}>           // page reloads unless preventDefault is called

// Reading e.target.checked for text inputs
function handleChange(e) {
  setValue(e.target.checked);  // wrong for text inputs — use e.target.value
  setValue(e.target.value);    // correct for text, email, password, select, textarea
}

// Using e.target.value for checkboxes
setValue(e.target.value);      // wrong for checkboxes — use e.target.checked
setValue(e.target.checked);    // correct for checkboxes
```

---

## Summary

Controlled components let React manage form state — every input's value is driven by state and updated via `onChange`. Use a single state object with a computed property handler when managing many fields. Checkboxes use `checked` and `e.target.checked`. Selects use `value` on the `<select>` element. Validate on blur for field-level feedback and on submit for final validation. For simple forms that only need values at submission time, the native `FormData` API with uncontrolled inputs is a lighter alternative.

---

_Next: [useState](../hooks/UseState.md) — managing local component state with the most fundamental React hook._
