import { JSX } from "react";
import { GrReactjs } from "react-icons/gr";
import { SiSelenium } from "react-icons/si";
export interface DocTech {
  slug: string;
  label: string;
  description: string;
  icon: JSX.Element | string;
  color: string;
  totalDocs: number;
}

const docRegistry: DocTech[] = [
  {
    slug: "reactjs",
    label: "ReactJS",
    description: "Hooks, patterns, performance & React 19",
    icon: <GrReactjs size={24} className="text-sky-400" />,
    color: "text-cyan-400",
    totalDocs: 54,
  },
  {
    slug: "selenium",
    label: "Selenium",
    description: "WebDriver, automation, testing & framework",
    icon: <SiSelenium size={24} className="text-green-400" />,
    color: "text-green-400",
    totalDocs: 50,
  },
];

export default docRegistry;