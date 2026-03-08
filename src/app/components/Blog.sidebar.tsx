/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  SlidersHorizontal,
  Check,
  Loader2,
  Tag,
  Calendar,
} from "lucide-react";

const BASE_URL = "http://localhost:5000/api/blogs";

interface Blog {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  coverImage: string | null;
  fileName: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filtered, setFiltered] = useState<Blog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [allTags, setAllTags] = useState<string[]>([]);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    fetch(BASE_URL)
      .then((r) => r.json())
      .then((res) => {
        const data: Blog[] = res.data ?? [];
        setBlogs(data);
        setFiltered(data);
        const tags = Array.from(new Set(data.flatMap((b) => b.tags))).sort();
        setAllTags(tags);
      })
      .catch(() => setError("Failed to load blogs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      blogs.filter((b) => {
        const matchesQuery =
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q));
        const matchesTags =
          activeTags.size === 0 || b.tags.some((t) => activeTags.has(t));
        return matchesQuery && matchesTags;
      }),
    );
  }, [query, blogs, activeTags]);

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  return (
    <aside className="w-72 shrink-0 flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-200 dark:border-gray-800">
        {/* Search + Filter row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none"
              strokeWidth={1.8}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="w-full pl-9 pr-8 py-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-0 focus:border-transparent transition-all duration-150"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Filter button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`relative w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-150 ${
                filterOpen
                  ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900"
                  : activeTags.size > 0
                    ? "bg-gray-100 dark:bg-gray-800 border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
              {activeTags.size > 0 && !filterOpen && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold flex items-center justify-center leading-none">
                  {activeTags.size}
                </span>
              )}
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/60 dark:shadow-black/50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Filter by Tag
                    </span>
                    {activeTags.size > 0 && (
                      <button
                        onClick={() => setActiveTags(new Set())}
                        className="text-[11px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1.5 px-1.5">
                    {allTags.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-4">
                        No tags available
                      </p>
                    ) : (
                      allTags.map((tag) => {
                        const isActive = activeTags.has(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-100 ${
                              isActive
                                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Tag
                                className="w-3 h-3 shrink-0"
                                strokeWidth={1.8}
                              />
                              <span className="truncate text-left text-[12px] font-medium capitalize">
                                {tag}
                              </span>
                            </div>
                            {isActive && (
                              <Check
                                className="w-3 h-3 shrink-0"
                                strokeWidth={2.5}
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {activeTags.size > 0 && (
                    <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
                        {activeTags.size} tag{activeTags.size !== 1 ? "s" : ""}{" "}
                        · {filtered.length} post
                        {filtered.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Active tag pills */}
        <AnimatePresence>
          {activeTags.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-wrap gap-1 mt-2.5 overflow-hidden"
            >
              {Array.from(activeTags).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-75 transition-opacity"
                >
                  {tag}
                  <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Blog list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-600 animate-spin" />
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Loading posts…
            </p>
          </div>
        )}

        {error && (
          <div className="mx-2 my-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
            <p className="text-center text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 px-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center mb-1">
              <Search
                className="w-4 h-4 text-gray-400 dark:text-gray-600"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No posts found
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
              Try a different search or filter
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {filtered.map((blog, i) => {
            const isActive = pathname === `/blogs/${blog.slug}`;
            return (
              <motion.button
                key={blog.slug}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                onClick={() => router.push(`/blogs/${blog.slug}`)}
                className={`w-full text-left px-3 py-3 rounded-xl mb-1 group transition-all duration-150 ${
                  isActive
                    ? "bg-gray-900 dark:bg-gray-900 border border-gray-900 dark:border-white shadow-sm"
                    : "bg-transparent border border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700"
                }`}
              >
                {/* Title */}
                <p
                  className={`text-sm font-semibold leading-snug mb-1 transition-colors line-clamp-2 ${
                    isActive
                      ? "text-white dark:text-white"
                      : "text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white"
                  }`}
                >
                  {blog.title}
                </p>

                {/* Description */}
                <p
                  className={`text-xs leading-relaxed line-clamp-2 mb-2 ${
                    isActive
                      ? "text-gray-300 dark:text-gray-300"
                      : "text-gray-500 dark:text-gray-300"
                  }`}
                >
                  {blog.description}
                </p>

                {/* Date + Tags row */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex items-center gap-1 text-[10px] ${
                      isActive
                        ? "text-gray-300 dark:text-gray-300"
                        : "text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    <Calendar className="w-2.5 h-2.5" strokeWidth={2} />
                    {formatDate(blog.date)}
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {blog.tags.slice(0, 2).map((tag) => {
                      const isTagActive = activeTags.has(tag);
                      return (
                        <span
                          key={tag}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium border transition-colors duration-150 ${
                            isActive
                              ? isTagActive
                                ? "bg-white text-gray-900 dark:bg-gray-900 dark:text-white border-white dark:border-gray-900"
                                : "bg-white/10 dark:bg-black/10 text-gray-200 dark:text-gray-700 border-white/20 dark:border-black/10"
                              : isTagActive
                                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center">
          {!loading && !error
            ? `${blogs.length} post${blogs.length !== 1 ? "s" : ""}`
            : ""}
        </p>
      </div>
    </aside>
  );
}
