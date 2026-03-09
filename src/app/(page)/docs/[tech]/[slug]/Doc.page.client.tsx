"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import MarkdownRenderer from "@/app/components/markdown/Markdown.render";


interface DocPageClientProps {
  content: string;
  fileName: string;
  techSlug: string;
  docSlug: string;
  prevItem: { label: string; slug: string } | null;
  nextItem: { label: string; slug: string } | null;
}

export default function DocPageClient({ content }: DocPageClientProps) {
  

  return (
    <>
      
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col min-h-full"
      >
        {/* Markdown content */}
        <div className="flex-1 max-w-6xl mx-auto px-6 py-8 pr-72">
          <MarkdownRenderer content={content} />
        </div>
      </motion.div>
    </>
  );
}
