# Data Fetching with TanStack Query

TanStack Query (formerly React Query) is a server state management library. It handles fetching, caching, background refetching, pagination, mutations, and synchronization of server data — so you do not have to manage loading states, error states, and cache invalidation manually. It is the standard solution for async data in React applications.

---

## Installation

```bash
npm install @tanstack/react-query
```

For DevTools (recommended during development):

```bash
npm install @tanstack/react-query-devtools
```

---

## Setup — QueryClient and Provider

Create a `QueryClient` and wrap the app in `QueryClientProvider`. This gives every component access to the query cache.

```jsx
// main.jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // data is fresh for 5 minutes
      retry: 2, // retry failed requests twice
    },
  },
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
```

---

## useQuery — Fetching Data

`useQuery` fetches and caches data. Pass it a `queryKey` and a `queryFn`. The key uniquely identifies the query in the cache. The function performs the actual fetch.

```jsx
import { useQuery } from "@tanstack/react-query";

function UserProfile({ userId }) {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
  });

  if (isLoading) return <p>Loading user...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

TanStack Query returns `isLoading` for the initial load (no cached data), `isFetching` for any fetch including background refetches, and `isError` if the latest attempt failed.

---

## Query Keys

Query keys are the foundation of the cache. Every unique key has its own cache entry. Keys are arrays — include every variable the query depends on.

```jsx
// Static key — always the same data
useQuery({ queryKey: ["products"], queryFn: fetchProducts });

// Dynamic key — different data per user
useQuery({ queryKey: ["user", userId], queryFn: () => fetchUser(userId) });

// Key with filters — different data per filter combination
useQuery({
  queryKey: ["products", { category, sort, page }],
  queryFn: () => fetchProducts({ category, sort, page }),
});

// Nested resources
useQuery({
  queryKey: ["users", userId, "orders"],
  queryFn: () => fetchUserOrders(userId),
});
```

When a key changes — for example, `userId` changes from `1` to `2` — TanStack Query automatically fetches the data for the new key, serves cached data for the old key if the user navigates back, and manages the loading state for you.

---

## Query Options — staleTime, gcTime, enabled

```jsx
useQuery({
  queryKey: ["config"],
  queryFn: fetchAppConfig,

  staleTime: Infinity, // data never becomes stale — fetched once per session
  gcTime: 1000 * 60 * 10, // cached for 10 minutes after last use (formerly cacheTime)
  refetchOnWindowFocus: false, // do not refetch when the browser tab regains focus
  retry: 3, // retry failed requests 3 times before giving up
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // exponential backoff
});

// Conditional fetching — query does not run until enabled is true
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // skip the query if userId is null or undefined
});
```

---

## useMutation — Creating, Updating, Deleting

`useMutation` handles write operations. It does not run automatically — you call `mutate` or `mutateAsync` when ready.

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreatePostForm() {
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: (newPost) =>
      fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      }).then((r) => r.json()),

    onSuccess: (createdPost) => {
      // Invalidate the posts list — triggers a background refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      // Or add the new post directly to the cache without a refetch
      queryClient.setQueryData(["post", createdPost.id], createdPost);
    },

    onError: (error) => {
      console.error("Failed to create post:", error.message);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    createPost.mutate({
      title: formData.get("title"),
      body: formData.get("body"),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" required />
      <textarea name="body" placeholder="Body" required />
      <button type="submit" disabled={createPost.isPending}>
        {createPost.isPending ? "Publishing..." : "Publish"}
      </button>
      {createPost.isError && (
        <p className="error">Failed to publish. Please try again.</p>
      )}
    </form>
  );
}
```

---

## Cache Invalidation and Synchronization

After a mutation, use `invalidateQueries` to mark cached data as stale. TanStack Query refetches it automatically if any component is currently subscribed to that query.

```jsx
const queryClient = useQueryClient();

// Invalidate all queries with a given key prefix
queryClient.invalidateQueries({ queryKey: ["posts"] });

// Invalidate a specific query
queryClient.invalidateQueries({ queryKey: ["posts", postId] });

// Invalidate multiple unrelated queries
queryClient.invalidateQueries({ queryKey: ["posts"] });
queryClient.invalidateQueries({ queryKey: ["user", userId, "stats"] });
```

---

## Optimistic Updates

Update the cache immediately when a mutation starts. If the mutation fails, roll back to the previous state.

```jsx
const queryClient = useQueryClient();

const toggleLike = useMutation({
  mutationFn: ({ postId, liked }) =>
    fetch(`/api/posts/${postId}/like`, {
      method: liked ? "DELETE" : "POST",
    }),

  onMutate: async ({ postId, liked }) => {
    // Cancel any in-flight refetches that would overwrite the optimistic update
    await queryClient.cancelQueries({ queryKey: ["posts"] });

    // Snapshot the previous value
    const previousPosts = queryClient.getQueryData(["posts"]);

    // Optimistically update the cache
    queryClient.setQueryData(["posts"], (old) =>
      old.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !liked,
              likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post,
      ),
    );

    // Return the snapshot for rollback
    return { previousPosts };
  },

  onError: (error, variables, context) => {
    // Roll back to the snapshot on failure
    queryClient.setQueryData(["posts"], context.previousPosts);
  },

  onSettled: () => {
    // Refetch to ensure server and cache are in sync
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },
});
```

