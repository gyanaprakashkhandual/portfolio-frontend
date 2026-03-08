# useImperativeHandle

`useImperativeHandle` customizes what a parent component can access when it holds a ref to a child component. Instead of exposing the raw DOM node, you define a controlled public API — a specific set of methods and properties the parent is allowed to call.

---

## Syntax

```js
useImperativeHandle(ref, () => ({
  method() { ... },
  property: value,
}), [dependencies])
```

- `ref` — the ref passed in from the parent (via the `ref` prop in React 19, or `forwardRef` in React 18).
- The factory function returns the object exposed to the parent.
- The optional dependency array controls when the exposed object is recreated.

---

## Why Use It

By default, when a parent holds a ref to a child component, it gets the raw DOM node — which exposes the entire DOM API. `useImperativeHandle` lets you:

- Restrict what the parent can do to only what you explicitly allow.
- Expose higher-level methods that encapsulate multiple DOM operations.
- Keep the internal DOM structure private while still providing an imperative interface.

---

## Basic Example

```jsx
import { useRef, useImperativeHandle } from "react";

// React 19 — ref as a plain prop
function FancyInput({ ref }) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    },
    clear() {
      inputRef.current.value = "";
    },
    getValue() {
      return inputRef.current.value;
    },
  }));

  return <input ref={inputRef} className="fancy-input" />;
}

function Form() {
  const inputRef = useRef(null);

  function handleSubmit() {
    const value = inputRef.current.getValue();
    console.log("Submitted:", value);
    inputRef.current.clear();
  }

  return (
    <div>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

The parent can call `focus()`, `clear()`, and `getValue()` — but cannot access the underlying `<input>` DOM node directly.

---

## React 18 — Using forwardRef

In React 18 and earlier, refs cannot be passed as regular props to custom components. You need `forwardRef` to forward the ref through.

```jsx
import { forwardRef, useRef, useImperativeHandle } from "react";

const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    },
    clear() {
      inputRef.current.value = "";
    },
  }));

  return <input ref={inputRef} {...props} />;
});
```

In React 19, `forwardRef` is no longer needed — `ref` is passed as a regular prop.

---

## Practical Example — Video Player

A media player component exposes a clean playback API while keeping the `<video>` DOM element internal.

```jsx
function VideoPlayer({ src, ref }) {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play() {
      videoRef.current.play();
    },
    pause() {
      videoRef.current.pause();
    },
    seek(seconds) {
      videoRef.current.currentTime = seconds;
    },
    setVolume(level) {
      videoRef.current.volume = Math.max(0, Math.min(1, level));
    },
    getProgress() {
      const { currentTime, duration } = videoRef.current;
      return duration ? currentTime / duration : 0;
    },
  }));

  return <video ref={videoRef} src={src} style={{ width: "100%" }} />;
}

function PlayerPage() {
  const playerRef = useRef(null);

  return (
    <div>
      <VideoPlayer src="/video.mp4" ref={playerRef} />
      <button onClick={() => playerRef.current.play()}>Play</button>
      <button onClick={() => playerRef.current.pause()}>Pause</button>
      <button onClick={() => playerRef.current.seek(0)}>Restart</button>
      <button onClick={() => playerRef.current.setVolume(0.5)}>
        Half Volume
      </button>
    </div>
  );
}
```

---

## Practical Example — Dialog Component

```jsx
function Modal({ ref, children }) {
  const dialogRef = useRef(null);

  useImperativeHandle(ref, () => ({
    open() {
      dialogRef.current.showModal();
    },
    close() {
      dialogRef.current.close();
    },
  }));

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal__content">{children}</div>
    </dialog>
  );
}

function App() {
  const modalRef = useRef(null);

  return (
    <div>
      <button onClick={() => modalRef.current.open()}>Open Modal</button>
      <Modal ref={modalRef}>
        <h2>Hello from Modal</h2>
        <button onClick={() => modalRef.current.close()}>Close</button>
      </Modal>
    </div>
  );
}
```

---

## Dependency Array

The third argument controls when the imperative handle is recreated. If the exposed methods depend on state or props, include those values.

```jsx
function Counter({ ref, step }) {
  const [count, setCount] = useState(0);

  useImperativeHandle(
    ref,
    () => ({
      increment() {
        setCount((prev) => prev + step);
      },
      reset() {
        setCount(0);
      },
      getCount() {
        return count;
      },
    }),
    [step, count],
  );
}
```

---

## When to Use useImperativeHandle

Use it when:

- You are building a reusable component library and want to expose a stable, intentional API for imperative actions.
- A parent genuinely needs to trigger something in a child (focus, scroll, play/pause, open/close) without lifting all of that state up.
- You want to hide the internal DOM structure from consumers of your component.

Avoid it when:

- The interaction can be driven through props and state — that is almost always the right approach in React.
- You are working within a single application and can restructure to pass data and callbacks as props instead.

Imperative APIs go against React's declarative model. Treat `useImperativeHandle` as an escape hatch for specific use cases — primarily when building component libraries or integrating with non-React systems.

---

## Common Mistakes

```jsx
// Exposing the entire DOM node — defeats the purpose
useImperativeHandle(ref, () => ({
  node: inputRef.current, // parent now has full access to everything
}))

// Forgetting dependencies — stale closure in exposed methods
useImperativeHandle(ref, () => ({
  submit() {
    submitForm(userId) // userId not in deps — stale value
  },
})) // should be [userId]

// Using useImperativeHandle when props would work
// If a parent just needs to toggle a value, a boolean prop is simpler
<Modal isOpen={isOpen} />
// vs imperatively calling modalRef.current.open()
```

---

## Summary

`useImperativeHandle` is the right tool when a parent needs to trigger behavior inside a child component imperatively, and you want to expose only a controlled, intentional API rather than the raw DOM node. It works in tandem with the `ref` prop (React 19) or `forwardRef` (React 18). Keep its use limited — most component interactions are better handled through props, state, and callbacks.

---

_Next: [useId](./UseId.md) — generate stable, unique IDs for accessibility attributes across server and client._
