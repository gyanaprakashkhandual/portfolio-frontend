"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, ChevronRight, Check } from "lucide-react";
import { renderInline } from "./renderinline";
import { ListItem } from "./types";

export function HeadingBlock({ level, text, id }: { level: number; text: string; id: string }) {
  const [hovered, setHovered] = useState(false);

  const sizeMap: Record<number, string> = {
    1: "text-3xl font-bold mt-8 mb-1 tracking-tight",
    2: "text-2xl font-semibold mt-6 mb-1 tracking-tight",
    3: "text-xl font-semibold mt-5 mb-1",
    4: "text-lg font-semibold mt-4 mb-1",
    5: "text-base font-semibold mt-3 mb-1",
    6: "text-sm font-semibold mt-3 mb-1 text-[#9b9a97] dark:text-[#6c7086]",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      id={id}
      className={`group relative flex items-center gap-2 text-[#37352f] dark:text-[#cdd6f4] ${sizeMap[level]}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.a
            href={`#${id}`}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -left-6 text-[#9b9a97] dark:text-[#6c7086] hover:text-[#37352f] dark:hover:text-[#cdd6f4] transition-colors"
          >
            <Hash size={14} />
          </motion.a>
        )}
      </AnimatePresence>
      {renderInline(text)}
    </Tag>
  );
}

export function BlockquoteBlock({ content }: { content: string }) {
  const { parseMarkdown } = require("./parseMarkdown");
  const firstLine = content.split("\n")[0];
  const calloutTypes: Record<string, { bg: string; border: string }> = {
    "💡": { bg: "bg-[#fef9c3] dark:bg-[#3d3000]", border: "border-[#fde68a] dark:border-[#7a6000]" },
    "⚠️": { bg: "bg-[#fff7ed] dark:bg-[#3d1f00]", border: "border-[#fed7aa] dark:border-[#7a3f00]" },
    "❌": { bg: "bg-[#fef2f2] dark:bg-[#3d0000]", border: "border-[#fecaca] dark:border-[#7a0000]" },
    "✅": { bg: "bg-[#f0fdf4] dark:bg-[#003d10]", border: "border-[#bbf7d0] dark:border-[#007a20]" },
    "📌": { bg: "bg-[#eff6ff] dark:bg-[#00103d]", border: "border-[#bfdbfe] dark:border-[#00207a]" },
    "🔥": { bg: "bg-[#fff7ed] dark:bg-[#3d1500]", border: "border-[#fdba74] dark:border-[#7a2a00]" },
    "ℹ️": { bg: "bg-[#eff6ff] dark:bg-[#00103d]", border: "border-[#bfdbfe] dark:border-[#00207a]" },
  };

  let callout: { bg: string; border: string } | null = null;
  for (const [emoji, styles] of Object.entries(calloutTypes)) {
    if (firstLine.includes(emoji)) {
      callout = styles;
      break;
    }
  }

  if (callout) {
    return (
      <div className={`my-3 px-4 py-3 rounded-lg border ${callout.bg} ${callout.border} text-[#37352f] dark:text-[#cdd6f4]`}>
        {parseMarkdown(content)}
      </div>
    );
  }

  return (
    <blockquote className="my-3 pl-4 border-l-[3px] border-[#d0cec8] dark:border-[#3d3d52] text-[#5f5e5b] dark:text-[#a6adc8]">
      {parseMarkdown(content)}
    </blockquote>
  );
}

