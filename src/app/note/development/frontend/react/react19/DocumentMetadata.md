# Document Metadata

React 19 allows components to render `<title>`, `<meta>`, and `<link>` tags directly in JSX. React hoists these elements to the document `<head>` automatically — no framework adapter, no third-party library, and no `useEffect` required. Components own their own metadata just as they own their own markup.

---

## The Problem Before React 19

Managing `<head>` metadata in React previously required workarounds. There was no built-in way to set the page title or meta description from inside a component.

```jsx
// Old approach — useEffect hack
function ProductPage({ product }) {
  useEffect(() => {
    document.title = product.name; // direct DOM mutation — not SSR-friendly
  }, [product.name]);

  return <main>{product.name}</main>;
}

// Old approach — framework-specific
import Head from "next/head";

function ProductPage({ product }) {
  return (
    <>
      <Head>
        <title>{product.name}</title>
        <meta name="description" content={product.description} />
      </Head>
      <main>{product.name}</main>
    </>
  );
}
```

React 19 makes this native.

---

## The title Element

Render `<title>` directly inside any component. React hoists it to `<head>` regardless of where in the component tree it appears.

```jsx
function AboutPage() {
  return (
    <>
      <title>About Us — Acme Corp</title>
      <main>
        <h1>About Acme Corp</h1>
        <p>We build things that matter.</p>
      </main>
    </>
  );
}
```

React hoists the `<title>` to `<head>`. The rest of the JSX renders in its normal DOM position.

---

## Dynamic Titles

Because `<title>` is just JSX, it accepts expressions and responds to props and state like any other element.

```jsx
async function ProductPage({ params }) {
  const product = await db.products.findUnique({ where: { id: params.id } });

  return (
    <>
      <title>{product.name} — Shop</title>
      <meta name="description" content={product.description} />
      <article>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </article>
    </>
  );
}
```

```jsx
// Client Component with dynamic title based on state
"use client";

function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <>
      <title>{query ? `Search: ${query} — Shop` : "Search — Shop"}</title>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <SearchResults query={query} />
    </>
  );
}
```

The title updates reactively as `query` changes.

---

## Meta Tags

Render `<meta>` elements inline in components. React hoists them to `<head>`.

```jsx
async function BlogPost({ slug }) {
  const post = await db.posts.findUnique({ where: { slug } });

  return (
    <>
      <title>{post.title} — The Blog</title>
      <meta name="description" content={post.excerpt} />
      <meta name="author" content={post.author.name} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:image" content={post.coverImageUrl} />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.excerpt} />

      <article>
        <h1>{post.title}</h1>
        <p className="byline">By {post.author.name}</p>
        <div>{post.content}</div>
      </article>
    </>
  );
}
```

All meta tags are set from the same data source used to render the article — no duplication between the head metadata and the page content.

---

## Link Tags for Canonical URLs and Alternate Languages

```jsx
async function ArticlePage({ params, locale }) {
  const article = await fetchArticle(params.slug, locale);

  return (
    <>
      <title>{article.title}</title>
      <link
        rel="canonical"
        href={`https://example.com/${locale}/articles/${params.slug}`}
      />
      <link
        rel="alternate"
        hrefLang="en"
        href={`https://example.com/en/articles/${params.slug}`}
      />
      <link
        rel="alternate"
        hrefLang="es"
        href={`https://example.com/es/articles/${params.slug}`}
      />

      <article>
        <h1>{article.title}</h1>
        <div>{article.content}</div>
      </article>
    </>
  );
}
```

---

## Metadata in Nested Components

Metadata elements can be rendered from any component in the tree — they all hoist to `<head>`. This means a deeply nested component can contribute its own metadata without any prop drilling to a layout component.

```jsx
// Layout — sets global defaults
function RootLayout({ children }) {
  return (
    <html>
      <head />
      <body>
        <meta name="application-name" content="Acme Shop" />
        <meta name="theme-color" content="#0070f3" />
        {children}
      </body>
    </html>
  );
}

// Page — sets page-specific metadata
async function ProductPage({ product }) {
  return (
    <>
      <title>{product.name} — Acme Shop</title>
      <meta name="description" content={product.description} />
      <ProductDetail product={product} />
    </>
  );
}

