# TypeScript with React

TypeScript adds static type checking to React applications. It catches errors at compile time, makes props self-documenting, enables precise editor autocompletion, and makes refactoring safer. This document covers how to type components, props, hooks, events, context, and common patterns in React with TypeScript.

---

## Setup

### New Project

```bash
npm create vite@latest my-app -- --template react-ts
```

### Existing Project

```bash
npm install --save-dev typescript @types/react @types/react-dom
```

Add a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

Enable `strict: true` from the start. Disabling it defeats much of TypeScript's value.

---

## Typing Component Props

Define props using an interface. Export it when other components need to reference the type.

```tsx
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function Button({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? "Loading..." : label}
    </button>
  );
}
```

---

## React.FC vs. Plain Function Types

Prefer plain function declarations over `React.FC`. `React.FC` implicitly includes `children` in older React versions, hides the return type, and does not provide meaningful advantages.

```tsx
// Avoid — React.FC adds implicit children and obscures types
const Button: React.FC<ButtonProps> = ({ label }) => <button>{label}</button>;

// Prefer — explicit, clear, and idiomatic TypeScript
function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}

// Or as a typed arrow function — also fine
const Button = ({ label }: ButtonProps): JSX.Element => (
  <button>{label}</button>
);
```

---

## Typing Children

Use `React.ReactNode` for the `children` prop — it accepts any valid JSX, including strings, numbers, elements, arrays, fragments, and null.

```tsx
import { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

function Card({ title, children, footer }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
```

Other children types for more specific constraints:

```tsx
children: ReactNode        // anything renderable — most common
children: ReactElement     // a single React element (not strings or arrays)
children: string           // only string content
children: ReactNode[]      // an array of renderable nodes
```

---

## Extending Native HTML Element Props

When a component wraps a native element, extend its props so consumers can pass any native attribute — `className`, `style`, `aria-*`, `data-*`, and event handlers.

```tsx
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

function Button({
  variant = "primary",
  isLoading,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant}`}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}

// Now accepts all native button attributes automatically
<Button variant="primary" type="submit" form="login-form" aria-label="Sign in">
  Sign In
</Button>;
```

Common element attribute types:

```tsx
HTMLAttributes<HTMLElement>; // generic
ButtonHTMLAttributes<HTMLButtonElement>; // button
InputHTMLAttributes<HTMLInputElement>; // input
TextareaHTMLAttributes<HTMLTextAreaElement>;
SelectHTMLAttributes<HTMLSelectElement>;
AnchorHTMLAttributes<HTMLAnchorElement>;
FormHTMLAttributes<HTMLFormElement>;
ImgHTMLAttributes<HTMLImageElement>;
```

---

## Typing useState

TypeScript usually infers the type from the initial value. Provide an explicit type argument when the initial value does not represent the full range of the state.

```tsx
// Inferred — initial value defines the type
const [count, setCount] = useState(0); // number
const [name, setName] = useState(""); // string
const [isOpen, setIsOpen] = useState(false); // boolean

// Explicit type argument — initial value is narrower than the type
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Product[]>([]);
const [error, setError] = useState<string | null>(null);
const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
  "idle",
);
```

---

## Typing useRef

Provide the element type as a type argument. Use `null` as the initial value — the ref is assigned by React when the element mounts.

```tsx
import { useRef } from "react";

// DOM element ref
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);
const videoRef = useRef<HTMLVideoElement>(null);

// Usage — TypeScript knows inputRef.current may be null before mount
function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    inputRef.current?.focus(); // optional chaining handles the null case
  }

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus</button>
    </div>
  );
}

// Mutable ref for storing a value (not a DOM node)
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const previousValueRef = useRef<string>("");
```

---

## Typing useReducer

Define action types as a discriminated union. TypeScript narrows the type inside each `case` automatically.

```tsx
interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QTY"; payload: { id: string; qty: number } }
  | { type: "CLEAR_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      // TypeScript knows action.payload is CartItem here
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price,
      };
    case "REMOVE_ITEM":
      // TypeScript knows action.payload is { id: string } here
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, qty: action.payload.qty }
            : item,
        ),
      };
    case "CLEAR_CART":
      return { items: [], total: 0 };
  }
}

