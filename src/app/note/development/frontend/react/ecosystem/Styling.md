# Styling Approaches

React does not enforce a styling methodology. You can use plain CSS, CSS Modules, utility classes, CSS-in-JS, or any combination. Each approach has distinct trade-offs around colocation, performance, tooling, and team ergonomics. Understanding the options helps you choose what fits your project.

---

## Plain CSS and Global Stylesheets

The simplest approach. Import `.css` files directly into components. Styles are global — any class defined in the file applies to the entire page.

```css
/* Button.css */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn--primary {
  background-color: #0070f3;
  color: white;
}

.btn--danger {
  background-color: #e00;
  color: white;
}
```

```jsx
import "./Button.css";

function Button({ variant = "primary", children, ...props }) {
  return (
    <button className={`btn btn--${variant}`} {...props}>
      {children}
    </button>
  );
}
```

Global CSS is easy to start with but becomes harder to maintain as the project grows. Class name collisions and specificity conflicts are common problems.

---

## CSS Modules

CSS Modules scope class names to the component file. The build tool generates unique class names automatically — `.btn` in `Button.module.css` becomes something like `Button_btn__a3x9k` in the final CSS.

```css
/* Button.module.css */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.primary {
  background-color: #0070f3;
  color: white;
}

.danger {
  background-color: #e00;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}
```

```jsx
import styles from "./Button.module.css";

function Button({ variant = "primary", children, ...props }) {
  return (
    <button className={`${styles.btn} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}
```

### Conditional Classes with CSS Modules

```jsx
import styles from "./Card.module.css";

function Card({ isHighlighted, isDisabled, children }) {
  const className = [
    styles.card,
    isHighlighted && styles.highlighted,
    isDisabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className}>{children}</div>;
}
```

CSS Modules work with Vite and Create React App out of the box. No extra configuration required for files named `*.module.css`.

---

## Tailwind CSS

Tailwind is a utility-first CSS framework. Instead of writing CSS, you compose pre-defined utility classes directly in JSX. There is no separate stylesheet to maintain — styles live entirely in the markup.

```jsx
function Button({ variant = "primary", size = "md", children, ...props }) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Tailwind with clsx

`clsx` (or `classnames`) simplifies conditional class composition with Tailwind.

```bash
npm install clsx
```

```jsx
import clsx from "clsx";

function Input({ label, error, disabled, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={clsx(
          "w-full rounded-lg border px-3 py-2 text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
          disabled && "cursor-not-allowed bg-gray-50 text-gray-400",
          className,
        )}
        disabled={disabled}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

### Tailwind Setup (Vite)

```bash
npm install tailwindcss @tailwindcss/vite
```

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* index.css */
@import "tailwindcss";
```

---

## styled-components

styled-components is a CSS-in-JS library. Styles are written as JavaScript template literals attached to component definitions. The library generates scoped class names at runtime.

```bash
npm install styled-components
```

```jsx
import styled, { css } from "styled-components";

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  ${({ variant }) =>
    variant === "primary" &&
    css`
      background-color: #0070f3;
      color: white;
    `}

  ${({ variant }) =>
    variant === "danger" &&
    css`
      background-color: #e00;
      color: white;
    `}

  ${({ size }) =>
    size === "lg" &&
    css`
      padding: 12px 24px;
      font-size: 1rem;
    `}
`;

// Usage — just use like any component
function App() {
  return (
    <>
      <Button variant="primary">Save</Button>
      <Button variant="danger" size="lg">
        Delete
      </Button>
    </>
  );
}
```

### Theming with styled-components

```jsx
import { ThemeProvider, createGlobalStyle } from "styled-components";

const theme = {
  colors: {
    primary: "#0070f3",
    danger: "#e00",
    text: "#111",
    background: "#fff",
  },
  spacing: {
    sm: "8px",
    md: "16px",
    lg: "24px",
  },
  borderRadius: "6px",
};

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, sans-serif; }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Card>
        <h2>Themed Card</h2>
      </Card>
    </ThemeProvider>
  );
}
```

---

## Emotion

Emotion is another CSS-in-JS library with a similar API to styled-components but with additional flexibility including the `css` prop for inline styles.

```bash
npm install @emotion/react @emotion/styled
```

```jsx
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";

