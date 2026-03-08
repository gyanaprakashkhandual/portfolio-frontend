# JSX Fundamentals

JSX is a syntax extension for JavaScript that lets you write HTML-like markup directly inside JavaScript. React uses JSX to describe what the UI should look like. It looks like HTML but compiles down to regular JavaScript function calls under the hood.

---

## What Is JSX

JSX is not HTML and it is not a string. It is syntactic sugar for `React.createElement()` calls. The JSX you write gets transformed by a compiler (Babel or the React compiler) before it runs in the browser.

```jsx
// What you write
const element = <h1 className="title">Hello, World</h1>;

// What it compiles to
const element = React.createElement(
  "h1",
  { className: "title" },
  "Hello, World",
);
```

Both produce the same result. JSX is simply the more readable form.

---

## Basic Syntax

JSX looks like HTML with a few key differences.

```jsx
// Self-closing tags must be explicitly closed
const input = <input type="text" />;
const image = <img src="/logo.png" alt="Logo" />;

// Multi-line JSX must be wrapped in parentheses
const element = (
  <div>
    <h1>Title</h1>
    <p>Paragraph text</p>
  </div>
);
```

---

## JSX Must Have a Single Root Element

Every JSX expression must return a single parent element. You cannot return two sibling elements at the top level.

```jsx
// Wrong — two root elements
return (
  <h1>Title</h1>
  <p>Subtitle</p>
);

// Correct — wrapped in a div
return (
  <div>
    <h1>Title</h1>
    <p>Subtitle</p>
  </div>
);

// Correct — wrapped in a Fragment (renders no extra DOM node)
return (
  <>
    <h1>Title</h1>
    <p>Subtitle</p>
  </>
);
```

Fragments are preferred when an extra wrapper `div` would break your layout or add unnecessary DOM nodes.

---

## Embedding JavaScript Expressions

Use curly braces `{}` to embed any valid JavaScript expression inside JSX.

```jsx
const name = "Alice";
const age = 30;

function getGreeting(name) {
  return `Hello, ${name}`;
}

function Profile() {
  return (
    <div>
      <h1>{getGreeting(name)}</h1>
      <p>Age: {age}</p>
      <p>Born in: {new Date().getFullYear() - age}</p>
      <p>Uppercase: {name.toUpperCase()}</p>
    </div>
  );
}
```

Curly braces accept expressions, not statements. You cannot put an `if` statement or a `for` loop directly inside them — but you can use ternary operators and array methods.

---

## JSX Attributes

JSX attributes follow camelCase naming instead of HTML's kebab-case. Some attribute names differ from their HTML counterparts.

```jsx
// HTML attributes use camelCase in JSX
<div className="container">        // class -> className
<label htmlFor="email">            // for -> htmlFor
<input tabIndex={1} />             // tabindex -> tabIndex
<input readOnly />                 // readonly -> readOnly

// Style is an object, not a string
<div style={{ color: "red", fontSize: 16 }}>
  styled text
</div>

// Boolean attributes
<input disabled />                  // same as disabled={true}
<input disabled={false} />          // attribute is omitted entirely
```

The double curly brace in `style={{ ... }}` is not special syntax — the outer `{}` is JSX expression interpolation and the inner `{}` is a JavaScript object literal.

---

## Expressions vs. Statements in JSX

Curly braces accept expressions only. Use ternary operators for conditional logic and `map` for lists.

```jsx
const isLoggedIn = true;
const items = ["Apple", "Banana", "Cherry"];

function App() {
  return (
    <div>
      {/* Ternary — conditional expression */}
      <p>{isLoggedIn ? "Welcome back" : "Please log in"}</p>

      {/* Logical AND — renders right side only if left side is truthy */}
      {isLoggedIn && <button>Log Out</button>}

      {/* map — renders a list */}
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## JSX Comments

JSX uses JavaScript block comments wrapped in curly braces.

```jsx
function App() {
  return (
    <div>
      {/* This is a JSX comment */}
      <p>Visible content</p>

      {/* Multi-line comment
          spans several lines */}
      <p>More content</p>
    </div>
  );
}
```

Regular HTML comments `<!-- -->` do not work in JSX.

---

## Spreading Props

You can spread an object as props using the spread operator. Useful when passing through a set of props without listing them individually.

```jsx
function Button({ variant, size, children, ...rest }) {
  return (
    <button className={`btn btn--${variant} btn--${size}`} {...rest}>
      {children}
    </button>
  );
}

// Usage
const buttonProps = { onClick: handleClick, type: "submit", disabled: false };
<Button variant="primary" size="lg" {...buttonProps}>
  Submit
</Button>;
```

Use spreading carefully — it can pass unintended props to DOM elements, triggering React warnings.

---

## JSX Represents Objects

After compilation, JSX produces plain JavaScript objects called React elements. These objects describe what should appear on screen.

```jsx
// This JSX
const element = <h1 className="title">Hello</h1>;

// Produces this object
const element = {
  type: "h1",
  props: {
    className: "title",
    children: "Hello",
  },
};
```

React reads these objects and uses them to build and update the DOM. This is why JSX must be in scope — historically `React` had to be imported even if not referenced directly.

---

## Children in JSX

Anything between opening and closing JSX tags becomes the `children` prop. Children can be strings, numbers, elements, arrays, or expressions.

```jsx
// String children
<p>Hello World</p>

// Element children
<div>
  <span>Child element</span>
</div>

// Mixed children
<section>
  <h2>Title</h2>
  <p>Paragraph</p>
  <button>Action</button>
</section>

// Expression as children
<p>{"Dynamic " + "text"}</p>
```

---

## Whitespace in JSX

JSX handles whitespace differently from HTML. Blank lines between elements are removed, and whitespace at the start and end of a line is trimmed.

```jsx
// These produce the same output
<p>Hello World</p>
<p>Hello  World</p>

// To render a space explicitly
<p>{"Hello"} {"World"}</p>
<p>Hello{" "}World</p>
```

---

## Capitalization Matters

JSX uses capitalization to distinguish between HTML elements and React components. Lowercase tags are treated as DOM elements. Capitalized tags are treated as components.

```jsx
// Lowercase — renders a native DOM <div>
<div className="container" />

// Capitalized — renders the MyComponent function/class
<MyComponent className="container" />

// This would look for a "myComponent" HTML element (which doesn't exist)
<myComponent /> // wrong — always capitalize component names
```

---

## Common Mistakes

```jsx
// Using class instead of className
<div class="box">...</div>  // wrong — produces a warning
<div className="box">...</div>  // correct

// Forgetting to close self-closing tags
<input type="text">    // wrong — JSX requires explicit closing
<input type="text" />  // correct

// Returning multiple root elements without a wrapper
return <h1>Title</h1><p>Text</p>  // syntax error

return (
  <>
    <h1>Title</h1>
    <p>Text</p>
  </>
);  // correct

// Using a statement inside curly braces
<p>{if (show) "yes"}</p>  // syntax error — if is a statement, not an expression
<p>{show ? "yes" : "no"}</p>  // correct
```

---

## Summary

JSX is a syntax extension that lets you write UI markup directly in JavaScript. It compiles to `React.createElement` calls, uses camelCase for attributes, requires a single root element, and embeds JavaScript expressions via curly braces. Fragments let you group elements without adding extra DOM nodes. Lowercase tags map to HTML elements, and capitalized tags map to React components.

---

_Next: [Components and Props](./Components.md) — building the fundamental building blocks of a React application._
