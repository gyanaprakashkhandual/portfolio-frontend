"use client";

import React from "react";
import { CodeBlock } from "./Code.block";
import { renderInline } from "./Render.inline";
import { HeadingBlock, BlockquoteBlock, TableBlock, ListBlock, DetailsBlock } from "./blocks";
import { slugify } from "./utils";

export function parseMarkdown(markdown: string): React.ReactNode[] {
  const lines = markdown.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let nodeKey = 0;
  const nk = () => nodeKey++;

  const footnotes: Record<string, string> = {};
  const referenceLinks: Record<string, { href: string; title?: string }> = {};

  for (const line of lines) {
    const fn = line.match(/^\[\^(\w+)\]:\s*(.+)/);
    if (fn) footnotes[fn[1]] = fn[2];
    const rl = line.match(/^\[(\w+)\]:\s*(\S+)(?:\s+"([^"]*)")?/);
    if (rl) referenceLinks[rl[1]] = { href: rl[2], title: rl[3] };
  }

  while (i < lines.length) {
    const line = lines[i];

    if (/^\[\^[\w]+\]:/.test(line) || /^\[[\w]+\]:/.test(line)) {
      i++;
      continue;
    }

    if (/^\*\[.+\]:/.test(line)) {
      i++;
      continue;
    }

    if (line.trim().startsWith("<details>")) {
      const contentLines: string[] = [];
      let summaryText = "";
      i++;
      if (lines[i]?.trim().startsWith("<summary>")) {
        summaryText = lines[i].replace(/<\/?summary>/g, "").trim();
        i++;
      }
      while (i < lines.length && !lines[i].trim().startsWith("</details>")) {
        contentLines.push(lines[i]);
        i++;
      }
      i++;
      nodes.push(<DetailsBlock key={nk()} summary={summaryText} content={contentLines.join("\n")} />);
      continue;
    }

    const fenceMatch = line.match(/^(`{3,}|~{3,})([\w-]*)/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const lang = fenceMatch[2] || "text";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      nodes.push(<CodeBlock key={nk()} code={codeLines.join("\n")} language={lang} />);
      continue;
    }

    if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
      nodes.push(<hr key={nk()} className="my-6 border-none h-px bg-gray-300 dark:bg-slate-700" />);
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const id = slugify(text.replace(/[*_`]/g, ""));
      nodes.push(<HeadingBlock key={nk()} level={level} text={text} id={id} />);
      i++;
      continue;
    }

    if (i + 1 < lines.length) {
      if (/^={3,}\s*$/.test(lines[i + 1]) && line.trim()) {
        const id = slugify(line.replace(/[*_`]/g, ""));
        nodes.push(<HeadingBlock key={nk()} level={1} text={line} id={id} />);
        i += 2;
        continue;
      }
      if (/^-{3,}\s*$/.test(lines[i + 1]) && line.trim() && !/^\s*[-*+]/.test(line)) {
        const id = slugify(line.replace(/[*_`]/g, ""));
        nodes.push(<HeadingBlock key={nk()} level={2} text={line} id={id} />);
        i += 2;
        continue;
      }
    }

    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith(">") || lines[i].trim() === "")) {
        if (lines[i].startsWith(">")) quoteLines.push(lines[i]);
        else if (quoteLines.length > 0) quoteLines.push("");
        i++;
      }
      const content = quoteLines.map((l) => l.replace(/^>\s?/, "")).join("\n");
      nodes.push(<BlockquoteBlock key={nk()} content={content} />);
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && /^\|?[\s:|-]+\|/.test(lines[i + 1])) {
      const tableLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      nodes.push(<TableBlock key={nk()} lines={tableLines} />);
      continue;
    }

    if (/^(\s*)[-*+]\s/.test(line)) {
      const listLines: string[] = [];
      while (
        i < lines.length &&
        (/^(\s*)[-*+]\s/.test(lines[i]) || /^\s{2,}/.test(lines[i]) || lines[i].trim() === "")
      ) {
        if (lines[i].trim() !== "" || listLines.length > 0) {
          listLines.push(lines[i]);
        }
        i++;
      }
      nodes.push(<ListBlock key={nk()} lines={listLines} ordered={false} />);
      continue;
    }

    if (/^(\s*)\d+\.\s/.test(line)) {
      const listLines: string[] = [];
      while (
        i < lines.length &&
        (/^\s*\d+\.\s/.test(lines[i]) || /^\s{3,}/.test(lines[i]) || lines[i].trim() === "")
      ) {
        if (lines[i].trim() !== "" || listLines.length > 0) {
          listLines.push(lines[i]);
        }
        i++;
      }
      nodes.push(<ListBlock key={nk()} lines={listLines} ordered={true} />);
      continue;
    }

    if (i + 1 < lines.length && lines[i + 1].match(/^:\s+/)) {
      const term = line.trim();
      const defs: string[] = [];
      i++;
      while (i < lines.length && lines[i].match(/^:\s+/)) {
        defs.push(lines[i].replace(/^:\s+/, ""));
        i++;
      }
      nodes.push(
        <dl key={nk()} className="my-3">
          <dt className="font-semibold text-stone-800 dark:text-slate-100">{renderInline(term)}</dt>
          {defs.map((d, di) => (
            <dd key={di} className="ml-4 text-stone-600 dark:text-slate-400 before:content-['\u2b33_']">
              {renderInline(d)}
            </dd>
          ))}
        </dl>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{1,6}\s/) &&
      !lines[i].match(/^(`{3,}|~{3,})/) &&
      !lines[i].startsWith(">") &&
      !/^(\s*[-*+]|\d+\.)\s/.test(lines[i]) &&
      !/^(\s*[-*_]){3,}\s*$/.test(lines[i]) &&
      !lines[i].includes("|") &&
      !lines[i].trim().startsWith("<details>") &&
      !lines[i].match(/^\[\^[\w]+\]:/) &&
      !lines[i].match(/^\[[\w]+\]:/) &&
      !lines[i].match(/^\*\[/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      const paraText = paraLines.join("\n").replace(/  \n/g, "\n");
      const segments = paraText.split(/\n/);
      nodes.push(
        <p key={nk()} className="my-2 leading-7 text-stone-800 dark:text-slate-100">
          {segments.map((seg, si) => (
            <React.Fragment key={si}>
              {renderInline(seg)}
              {si < segments.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>,
      );
    }
  }

  if (Object.keys(footnotes).length > 0) {
    nodes.push(
      <div key={nk()} className="mt-8 pt-4 border-t border-gray-300 dark:border-slate-700">
        <p className="text-xs font-medium text-stone-400 dark:text-stone-500 mb-2 uppercase tracking-wider">
          Footnotes
        </p>
        <ol className="text-sm text-stone-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
          {Object.entries(footnotes).map(([ref, text]) => (
            <li key={ref} id={`fn-${ref}`} className="leading-6">
              {renderInline(text)}
            </li>
          ))}
        </ol>
      </div>,
    );
  }

  return nodes;
}