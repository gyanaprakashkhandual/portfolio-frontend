# Forwarding Refs

Ref Forwarding is a technique that lets a parent component pass a `ref` through a child component to a DOM node or inner component inside it. By default, refs do not pass through component boundaries — `forwardRef` is the mechanism that enables this.

---

## The Problem

When you attach a `ref` to a custom component, React gives you a reference to the **component instance**, not to the DOM element inside it. For function components, there is no instance at all — the ref is `null`.

```jsx
function Input({ placeholder }) {
  return <input placeholder={placeholder} />;
}

function Form() {
  const inputRef = useRef(null);

  // inputRef.current is null — Input is a function component
  // Can't call inputRef.current.focus()
  return <Input ref={inputRef} placeholder="Enter text" />;
}
```

`forwardRef` solves this by allowing the child to explicitly forward the ref to its internal DOM node.

---

## Syntax

```jsx
const MyComponent = forwardRef(function (props, ref) {
  return <element ref={ref} />;
});
```

The `forwardRef` wrapper passes a second argument — `ref` — to the render function alongside `props`.

---

## Basic Example

```jsx
import { forwardRef, useRef } from "react";

const Input = forwardRef(function Input({ placeholder, ...props }, ref) {
  return (
    <input
      ref={ref}
      placeholder={placeholder}
      className="custom-input"
      {...props}
    />
  );
});

// Usage — now the ref reaches the actual <input> DOM node
function Form() {
  const inputRef = useRef(null);

  function focusInput() {
    inputRef.current.focus();
  }

  return (
    <>
      <Input ref={inputRef} placeholder="Type here..." />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}
```

`inputRef.current` is now the underlying `<input>` DOM element.

---

## Forwarding Through Multiple Levels

You can forward refs through multiple component layers.

```jsx
const TextInput = forwardRef(function (props, ref) {
  return <input type="text" ref={ref} {...props} />;
});

const LabeledInput = forwardRef(function ({ label, ...props }, ref) {
  return (
    <div className="labeled-input">
      <label>{label}</label>
      <TextInput ref={ref} {...props} />
    </div>
  );
});

// Usage — ref reaches the <input> inside TextInput
function App() {
  const ref = useRef(null);

  return <LabeledInput ref={ref} label="Your Name" placeholder="Enter name" />;
}
```

The ref passes through `LabeledInput` to `TextInput` to the actual `<input>` element.

---

## Setting displayName

Anonymous `forwardRef` components show as "ForwardRef" in React DevTools. Set `displayName` for clarity.

```jsx
const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />;
});

// Or explicitly:
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
Input.displayName = "Input";
```

---

## useImperativeHandle — Exposing a Custom API

Instead of forwarding the raw DOM node, you can expose a **controlled, custom API** on the ref. This is useful when you want to allow specific actions without giving the parent full DOM access.

```jsx
import { forwardRef, useRef, useImperativeHandle } from "react";

const VideoPlayer = forwardRef(function VideoPlayer(props, ref) {
  const videoRef = useRef(null);

  // Expose only the methods you want the parent to use
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
  }));

  return <video ref={videoRef} src={props.src} />;
});

// Usage — parent can call play/pause/seek, but can't access the raw DOM node
function App() {
  const playerRef = useRef(null);

  return (
    <>
      <VideoPlayer ref={playerRef} src="/movie.mp4" />
      <button onClick={() => playerRef.current.play()}>Play</button>
      <button onClick={() => playerRef.current.pause()}>Pause</button>
      <button onClick={() => playerRef.current.seek(60)}>Skip to 1:00</button>
    </>
  );
}
```

`useImperativeHandle` intentionally limits what the parent can do — exposing a focused interface rather than the entire DOM node.

---

## Forwarding Refs in HOCs

When wrapping a component with a Higher-Order Component, refs break unless you explicitly forward them.

```jsx
function withBorder(WrappedComponent) {
  // Use forwardRef inside the HOC to preserve ref behavior
  const WithBorder = forwardRef(function (props, ref) {
    return (
      <div style={{ border: "2px solid blue" }}>
        <WrappedComponent ref={ref} {...props} />
      </div>
    );
  });

  WithBorder.displayName = `withBorder(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithBorder;
}

const BorderedInput = withBorder(Input);

function App() {
  const ref = useRef(null);
  return <BorderedInput ref={ref} placeholder="Bordered input" />;
}
```

---

## React 19 — Ref as a Prop

In React 19, `forwardRef` is no longer required. You can pass `ref` as a regular prop and receive it directly in function components.

```jsx
// React 19 — no forwardRef needed
function Input({ ref, placeholder, ...props }) {
  return <input ref={ref} placeholder={placeholder} {...props} />;
}

// Usage is identical
function Form() {
  const inputRef = useRef(null);
  return <Input ref={inputRef} placeholder="Type here..." />;
}
```

`forwardRef` still works in React 19 for backward compatibility, but the simpler prop-based approach is now preferred for new code.

---

## Common Mistakes

```jsx
// ❌ Using ref on a function component without forwardRef (pre-React 19)
function MyInput(props) {
  return <input {...props} />;
}

const ref = useRef(null);
<MyInput ref={ref} />; // ref.current is null

// ✅ Wrap with forwardRef to pass the ref through
const MyInput = forwardRef((props, ref) => <input ref={ref} {...props} />);

// ❌ Forgetting to attach the ref to a DOM node
const MyInput = forwardRef((props, ref) => {
  return (
    <div>
      <input />
    </div>
  ); // ref not attached to anything — null
});

// ✅ Attach the ref explicitly
const MyInput = forwardRef((props, ref) => {
  return (
    <div>
      <input ref={ref} />
    </div>
  );
});

// ❌ Exposing the entire DOM node when a limited API is safer
// Use useImperativeHandle when only specific methods should be available
```

---

## When to Use Forwarding Refs

Use `forwardRef` (or ref-as-prop in React 19) when:

- Building **reusable input, button, or form components** that consumers might need to focus or measure
- Creating **animation triggers** where a parent needs to call `play()` or `start()`
- **Design system components** that must behave like native DOM elements
- Wrapping components with **HOCs** that shouldn't break ref behavior
- Exposing a **limited imperative API** via `useImperativeHandle`

Avoid forwarding refs when the parent can accomplish its goal with state and callbacks instead.

---

## Summary

`forwardRef` lets you pass a `ref` through a custom component to its internal DOM node or a custom imperative handle. Use it to build reusable components that behave like native elements, to preserve ref behavior inside HOCs, and combine it with `useImperativeHandle` when you want to expose a controlled API instead of the raw DOM. In React 19, refs can be passed as plain props, removing the need for `forwardRef` in most cases.

---

_Back to: [Component Patterns Overview]_
