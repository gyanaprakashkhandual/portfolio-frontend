export interface SidebarChild {
  id: string;
  label: string;
  children?: SidebarChild[];
}

export interface SidebarSection {
  id: string;
  label: string;
  children: SidebarChild[];
}

const reactjsSidebarItems: SidebarSection[] = [
  {
    id: "rj-1",
    label: "Getting Started",
    children: [
      { id: "rj-1-1", label: "Introduction to React" },
      { id: "rj-1-2", label: "JSX Fundamentals" },
      { id: "rj-1-3", label: "Components and Props" },
      { id: "rj-1-4", label: "Rendering Elements" },
      { id: "rj-1-5", label: "Event Handling" },
      { id: "rj-1-6", label: "Conditional Rendering" },
      { id: "rj-1-7", label: "Lists and Keys" },
      { id: "rj-1-8", label: "Forms and Controlled Components" },
    ],
  },
  {
    id: "rj-2",
    label: "Hooks",
    children: [
      { id: "rj-2-1", label: "useState" },
      { id: "rj-2-2", label: "useEffect" },
      { id: "rj-2-3", label: "useContext" },
      { id: "rj-2-4", label: "useReducer" },
      { id: "rj-2-5", label: "useRef" },
      { id: "rj-2-6", label: "useMemo" },
      { id: "rj-2-7", label: "useCallback" },
      { id: "rj-2-8", label: "useLayoutEffect" },
      { id: "rj-2-9", label: "useImperativeHandle" },
      { id: "rj-2-10", label: "useId" },
      { id: "rj-2-11", label: "useTransition" },
      { id: "rj-2-12", label: "useDeferredValue" },
      { id: "rj-2-13", label: "useSyncExternalStore" },
      { id: "rj-2-14", label: "useInsertionEffect" },
      {
        id: "rj-2-15",
        label: "React 19 New Hooks",
        children: [
          { id: "rj-2-15-1", label: "useActionState" },
          { id: "rj-2-15-2", label: "useFormStatus" },
          { id: "rj-2-15-3", label: "useOptimistic" },
        ],
      },
    ],
  },
  {
    id: "rj-3",
    label: "Component Patterns",
    children: [
      { id: "rj-3-1", label: "Component Composition" },
      { id: "rj-3-2", label: "Higher Order Components" },
      { id: "rj-3-3", label: "Render Props" },
      { id: "rj-3-4", label: "Compound Components" },
      { id: "rj-3-5", label: "Custom Hooks" },
      { id: "rj-3-6", label: "Forwarding Refs" },
    ],
  },
  {
    id: "rj-4",
    label: "State Management",
    children: [
      { id: "rj-4-1", label: "Lifting State Up" },
      { id: "rj-4-2", label: "Context API" },
      { id: "rj-4-3", label: "State Management with Zustand" },
      { id: "rj-4-4", label: "State Management with Redux Toolkit" },
    ],
  },
  {
    id: "rj-5",
    label: "Performance",
    children: [
      { id: "rj-5-1", label: "React Memo" },
      { id: "rj-5-2", label: "Code Splitting" },
      { id: "rj-5-3", label: "Lazy and Suspense" },
      { id: "rj-5-4", label: "Virtualization" },
      { id: "rj-5-5", label: "Profiling" },
    ],
  },
  {
    id: "rj-6",
    label: "React 19 Features",
    children: [
      { id: "rj-6-1", label: "Server Components" },
      { id: "rj-6-2", label: "Server Actions" },
      { id: "rj-6-3", label: "Asset Loading" },
      { id: "rj-6-4", label: "Document Metadata" },
      { id: "rj-6-5", label: "Ref as Prop" },
    ],
  },
  {
    id: "rj-7",
    label: "Ecosystem",
    children: [
      { id: "rj-7-1", label: "React Router" },
      { id: "rj-7-2", label: "Data Fetching with TanStack Query" },
      { id: "rj-7-3", label: "Styling Approaches" },
      { id: "rj-7-4", label: "Testing with RTL" },
    ],
  },
  {
    id: "rj-8",
    label: "Best Practices",
    children: [
      { id: "rj-8-1", label: "Project Structure" },
      { id: "rj-8-2", label: "Error Boundaries" },
      { id: "rj-8-3", label: "Accessibility" },
      { id: "rj-8-4", label: "TypeScript with React" },
    ],
  },
];

export default reactjsSidebarItems;
