# useFormStatus

`useFormStatus` is a React 19 hook that gives any component inside a `<form>` access to that form's submission status. It eliminates the need to pass `isPending` down as a prop through intermediate components — a submit button deep in a component tree can read the form's pending state directly.

---

## Syntax

```js
const { pending, data, method, action } = useFormStatus();
```

- `pending` — `true` while the parent form's action is executing. The most commonly used field.
- `data` — a `FormData` object representing what was submitted. `null` if no submission is in progress.
- `method` — the HTTP method of the form (`"get"` or `"post"`).
- `action` — a reference to the function passed to the form's `action` prop.

---

## Critical Rule — Must Be Inside a Form

`useFormStatus` reads the status of the nearest parent `<form>`. It must be called from inside a component that is rendered as a **child** of the form — not inside the form's own component.

```jsx
// Wrong — called in the same component as the form
function MyForm() {
  const { pending } = useFormStatus(); // will not work — no parent form
  return <form>...</form>;
}

// Correct — called from a child component inside the form
function SubmitButton() {
  const { pending } = useFormStatus(); // works — has a parent form
  return (
    <button type="submit" disabled={pending}>
      Submit
    </button>
  );
}

function MyForm() {
  return (
    <form action={formAction}>
      <SubmitButton />
    </form>
  );
}
```

---

## Basic Usage — Reusable Submit Button

The most common use case is a self-contained submit button that handles its own pending state without receiving props.

```jsx
import { useFormStatus } from "react-dom";

function SubmitButton({ label = "Submit", pendingLabel = "Submitting..." }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
```

Now any form that includes `<SubmitButton />` gets proper pending behavior automatically.

---

## Full Form Example

```jsx
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Logging in..." : "Log In"}
    </button>
  );
}

function FormFields() {
  const { pending } = useFormStatus();

  return (
    <>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" disabled={pending} required />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        disabled={pending}
        required
      />
    </>
  );
}

async function loginAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await authenticate(email, password);
    return { error: null };
  } catch {
    return { error: "Invalid email or password." };
  }
}

function LoginForm() {
  const [state, formAction] = useActionState(loginAction, { error: null });

  return (
    <form action={formAction}>
      {state.error && <p className="error">{state.error}</p>}
      <FormFields />
      <SubmitButton />
    </form>
  );
}
```

`LoginForm` has no knowledge of `pending` — the child components handle it entirely on their own.

---

## Reading Submitted Data

The `data` property gives you access to the `FormData` that was submitted while the action is pending. This is useful for showing optimistic previews or displaying what is being processed.

```jsx
function SubmittingIndicator() {
  const { pending, data } = useFormStatus();

  if (!pending || !data) return null;

  const username = data.get("username");

  return <p>Creating account for {username}...</p>;
}

function SignUpForm() {
  return (
    <form action={signUpAction}>
      <input name="username" type="text" placeholder="Choose a username" />
      <SubmittingIndicator />
      <button type="submit">Create Account</button>
    </form>
  );
}
```

---

## Building a Form Loading Overlay

```jsx
import { useFormStatus } from "react-dom";

function FormOverlay() {
  const { pending } = useFormStatus();

  if (!pending) return null;

  return (
    <div className="form-overlay">
      <div className="spinner" />
      <p>Processing your request...</p>
    </div>
  );
}

function CheckoutForm() {
  return (
    <form action={checkoutAction} style={{ position: "relative" }}>
      <FormOverlay />
      <input name="card" placeholder="Card number" />
      <input name="expiry" placeholder="MM/YY" />
      <input name="cvv" placeholder="CVV" />
      <button type="submit">Pay Now</button>
    </form>
  );
}
```

---

## Import Path

Note that `useFormStatus` is imported from `react-dom`, not from `react`:

```js
// Correct
import { useFormStatus } from "react-dom";

// Wrong
import { useFormStatus } from "react";
```

This is because form status is tied to the DOM's concept of form submission, making it a DOM-specific API.

---

## useFormStatus vs useActionState isPending

Both provide a pending state, but they serve different roles:

|          | `useFormStatus`                             | `useActionState`                     |
| -------- | ------------------------------------------- | ------------------------------------ |
| Location | Child component inside the form             | The component that owns the form     |
| Provides | `pending`, `data`, `method`, `action`       | `state`, `formAction`, `isPending`   |
| Use for  | Reusable child components (buttons, inputs) | Form-level state and result handling |

Use them together — `useActionState` at the form level for state management, `useFormStatus` in child components for local pending awareness.

---

## Common Mistakes

```jsx
// Calling useFormStatus in the form component itself — not a child of any form
function ContactForm() {
  const { pending } = useFormStatus(); // wrong — returns pending: false always
  return <form action={action}>...</form>;
}

// Correct — extract to a child component
function SubmitButton() {
  const { pending } = useFormStatus(); // correct
  return <button disabled={pending}>Send</button>;
}

// Wrong import path
import { useFormStatus } from "react"; // throws — not available from 'react'

// Correct
import { useFormStatus } from "react-dom";
```

---

## Summary

`useFormStatus` is a small but powerful hook for building reusable form components that are aware of their parent form's state. It is the clean solution to passing `isPending` down through props — your submit buttons, loading indicators, and field components can self-manage their disabled/loading state without any coupling to the parent. Import it from `react-dom`, use it only in child components of a form, and pair it with `useActionState` for a complete form management solution.

---

_Next: [useOptimistic](./UseOptimistic.md) — show instant UI updates while an async action completes in the background._
