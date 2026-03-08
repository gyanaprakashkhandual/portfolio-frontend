"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Tag,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  User,
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
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
      <div className="h-5 w-4/5 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
      <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
      <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
      <div className="flex justify-between pt-1">
        <div className="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function BlogIndexPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(BASE_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => setBlogs(res.data ?? []))
      .catch((e) => setError(e.message ?? "Failed to load blogs."))
      .finally(() => setLoading(false));
  }, []);

  const allTags = [...new Set(blogs.flatMap((b) => b.tags))];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950 main-scrollbar">
      {/* Top bar */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium mb-0.5">
          Writing
        </p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          Blog Posts
        </h1>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center">
                <AlertTriangle
                  className="w-5 h-5 text-red-500 dark:text-red-400"
                  strokeWidth={1.8}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  {error}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  Check that the backend is running on port 5000.
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && blogs.length > 0 && (
            <div>
              {/* Summary strip */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-6 mb-8 px-1 flex-wrap"
              >
                {[
                  {
                    icon: BookOpen,
                    label: "Posts",
                    value: String(blogs.length),
                  },
                  { icon: Tag, label: "Topics", value: String(allTags.length) },
                  {
                    icon: User,
                    label: "Author",
                    value: blogs[0]?.author ?? "—",
                  },
                ].map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && (
                      <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mr-2" />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
                      <Icon
                        className="w-4 h-4 text-white dark:text-gray-900"
                        strokeWidth={1.8}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                        {value}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mt-0.5">
                        {label}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Blog cards grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {blogs.map((blog, i) => (
                  <motion.button
                    key={blog.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.08,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => router.push(`/blogs/${blog.slug}`)}
                    className="group text-left rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 capitalize"
                        >
                          <Tag className="w-2 h-2" strokeWidth={2} />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {blog.title}
                    </h2>

                    {/* Description */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {blog.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        {/* Author avatar */}
                        <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-white dark:text-gray-900">
                            {blog.author.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 leading-none">
                            {blog.author}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
                            <Calendar className="w-2.5 h-2.5" strokeWidth={2} />
                            {formatDate(blog.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        Read
                        <ArrowRight
                          className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                          strokeWidth={2}
                        />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && blogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FileText
                className="w-8 h-8 text-gray-300 dark:text-gray-700"
                strokeWidth={1.5}
              />
              <p className="text-sm text-gray-400 dark:text-gray-600">
                No blog posts found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
