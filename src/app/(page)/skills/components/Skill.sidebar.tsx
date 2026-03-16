/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  Check,
  Globe,
  Shield,
  FlaskConical,
  Code2,
  Database,
  Server,
  Monitor,
  Wrench,
  BarChart3,
  Rocket,
  Cpu,
} from "lucide-react";
import { useAppDispatch } from "../../../lib/hooks";
import {
  fetchSkillsByCategory,
  fetchSkillsBySubcategory,
} from "../../../lib/features/skill/skill.slice";
import { ISkill } from "@/app/lib/types";

interface CategoryMeta {
  label: string;
  icon: React.ReactNode;
  subcategories: string[];
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  web: {
    label: "Web",
    icon: <Globe className="w-3.5 h-3.5" strokeWidth={1.8} />,
    subcategories: [
      "backend",
      "frontend",
      "database",
      "deployment",
      "monitoring",
      "tools",
    ],
  },
  language: {
    label: "Language",
    icon: <Code2 className="w-3.5 h-3.5" strokeWidth={1.8} />,
    subcategories: [],
  },
  security: {
    label: "Security",
    icon: <Shield className="w-3.5 h-3.5" strokeWidth={1.8} />,
    subcategories: [],
  },
  test: {
    label: "Testing",
    icon: <FlaskConical className="w-3.5 h-3.5" strokeWidth={1.8} />,
    subcategories: ["api", "database", "performance", "security", "ui"],
  },
};

const SUBCATEGORY_ICONS: Record<string, React.ReactNode> = {
  backend: <Server className="w-3 h-3" strokeWidth={1.8} />,
  frontend: <Monitor className="w-3 h-3" strokeWidth={1.8} />,
  database: <Database className="w-3 h-3" strokeWidth={1.8} />,
  deployment: <Rocket className="w-3 h-3" strokeWidth={1.8} />,
  monitoring: <BarChart3 className="w-3 h-3" strokeWidth={1.8} />,
  tools: <Wrench className="w-3 h-3" strokeWidth={1.8} />,
  api: <Cpu className="w-3 h-3" strokeWidth={1.8} />,
  performance: <BarChart3 className="w-3 h-3" strokeWidth={1.8} />,
  security: <Shield className="w-3 h-3" strokeWidth={1.8} />,
  ui: <Monitor className="w-3 h-3" strokeWidth={1.8} />,
};

interface SkillsSidebarProps {
  onSelect: (skills: ISkill[], label: string, loading: boolean) => void;
  selectedKey: string;
  onKeyChange: (key: string) => void;
}

export default function SkillsSidebar({
  onSelect,
  selectedKey,
  onKeyChange,
}: SkillsSidebarProps) {
  const dispatch = useAppDispatch();

  const [query, setQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["web"]),
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(),
  );
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
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
    fetchSkills("web/backend", "web", "backend");
  }, []);

  async function fetchSkills(
    key: string,
    category: string,
    subcategory?: string,
  ) {
    setLoadingKey(key);
    onKeyChange(key);
    onSelect([], key, true);
    try {
      if (subcategory) {
        const result = await dispatch(
          fetchSkillsBySubcategory({ category, subcategory }),
        ).unwrap();
        onSelect(result.data, key, false);
      } else {
        const result = await dispatch(fetchSkillsByCategory(category)).unwrap();
        onSelect(result.data, key, false);
      }
    } catch {
      onSelect([], key, false);
    } finally {
      setLoadingKey(null);
    }
  }

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function toggleFilterCategory(cat: string) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  const allCategories = Object.keys(CATEGORY_META);
  const visibleCategories =
    activeCategories.size > 0
      ? allCategories.filter((c) => activeCategories.has(c))
      : allCategories;

  const filteredCategories = visibleCategories.filter((cat) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const meta = CATEGORY_META[cat];
    return (
      cat.toLowerCase().includes(q) ||
      meta.label.toLowerCase().includes(q) ||
      meta.subcategories.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      <div className="px-4 pt-5 pb-4 border-b border-gray-200 dark:border-gray-800">
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
              placeholder="Search skills…"
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

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`relative w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-150 ${
                filterOpen
                  ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900"
                  : activeCategories.size > 0
                    ? "bg-gray-100 dark:bg-gray-800 border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
              {activeCategories.size > 0 && !filterOpen && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold flex items-center justify-center">
                  {activeCategories.size}
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
                  className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/60 dark:shadow-black/50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Filter by Category
                    </span>
                    {activeCategories.size > 0 && (
                      <button
                        onClick={() => setActiveCategories(new Set())}
                        className="text-[11px] font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="py-1.5 px-1.5">
                    {allCategories.map((cat) => {
                      const isActive = activeCategories.has(cat);
                      const meta = CATEGORY_META[cat];
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleFilterCategory(cat)}
                          className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-100 ${
                            isActive
                              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{meta.icon}</span>
                            <span className="text-[12px] font-medium">
                              {meta.label}
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
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {activeCategories.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1 mt-2.5 overflow-hidden"
            >
              {Array.from(activeCategories).map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleFilterCategory(cat)}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-75 transition-opacity"
                >
                  {CATEGORY_META[cat]?.label}
                  <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 px-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center mb-1">
              <Search
                className="w-4 h-4 text-gray-400 dark:text-gray-600"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No categories found
            </p>
          </div>
        ) : (
          filteredCategories.map((cat, ci) => {
            const meta = CATEGORY_META[cat];
            const isExpanded = expandedCategories.has(cat);
            const catKey = cat;
            const isCatActive = selectedKey === catKey;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ci * 0.05, duration: 0.2 }}
                className="mb-1"
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      toggleCategory(cat);
                      if (meta.subcategories.length === 0) {
                        fetchSkills(catKey, cat);
                      }
                    }}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 group ${
                      isCatActive && meta.subcategories.length === 0
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <span
                      className={
                        isCatActive && meta.subcategories.length === 0
                          ? "text-white dark:text-gray-900"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      {meta.icon}
                    </span>
                    <span className="text-sm font-semibold flex-1 text-left">
                      {meta.label}
                    </span>
                    {loadingKey === catKey && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    {meta.subcategories.length > 0 && (
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        strokeWidth={2}
                      />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && meta.subcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-3 pl-3 border-l border-gray-200 dark:border-gray-800 mt-0.5 mb-1"
                    >
                      {meta.subcategories
                        .filter(
                          (sub) =>
                            !query ||
                            sub.toLowerCase().includes(query.toLowerCase()),
                        )
                        .map((sub, si) => {
                          const subKey = `${cat}/${sub}`;
                          const isSubActive = selectedKey === subKey;
                          return (
                            <motion.button
                              key={sub}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: si * 0.03 }}
                              onClick={() => fetchSkills(subKey, cat, sub)}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-0.5 text-left transition-all duration-150 group ${
                                isSubActive
                                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                              }`}
                            >
                              <span
                                className={
                                  isSubActive
                                    ? "text-white dark:text-gray-900"
                                    : "text-gray-400 dark:text-gray-600"
                                }
                              >
                                {SUBCATEGORY_ICONS[sub] ?? (
                                  <Code2
                                    className="w-3 h-3"
                                    strokeWidth={1.8}
                                  />
                                )}
                              </span>
                              <span className="text-xs font-medium capitalize flex-1">
                                {sub}
                              </span>
                              {loadingKey === subKey && (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              )}
                            </motion.button>
                          );
                        })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center">
          {Object.keys(CATEGORY_META).length} categories
        </p>
      </div>
    </aside>
  );
}
