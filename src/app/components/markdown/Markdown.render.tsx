"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { parseMarkdown } from "./Parse.markdown";
import { TableOfContents } from "./Table";
import { MarkdownRendererProps } from "./types";

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const nodes = useMemo(() => parseMarkdown(content), [content]);

  return (
    <>
      <TableOfContents content={content} />
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`max-w-7xl mx-auto px-6 py-10 text-stone-800 dark:text-slate-100 bg-white dark:bg-slate-950 ${className}`}
        style={{
          fontFamily:
            '"Söhne", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        {nodes}
      </motion.article>
    </>
  );
}

export { parseMarkdown } from "./Parse.markdown";
export { renderInline } from "./Render.inline";
export { CodeBlock } from "./Code.block";
export { TableOfContents } from "./Table";
export { HeadingBlock, BlockquoteBlock, TableBlock, ListBlock, DetailsBlock } from "./blocks";
export * from "./types";
export { slugify, syntaxHighlight } from "./utils";
export { getLangIcon } from "./Lang.icons";