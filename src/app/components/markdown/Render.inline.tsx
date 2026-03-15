"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

export function renderInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: [RegExp, (match: RegExpMatchArray) => React.ReactNode][] = [
    [
      /`([^`]+)`/,
      (m) => (
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded-md text-[0.85em] font-mono bg-gray-200 dark:bg-slate-800 text-red-600 dark:text-red-400 border border-gray-300 dark:border-slate-700"
        >
          {m[1]}
        </code>
      ),
    ],
    [
      /\*\*\*(.+?)\*\*\*/,
      (m) => (
        <strong key={key++}>
          <em>{renderInline(m[1])}</em>
        </strong>
      ),
    ],
    [
      /\*\*(.+?)\*\*/,
      (m) => (
        <strong
          key={key++}
          className="font-semibold text-stone-800 dark:text-slate-100"
        >
          {renderInline(m[1])}
        </strong>
      ),
    ],
    [
      /\*(.+?)\*/,
      (m) => (
        <em key={key++} className="italic">
          {renderInline(m[1])}
        </em>
      ),
    ],
    [
      /___(.+?)___/,
      (m) => (
        <strong key={key++}>
          <em>{renderInline(m[1])}</em>
        </strong>
      ),
    ],
    [
      /__(.+?)__/,
      (m) => (
        <strong key={key++} className="font-semibold">
          {renderInline(m[1])}
        </strong>
      ),
    ],
    [/_(.+?)_/, (m) => <em key={key++}>{renderInline(m[1])}</em>],
    [
      /~~(.+?)~~/,
      (m) => (
        <del
          key={key++}
          className="line-through text-stone-400 dark:text-stone-500"
        >
          {renderInline(m[1])}
        </del>
      ),
    ],
    [
      /==(.+?)==/,
      (m) => (
        <mark
          key={key++}
          className="bg-yellow-100 dark:bg-yellow-950 text-stone-800 dark:text-slate-100 px-0.5 rounded-sm"
        >
          {m[1]}
        </mark>
      ),
    ],
    [
      /\^(.+?)\^/,
      (m) => (
        <sup key={key++} className="text-xs">
          {m[1]}
        </sup>
      ),
    ],
    [
      /~(.+?)~/,
      (m) => (
        <sub key={key++} className="text-xs">
          {m[1]}
        </sub>
      ),
    ],
    [
      /<kbd>(.+?)<\/kbd>/,
      (m) => (
        <kbd
          key={key++}
          className="px-1.5 py-0.5 text-xs font-mono rounded-md bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 border-b-2 text-stone-800 dark:text-slate-100 shadow-sm"
        >
          {m[1]}
        </kbd>
      ),
    ],
    [
      /!\[([^\]]*)\]\(([^)]+)\)/,
      (m) => (
        <span key={key++} className="block my-4">
          <img
            src={m[2]}
            alt={m[1]}
            className="max-w-full rounded-lg border border-gray-300 dark:border-slate-700 shadow-sm"
          />
          {m[1] && (
            <span className="block text-center text-xs text-stone-400 dark:text-stone-500 mt-2 italic">
              {m[1]}
            </span>
          )}
        </span>
      ),
    ],
    [
      /\[([^\]]+)\]\(([^)"]+)(?:\s+"([^"]*)")?\)/,
      (m) => (
        <a
          key={key++}
          href={m[2]}
          title={m[3]}
          target={m[2].startsWith("http") ? "_blank" : undefined}
          rel={m[2].startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-0.5 group/link"
        >
          {m[1]}
          {m[2].startsWith("http") && (
            <ExternalLink
              size={11}
              className="opacity-0 group-hover/link:opacity-60 transition-opacity"
            />
          )}
        </a>
      ),
    ],
    [
      /\[([^\]]+)\]\[([^\]]*)\]/,
      (m) => (
        <span
          key={key++}
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          {m[1]}
        </span>
      ),
    ],
    [
      /\[\^(\w+)\]/,
      (m) => (
        <sup key={key++}>
          <a
            href={`#fn-${m[1]}`}
            className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
          >
            [{m[1]}]
          </a>
        </sup>
      ),
    ],
    [
      /(?<!\[)(https?:\/\/[^\s<>"]+)/,
      (m) => (
        <a
          key={key++}
          href={m[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 inline-flex items-center gap-0.5"
        >
          {m[1]}
          <ExternalLink size={11} className="opacity-60" />
        </a>
      ),
    ],
    [
      /&(amp|lt|gt|quot|copy|reg|trade|mdash|ndash|hellip|nbsp);/,
      (m) => {
        const entities: Record<string, string> = {
          amp: "&",
          lt: "<",
          gt: ">",
          quot: '"',
          copy: "©",
          reg: "®",
          trade: "™",
          mdash: "—",
          ndash: "–",
          hellip: "…",
          nbsp: "\u00A0",
        };
        return <span key={key++}>{entities[m[1]] || m[0]}</span>;
      },
    ],
  ];

  while (remaining.length > 0) {
    let earliest: {
      index: number;
      match: RegExpMatchArray;
      node: React.ReactNode;
    } | null = null;

    for (const [pattern, render] of patterns) {
      const match = remaining.match(pattern);
      if (match && match.index !== undefined) {
        if (!earliest || match.index < earliest.index) {
          earliest = { index: match.index, match, node: render(match) };
        }
      }
    }

    if (!earliest) {
      result.push(remaining);
      break;
    }

    if (earliest.index > 0) {
      result.push(remaining.slice(0, earliest.index));
    }
    result.push(earliest.node);
    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  return result;
}
