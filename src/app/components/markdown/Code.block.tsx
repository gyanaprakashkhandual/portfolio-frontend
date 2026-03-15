"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { getLangIcon } from "./Lang.icons";
import { syntaxHighlight } from "./utils";
import { CodeBlockProps } from "./types";

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lang = language.toLowerCase().trim();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const lines = decodeHtmlEntities(code).split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group my-4 rounded-lg overflow-hidden border border-gray-300 dark:border-slate-700 bg-slate-950 shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            {getLangIcon(lang)}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono tracking-wide uppercase">
              {lang || "plain text"}
            </span>
          </div>
        </div>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-150 font-medium"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                className="flex items-center gap-1 text-green-400"
              >
                <Check size={12} />
                Copied!
              </motion.span>
            ) : (
              <motion.span key="copy" className="flex items-center gap-1">
                <Copy size={12} />
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="overflow-x-auto pt-2 pb-2">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-slate-800/30">
                <td className="select-none text-right text-slate-600 text-xs px-3 py-0 font-mono w-10 min-w-10 border-r border-slate-700">
                  {i + 1}
                </td>
                <td className="px-4 py-0 font-mono text-[13px] leading-6 text-slate-200 whitespace-pre">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlight(line, lang),
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}