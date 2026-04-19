/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Copy,
  Check,
  ExternalLink,
  Package,
  Github,
  Zap,
  Type,
  Code2,
  Table2,
  Quote,
  List,
} from "lucide-react";

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useCopy(text);
  return (
    <button
      onClick={copy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-all text-white/60 hover:text-white"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function CodeBlock({
  code,
  lang = "bash",
  className = "",
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  const tokens = {
    bash: (line: string) => {
      if (
        line.startsWith("npm ") ||
        line.startsWith("git ") ||
        line.startsWith("cd ")
      ) {
        const [cmd, ...rest] = line.split(" ");
        return (
          <>
            <span className="text-emerald-400">{cmd}</span>
            <span className="text-zinc-200"> {rest.join(" ")}</span>
          </>
        );
      }
      return <span className="text-zinc-200">{line}</span>;
    },
    tsx: (line: string) => {
      return <span className="text-zinc-200">{line}</span>;
    },
  };

  return (
    <div className={`relative group ${className}`}>
      <pre className="bg-zinc-900 border border-zinc-700/60 rounded-xl px-5 py-4 text-[13px] font-mono overflow-x-auto leading-relaxed text-zinc-200">
        {code.split("\n").map((line, i) => (
          <div key={i} className="min-h-[1.5em]">
            {(tokens as any)[lang]?.(line) ?? (
              <span className="text-zinc-200">{line}</span>
            )}
          </div>
        ))}
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const DEMO_MARKDOWN = `# Welcome to ShowMarkdown

A **React library** that turns raw Markdown into beautiful UI instantly.

## Features

- Renders all standard Markdown elements
- Built-in syntax highlighting
- Zero configuration needed

## Code Example

\`\`\`tsx
import Markdown from "showmarkdown";
\`\`\`

> Drop it in. It just works.

| Element | Supported |
|---------|-----------|
| Headings | ✓ |
| Tables | ✓ |
| Code | ✓ |`;

function LivePreview() {
  const lines = DEMO_MARKDOWN.split("\n");
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((v) => {
        if (v >= lines.length) {
          clearInterval(timer);
          return v;
        }
        return v + 1;
      });
    }, 60);
    return () => clearInterval(timer);
  }, []);

  const rendered = lines.slice(0, visibleLines).join("\n");

  const parseMarkdown = (md: string) => {
    const elements: React.ReactNode[] = [];
    const mdLines = md.split("\n");
    let i = 0;

    while (i < mdLines.length) {
      const line = mdLines[i];

      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-white mt-2 mb-3">
            {parseinline(line.slice(2))}
          </h1>,
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-lg font-semibold text-white mt-5 mb-2">
            {parseinline(line.slice(3))}
          </h2>,
        );
      } else if (line.startsWith("- ")) {
        elements.push(
          <li key={i} className="text-zinc-300 text-sm ml-4 list-disc">
            {parseinline(line.slice(2))}
          </li>,
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={i}
            className="border-l-2 border-emerald-400 pl-4 my-3 text-zinc-400 text-sm italic"
          >
            {parseinline(line.slice(2))}
          </blockquote>,
        );
      } else if (line.startsWith("```")) {
        const lang = line.slice(3);
        const codeLines: string[] = [];
        i++;
        while (i < mdLines.length && !mdLines[i].startsWith("```")) {
          codeLines.push(mdLines[i]);
          i++;
        }
        elements.push(
          <pre
            key={i}
            className="bg-black/40 border border-zinc-700/40 rounded-lg px-4 py-3 text-xs font-mono text-emerald-300 my-3 overflow-x-auto"
          >
            {codeLines.join("\n")}
          </pre>,
        );
      } else if (line.startsWith("|")) {
        const rows: string[][] = [];
        while (i < mdLines.length && mdLines[i].startsWith("|")) {
          if (!mdLines[i].includes("---")) {
            rows.push(
              mdLines[i]
                .split("|")
                .filter(Boolean)
                .map((c) => c.trim()),
            );
          }
          i++;
        }
        elements.push(
          <table key={i} className="w-full text-xs my-3 border-collapse">
            <thead>
              <tr>
                {rows[0]?.map((cell, ci) => (
                  <th
                    key={ci}
                    className="border border-zinc-700 px-3 py-1.5 text-left text-zinc-300 bg-zinc-800/60 font-medium"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border border-zinc-700/50 px-3 py-1.5 text-zinc-400"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>,
        );
        continue;
      } else if (line.trim()) {
        elements.push(
          <p key={i} className="text-zinc-300 text-sm leading-relaxed mb-2">
            {parseinline(line)}
          </p>,
        );
      }
      i++;
    }
    return elements;
  };

  const parseinline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="bg-zinc-700/60 text-emerald-300 px-1 rounded text-xs font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="grid grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-zinc-700/60 h-72">
      <div className="bg-zinc-950 p-5 overflow-y-auto border-r border-zinc-700/60">
        <p className="text-[10px] text-zinc-600 font-mono mb-3 uppercase tracking-widest">
          Raw Markdown
        </p>
        <pre className="text-[11px] font-mono text-zinc-500 leading-relaxed whitespace-pre-wrap">
          {rendered}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-1.5 h-3 bg-emerald-400 ml-0.5 align-middle"
          />
        </pre>
      </div>
      <div className="bg-zinc-900 p-5 overflow-y-auto">
        <p className="text-[10px] text-zinc-600 font-mono mb-3 uppercase tracking-widest">
          Rendered Output
        </p>
        <div>{parseMarkdown(rendered)}</div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: <Type size={16} />,
    label: "Headings",
    desc: "H1–H6 with clean hierarchy",
  },
  { icon: <List size={16} />, label: "Lists", desc: "Ordered and unordered" },
  {
    icon: <Code2 size={16} />,
    label: "Code blocks",
    desc: "Syntax highlighted",
  },
  { icon: <Quote size={16} />, label: "Blockquotes", desc: "Styled callouts" },
  {
    icon: <Table2 size={16} />,
    label: "Tables",
    desc: "Full GFM table support",
  },
  {
    icon: <Zap size={16} />,
    label: "TypeScript",
    desc: "Full type definitions",
  },
];

