/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, ChevronRight, Check } from "lucide-react";
import { renderInline } from "./Render.inline";
import { ListItem } from "./types";
import { JSX } from "react/jsx-dev-runtime";

export function HeadingBlock({ level, text, id }: { level: number; text: string; id: string }) {
  const [hovered, setHovered] = useState(false);

  const sizeMap: Record<number, string> = {
    1: "text-3xl font-bold mt-8 mb-1 tracking-tight",
    2: "text-2xl font-semibold mt-6 mb-1 tracking-tight",
    3: "text-xl font-semibold mt-5 mb-1",
    4: "text-lg font-semibold mt-4 mb-1",
    5: "text-base font-semibold mt-3 mb-1",
    6: "text-sm font-semibold mt-3 mb-1 text-stone-400 dark:text-stone-500",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      id={id}
      className={`group relative flex items-center gap-2 text-stone-800 dark:text-slate-100 ${sizeMap[level]}`}
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
            className="absolute -left-6 text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-slate-100 transition-colors"
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
  const { parseMarkdown } = require("./Parse.markdown");
  const firstLine = content.split("\n")[0];
  const calloutTypes: Record<string, { bg: string; border: string }> = {
    "💡": { bg: "bg-yellow-100 dark:bg-yellow-950", border: "border-yellow-300 dark:border-yellow-900" },
    "⚠️": { bg: "bg-orange-100 dark:bg-orange-950", border: "border-orange-300 dark:border-orange-900" },
    "❌": { bg: "bg-red-100 dark:bg-red-950", border: "border-red-300 dark:border-red-900" },
    "✅": { bg: "bg-green-100 dark:bg-green-950", border: "border-green-300 dark:border-green-900" },
    "📌": { bg: "bg-blue-100 dark:bg-blue-950", border: "border-blue-300 dark:border-blue-900" },
    "🔥": { bg: "bg-orange-100 dark:bg-orange-950", border: "border-orange-400 dark:border-orange-900" },
    "ℹ️": { bg: "bg-blue-100 dark:bg-blue-950", border: "border-blue-300 dark:border-blue-900" },
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
      <div className={`my-3 px-4 py-3 rounded-lg border ${callout.bg} ${callout.border} text-stone-800 dark:text-slate-100`}>
        {parseMarkdown(content)}
      </div>
    );
  }

  return (
    <blockquote className="my-3 pl-4 border-l-[3px] border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-400">
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
    <div className="my-4 overflow-x-auto rounded-lg border border-gray-300 dark:border-slate-700">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-slate-800">
            {headers.map((h, hi) => (
              <th key={hi} className={`px-4 py-2.5 font-semibold text-stone-800 dark:text-slate-100 border-b border-gray-300 dark:border-slate-700 ${alignClass(alignments[hi])}`}>
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`border-b border-gray-200 dark:border-slate-700 ${ri % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-gray-50 dark:bg-slate-900/80"} hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors`}>
              {headers.map((_, ci) => (
                <td key={ci} className={`px-4 py-2.5 text-stone-600 dark:text-slate-400 ${alignClass(alignments[ci])}`}>
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
              className={`flex items-start gap-2 leading-7 text-stone-800 dark:text-slate-100 ${
                !ord && !isTask ? "before:content-['•'] before:text-stone-400 dark:before:text-stone-500 before:mt-0.5 before:shrink-0" : ""
              }`}
            >
              {isTask && (
                <div className={`mt-1.5 w-4 h-4 rounded shrink-0 flex items-center justify-center border-2 transition-colors ${
                  item.checked ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950"
                }`}>
                  {item.checked && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
              )}
              <div className={`flex-1 ${item.checked ? "line-through text-stone-400 dark:text-stone-500" : ""}`}>
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
  const { parseMarkdown } = require("./Parse.markdown");
  const [open, setOpen] = useState(false);

  return (
    <div className="my-3 border border-gray-300 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight size={14} className="text-stone-400 dark:text-stone-500" />
        </motion.span>
        <span className="text-sm font-medium text-stone-800 dark:text-slate-100">
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
            <div className="px-4 py-3 text-sm text-stone-800 dark:text-slate-100">
              {parseMarkdown(content)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}