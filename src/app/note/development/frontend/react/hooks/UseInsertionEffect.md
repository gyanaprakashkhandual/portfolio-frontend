# useInsertionEffect

`useInsertionEffect` fires synchronously before any DOM mutations — before `useLayoutEffect` and before the browser paints. It exists specifically for CSS-in-JS libraries to inject style rules into the DOM at the right time, ensuring styles are present before layout reads occur.

---

## Syntax

```js
useInsertionEffect(() => {
  // inject styles here
  return () => {
    // cleanup
  };
}, [dependencies]);
```

The API mirrors `useEffect` and `useLayoutEffect`, but the timing is different.

---

## Execution Order

| Hook                 | When It Fires                             |
| -------------------- | ----------------------------------------- |
| `useInsertionEffect` | Before any DOM mutations (before layout)  |
| `useLayoutEffect`    | After DOM mutations, before browser paint |
| `useEffect`          | After browser paint                       |

`useInsertionEffect` fires first — before React applies any DOM changes for the current render. This guarantees that injected styles exist before `useLayoutEffect` runs and reads layout.

---

## Who This Hook Is For

`useInsertionEffect` is a low-level hook intended for **CSS-in-JS library authors** — not for application developers. Libraries like styled-components, Emotion, and similar tools use it internally to inject `<style>` tags or CSS rules at the correct moment.

If you are building an application rather than a styling library, you should not need this hook. Use `useLayoutEffect` for DOM reads, `useEffect` for side effects, and your chosen styling solution's built-in API.

---

## Why It Exists

Before `useInsertionEffect`, CSS-in-JS libraries injected styles during rendering or inside `useLayoutEffect`. Both approaches have problems:

- **Injecting during render** breaks React's rendering rules — it causes side effects in a phase that should be pure.
- **Injecting in `useLayoutEffect`** means styles arrive after the DOM is already in place, so `useLayoutEffect` hooks that read layout (like `getBoundingClientRect`) see incorrect dimensions — the layout was calculated before the styles were applied.

`useInsertionEffect` solves this by providing a dedicated phase for style injection that precedes all layout reads.

---

## Basic Usage — Style Injection

```jsx
import { useInsertionEffect } from "react";

function useCSS(className, cssRule) {
  useInsertionEffect(() => {
    if (isStyleAlreadyInjected(className)) return;

    const styleTag = document.createElement("style");
    styleTag.textContent = cssRule;
    styleTag.setAttribute("data-class", className);
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, [className, cssRule]);
}

function Button({ children }) {
  useCSS(
    "btn-primary",
    `.btn-primary { background: blue; color: white; padding: 8px 16px; }`,
  );

  return <button className="btn-primary">{children}</button>;
}
```

---

## How CSS-in-JS Libraries Use It

Here is a simplified version of how a library like Emotion might use `useInsertionEffect` internally:

```jsx
// Simplified internal library code
import { useInsertionEffect } from "react";

const injectedStyles = new Set();

function useStyles(css) {
  const hash = hashString(css);

  useInsertionEffect(() => {
    if (injectedStyles.has(hash)) return;

    const sheet = document.styleSheets[0] ?? createStyleSheet();
    sheet.insertRule(`.css-${hash} { ${css} }`);
    injectedStyles.add(hash);
  }, [hash]);

  return `css-${hash}`;
}

// Application code using the library
function Card({ children }) {
  const className = useStyles(
    "border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.1);",
  );

  return <div className={className}>{children}</div>;
}
```

---

## Limitations

`useInsertionEffect` has intentional restrictions that distinguish it from other hooks:

**No refs.** Refs are not attached to DOM nodes yet when `useInsertionEffect` fires. Do not read or write `ref.current` inside it.

**No state updates.** Calling `setState` inside `useInsertionEffect` will throw an error. It is a style injection point, not a state update point.

**No DOM reads.** The DOM is not in its final state yet — layout has not been applied. Do not call `getBoundingClientRect` or read computed styles.

**No access to the component's rendered output.** The hook fires before React has applied changes to the DOM.

```jsx
// Wrong — trying to read state or update it
useInsertionEffect(() => {
  setState(someValue); // throws — not allowed
  console.log(ref.current); // null or stale — not yet attached
}, []);

// Correct — only inject styles
useInsertionEffect(() => {
  injectStyleRule(".my-class { color: red; }");
}, []);
```

---

## useInsertionEffect vs useLayoutEffect

|                     | `useInsertionEffect`            | `useLayoutEffect`                 |
| ------------------- | ------------------------------- | --------------------------------- |
| Purpose             | Inject CSS rules and style tags | Read DOM layout and apply changes |
| Timing              | Before DOM mutations            | After DOM mutations, before paint |
| Can read DOM layout | No                              | Yes                               |
| Can update state    | No                              | Yes                               |
| Has refs            | No                              | Yes                               |
| Who uses it         | CSS-in-JS library authors       | Application developers            |

---

## When to Use It in Application Code

Almost never. If you are writing application code, you should not need `useInsertionEffect`. Reach for it only if:

- You are building a CSS-in-JS library or a style injection utility from scratch.
- You need to ensure a style is present before `useLayoutEffect` runs in the same render.

For everything else, your styling library already handles this internally, and `useEffect` or `useLayoutEffect` covers the remaining DOM interaction use cases.

---

## Summary

`useInsertionEffect` is a specialized hook that fills a narrow but important gap in React's rendering pipeline — it provides CSS-in-JS libraries a safe place to inject styles before layout reads happen. Its API mirrors `useEffect` and `useLayoutEffect`, but its restrictions are strict: no refs, no state updates, no DOM reads. Unless you are authoring a styling library, you will not call this hook directly — but understanding it helps you understand how libraries like styled-components and Emotion work under the hood.

---

_Next: [useActionState](./UseActionState.md) — manage async action state with React 19's new form-driven state hook._
