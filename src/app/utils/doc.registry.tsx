export interface DocTech {
  slug: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  totalDocs: number;
}

const docRegistry: DocTech[] = [
  {
    slug: "reactjs",
    label: "ReactJS",
    description: "Hooks, patterns, performance & React 19",
    icon: "⚛️",
    color: "text-cyan-400",
    totalDocs: 54,
  },
];

export default docRegistry;