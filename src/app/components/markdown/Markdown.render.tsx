"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { parseMarkdown } from "./parseMarkdown";
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
        className={`notion-md max-w-7xl mx-auto px-6 py-10 font-notion text-[#37352f] dark:text-[#cdd6f4] bg-white dark:bg-gray-950 ${className}`}
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

export { parseMarkdown } from "./parseMarkdown";
export { renderInline } from "./renderinline";
export { CodeBlock } from "./Codeblock";
export { TableOfContents } from "./Table";
export { HeadingBlock, BlockquoteBlock, TableBlock, ListBlock, DetailsBlock } from "./blocks";
export * from "./types";
export { slugify, syntaxHighlight } from "./utils";
export { getLangIcon } from "./langicons";