export function TableBlock({ lines }: { lines: string[] }) {
  const parseRow = (line: string): string[] =>
    line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

  const parseAlignments = (line: string): ("left" | "center" | "right" | "none")[] =>
    parseRow(line).map((cell) => {
      if (/^:-+:$/.test(cell)) return "center";
      if (/^-+:$/.test(cell)) return "right";
      if (/^:-+$/.test(cell)) return "left";
      return "none";
    });

  if (lines.length < 2) return null;

  const headers = parseRow(lines[0]);
  const alignments = parseAlignments(lines[1]);
  const rows = lines.slice(2).map(parseRow);

  const alignClass = (a: string) => {
    if (a === "center") return "text-center";
    if (a === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-[#e3e2e0] dark:border-[#2d2d3f]">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#f7f6f3] dark:bg-[#181825]">
            {headers.map((h, hi) => (
              <th key={hi} className={`px-4 py-2.5 font-semibold text-[#37352f] dark:text-[#cdd6f4] border-b border-[#e3e2e0] dark:border-[#2d2d3f] ${alignClass(alignments[hi])}`}>
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`border-b border-[#f1f0ef] dark:border-[#2d2d3f] ${ri % 2 === 0 ? "bg-white dark:bg-[#1e1e2e]" : "bg-[#fafaf9] dark:bg-[#181825]"} hover:bg-[#f7f6f3] dark:hover:bg-[#2d2d3f] transition-colors`}>
              {headers.map((_, ci) => (
                <td key={ci} className={`px-4 py-2.5 text-[#5f5e5b] dark:text-[#a6adc8] ${alignClass(alignments[ci])}`}>
                  {renderInline(row[ci] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ListBlock({ lines, ordered }: { lines: string[]; ordered: boolean }) {
  const parseItems = (ls: string[]): ListItem[] => {
    const items: ListItem[] = [];
    const stack: ListItem[] = [];

    for (const line of ls) {
      if (line.trim() === "") continue;

      const unorderedMatch = line.match(/^(\s*)[-*+]\s+(\[[ xX]\]\s+)?(.*)$/);
      const orderedMatch = line.match(/^(\s*)\d+\.\s+(\[[ xX]\]\s+)?(.*)$/);
      const match = unorderedMatch || orderedMatch;

      if (!match) {
        if (stack.length > 0) {
          stack[stack.length - 1].text += " " + line.trim();
        }
        continue;
      }

      const depth = match[1].length;
      const checkStr = match[2];
      const text = match[3];
      const checked =
        checkStr != null
          ? checkStr.trim().toLowerCase() === "[x]" || checkStr.trim().toLowerCase() === "[x] "
            ? true
            : false
          : null;

      const item: ListItem = { depth, text, checked, children: [] };

      while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
        stack.pop();
      }

      if (stack.length === 0) {
        items.push(item);
      } else {
        stack[stack.length - 1].children.push(item);
      }

      stack.push(item);
    }

    return items;
  };

  const renderItems = (items: ListItem[], ord: boolean, depth = 0): React.ReactNode => {
    const Tag = ord ? "ol" : "ul";
    return (
      <Tag className={`my-1 space-y-0.5 ${depth === 0 ? "my-3" : "mt-1 ml-5"} ${ord ? "list-decimal list-inside" : ""}`}>
        {items.map((item, idx) => {
          const isTask = item.checked !== null;
          return (
            <li
              key={idx}
              className={`flex items-start gap-2 leading-7 text-[#37352f] dark:text-[#cdd6f4] ${
                !ord && !isTask ? "before:content-['•'] before:text-[#9b9a97] dark:before:text-[#6c7086] before:mt-0.5 before:shrink-0" : ""
              }`}
            >
              {isTask && (
                <div className={`mt-1.5 w-4 h-4 rounded shrink-0 flex items-center justify-center border-2 transition-colors ${
                  item.checked ? "bg-[#2383e2] border-[#2383e2]" : "border-[#c7c6c4] dark:border-[#3d3d52] bg-white dark:bg-[#1e1e2e]"
                }`}>
                  {item.checked && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
              )}
              <div className={`flex-1 ${item.checked ? "line-through text-[#9b9a97] dark:text-[#6c7086]" : ""}`}>
                <span>{renderInline(item.text)}</span>
                {item.children.length > 0 && renderItems(item.children, ord, depth + 1)}
              </div>
            </li>
          );
        })}
      </Tag>
    );
  };

  const items = parseItems(lines);
  return <div>{renderItems(items, ordered)}</div>;
}

export function DetailsBlock({ summary, content }: { summary: string; content: string }) {
  const { parseMarkdown } = require("./parseMarkdown");
  const [open, setOpen] = useState(false);

  return (
    <div className="my-3 border border-[#e3e2e0] dark:border-[#2d2d3f] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left bg-[#f7f6f3] dark:bg-[#181825] hover:bg-[#f1f0ef] dark:hover:bg-[#2d2d3f] transition-colors"
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight size={14} className="text-[#9b9a97] dark:text-[#6c7086]" />
        </motion.span>
        <span className="text-sm font-medium text-[#37352f] dark:text-[#cdd6f4]">
          {renderInline(summary)}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 text-sm text-[#37352f] dark:text-[#cdd6f4]">
              {parseMarkdown(content)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}