const USAGE_CODE = `import Markdown from "showmarkdown";
import content from "./README.md?raw";

export default function App() {
  return <Markdown content={content} />;
}`;

const DEV_CODE = `git clone https://github.com/gyanaprakashkhandual/markdown.git
cd markdown
npm install
npm run dev`;

export default function ShowMarkdownPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      <div className="font-body max-w-5xl mx-auto px-5 pb-1">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="pt-20 pb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <a
              href="https://www.npmjs.com/package/showmarkdown"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-code text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <Package size={11} /> Show Markdown
            </a>
            <a
              href="https://github.com/gyanaprakashkhandual/markdown"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-code text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <Github size={11} /> github
            </a>
            <span className="text-xs font-code text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full">
              MIT
            </span>
          </div>

          <h1 className="font-display text-6xl leading-[1.08] mb-6 text-black dark:text-white">
            Show<em>Markdown</em>
          </h1>

          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg mb-10 font-light">
            A React library that renders raw Markdown into a clean, beautiful
            UI. Drop it into any React or Next.js project — no parsing logic
            needed.
          </p>

          <div className="flex items-center gap-3">
            <div className="relative group flex-1 max-w-xs">
              <pre className="font-code bg-black dark:bg-zinc-900 text-emerald-400 border border-zinc-800 rounded-xl px-5 py-3 text-sm">
                npm install showmarkdown
              </pre>
              <CopyButton text="npm install showmarkdown" />
            </div>
            <a
              href="https://github.com/gyanaprakashkhandual/markdown"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <Github size={14} /> Repository{" "}
              <ExternalLink size={11} className="text-zinc-400" />
            </a>
          </div>
        </motion.div>

        <AnimatedSection delay={0.1}>
          <div className="mb-16">
            <p className="text-[11px] font-code text-zinc-400 uppercase tracking-widest mb-5">
              Live preview
            </p>
            <LivePreview />
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-3 text-center">
              Left: raw Markdown string → Right: rendered output from{" "}
              <code className="font-code">{"<Markdown content={...} />"}</code>
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <div className="mb-16 border-t border-zinc-100 dark:border-zinc-900 pt-14">
            <p className="text-[11px] font-code text-zinc-400 uppercase tracking-widest mb-8">
              Usage
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
              Pass any raw Markdown string to the{" "}
              <code className="font-code text-black dark:text-white text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                content
              </code>{" "}
              prop. The component handles the rest.
            </p>
            <CodeBlock code={USAGE_CODE} lang="tsx" />

            <div className="mt-8 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-xs font-code text-zinc-500">Props</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900">
                    <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium">
                      Prop
                    </th>
                    <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium">
                      Type
                    </th>
                    <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium">
                      Required
                    </th>
                    <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-5 py-4">
                      <code className="font-code text-xs text-black dark:text-white">
                        content
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <code className="font-code text-xs text-blue-600 dark:text-blue-400">
                        string
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Yes
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      Raw Markdown string to render
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="mb-16 border-t border-zinc-100 dark:border-zinc-900 pt-14">
            <p className="text-[11px] font-code text-zinc-400 uppercase tracking-widest mb-8">
              Features
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group"
                >
                  <div className="text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors mb-3">
                    {f.icon}
                  </div>
                  <p className="text-sm font-medium text-black dark:text-white mb-0.5">
                    {f.label}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["React 19", "Next.js", "TypeScript"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-code border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="mb-16 border-t border-zinc-100 dark:border-zinc-900 pt-14">
            <p className="text-[11px] font-code text-zinc-400 uppercase tracking-widest mb-8">
              Development
            </p>
            <CodeBlock code={DEV_CODE} lang="bash" className="mb-5" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
              To build the library:
            </p>
            <CodeBlock code="npm run build" lang="bash" />
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-[11px] font-code text-zinc-400 uppercase tracking-widest mb-4">
                  Contributing
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                  Contributions are welcome. Read{" "}
                  <a
                    href="https://github.com/gyanaprakashkhandual/markdown"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black dark:text-white underline underline-offset-2"
                  >
                    CONTRIBUTING.md
                  </a>{" "}
                  before opening a pull request.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-1">
                  MIT License
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                  Built by{" "}
                  <span className="text-black dark:text-white font-medium">
                    Gyana Prakash Khandual
                  </span>
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
