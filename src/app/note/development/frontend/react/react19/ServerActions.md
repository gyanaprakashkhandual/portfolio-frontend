# Server Actions

Server Actions are async functions that run exclusively on the server but can be called directly from Client Components and HTML forms. They handle mutations — creating, updating, and deleting data — without writing API routes. React 19 makes Server Actions a first-class primitive, enabling the full request-response cycle to live in component files.

---

## What Server Actions Replace

Before Server Actions, a form submission or button click that needed to modify server data required:

1. An API route (e.g. `POST /api/users`)
2. A `fetch` call from the client
3. Loading and error state management
4. Revalidation of cached data

Server Actions collapse all of this into a single async function marked with `"use server"`.

---

## The `"use server"` Directive

Add `"use server"` at the top of an async function to mark it as a Server Action. It can only be called, never executed directly on the client — React serializes the call and sends it to the server.

```jsx
// Inline Server Action — defined inside a Server Component
async function ServerPage() {
  async function createPost(formData) {
    "use server";

    const title = formData.get("title");
    const body = formData.get("body");

    await db.posts.create({ data: { title, body } });
  }

  return (
    <form action={createPost}>
      <input name="title" placeholder="Post title" required />
      <textarea name="body" placeholder="Post body" required />
      <button type="submit">Publish</button>
    </form>
  );
}
```

The `"use server"` directive inside the function body makes it a Server Action. When the form submits, `createPost` runs on the server — not in the browser.

---

## Server Actions in Dedicated Files

For reuse across multiple components, define Server Actions in a separate file with `"use server"` at the top of the file. This marks every exported function in the file as a Server Action.

```jsx
// actions/posts.js
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function createPost(formData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const title = formData.get("title");
  const body = formData.get("body");

  if (!title || !body) {
    return { error: "Title and body are required." };
  }

  await db.posts.create({
    data: {
      title,
      body,
      authorId: session.user.id,
    },
  });

  revalidatePath("/posts");
  redirect("/posts");
}

export async function deletePost(postId) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const post = await db.posts.findUnique({ where: { id: postId } });
  if (post.authorId !== session.user.id) throw new Error("Forbidden");

  await db.posts.delete({ where: { id: postId } });
  revalidatePath("/posts");
}

export async function updatePost(postId, formData) {
  const title = formData.get("title");
  const body = formData.get("body");

  await db.posts.update({
    where: { id: postId },
    data: { title, body },
  });

  revalidatePath(`/posts/${postId}`);
}
```

---

## Using Server Actions in Forms

Pass a Server Action to the `action` prop of a `<form>`. React intercepts the submission and calls the action with the form's `FormData`.

```jsx
// app/posts/new/page.jsx — Server Component
import { createPost } from "@/actions/posts";

export default function NewPostPage() {
  return (
    <div>
      <h1>New Post</h1>
      <form action={createPost}>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" required />
        </div>
        <div>
          <label htmlFor="body">Content</label>
          <textarea id="body" name="body" required />
        </div>
        <button type="submit">Publish Post</button>
      </form>
    </div>
  );
}
```

No `onSubmit`, no `fetch`, no state for loading. The form submits, `createPost` runs on the server, and Next.js handles revalidation and redirect.

---

## Server Actions with useActionState

`useActionState` (React 19) connects a Server Action to form state — tracking the action's result and pending status across submissions. This is the standard pattern for forms with validation feedback.

```jsx
"use client";

import { useActionState } from "react";
import { createPost } from "@/actions/posts";

const initialState = { error: null, success: false };

export default function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(
    createPost,
    initialState,
  );

  return (
    <form action={formAction}>
      {state.error && <div className="error-banner">{state.error}</div>}
      {state.success && (
        <div className="success-banner">Post published successfully.</div>
      )}

      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" required />
      </div>

      <div>
        <label htmlFor="body">Content</label>
        <textarea id="body" name="body" required />
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "Publishing..." : "Publish Post"}
      </button>
    </form>
  );
}
```

The Server Action must return the state object:

```jsx
// actions/posts.js
"use server";

export async function createPost(prevState, formData) {
  const title = formData.get("title");
  const body = formData.get("body");

  if (!title) return { error: "Title is required.", success: false };
  if (!body) return { error: "Body is required.", success: false };

  try {
    await db.posts.create({ data: { title, body } });
    revalidatePath("/posts");
    return { error: null, success: true };
  } catch {
    return {
      error: "Failed to create post. Please try again.",
      success: false,
    };
  }
}
```

---

## Calling Server Actions from Event Handlers

Server Actions are not limited to forms. Call them directly from `onClick` or any other event handler in a Client Component.

