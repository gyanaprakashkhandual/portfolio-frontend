"use client";

import React, { useState, useEffect, useMemo } from "react";
import { slugify } from "./utils";
import { TocItem } from "./types";

export function TableOfContents({ content }: { content: string }) {
  const items: TocItem[] = useMemo(() => {
    return content
      .split("\n")
      .filter((l) => /^#{1,6}\s/.test(l))
      .map((l) => {
        const m = l.match(/^(#{1,6})\s+(.+)/);
        if (!m) return null;
        const level = m[1].length;
        const text = m[2].replace(/[*_`]/g, "");
        const id = slugify(text);
        return { level, text, id };
      })
      .filter(Boolean) as TocItem[];
  }, [content]);

  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="hidden xl:block fixed right-8 top-24 w-56 max-h-[70vh] overflow-y-auto mt-10">
      <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">
        On this page
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-xs leading-5 transition-colors truncate
                ${item.level === 1 ? "" : item.level === 2 ? "pl-3" : item.level === 3 ? "pl-6" : "pl-9"}
                ${
                  activeId === item.id
                    ? "text-stone-800 dark:text-slate-100 font-medium"
                    : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-slate-400"
                }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}