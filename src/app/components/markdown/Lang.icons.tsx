import React from "react";
import { Terminal } from "lucide-react";
import {
  FiTerminal,
  FiDatabase,
  FiCpu,
  FiFileText,
  FiGlobe,
} from "react-icons/fi";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiRust,
  SiGo,
  SiBabel,
  SiCsdn,
} from "react-icons/si";

export function getLangIcon(lang: string) {
  const map: Record<string, React.ReactNode> = {
    javascript: <SiJavascript className="text-yellow-400" size={14} />,
    js: <SiJavascript className="text-yellow-400" size={14} />,
    typescript: <SiTypescript className="text-blue-400" size={14} />,
    ts: <SiTypescript className="text-blue-400" size={14} />,
    tsx: <SiTypescript className="text-blue-400" size={14} />,
    jsx: <SiJavascript className="text-yellow-400" size={14} />,
    python: <SiPython className="text-blue-300" size={14} />,
    py: <SiPython className="text-blue-300" size={14} />,
    rust: <SiRust className="text-orange-400" size={14} />,
    go: <SiGo className="text-cyan-400" size={14} />,
    css: <SiCsdn className="text-blue-500" size={14} />,
    bash: <SiBabel className="text-green-400" size={14} />,
    sh: <Terminal className="text-green-400" size={14} />,
    shell: <Terminal className="text-green-400" size={14} />,
    sql: <FiDatabase className="text-purple-400" size={14} />,
    json: <FiFileText className="text-orange-300" size={14} />,
    html: <FiGlobe className="text-red-400" size={14} />,
    xml: <FiGlobe className="text-red-400" size={14} />,
    cpp: <FiCpu className="text-blue-300" size={14} />,
    c: <FiCpu className="text-blue-300" size={14} />,
    default: <FiTerminal className="text-slate-500 dark:text-slate-400" size={14} />,
  };
  return map[lang.toLowerCase()] || map.default;
}
