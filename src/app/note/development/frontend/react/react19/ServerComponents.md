# Server Components

React Server Components (RSC) are components that render exclusively on the server. They never ship their code to the browser, can directly access server-side resources like databases and file systems, and produce zero JavaScript overhead on the client. They are one of the most fundamental additions in React 19.

---

## The Core Idea

In traditional React, every component — regardless of whether it needs interactivity — ships its JavaScript to the browser, executes there, and hydrates. Server Components break this assumption. A Server Component runs only on the server, sends its rendered HTML output to the client, and contributes zero bytes to the JavaScript bundle.

```
Traditional React
  Server → HTML shell
  Browser → downloads JS → executes → hydrates → interactive

React Server Components
  Server → renders component → sends HTML + minimal JS
  Browser → displays content immediately, downloads only Client Component JS
```

---

## Server Components vs. Client Components

|                               | Server Component | Client Component                |
| ----------------------------- | ---------------- | ------------------------------- |
| Where it runs                 | Server only      | Browser (and server during SSR) |
| Bundle contribution           | Zero             | Included in JS bundle           |
| Can use hooks                 | No               | Yes                             |
| Can handle events             | No               | Yes                             |
| Can access DB / filesystem    | Yes              | No                              |
| Can use async/await directly  | Yes              | No (use useEffect)              |
| Default in Next.js App Router | Yes              | No — requires `"use client"`    |

---

## Default Behavior in Next.js

In the Next.js App Router (the primary framework for RSC today), every component is a Server Component by default. You opt into client-side behavior with `"use client"` at the top of the file.

```jsx
// app/page.jsx — Server Component by default
// No "use client" directive — runs only on the server

async function HomePage() {
  const featuredPosts = await db.posts.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <main>
      <h1>Latest Posts</h1>
      <PostGrid posts={featuredPosts} />
    </main>
  );
}

export default HomePage;
```

`HomePage` queries the database directly. No API route is needed. No data-fetching hook is needed. The database result never touches the client.

---

## Async Server Components

Server Components can be `async` functions. This is the most powerful aspect — you can `await` any server-side operation directly in the component body.

```jsx
// app/products/[id]/page.jsx
async function ProductPage({ params }) {
  const { id } = await params;

  // All of this runs on the server — never exposed to the client
  const [product, reviews, inventory] = await Promise.all([
    db.products.findUnique({ where: { id } }),
    db.reviews.findMany({ where: { productId: id }, take: 10 }),
    inventoryService.getStock(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="product-page">
      <ProductHeader product={product} />
      <InventoryStatus stock={inventory.stock} />
      <ProductReviews reviews={reviews} />
      <AddToCartButton productId={product.id} price={product.price} />
    </div>
  );
}

export default ProductPage;
```

Three parallel data fetches happen on the server in a single render. `AddToCartButton` requires interactivity, so it is a Client Component — but `ProductHeader`, `InventoryStatus`, and `ProductReviews` can all be Server Components that receive data as props.

---

## Client Components

Add `"use client"` at the top of any file to mark it and all components it imports as Client Components. Use Client Components for anything that requires interactivity, browser APIs, or React hooks.

```jsx
"use client";

import { useState } from "react";

function AddToCartButton({ productId, price }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAddToCart() {
    setLoading(true);
    await addToCart(productId);
    setAdded(true);
    setLoading(false);
  }

  return (
    <button onClick={handleAddToCart} disabled={loading}>
      {loading
        ? "Adding..."
        : added
          ? "Added to Cart"
          : `Add to Cart — $${price}`}
    </button>
  );
}

export default AddToCartButton;
```

`"use client"` is a boundary, not a per-component declaration. Everything imported into a `"use client"` file becomes part of the client bundle.

---

## Composing Server and Client Components

Server and Client Components compose together naturally. A Server Component can render a Client Component. A Client Component can receive Server Component output as `children`.

```jsx
// ServerLayout.jsx — Server Component
import ClientSidebar from "./ClientSidebar"; // Client Component
import ServerContent from "./ServerContent"; // Server Component

async function ServerLayout() {
  const user = await getUser();
  const navigation = await getNavigation();

  return (
    <div className="layout">
      {/* Client Component receives server-fetched data as props */}
      <ClientSidebar user={user} navigation={navigation} />

      {/* Server Component — renders on server, zero client JS */}
      <ServerContent />
    </div>
  );
}
```

```jsx
// ClientSidebar.jsx — Client Component
"use client";

import { useState } from "react";

function ClientSidebar({ user, navigation }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={isOpen ? "sidebar--open" : "sidebar--closed"}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      <p>Welcome, {user.name}</p>
      <nav>
        {navigation.map((item) => (
          <a key={item.id} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
```

---

## Passing Server Components as Children to Client Components