---

## Pagination

Use the `page` variable in the query key so each page has its own cache entry.

```jsx
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

function PaginatedPostList() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["posts", { page }],
    queryFn: () => fetchPosts({ page, limit: 10 }),
    placeholderData: keepPreviousData, // show previous page data while next page loads
  });

  return (
    <div>
      {isLoading ? (
        <PostListSkeleton />
      ) : (
        <ul>
          {data.posts.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}

      <div className="pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {data?.totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={isPlaceholderData || page === data?.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

`keepPreviousData` keeps the previous page visible while the next page loads — no blank flash between pages.

---

## Infinite Scroll

`useInfiniteQuery` fetches sequential pages and accumulates the results.

```jsx
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";

function InfinitePostList() {
  const loadMoreRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["posts", "infinite"],
      queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam, limit: 10 }),
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  // Trigger next page when the sentinel element enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) return <PostListSkeleton />;

  return (
    <div>
      <ul>
        {allPosts.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>

      {/* Sentinel element — triggers next page fetch when visible */}
      <div ref={loadMoreRef}>
        {isFetchingNextPage && <p>Loading more...</p>}
        {!hasNextPage && <p>You have reached the end.</p>}
      </div>
    </div>
  );
}
```

---

## Prefetching

Fetch data before the user needs it — on hover, on route transition, or during idle time.

```jsx
const queryClient = useQueryClient();

// Prefetch on hover
function PostLink({ post }) {
  function handleMouseEnter() {
    queryClient.prefetchQuery({
      queryKey: ["post", post.id],
      queryFn: () => fetchPost(post.id),
      staleTime: 1000 * 60 * 5,
    });
  }

  return (
    <a href={`/posts/${post.id}`} onMouseEnter={handleMouseEnter}>
      {post.title}
    </a>
  );
}

// Prefetch on the server (Next.js)
export async function getServerSideProps({ params }) {
  await queryClient.prefetchQuery({
    queryKey: ["post", params.id],
    queryFn: () => fetchPost(params.id),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
```

---

## Query Status Reference

```jsx
const {
  data, // the resolved data — undefined until the first successful fetch
  error, // the error object if the query failed
  status, // "pending" | "error" | "success"
  isLoading, // true when fetching for the first time with no cached data
  isFetching, // true whenever a fetch is in progress (including background)
  isError, // true if the last fetch failed
  isSuccess, // true if data is available
  isStale, // true if data is older than staleTime
  refetch, // function to manually trigger a refetch
  dataUpdatedAt, // timestamp of the last successful fetch
} = useQuery({ queryKey, queryFn });
```

---

## TanStack Query vs. useEffect for Fetching

|                    | useEffect + useState | TanStack Query     |
| ------------------ | -------------------- | ------------------ |
| Loading state      | Manual               | Built-in           |
| Error handling     | Manual               | Built-in           |
| Caching            | None                 | Automatic          |
| Background refetch | None                 | Automatic          |
| Deduplication      | None                 | Automatic          |
| Pagination         | Manual               | Built-in           |
| Optimistic updates | Manual               | Built-in helpers   |
| DevTools           | None                 | Dedicated DevTools |
| Code volume        | High                 | Low                |

---

## Common Mistakes

```jsx
// Fetching inside useEffect — misses caching, deduplication, background sync
useEffect(() => {
  fetch("/api/users").then(...); // do not do this when TanStack Query is available
}, []);

// Using an unstable query key — triggers a fetch on every render
useQuery({
  queryKey: ["users", { filter: filters }], // new object reference every render
  queryFn: fetchUsers,
});

// Fix — ensure the key is stable or use primitive values
useQuery({
  queryKey: ["users", filters.category, filters.sort],
  queryFn: fetchUsers,
});

// Forgetting enabled — query runs with undefined parameters
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId), // userId may be undefined on first render
});

// Fix — guard with enabled
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId,
});

// Mutating without invalidating — cache goes stale after a write
createPost.mutate(newPost);
// Fix — invalidate the relevant queries in onSuccess
onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] });
```

---

## Summary

TanStack Query manages server state — fetching, caching, synchronization, and mutations — with minimal boilerplate. Use `useQuery` with a descriptive `queryKey` and a `queryFn` for data fetching. Use `useMutation` with `onSuccess` invalidation for writes. Add every variable a query depends on to its key so the cache stays correct as data changes. Use `placeholderData: keepPreviousData` for smooth pagination and `useInfiniteQuery` for infinite scroll. Prefetch on hover or navigation for instant perceived performance. Replace all `useEffect`-based fetching with TanStack Query — it handles every edge case you would otherwise implement manually.

---

_Next: [Styling Approaches](./Styling.md) — CSS Modules, Tailwind, styled-components, and choosing the right styling strategy._
