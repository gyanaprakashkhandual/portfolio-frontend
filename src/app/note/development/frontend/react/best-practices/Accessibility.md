# Accessibility

Accessibility (a11y) means building applications that work for everyone — including people who use screen readers, keyboard-only navigation, voice control, or other assistive technologies. In React, most accessibility work comes down to using correct HTML semantics, managing focus deliberately, and providing the right ARIA attributes when native HTML is not enough.

---

## Why Accessibility Matters

Roughly one in four adults has some form of disability. Beyond reaching more users, accessible applications are required by law in many jurisdictions (WCAG, ADA, Section 508, EN 301 549). Accessible code is also better code — semantic HTML, clear focus management, and well-labeled elements make applications easier to test, maintain, and use by everyone.

---

## Semantic HTML First

The most powerful accessibility tool is correct HTML. Native elements like `<button>`, `<input>`, `<nav>`, `<main>`, `<header>`, and `<footer>` come with built-in roles, keyboard behavior, and screen reader support for free. Reaching for `<div>` and `<span>` with custom behavior requires you to recreate all of that manually.

```jsx
// Wrong — a div acting as a button, requires manual ARIA and keyboard handling
<div onClick={handleClick} className="btn">
  Submit
</div>

// Correct — a real button, works with keyboard, screen readers, and all browsers
<button onClick={handleClick} type="button">
  Submit
</button>

// Wrong — no semantic structure
<div className="header">
  <div className="nav">...</div>
</div>
<div className="main">...</div>

// Correct — meaningful structure announced to screen readers
<header>
  <nav>...</nav>
</header>
<main>...</main>
```

Landmark elements — `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>`, `<article>` — let screen reader users jump directly to regions of the page.

---

## Labels for Form Inputs

Every form input must have an accessible label. The most reliable way is to associate a `<label>` with an input using the `htmlFor` attribute (note: `for` in HTML becomes `htmlFor` in JSX).

```jsx
// Correct — label associated via htmlFor / id
function EmailField({ value, onChange }) {
  return (
    <div>
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        type="email"
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}

// Correct — label wrapping the input (implicit association)
function CheckboxField({ checked, onChange, label }) {
  return (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

// Wrong — placeholder is not a label. When the user starts typing, guidance disappears
<input type="email" placeholder="Email address" />; // no label — inaccessible
```

For inputs without a visible label (icon buttons, search inputs inside a search form), use `aria-label` or `aria-labelledby`.

```jsx
// Visible search button with no text — aria-label provides the name
<button type="submit" aria-label="Search">
  <SearchIcon aria-hidden="true" />
</button>

// Input labeled by a visible heading elsewhere on the page
<h2 id="newsletter-heading">Subscribe to our newsletter</h2>
<input
  type="email"
  aria-labelledby="newsletter-heading"
  placeholder="Your email"
/>
```

---

## ARIA Attributes

ARIA (Accessible Rich Internet Applications) attributes communicate state, role, and properties to assistive technologies when native HTML semantics are not sufficient.

### aria-label and aria-labelledby

```jsx
// aria-label — provides a direct label string
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// aria-labelledby — references another element's text as the label
<section aria-labelledby="section-title">
  <h2 id="section-title">Recent Activity</h2>
  <ActivityList />
</section>
```

### aria-describedby

Provides additional descriptive text — error messages, hints, or instructions — linked to an element.

```jsx
function PasswordField({ value, onChange, error }) {
  return (
    <div>
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={value}
        onChange={onChange}
        aria-describedby={error ? "password-error" : "password-hint"}
        aria-invalid={!!error}
      />
      {error ? (
        <p id="password-error" role="alert">
          {error}
        </p>
      ) : (
        <p id="password-hint">Must be at least 8 characters.</p>
      )}
    </div>
  );
}
```

### aria-live Regions

Announce dynamic content changes to screen readers without requiring focus.

```jsx
function StatusMessage({ status, message }) {
  return (
    // aria-live="polite" announces after the user finishes their current action
    // aria-live="assertive" interrupts immediately — use for critical errors only
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

// Common pattern — visually hidden but announced to screen readers
function Toast({ messages }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {messages.map((msg) => (
        <p key={msg.id}>{msg.text}</p>
      ))}
    </div>
  );
}
```

### aria-expanded, aria-controls, aria-haspopup

