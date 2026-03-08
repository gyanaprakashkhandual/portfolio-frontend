"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MarkdownRenderer from "@/app/components/markdown/Markdown.render";

interface DocPageClientProps {
  content: string;
  fileName: string;
  techSlug: string;
  docSlug: string;
  prevItem: { label: string; slug: string } | null;
  nextItem: { label: string; slug: string } | null;
}

export default function DocPageClient({
  content,
  fileName,
  techSlug,
  docSlug,
  prevItem,
  nextItem,
}: DocPageClientProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col min-h-full"
    >
      {/* Doc file label */}
      <div className="flex items-center gap-2 px-6 pt-6 pb-0">
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          {fileName}
        </span>
      </div>

      {/* Markdown content */}
      <div className="flex-1">
        <MarkdownRenderer content={content} />
      </div>

      {/* Prev / Next navigation */}
      {(prevItem || nextItem) && (
        <div className="flex items-center justify-between gap-4 px-6 py-8 border-t border-gray-200 dark:border-gray-800 mt-4">
          {prevItem ? (
            <button
              onClick={() => router.push(`/docs/${techSlug}/${prevItem.slug}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-150 group max-w-[45%]"
            >
              <ChevronLeft className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" strokeWidth={2} />
              <div className="min-w-0 text-left">
                <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-wider font-semibold mb-0.5">Previous</p>
                <p className="text-sm font-medium truncate">{prevItem.label}</p>
              </div>
            </button>
          ) : <div />}

          {nextItem ? (
            <button
              onClick={() => router.push(`/docs/${techSlug}/${nextItem.slug}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-150 group max-w-[45%]"
            >
              <div className="min-w-0 text-right">
                <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-wider font-semibold mb-0.5">Next</p>
                <p className="text-sm font-medium truncate">{nextItem.label}</p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" strokeWidth={2} />
            </button>
          ) : <div />}
        </div>
      )}
    </motion.div>
  );
}