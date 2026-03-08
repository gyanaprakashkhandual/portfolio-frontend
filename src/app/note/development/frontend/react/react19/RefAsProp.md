# Ref as Prop

React 19 allows function components to receive `ref` as a regular prop — no `forwardRef` wrapper required. This simplifies component APIs, eliminates a common source of boilerplate, and makes ref forwarding feel natural rather than like a workaround.

---

## The Problem Before React 19

In React 18 and earlier, `ref` was special. It was not passed to function components as a prop — React intercepted it before the component received its props. To forward a ref to a DOM node inside a function component, you had to explicitly wrap the component with `forwardRef`.

```jsx
// React 18 — forwardRef required
import { forwardRef } from "react";

const Input = forwardRef(function Input({ placeholder, ...props }, ref) {
  return <input ref={ref} placeholder={placeholder} {...props} />;
});

// Usage
const inputRef = useRef(null);
<Input ref={inputRef} placeholder="Enter text" />;
```

`forwardRef` adds a layer of indirection — a separate function signature, a second argument, and a wrapper that makes DevTools output less readable.

---

## Ref as Prop in React 19

In React 19, `ref` is passed like any other prop. Access it directly from the props object and attach it to a DOM node or expose it via `useImperativeHandle`.

```jsx
// React 19 — no forwardRef needed
function Input({ ref, placeholder, ...props }) {
  return <input ref={ref} placeholder={placeholder} {...props} />;
}

// Usage — identical to before
const inputRef = useRef(null);
<Input ref={inputRef} placeholder="Enter text" />;
```

The component behaves identically from the outside. Consumers pass `ref` exactly as they always have. The difference is purely inside the component definition.

---

## Before and After Comparison

```jsx
// React 18
import { forwardRef, useRef } from "react";

const TextArea = forwardRef(function TextArea(
  { label, rows = 4, ...props },
  ref,
) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea ref={ref} rows={rows} {...props} />
    </div>
  );
});

// React 19
function TextArea({ ref, label, rows = 4, ...props }) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea ref={ref} rows={rows} {...props} />
    </div>
  );
}
```

The React 19 version is a plain function with a plain props object. No wrapper, no second argument, no import of `forwardRef`.

---

## Forwarding Refs Through Multiple Layers

Ref forwarding through nested components is now as straightforward as passing any other prop.

```jsx
// React 19 — ref flows through the tree like any prop
function FormField({ ref, label, error, ...inputProps }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        ref={ref}
        className={error ? "input--error" : "input"}
        {...inputProps}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function EmailField({ ref, error }) {
  return (
    <FormField
      ref={ref}
      label="Email"
      type="email"
      name="email"
      error={error}
      placeholder="you@example.com"
    />
  );
}

// Usage
function SignUpForm() {
  const emailRef = useRef(null);

  function focusEmail() {
    emailRef.current?.focus();
  }

  return (
    <>
      <EmailField ref={emailRef} />
      <button onClick={focusEmail}>Focus Email</button>
    </>
  );
}
```

In React 18, each intermediate component would need its own `forwardRef` wrapper. In React 19, `ref` flows through naturally.

---

## useImperativeHandle Without forwardRef

`useImperativeHandle` lets you expose a custom API on the ref instead of the raw DOM node. In React 19, use it with the ref received directly from props.

```jsx
import { useRef, useImperativeHandle } from "react";

function VideoPlayer({ ref, src, poster }) {
  const videoRef = useRef(null);

  // Expose a controlled API — parent can only call these methods
  useImperativeHandle(ref, () => ({
    play() {
      videoRef.current.play();
    },
    pause() {
      videoRef.current.pause();
    },
    seek(time) {
      videoRef.current.currentTime = time;
    },
    get currentTime() {
      return videoRef.current.currentTime;
    },
    get duration() {
      return videoRef.current.duration;
    },
  }));

  return <video ref={videoRef} src={src} poster={poster} />;
}

// Usage
function MediaPage() {
  const playerRef = useRef(null);

  return (
    <>
      <VideoPlayer ref={playerRef} src="/video.mp4" poster="/poster.jpg" />
      <div className="controls">
        <button onClick={() => playerRef.current.play()}>Play</button>
        <button onClick={() => playerRef.current.pause()}>Pause</button>
        <button onClick={() => playerRef.current.seek(0)}>Restart</button>
      </div>
    </>
  );
}
```

---

## Ref as Prop in HOCs