```jsx
function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      <div id={contentId} hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
}

// Dropdown trigger
<button
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls="options-list"
>
  Select option
</button>;
```

### aria-hidden

Remove decorative elements from the accessibility tree. Icons that accompany visible text should always be hidden.

```jsx
// Icon is decorative — label comes from the button text
<button>
  <SaveIcon aria-hidden="true" />
  Save Changes
</button>

// Icon-only button — provide a label on the button itself
<button aria-label="Save changes">
  <SaveIcon aria-hidden="true" />
</button>

// Purely decorative image
<img src="/decoration.svg" alt="" aria-hidden="true" />
```

---

## Keyboard Navigation

Every interactive element must be reachable and operable with a keyboard. Native HTML elements handle this automatically. Custom interactive components require deliberate keyboard support.

### Focus Management

```jsx
// Managing focus when a modal opens
import { useEffect, useRef } from "react";

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus so we can restore it when the modal closes
      previousFocusRef.current = document.activeElement;
      // Move focus into the modal
      modalRef.current?.focus();
    } else {
      // Restore focus to the element that triggered the modal
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
      className="modal"
    >
      <h2 id="modal-title">Dialog Title</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### Focus Trap

When a modal or dialog is open, focus must not leave it. Users tabbing through the page should cycle through only the modal's focusable elements.

```jsx
function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(focusableSelectors),
    );

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e) {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, containerRef]);
}
```

### Keyboard Shortcuts for Custom Widgets

Custom interactive widgets need explicit keyboard handling. A listbox, for example, should respond to arrow keys, Home, End, and Enter.

```jsx
function ListBox({ options, value, onChange }) {
  function handleKeyDown(e) {
    const currentIndex = options.findIndex((o) => o.value === value);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        onChange(options[Math.min(currentIndex + 1, options.length - 1)].value);
        break;
      case "ArrowUp":
        e.preventDefault();
        onChange(options[Math.max(currentIndex - 1, 0)].value);
        break;
      case "Home":
        e.preventDefault();
        onChange(options[0].value);
        break;
      case "End":
        e.preventDefault();
        onChange(options[options.length - 1].value);
        break;
    }
  }

  return (
    <ul role="listbox" onKeyDown={handleKeyDown} tabIndex={0}>
      {options.map((option) => (
        <li
          key={option.value}
          role="option"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </li>
      ))}
    </ul>
  );
}
```

---

## Skip Navigation Links

Allow keyboard users to skip repeated navigation and jump directly to the main content.

```jsx
// Visually hidden until focused — appears on Tab press
function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}

// Place at the very top of the page
function Layout({ children }) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
```

```css
/* Skip link — visually hidden until focused */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
```

---

## Color and Contrast

Text must meet minimum contrast ratios against its background. WCAG AA requires 4.5:1 for normal text and 3:1 for large text. WCAG AAA requires 7:1 and 4.5:1 respectively.

Never use color alone to convey information — always pair color with text, an icon, or a pattern.

```jsx
// Wrong — color alone distinguishes success from error
<p style={{ color: "green" }}>Saved</p>
<p style={{ color: "red" }}>Failed</p>

// Correct — color reinforced with text and icon
<p className="status status--success">
  <CheckIcon aria-hidden="true" /> Saved successfully
</p>
<p className="status status--error" role="alert">
  <ErrorIcon aria-hidden="true" /> Save failed — please try again
</p>
```

---

## Images and Alt Text

Every `<img>` element must have an `alt` attribute. Decorative images get an empty `alt=""`. Informative images get a meaningful description.

```jsx
// Informative image — describe what it communicates
<img
  src="/charts/revenue-q3.png"
  alt="Q3 revenue chart showing 23% growth compared to Q2"
/>

// Decorative image — empty alt, hidden from screen readers
<img src="/decoration/wave.svg" alt="" />

// Icon in a button — icon is decorative, button label provides the name
<button aria-label="Delete post">
  <TrashIcon aria-hidden="true" />
</button>

// Linked image — alt text describes the destination, not the image
<a href="/products/keyboard">
  <img src="/keyboard.jpg" alt="View Mechanical Keyboard product page" />
</a>
```

---

## useId for Accessible Associations

React 18 introduced `useId` to generate stable, unique IDs for associating labels with inputs. It works correctly with server-side rendering — IDs match between server and client.

```jsx
import { useId } from "react";