```jsx
"use client";

import { deletePost } from "@/actions/posts";
import { useTransition } from "react";

function DeleteButton({ postId }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this post?")) return;

    startTransition(async () => {
      await deletePost(postId);
    });
  }

  return (
    <button onClick={handleDelete} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete Post"}
    </button>
  );
}
```

`useTransition` marks the async action as non-urgent, keeping the UI responsive while the server call completes.

---

## Server Actions with useOptimistic

Combine Server Actions with `useOptimistic` to update the UI instantly before the server responds, then confirm or roll back based on the result.

```jsx
"use client";

import { useOptimistic, useTransition } from "react";
import { toggleLike } from "@/actions/posts";

function LikeButton({ postId, initialLikes, initialLiked }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimistic] = useOptimistic({
    likes: initialLikes,
    liked: initialLiked,
  });

  function handleToggle() {
    startTransition(async () => {
      // Update UI immediately
      setOptimistic((prev) => ({
        likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
        liked: !prev.liked,
      }));

      // Sync with server
      await toggleLike(postId);
    });
  }

  return (
    <button onClick={handleToggle} disabled={isPending}>
      {optimisticState.liked ? "Unlike" : "Like"} ({optimisticState.likes})
    </button>
  );
}
```

---

## Passing Additional Arguments

Use `.bind()` to pre-fill arguments before passing a Server Action to a form or event handler.

```jsx
// actions/posts.js
"use server";

export async function updatePost(postId, formData) {
  const title = formData.get("title");
  await db.posts.update({ where: { id: postId }, data: { title } });
  revalidatePath(`/posts/${postId}`);
}
```

```jsx
// EditPostForm.jsx — Server Component
import { updatePost } from "@/actions/posts";

async function EditPostForm({ post }) {
  // Bind postId as the first argument — form submission provides formData
  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <form action={updatePostWithId}>
      <input name="title" defaultValue={post.title} />
      <button type="submit">Save Changes</button>
    </form>
  );
}
```

---

## Error Handling

Server Actions should return structured error responses for expected failures. For unexpected failures, use `try/catch` and return a generic error message — never expose internal error details to the client.

```jsx
"use server";

export async function registerUser(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validation — expected failure
  if (!email || !password) {
    return { error: "All fields are required.", field: "email" };
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return { error: "Enter a valid email address.", field: "email" };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      field: "password",
    };
  }

  try {
    const existingUser = await db.users.findUnique({ where: { email } });
    if (existingUser) {
      return {
        error: "An account with this email already exists.",
        field: "email",
      };
    }

    await db.users.create({
      data: { email, password: await hashPassword(password) },
    });
    return { error: null, success: true };
  } catch {
    // Unexpected failure — do not expose internals
    return { error: "Something went wrong. Please try again.", field: null };
  }
}
```

---

## Security Considerations

Server Actions run on the server with full access to your database and environment. Treat every input as untrusted.

```jsx
"use server";

export async function adminDeleteUser(userId) {
  // Always authenticate — never trust the caller
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Always authorize — verify the caller has permission
  if (session.user.role !== "admin") throw new Error("Forbidden");

  // Validate inputs — never trust userId from the client
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID");
  }

  await db.users.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
```

Every Server Action that modifies data should verify authentication and authorization. Never assume that because an action is "server-side" it is safe from misuse — Server Actions have public endpoints.

---

## Common Mistakes

```jsx
// Missing "use server" — the function runs on the client
async function createPost(formData) {
  // no "use server" — this is a regular client function
  await db.posts.create(...); // db is not available on the client
}

// Using a Server Action directly in useActionState without the prevState argument
export async function createPost(formData) { // wrong — missing prevState
  "use server";
}

// Correct — useActionState passes prevState as the first argument
export async function createPost(prevState, formData) {
  "use server";
}

// Exposing sensitive data in error messages
return { error: error.message }; // may expose DB schema, stack traces, internals
return { error: "Something went wrong. Please try again." }; // safe

// No authentication check inside a Server Action
export async function deleteUser(userId) {
  "use server";
  await db.users.delete({ where: { id: userId } }); // anyone can call this
}
```

---

## Summary

Server Actions are async server-side functions marked with `"use server"` that can be called directly from forms and Client Components. They replace API routes for mutations, run with full server access, and integrate cleanly with `useActionState` for form validation feedback, `useTransition` for non-blocking calls, and `useOptimistic` for instant UI updates. Always validate inputs, authenticate and authorize callers, return structured error objects for expected failures, and use `revalidatePath` or `redirect` to update the UI after a successful mutation.

---

_Next: [Asset Loading](./AssetLoading.md) — React 19's built-in support for preloading and managing scripts, styles, and fonts._
