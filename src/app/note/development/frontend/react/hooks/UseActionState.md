# useActionState

`useActionState` is a React 19 hook that manages state driven by async actions — most commonly form submissions. It wires together an async function (the action), the state it produces, and a pending indicator into a single, ergonomic API. It integrates directly with HTML `<form>` actions and works seamlessly with Server Actions.

---

## Syntax

```js
const [state, formAction, isPending] = useActionState(action, initialState);
```

- `action` — an async function `(currentState, formData) => newState`. Receives the current state and the submitted form data.
- `initialState` — the starting value of `state` before the first action runs.
- `state` — the current value returned by the last completed action, or `initialState` if no action has run yet.
- `formAction` — pass this to a `<form>`'s `action` prop or a `<button>`'s `formAction` prop to wire up the action.
- `isPending` — `true` while the action is executing. Use it to disable inputs or show a loading indicator.

---

## Basic Example — Contact Form

```jsx
import { useActionState } from "react";

async function submitContactForm(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  try {
    await sendEmail({ name, email, message });
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: "Failed to send message. Please try again.",
    };
  }
}

function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, {
    success: false,
    error: null,
  });

  if (state.success) {
    return <p>Your message has been sent successfully.</p>;
  }

  return (
    <form action={formAction}>
      {state.error && <p className="error">{state.error}</p>}

      <label htmlFor="name">Name</label>
      <input id="name" name="name" type="text" required />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" required />

      <button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
```

---

## Form Validation with State

The action receives the previous state, which lets you accumulate state across submissions — including field-level validation errors.

```jsx
async function signUpAction(prevState, formData) {
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  const errors = {};

  if (!username || username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  await createUser({ username, email, password });
  return { errors: {}, success: true };
}

function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    errors: {},
    success: false,
  });

  if (state.success) {
    return <p>Account created. Welcome aboard!</p>;
  }

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" />
        {state.errors.username && (
          <p className="field-error">{state.errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        {state.errors.email && (
          <p className="field-error">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
        {state.errors.password && (
          <p className="field-error">{state.errors.password}</p>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
```

---

## Using with Server Actions

`useActionState` is designed to pair naturally with React Server Actions. The action function can be defined in a server file and imported directly.

```js
// actions.js (server)
"use server";

export async function updateProfile(prevState, formData) {
  const name = formData.get("name");
  const bio = formData.get("bio");

  try {
    await db.user.update({
      where: { id: session.userId },
      data: { name, bio },
    });
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Profile update failed." };
  }
}
```

```jsx
// ProfileForm.jsx (client)
"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

function ProfileForm({ user }) {
  const [state, formAction, isPending] = useActionState(updateProfile, {
    success: false,
    error: null,
  });

  return (
    <form action={formAction}>
      {state.success && <p>Profile updated successfully.</p>}
      {state.error && <p className="error">{state.error}</p>}

      <input name="name" defaultValue={user.name} />
      <textarea name="bio" defaultValue={user.bio} />

      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
```

---

## Action Receives Previous State

The action's first argument is always the previous state. This allows you to build on previous results — accumulating errors, merging partial updates, or implementing multi-step flows.

```jsx
async function multiStepAction(prevState, formData) {
  const step = formData.get("step");

  if (step === "1") {
    return {
      ...prevState,
      step: 2,
      name: formData.get("name"),
    };
  }

  if (step === "2") {
    await finalizeOnboarding({ ...prevState, plan: formData.get("plan") });
    return { ...prevState, step: 3, complete: true };
  }
}
```

---

## isPending — Disabling Inputs During Submission

While the action is running, `isPending` is `true`. Use it to give the user clear feedback and prevent duplicate submissions.

```jsx
<form action={formAction}>
  <input name="email" disabled={isPending} />
  <input name="password" type="password" disabled={isPending} />
  <button type="submit" disabled={isPending}>
    {isPending ? "Logging in..." : "Log In"}
  </button>
</form>
```

---

## useActionState vs useState + useEffect

Before `useActionState`, handling form submissions required wiring up multiple pieces manually:

```jsx
// Old approach — manual wiring
const [state, setState] = useState({ error: null, success: false })
const [isPending, setIsPending] = useState(false)

async function handleSubmit(e) {
  e.preventDefault()
  setIsPending(true)
  try {
    await submitForm(new FormData(e.target))
    setState({ error: null, success: true })
  } catch (err) {
    setState({ error: err.message, success: false })
  } finally {
    setIsPending(false)
  }
}

<form onSubmit={handleSubmit}>
```

`useActionState` replaces this pattern with a clean, composable API that also supports progressive enhancement — the form works even before JavaScript loads when used with Server Actions.

---

## Common Mistakes

```jsx
// Forgetting that action receives prevState as first argument
async function action(formData) { // wrong — missing prevState
  const value = formData.get('name')
}

// Correct
async function action(prevState, formData) {
  const value = formData.get('name')
}

// Using e.preventDefault() — not needed when passing action to form's action prop
<form action={formAction} onSubmit={(e) => e.preventDefault()}> // unnecessary

// Not returning state from the action — state becomes undefined
async function action(prevState, formData) {
  await doSomething()
  // forgot to return new state
}

// Always return the new state
async function action(prevState, formData) {
  await doSomething()
  return { success: true }
}
```

---

## Summary

`useActionState` is React 19's answer to the form-handling boilerplate that developers have been writing for years. It cleanly unifies async action execution, pending state, and state transitions into one hook. Use it for form submissions, server mutations, and any async user action that produces a result state. Pair it with Server Actions for a fully progressive, server-friendly form experience.

---

_Next: [useFormStatus](./UseFormStatus.md) — read the submission status of a parent form from inside any child component._