// The css prop — inline scoped styles
function Banner({ isError }) {
  return (
    <div
      css={css`
        padding: 16px;
        border-radius: 8px;
        background-color: ${isError ? "#fee2e2" : "#ecfdf5"};
        color: ${isError ? "#991b1b" : "#065f46"};
        font-weight: 500;
      `}
    >
      {isError ? "Something went wrong." : "Operation successful."}
    </div>
  );
}

// styled API — same as styled-components
const Heading = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 8px;
`;
```

---

## Inline Styles

React supports inline styles as a JavaScript object. Use for dynamic, computed values that cannot be expressed with class names. Avoid for static styles — they bypass the browser's stylesheet optimizations, cannot use pseudo-selectors, and are not reusable.

```jsx
// Appropriate — value is genuinely dynamic and computed
function ProgressBar({ percent }) {
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

// Appropriate — animation or position driven by state
function Tooltip({ x, y, children }) {
  return (
    <div className="tooltip" style={{ position: "fixed", left: x, top: y }}>
      {children}
    </div>
  );
}
```

---

## Choosing a Styling Approach

| Approach                    | Best For                             | Trade-offs                               |
| --------------------------- | ------------------------------------ | ---------------------------------------- |
| Plain CSS                   | Small projects, simple requirements  | Global scope, class collisions           |
| CSS Modules                 | Medium projects, component libraries | No runtime cost, requires build tooling  |
| Tailwind CSS                | Rapid development, design systems    | Verbose JSX, requires learning utilities |
| styled-components / Emotion | Component libraries, heavy theming   | Runtime cost, larger bundle              |
| Inline Styles               | Truly dynamic values                 | No pseudo-selectors, not reusable        |

In practice, many teams combine approaches — Tailwind for layout and typography, CSS Modules or styled-components for complex interactive components.

---

## Design Tokens and CSS Custom Properties

Regardless of which approach you choose, define design tokens as CSS custom properties. They work everywhere — with any styling tool — and enable theming with zero JavaScript.

```css
/* tokens.css */
:root {
  --color-primary: #0070f3;
  --color-primary-dark: #0051a2;
  --color-danger: #dc2626;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-border: #e5e7eb;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}

/* Dark mode — override tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #f9fafb;
    --color-background: #111827;
    --color-surface: #1f2937;
    --color-border: #374151;
  }
}
```

```jsx
/* Using tokens in any styling approach */
.button {
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
}
```

---

## Common Mistakes

```jsx
// Using inline styles for static values — defeats browser stylesheet caching
<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
  // Move to a CSS class or Tailwind utilities

// Building className strings with string interpolation — fragile
const cls = "btn btn-" + variant; // breaks if variant is undefined
// Use template literals with a fallback or clsx
const cls = clsx("btn", variant && `btn-${variant}`);

// Importing global CSS into a CSS Modules file — naming conflicts
// button.module.css
@import "./global.css"; // global styles leak into all pages

// Applying too many utility classes inline in JSX — hard to read
<div className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
// Extract to a component or a Tailwind @apply class for frequently reused patterns
```

---

## Summary

React supports any styling approach. Plain CSS is the simplest starting point. CSS Modules scope styles to their component file with zero runtime cost — the best default for most projects. Tailwind accelerates development with utility classes directly in JSX and works well for design systems. styled-components and Emotion bring full CSS syntax into JavaScript with dynamic theming, at the cost of a runtime. Inline styles are appropriate only for genuinely computed dynamic values. Define design tokens as CSS custom properties regardless of which approach you use — they provide a consistent foundation for theming and work across all tools.

---

_Next: [Testing with RTL](./RTL.md) — testing React components from the user's perspective with React Testing Library._
