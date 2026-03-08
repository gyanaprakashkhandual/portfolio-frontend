# useOptimistic

`useOptimistic` is a React 19 hook that lets you show an instant UI update while an async operation is still in progress. The user sees the expected result immediately — before the server confirms it — and React automatically reverts to the real state once the action completes or fails.

---

## Syntax

```js
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);
```

- `state` — the real, authoritative state. Used when no optimistic update is in progress.
- `updateFn` — a function `(currentState, optimisticValue) => newState` that produces the temporary optimistic state.
- `optimisticState` — the value to render. Reflects the optimistic update while the action is pending; returns to `state` once the action settles.
- `addOptimistic` — call this with the optimistic value to immediately apply the temporary update.

---

## Why It Exists

Network requests take time. Without optimistic updates, a user clicks "like" and waits for the server to respond before the UI changes. This creates a sluggish, unresponsive feeling.

With `useOptimistic`, the UI updates instantly when the user acts. If the server confirms the action, nothing changes — the real state catches up. If it fails, React rolls back to the previous state automatically.

---

## Basic Example — Like Button

```jsx
import { useOptimistic, useState } from "react";

async function toggleLikeOnServer(postId, liked) {
  const response = await fetch(`/api/posts/${postId}/like`, {
    method: liked ? "POST" : "DELETE",
  });
  if (!response.ok) throw new Error("Failed to update like");
  return response.json();
}

function LikeButton({ postId, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const [optimisticLiked, addOptimisticLike] = useOptimistic(
    liked,
    (currentLiked, nextLiked) => nextLiked,
  );

  const [optimisticCount, addOptimisticCount] = useOptimistic(
    count,
    (currentCount, delta) => currentCount + delta,
  );

  async function handleToggle() {
    const nextLiked = !liked;
    addOptimisticLike(nextLiked);
    addOptimisticCount(nextLiked ? 1 : -1);

    try {
      const data = await toggleLikeOnServer(postId, nextLiked);
      setLiked(data.liked);
      setCount(data.count);
    } catch {
      // useOptimistic automatically reverts on error
    }
  }

  return (
    <button onClick={handleToggle}>
      {optimisticLiked ? "Unlike" : "Like"} ({optimisticCount})
    </button>
  );
}
```

The button updates visually the moment the user clicks — no waiting for the network response.

---

## Common Pattern — Optimistic List Updates

```jsx
import { useOptimistic, useState, useRef } from "react";

async function addMessageToServer(text) {
  const response = await fetch("/api/messages", {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
}

function MessageThread({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const inputRef = useRef(null);

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (currentMessages, newMessage) => [
      ...currentMessages,
      { ...newMessage, sending: true },
    ],
  );

  async function handleSend() {
    const text = inputRef.current.value.trim();
    if (!text) return;

    inputRef.current.value = "";

    const tempMessage = { id: Date.now(), text };
    addOptimisticMessage(tempMessage);

    try {
      const saved = await addMessageToServer(text);
      setMessages((prev) => [...prev, saved]);
    } catch {
      // Optimistic message is automatically removed on failure
      // Optionally restore the input text
      inputRef.current.value = text;
    }
  }

  return (
    <div>
      <ul>
        {optimisticMessages.map((msg) => (
          <li key={msg.id} style={{ opacity: msg.sending ? 0.6 : 1 }}>
            {msg.text}
            {msg.sending && <span> (Sending...)</span>}
          </li>
        ))}
      </ul>
      <input ref={inputRef} type="text" placeholder="Type a message..." />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

The message appears immediately with a "Sending..." label and reduced opacity. Once confirmed by the server, the real message replaces it seamlessly.

---

## Using with useActionState

`useOptimistic` pairs naturally with `useActionState` for form-driven optimistic updates.

```jsx
import { useActionState, useOptimistic } from "react";
import { useFormStatus } from "react-dom";

async function addTodoAction(prevState, formData) {
  const text = formData.get("text");
  const newTodo = await createTodoOnServer(text);
  return { todos: [...prevState.todos, newTodo] };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add Todo"}
    </button>
  );
}

function TodoApp() {
  const [state, formAction] = useActionState(addTodoAction, { todos: [] });

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    state.todos,
    (current, newText) => [
      ...current,
      { id: Date.now(), text: newText, pending: true },
    ],
  );

  return (
    <form
      action={async (formData) => {
        addOptimisticTodo(formData.get("text"));
        await formAction(formData);
      }}
    >
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
      <input name="text" type="text" required />
      <SubmitButton />
    </form>
  );
}
```

---

## How the Revert Works

React's automatic revert behavior is tied to the async action's lifecycle:

1. `addOptimistic(value)` is called — `optimisticState` immediately reflects the update.
2. The async action runs — the UI shows the optimistic state.
   3a. Action succeeds — `state` updates with the real data. `optimisticState` transitions to the new `state`.
   3b. Action fails — React reverts `optimisticState` back to the last known `state`. The temporary update disappears.

You do not need to write any revert logic yourself. React handles it.

---

## Showing Pending Feedback

Use a flag on the optimistic item to distinguish temporary from confirmed data:

```jsx
const [optimisticItems, addOptimistic] = useOptimistic(
  items,
  (current, newItem) => [
    ...current,
    { ...newItem, status: "pending" }, // mark as pending
  ],
);

// In the render
{
  optimisticItems.map((item) => (
    <div
      key={item.id}
      className={item.status === "pending" ? "item--pending" : "item"}
    >
      {item.text}
    </div>
  ));
}
```

---

## Common Mistakes

```jsx
// Calling addOptimistic outside a transition or async action
// — optimistic state will not automatically revert
function handleClick() {
  addOptimistic(newValue); // works, but you must manage revert manually
  // wrap in startTransition or use with useActionState for auto-revert
}

// Not handling the error case — user is left without feedback
try {
  await serverAction();
} catch {
  // do nothing — optimistic state reverts but user has no explanation
}
// Always inform the user when an action fails

// Using optimisticState as the source of truth for server submissions
// optimisticState is for display only — always use real state for business logic
```

---

## When to Use useOptimistic

Use it for interactions where:

- The expected outcome is almost always success (liking a post, sending a message, adding an item).
- The network latency would make the UI feel sluggish without instant feedback.
- A brief visual revert on failure is acceptable and clearly communicated.

Avoid it when:

- The server response is unpredictable and may differ significantly from the assumed outcome.
- The failure case has high impact — for example, a payment submission where showing success prematurely would confuse the user.

---

## Summary

`useOptimistic` makes React applications feel faster and more responsive by removing the perceived cost of network latency. The user's action is reflected immediately in the UI, the server confirms or rejects it asynchronously, and React handles the revert automatically on failure. Use it with `useActionState` and `useFormStatus` to build a complete, modern async form and interaction pattern in React 19.

---

_Hooks documentation complete. Next section: [Component Patterns](../patterns/Composition.md)._
