/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Tag,
  AlertTriangle,
  Clock,
  BookOpen,
} from "lucide-react";
import MarkdownRenderer from "@/app/components/markdown/Markdown.render";

const BASE_URL = "http://localhost:5000/api/blogs";

interface BlogDetail {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  coverImage: string | null;
  content: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

function SkeletonDetail() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      <div className="space-y-3">
        <div className="h-8 w-4/5 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-8 w-3/5 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-2 pt-4">
        {[100, 90, 95, 80, 85, 70, 90, 60].map((w, i) => (
          <div
            key={i}
            className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setBlog(null);

    fetch(`${BASE_URL}/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then((res) => {
        const data = res?.data ?? (res?.slug ? res : null);
        if (!data) throw new Error(res?.message ?? `Blog "${slug}" not found.`);
        setBlog(data);
      })
      .catch((e) => setError(e.message ?? "Failed to load blog."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex-1 overflow-auto">
          <SkeletonDetail />
        </div>
      </div>
    );

  if (error || !blog)
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => router.push("/blogs")}
            className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              strokeWidth={1.8}
            />
            All Posts
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center">
            <AlertTriangle
              className="w-5 h-5 text-red-500 dark:text-red-400"
              strokeWidth={1.8}
            />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              {error ?? "Post not found."}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Could not load{" "}
              <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">
                {slug}
              </code>
            </p>
          </div>
          <button
            onClick={() => router.push("/blogs")}
            className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to blog
          </button>
        </div>
      </div>
    );

  const readTime = estimateReadTime(blog.content);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950 main-scrollbar">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between">
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push("/blogs")}
          className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            strokeWidth={1.8}
          />
          All Posts
        </motion.button>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <Clock className="w-3 h-3" strokeWidth={1.8} />
          {readTime}
        </div>
      </div>

      {/* Article */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 pr-72">
          {/* Article header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className=""
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 capitalize"
                >
                  <Tag className="w-2.5 h-2.5" strokeWidth={2} />
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug mb-4">
              {blog.title}
            </h1>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
              {blog.description}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {/* Author */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white border border-gray-900 dark:border-white flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-white dark:text-gray-900">
                    {blog.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">
                    {blog.author}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Author
                  </p>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />

              {/* Date */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
                {formatDate(blog.date)}
              </div>

              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />

              {/* Read time */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={1.8} />
                {readTime}
              </div>
            </div>
          </motion.div>

          {/* Markdown content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="
             "
          >
            <MarkdownRenderer content={blog.content} />
          </motion.div>

          {/* Bottom author card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white border border-gray-900 dark:border-white flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white dark:text-gray-900">
                  {blog.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {blog.author}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Published on {formatDate(blog.date)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