// Deeply nested component — contributes its own metadata
function SalesBanner({ discount }) {
  if (!discount) return null;

  return (
    <>
      <meta name="discount-available" content="true" />
      <div className="sale-banner">{discount}% off today only</div>
    </>
  );
}
```

All three levels of the tree write to `<head>` independently.

---

## Title Deduplication

When multiple `<title>` elements are rendered, React uses the last one to win — the most specific, deepest component in the tree takes precedence. This mirrors how CSS specificity works.

```jsx
// RootLayout renders <title>Acme Shop</title>
// ProductPage renders <title>Keyboard — Acme Shop</title>
// The product page title wins — only one <title> appears in <head>
```

For `<meta>` tags, deduplication is based on the `name` or `property` attribute. If two components render `<meta name="description">`, the last one rendered wins.

---

## Structured Data

Render JSON-LD structured data directly in components using a `<script>` tag with `type="application/ld+json"`.

```jsx
async function ProductPage({ params }) {
  const product = await db.products.findUnique({ where: { id: params.id } });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <title>{product.name} — Shop</title>
      <meta name="description" content={product.description} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p>${product.price}</p>
      </article>
    </>
  );
}
```

---

## Viewport and Charset

Set universal meta tags at the root layout level. These only need to be defined once.

```jsx
function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

In Next.js App Router, `charSet` and `viewport` have dedicated exports in `layout.js` — React's native approach is more relevant for custom renderers and lighter frameworks.

---

## Robots and Indexing Control

```jsx
async function DraftPostPage({ post }) {
  return (
    <>
      <title>{post.title} — Draft</title>

      {/* Tell search engines not to index draft posts */}
      {post.isDraft && <meta name="robots" content="noindex, nofollow" />}

      {!post.isDraft && (
        <>
          <meta name="robots" content="index, follow" />
          <link
            rel="canonical"
            href={`https://example.com/posts/${post.slug}`}
          />
        </>
      )}

      <article>
        <h1>{post.title}</h1>
        {post.isDraft && <span className="badge">Draft</span>}
        <div>{post.content}</div>
      </article>
    </>
  );
}
```

---

## Document Metadata vs. Framework Solutions

|                          | React 19 Native        | Next.js Metadata API | react-helmet            |
| ------------------------ | ---------------------- | -------------------- | ----------------------- |
| Setup required           | None                   | None (built-in)      | npm install             |
| SSR support              | Yes                    | Yes                  | Requires specific setup |
| Server Component support | Yes                    | Yes                  | No                      |
| Deduplication            | Yes — by name/property | Yes                  | Yes                     |
| Structured data          | Yes — via script tag   | Yes                  | Yes                     |
| Framework dependency     | None                   | Next.js only         | None                    |

React 19's approach is framework-agnostic. It works in any React 19 compatible renderer.

---

## Common Mistakes

```jsx
// Using useEffect to set document.title — not SSR-friendly and runs after paint
useEffect(() => {
  document.title = "My Page"; // wrong approach in React 19
}, []);

// Just render the title as JSX
function MyPage() {
  return (
    <>
      <title>My Page</title>
      <main>Content</main>
    </>
  );
}

// Rendering <title> inside <head> explicitly — not necessary in React 19
// React hoists it automatically from anywhere in the tree
function Page() {
  return (
    <html>
      <head>
        <title>My Page</title> {/* works, but unnecessary to be explicit */}
      </head>
      <body>
        <title>My Page</title> {/* also works — React hoists it */}
      </body>
    </html>
  );
}

// Forgetting to sanitize user-generated content in meta tags
<meta name="description" content={userInput} />;
// Ensure userInput does not contain characters that break HTML attributes
// React's JSX rendering handles escaping automatically for attribute values
```

---

## Summary

React 19 makes `<title>`, `<meta>`, and `<link>` elements first-class JSX. Render them anywhere in the component tree and React automatically hoists them to `<head>`. Titles are deduplicated with the deepest component winning. Meta tags deduplicate by `name` or `property`. This eliminates the need for `useEffect` hacks, `document.title` mutations, and framework-specific `<Head>` components for most metadata use cases. Structured data works via `<script type="application/ld+json">`. Co-locate page metadata with the component that has the data — no prop drilling required.

---

_Next: [Ref as Prop](./RefAsProp.md) — passing refs directly as props in React 19 without forwardRef._
