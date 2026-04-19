"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar, User, BookOpen } from "lucide-react";
import { blogs } from "./data/Blogs";

const tagStyles: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  emerald:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
};

const tagDotStyles: Record<string, string> = {
  blue: "bg-blue-400 dark:bg-blue-500",
  emerald: "bg-emerald-400 dark:bg-emerald-500",
};

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-5 pt-20 pb-28">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <BookOpen size={11} className="text-zinc-400" />
            <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
              Developer guides
            </span>
          </div>

          <h1 className="text-5xl font-semibold text-black dark:text-white leading-[1.1] mb-4 tracking-tight">
            Package{" "}
            <span className="italic font-light text-zinc-400 dark:text-zinc-500">
              Guides
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-light max-w-lg leading-relaxed">
            In-depth guides for open-source packages. Drop-in documentation with
            working examples.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-900">
            <div>
              <p className="text-2xl font-semibold text-black dark:text-white">
                {blogs.length}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">Total guides</p>
            </div>
            <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
            <div>
              <p className="text-2xl font-semibold text-black dark:text-white">
                {Array.from(new Set(blogs.map((b) => b.tag))).length}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">Topics</p>
            </div>
            <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex -space-x-2">
              {Array.from(new Set(blogs.map((b) => b.author)))
                .slice(0, 4)
                .map((author, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 flex items-center justify-center"
                  >
                    <span className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {author
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Blog list */}
        <div className="space-y-3">
          {blogs.map((blog, i) => (
            <motion.div
              key={blog.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.08 + 0.2,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link href={`/blogs/${blog.slug}`} className="group block">
                <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 bg-white dark:bg-zinc-950 overflow-hidden">
                  {/* Hover bg fill */}
                  <motion.div
                    className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"
                    aria-hidden
                  />

                  <div className="relative flex items-start justify-between gap-6">
                    {/* Index number */}
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mt-0.5">
                      <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                        <span
                          className={`text-[11px] border px-2.5 py-0.5 rounded-full uppercase tracking-wider font-medium flex items-center gap-1.5 ${tagStyles[blog.tagColor]}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${tagDotStyles[blog.tagColor]}`}
                          />
                          {blog.tag}
                        </span>

                        <span className="text-zinc-200 dark:text-zinc-700 text-xs">
                          ·
                        </span>

                        <span className="text-xs text-zinc-400 dark:text-zinc-600 flex items-center gap-1">
                          <Calendar size={10} />
                          {blog.date}
                        </span>

                        <span className="text-zinc-200 dark:text-zinc-700 text-xs">
                          ·
                        </span>

                        <span className="text-xs text-zinc-400 dark:text-zinc-600 flex items-center gap-1">
                          <Clock size={10} />
                          {blog.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-semibold text-black dark:text-white mb-2 leading-snug tracking-tight group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                        {blog.title}
                      </h2>

                      {/* Description */}
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 max-w-xl">
                        {blog.description}
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <User size={10} className="text-zinc-400" />
                        </div>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {blog.author}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="shrink-0 mt-1">
                      <div className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-black dark:group-hover:border-white group-hover:bg-black dark:group-hover:bg-white transition-all duration-200">
                        <ArrowRight
                          size={13}
                          className="text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-all duration-200 group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