function FormField({ label, error, type = "text", ...props }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## Accessible Loading States

Communicate loading and busy states to screen readers.

```jsx
function SubmitButton({ isPending, children }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      aria-busy={isPending}
      aria-label={isPending ? "Submitting, please wait" : undefined}
    >
      {isPending ? "Submitting..." : children}
    </button>
  );
}

// Screen reader announcement for content loading
function ContentSection({ isLoading, children }) {
  return (
    <section aria-busy={isLoading} aria-label="Content section">
      {isLoading ? <Skeleton /> : children}
    </section>
  );
}
```

---

## Accessible Routing

When navigating between pages in a SPA, focus stays wherever it was before the navigation — often on the link that was clicked. Screen reader users do not hear the new page title and have no indication the page changed.

```jsx
function usePageTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

// Announce page changes to screen readers
function RouteAnnouncer() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const title = document.title || "New page";
    setAnnouncement(`Navigated to ${title}`);
  }, [location.pathname]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
```

---

## Visually Hidden Utility Class

Visually hide content that should still be read by screen readers — status announcements, additional context for icon buttons, and screen-reader-only instructions.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```jsx
// Provide extra context to screen reader users
function CartIcon({ count }) {
  return (
    <button aria-label={`Cart, ${count} items`}>
      <ShoppingCartIcon aria-hidden="true" />
      <span aria-hidden="true">{count}</span>
    </button>
  );
}
```

---

## Testing Accessibility

### Automated Testing

`axe-core` and `eslint-plugin-jsx-a11y` catch a large category of accessibility errors automatically.

```bash
npm install --save-dev @axe-core/react eslint-plugin-jsx-a11y
```

```jsx
// Run axe in development
import React from "react";
import ReactDOM from "react-dom/client";

if (import.meta.env.DEV) {
  const axe = await import("@axe-core/react");
  axe.default(React, ReactDOM, 1000);
}
```

```json
// .eslintrc — enable jsx-a11y rules
{
  "plugins": ["jsx-a11y"],
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

### Manual Testing

Automated tools catch around 30-40% of accessibility issues. Manual testing is essential.

Keyboard testing: tab through every interactive element. Every element should be reachable, have a visible focus indicator, and work with Enter or Space.

Screen reader testing: use NVDA with Firefox on Windows, VoiceOver with Safari on macOS and iOS, or TalkBack on Android. Navigate by headings, landmarks, and forms to verify the page structure makes sense without a visual display.

Browser DevTools: Chrome and Firefox Accessibility panels show the accessibility tree, roles, and computed accessible names for any element.

---

## Common Mistakes

```jsx
// Div acting as a button — no keyboard access, no role, no focus
<div onClick={handleClick}>Submit</div>
// Use <button> — keyboard, focus, and semantics are built in

// Empty alt on informative images
<img src="/chart.png" alt="" /> // screen reader says nothing about the chart
<img src="/chart.png" alt="Monthly revenue trends for Q3 2024" /> // correct

// Missing label on input — placeholder disappears when typing
<input type="email" placeholder="Email" />
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="you@example.com" /> // correct

// Using only color to convey state
<p style={{ color: "red" }}>Error occurred</p> // invisible to color-blind users
<p role="alert"><ErrorIcon aria-hidden="true" /> Error occurred</p> // correct

// Generating IDs with Math.random — breaks SSR hydration
const id = `input-${Math.random()}`; // wrong
const id = useId(); // correct — stable across server and client

// Interactive element with tabIndex > 0 — breaks natural tab order
<div tabIndex="2">...</div> // disrupts expected focus sequence
// Use tabIndex="0" to add to natural order, tabIndex="-1" for programmatic focus only
```

---

## Summary

Accessible React applications start with correct semantic HTML — use native elements before reaching for ARIA. Associate every form input with a label using `htmlFor` and `id` or `useId`. Add ARIA attributes only when native HTML is insufficient. Manage focus deliberately when modals open and close, and implement focus traps for dialogs. Announce dynamic changes with `aria-live` regions. Hide decorative content with `aria-hidden`. Meet color contrast requirements and never use color as the only signal. Test with a keyboard first, then with a screen reader. Use `eslint-plugin-jsx-a11y` and `axe-core` to catch issues automatically, but always follow up with manual testing.

---

_Next: [TypeScript with React](./TypeScript.md) — adding static types to components, props, hooks, and events._