function Cart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  return (
    <div>
      {state.items.map((item) => (
        <div key={item.id}>
          {item.name}
          <button
            onClick={() =>
              dispatch({ type: "REMOVE_ITEM", payload: { id: item.id } })
            }
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Typing useContext

Type the context value at creation time. Use `null` as the default and add a guard in the custom hook.

```tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Usage — TypeScript knows theme is "light" | "dark", not null
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  );
}
```

---

## Typing Event Handlers

Use React's synthetic event types for event handler parameters.

```tsx
import {
  ChangeEvent,
  MouseEvent,
  FormEvent,
  KeyboardEvent,
  FocusEvent,
} from "react";

function Form() {
  const [value, setValue] = useState("");

  // Input change
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  // Textarea change
  function handleTextareaChange(e: ChangeEvent<HTMLTextAreaElement>) {
    console.log(e.target.value);
  }

  // Select change
  function handleSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    console.log(e.target.value);
  }

  // Form submit
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(value);
  }

  // Button click with event object
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    console.log(e.currentTarget.name);
  }

  // Keyboard event
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submitForm();
  }

  // Focus event
  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    validateField(e.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <button type="submit" onClick={handleClick}>
        Submit
      </button>
    </form>
  );
}
```

---

## Typing Custom Hooks

Always type the return value of custom hooks explicitly — either as a tuple or an object.

```tsx
// Returning a tuple — type as const preserves tuple type, not widened array
function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle] as const;
}

// Returning an object — interface makes the return type explicit and readable
interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  function refetch() {
    setIsLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data: T) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    refetch();
  }, [url]);

  return { data, isLoading, error, refetch };
}

// Usage — TypeScript knows the exact shape of the returned data
const { data: users, isLoading } = useFetch<User[]>("/api/users");
```

---

## Generic Components

Use generics to write components that work with any data type while remaining fully type-safe.

```tsx
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
  placeholder?: string;
}

function Select<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = "Select an option",
}: SelectProps<T>) {
  return (
    <select
      value={value ? String(getValue(value)) : ""}
      onChange={(e) => {
        const selected = options.find(
          (o) => String(getValue(o)) === e.target.value,
        );
        if (selected) onChange(selected);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={String(getValue(option))} value={String(getValue(option))}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}

// Usage — fully typed based on the data passed in
interface Country {
  code: string;
  name: string;
}

<Select<Country>
  options={countries}
  value={selectedCountry}
  onChange={setSelectedCountry}
  getLabel={(c) => c.name}
  getValue={(c) => c.code}
/>;
```

---

## Typing forwardRef (Pre React 19)

```tsx
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, ...props },
  ref,
) {
  return (
    <div className="field">
      <label>{label}</label>
      <input ref={ref} {...props} />
      {error && <p className="error">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
```

In React 19, `ref` is a regular prop — no `forwardRef` wrapper needed.

```tsx
// React 19 — ref as a regular typed prop
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ label, error, ref, ...props }: InputProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <input ref={ref} {...props} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## Utility Types for React

TypeScript provides built-in utility types, and React exports several of its own.

```tsx
import {
  ComponentProps, // all props of a component
  ComponentPropsWithRef,
  ElementType,
  ReactNode,
  ReactElement,
  CSSProperties, // for inline style objects
} from "react";

// ComponentProps — extract props from an existing component
type ButtonProps = ComponentProps<typeof Button>;
type DivProps = ComponentProps<"div">;
type InputProps = ComponentProps<"input">;

// CSSProperties — type for inline style objects
function Box({ style }: { style?: CSSProperties }) {
  return <div style={style} />;
}

// Omit — remove specific props before extending
interface TextInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
}

// Partial — all props optional
type PartialButtonProps = Partial<ButtonProps>;

// Required — all props required
type RequiredButtonProps = Required<ButtonProps>;
```

---

## Common Mistakes

```tsx
// Using any — defeats TypeScript entirely
function Component({ data }: { data: any }) {
  return <div>{data.whatever.you.want}</div>; // no errors, no safety
}
// Use unknown and narrow the type, or define the exact interface

// Non-null assertion without a good reason
const value = ref.current!.value; // crashes if ref.current is null
const value = ref.current?.value; // safe — returns undefined if null

// Typing onClick as () => void when it needs the event
interface Props {
  onClick: () => void; // cannot access event.target
  onClick: (e: MouseEvent<HTMLButtonElement>) => void; // correct
}

// Using React.FC on every component
const Component: React.FC<Props> = ({ name }) => <div>{name}</div>;
// Just use a plain function — it is cleaner and more idiomatic

// Not enabling strict mode — misses null checks and implicit any
// Always use "strict": true in tsconfig.json

// Casting with as when the types do not actually align
const element = someElement as HTMLInputElement; // may be wrong at runtime
// Use type guards instead
if (someElement instanceof HTMLInputElement) {
  console.log(someElement.value); // safe
}
```

---

## Summary

TypeScript with React adds confidence, editor intelligence, and documentation value to every component. Define props with interfaces and extend native HTML attribute types to avoid recreating built-in props. Use `useState<T>` with an explicit type argument when the initial value is `null` or an empty array. Type discriminated union actions in `useReducer` for full type narrowing in reducers. Provide the context value type at `createContext` time and guard with a custom hook. Use React's synthetic event types for handler parameters. Write generic components for reusable data-driven UI. Enable `strict` mode from day one and avoid `any`, non-null assertions, and `as` casts without a valid reason.

---

_Back to: [Best Practices Overview]_