A Server Component cannot be imported into a Client Component — that would pull it into the client bundle. But you can pass a Server Component as `children` to a Client Component. The Server Component renders on the server; the Client Component renders it as an already-resolved value.

```jsx
// ClientWrapper.jsx — Client Component
"use client";

import { useState } from "react";

function ClientWrapper({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <div className={`theme--${theme}`}>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
      {/* children is already-rendered Server Component output */}
      {children}
    </div>
  );
}

// ServerPage.jsx — Server Component
import ClientWrapper from "./ClientWrapper";
import ServerContent from "./ServerContent";

async function ServerPage() {
  const data = await fetchData();

  return (
    <ClientWrapper>
      {/* ServerContent renders on server, its output is passed as children */}
      <ServerContent data={data} />
    </ClientWrapper>
  );
}
```

This pattern is the standard way to combine stateful client wrappers with server-rendered content.

---

## What Server Components Cannot Do

Server Components have no access to browser or React interactivity APIs.

```jsx
// These will throw errors in a Server Component

"use server"; // not needed, this is just to illustrate — avoid these patterns:

import { useState } from "react"; // error — hooks not available
import { useEffect } from "react"; // error
import { useContext } from "react"; // error

function ServerComponent() {
  const [count, setCount] = useState(0); // error

  // No browser APIs
  const width = window.innerWidth; // error — window is not defined
  document.title = "Hello"; // error — document is not defined

  // No event handlers on JSX in Server Components
  return <button onClick={() => {}}>Click</button>; // silently ignored or error
}
```

If a component needs any of these, it must be a Client Component.

---

## Data Fetching Patterns

### Sequential Fetching

```jsx
async function UserOrderHistory({ userId }) {
  const user = await db.users.findUnique({ where: { id: userId } });
  // Fetches orders only after user is resolved
  const orders = await db.orders.findMany({ where: { userId: user.id } });

  return (
    <div>
      <h2>{user.name}'s Orders</h2>
      <OrderList orders={orders} />
    </div>
  );
}
```

### Parallel Fetching

```jsx
async function Dashboard({ userId }) {
  // All three fetch in parallel — much faster than sequential
  const [user, stats, notifications] = await Promise.all([
    db.users.findUnique({ where: { id: userId } }),
    analyticsService.getUserStats(userId),
    db.notifications.findMany({ where: { userId, read: false } }),
  ]);

  return (
    <div>
      <Header user={user} notificationCount={notifications.length} />
      <StatsPanel stats={stats} />
      <NotificationList notifications={notifications} />
    </div>
  );
}
```

### Component-Level Fetching

Each Server Component can fetch its own data independently. This eliminates prop drilling and keeps data co-located with the component that uses it.

```jsx
// No need to fetch reviews in a parent and pass them down
async function ProductReviews({ productId }) {
  const reviews = await db.reviews.findMany({
    where: { productId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <h3>Reviews ({reviews.length})</h3>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </section>
  );
}
```

---

## Server Components and Caching

Frameworks like Next.js add caching on top of Server Components. Fetch calls inside Server Components can be cached, deduplicated, and revalidated on a schedule.

```jsx
async function BlogPost({ slug }) {
  // Cached and revalidated every hour
  const post = await fetch(`https://cms.example.com/posts/${slug}`, {
    next: { revalidate: 3600 },
  }).then((r) => r.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

---

## Common Mistakes

```jsx
// Using hooks in a Server Component
async function ServerComponent() {
  const [open, setOpen] = useState(false); // Error — hooks are client-only
}

// Importing a Client Component into a Server Component is fine
import ClientButton from "./ClientButton"; // OK

// Importing a Server Component into a Client Component — pulls it into the bundle
("use client");
import ServerComponent from "./ServerComponent"; // wrong — defeats the purpose

// Pass Server Component output as children instead
<ClientWrapper>
  <ServerComponent /> {/* rendered on server, passed as children */}
</ClientWrapper>;

// Passing non-serializable values from Server to Client Components
// Functions, class instances, and Promises cannot be passed as props
async function Server() {
  const handler = () => doSomething(); // cannot pass this to a Client Component
  return <ClientComponent onClick={handler} />; // Error
}

// Pass serializable data only — strings, numbers, plain objects, arrays
async function Server() {
  const data = { id: 1, name: "Alice" }; // serializable — fine
  return <ClientComponent user={data} />;
}
```

---

## Summary

React Server Components render exclusively on the server, contribute zero JavaScript to the client bundle, and can directly access databases, file systems, and server APIs using `async/await`. Client Components opt in with `"use client"` and retain full access to hooks, events, and browser APIs. Compose them by passing server-rendered output as `children` to Client Components — never import a Server Component into a Client Component. Use parallel data fetching with `Promise.all` and co-locate each component's data fetch within the component itself for cleaner, more maintainable server code.

---

_Next: [Server Actions](./ServerActions.md) — running server-side mutations directly from forms and client components._
