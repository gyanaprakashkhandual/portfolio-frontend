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
          className="px-1.5 py-0.5 rounded-md text-[0.85em] font-mono bg-[#f1f0ef] dark:bg-[#2d2d3f] text-[#eb5757] dark:text-[#f28779] border border-[#e3e2e0] dark:border-[#3d3d52]"
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
          className="font-semibold text-[#37352f] dark:text-[#cdd6f4]"
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
          className="line-through text-[#9b9a97] dark:text-[#6c7086]"
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
          className="bg-[#fef9c3] dark:bg-[#3d3000] text-[#37352f] dark:text-[#cdd6f4] px-0.5 rounded-sm"
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
          className="px-1.5 py-0.5 text-xs font-mono rounded-md bg-[#f7f6f3] dark:bg-[#2d2d3f] border border-[#d0cec8] dark:border-[#3d3d52] border-b-2 text-[#37352f] dark:text-[#cdd6f4] shadow-sm"
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
            className="max-w-full rounded-lg border border-[#e3e2e0] dark:border-[#2d2d3f] shadow-sm"
          />
          {m[1] && (
            <span className="block text-center text-xs text-[#9b9a97] dark:text-[#6c7086] mt-2 italic">
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
          className="text-[#2383e2] dark:text-[#569cd6] hover:underline underline-offset-2 inline-flex items-center gap-0.5 group/link"
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
          className="text-[#2383e2] dark:text-[#569cd6] hover:underline cursor-pointer"
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
            className="text-[#2383e2] dark:text-[#569cd6] hover:underline text-xs"
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
          className="text-[#2383e2] dark:text-[#569cd6] hover:underline underline-offset-2 inline-flex items-center gap-0.5"
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