Higher-order components previously had to explicitly forward refs to avoid breaking them. In React 19 this is no longer necessary — `ref` flows through like any other prop.

```jsx
// React 19 — HOC does not need special ref handling
function withBorder(WrappedComponent) {
  return function WithBorder({ ref, ...props }) {
    return (
      <div style={{ border: "2px solid blue" }}>
        <WrappedComponent ref={ref} {...props} />
      </div>
    );
  };
}

const BorderedInput = withBorder(Input);

function App() {
  const ref = useRef(null);
  return <BorderedInput ref={ref} placeholder="Bordered" />;
}
```

In React 18, this HOC would require `forwardRef` at both the HOC wrapper and the wrapped component level. In React 19, `ref` is just a prop.

---

## Ref Callback as a Prop

Ref callbacks — functions passed as `ref` — also work the same way and are useful for measuring DOM nodes or triggering animations.

```jsx
function MeasuredBox({ ref, children }) {
  return (
    <div
      ref={(node) => {
        if (node) {
          console.log("Height:", node.getBoundingClientRect().height);
        }
        // If ref is a callback ref from the parent, call it too
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
    >
      {children}
    </div>
  );
}
```

For the simpler case where you just want to attach the parent's ref, pass it directly:

```jsx
function SimpleWrapper({ ref, children }) {
  return <div ref={ref}>{children}</div>;
}
```

---

## Backward Compatibility

`forwardRef` still works in React 19 — existing code does not break. The ref-as-prop approach is the new preferred pattern for new components, but there is no urgency to migrate.

```jsx
// Still valid in React 19 — no changes needed for existing code
const LegacyInput = forwardRef(function LegacyInput(props, ref) {
  return <input ref={ref} {...props} />;
});
```

React will eventually deprecate `forwardRef` in a future major version once the ecosystem has migrated, but for now both patterns work side by side.

---

## Building a Design System with Ref as Prop

Ref access is essential for design system primitives — inputs, buttons, and interactive elements must be focusable and measurable by consumers. React 19 makes this clean.

```jsx
// Button.jsx
function Button({ ref, variant = "primary", size = "md", children, ...props }) {
  return (
    <button ref={ref} className={`btn btn--${variant} btn--${size}`} {...props}>
      {children}
    </button>
  );
}

// Input.jsx
function Input({ ref, label, error, id, ...props }) {
  const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        ref={ref}
        id={inputId}
        className={error ? "input--error" : "input"}
        {...props}
      />
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Select.jsx
function Select({ ref, label, options, error, ...props }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <select
        ref={ref}
        className={error ? "select--error" : "select"}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
```

Every primitive in the design system exposes `ref` without any additional complexity.

---

## Common Mistakes

```jsx
// Destructuring ref but forgetting to attach it to a DOM node
function Input({ ref, ...props }) {
  return <input {...props} />; // ref is received but not attached — ref.current is null
}

// Correct — attach the ref
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// Using forwardRef in React 19 for new components — unnecessary boilerplate
const Input = forwardRef(function Input(props, ref) {
  // redundant in React 19
  return <input ref={ref} {...props} />;
});

// Simpler in React 19
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// Spreading all props onto a DOM element including ref
function Wrapper({ ref, children, ...props }) {
  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  ); // correct — ref is separate
}

// Do not spread ref into HTML attributes via the rest spread if not separating it
function Broken({ ...props }) {
  return <div {...props} />; // in React 19, ref in props will attach correctly
  // but explicit separation is clearer and safer
}
```

---

## When ref Is Not Needed

Not every component needs a ref. Only add `ref` support when the component needs to expose direct DOM access or a custom imperative API to its parent.

```jsx
// No ref needed — purely presentational, no imperative access required
function Badge({ label, variant }) {
  return <span className={`badge badge--${variant}`}>{label}</span>;
}

// Ref makes sense — parent may need to focus or measure this input
function SearchInput({ ref, ...props }) {
  return <input ref={ref} type="search" {...props} />;
}
```

---

## Summary

React 19 makes `ref` a regular prop for function components, eliminating the need for `forwardRef` in new code. Access `ref` directly from the props object and attach it to the DOM node you want to expose. `useImperativeHandle` works the same way — receive the ref from props instead of as a second argument. Existing `forwardRef` code continues to work unchanged. The new pattern reduces boilerplate, improves component readability, and makes ref forwarding through HOCs and multi-level trees feel natural.

---

_Back to: [React 19 Features Overview]_
