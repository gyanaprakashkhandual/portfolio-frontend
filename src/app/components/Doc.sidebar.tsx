/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  SlidersHorizontal,
  Check,
  Menu,
  ArrowLeft,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import sidebarItems from "../script/doc.sidebar.item";
import type { SidebarSection, SidebarChild } from "../script/doc.sidebar.item";
import docRegistry from "../utils/doc.registry";
import { labelToSlug } from "../utils/slug.util";

type ViewMode = "menu" | "docs";

interface DocSidebarProps {
  techSlug?: string;
}

export default function DocSidebar({ techSlug }: DocSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, setViewMode] = useState<ViewMode>(
    techSlug ? "docs" : "menu",
  );
  const [activeTech, setActiveTech] = useState<string>(techSlug ?? "");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeSections, setActiveSections] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [expandedNested, setExpandedNested] = useState<Set<string>>(new Set());
  const [totalDocs, setTotalDocs] = useState(0);

  const filterRef = useRef<HTMLDivElement>(null);

  const currentSections: SidebarSection[] = activeTech
    ? (sidebarItems[activeTech] ?? [])
    : [];

  const allSectionLabels = currentSections.map((s) => s.label);

  useEffect(() => {
    if (techSlug && techSlug !== activeTech) {
      setActiveTech(techSlug);
      setViewMode("docs");
    }
  }, [techSlug, activeTech]);

  useEffect(() => {
    const count = currentSections.reduce((acc, s) => {
      function countChildren(children: SidebarChild[]): number {
        return children.reduce(
          (a, c) => a + 1 + (c.children ? countChildren(c.children) : 0),
          0,
        );
      }
      return acc + countChildren(s.children);
    }, 0);
    setTotalDocs(count);
  }, [currentSections]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleSection(label: string) {
    setActiveSections((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  function toggleExpanded(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleNestedExpanded(id: string) {
    setExpandedNested((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleTechSelect(slug: string) {
    setActiveTech(slug);
    setViewMode("docs");
    setQuery("");
    setActiveSections(new Set());
    router.push(`/docs/${slug}`);
  }

  function handleDocSelect(label: string) {
    const slug = labelToSlug(label);
    router.push(`/docs/${activeTech}/${slug}`);
  }

  function isDocActive(label: string): boolean {
    const slug = labelToSlug(label);
    return pathname === `/docs/${activeTech}/${slug}`;
  }

  const getFilteredSections = useCallback((): SidebarSection[] => {
    const q = query.toLowerCase();

    return currentSections
      .filter((section) => {
        if (activeSections.size > 0 && !activeSections.has(section.label))
          return false;
        return true;
      })
      .map((section) => {
        if (!q) return section;
        function filterChildren(children: SidebarChild[]): SidebarChild[] {
          return children
            .map((child) => {
              const matchesSelf = child.label.toLowerCase().includes(q);
              const filteredChildren = child.children
                ? filterChildren(child.children)
                : undefined;
              if (
                matchesSelf ||
                (filteredChildren && filteredChildren.length > 0)
              ) {
                return { ...child, children: filteredChildren };
              }
              return null;
            })
            .filter(Boolean) as SidebarChild[];
        }
        const filtered = filterChildren(section.children);
        return filtered.length > 0 ? { ...section, children: filtered } : null;
      })
      .filter(Boolean) as SidebarSection[];
  }, [currentSections, query, activeSections]);

  const filteredSections = getFilteredSections();

  const techInfo = docRegistry.find((d) => d.slug === activeTech);

  return (
    <aside className="w-72 shrink-0 flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          {viewMode === "docs" && (
            <button
              onClick={() => setViewMode("menu")}
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-150"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {viewMode === "docs" && techInfo ? (
              <>
                <span className="text-base">{techInfo.icon}</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {techInfo.label}
                </span>
              </>
            ) : (
              <>
                <BookOpen
                  className="w-4 h-4 text-gray-400 dark:text-gray-500"
                  strokeWidth={1.8}
                />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Documentation
                </span>
              </>
            )}
          </div>
          <button
            onClick={() =>
              setViewMode(
                viewMode === "menu" ? (activeTech ? "docs" : "menu") : "menu",
              )
            }
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-150"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Search + Filter — only in docs mode */}
        {viewMode === "docs" && (
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
                placeholder="Search docs…"
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

            {/* Filter by section */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`relative w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-150 ${
                  filterOpen
                    ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900"
                    : activeSections.size > 0
                      ? "bg-gray-100 dark:bg-gray-800 border-gray-900 dark:border-white text-gray-900 dark:text-white"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
                {activeSections.size > 0 && !filterOpen && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold flex items-center justify-center leading-none">
                    {activeSections.size}
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
                        Filter by Section
                      </span>
                      {activeSections.size > 0 && (
                        <button
                          onClick={() => setActiveSections(new Set())}
                          className="text-[11px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1.5 px-1.5">
                      {allSectionLabels.map((label) => {
                        const isActive = activeSections.has(label);
                        return (
                          <button
                            key={label}
                            onClick={() => toggleSection(label)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-100 ${
                              isActive
                                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            <span className="truncate text-left text-[12px] font-medium">
                              {label}
                            </span>
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
                    {activeSections.size > 0 && (
                      <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
                          {activeSections.size} section
                          {activeSections.size !== 1 ? "s" : ""} ·{" "}
                          {filteredSections.length} group
                          {filteredSections.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Active section pills */}
        <AnimatePresence>
          {viewMode === "docs" && activeSections.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-wrap gap-1 mt-2.5 overflow-hidden"
            >
              {Array.from(activeSections).map((label) => (
                <button
                  key={label}
                  onClick={() => toggleSection(label)}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-75 transition-opacity"
                >
                  {label}
                  <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto py-2 px-2 main-scrollbar">
        <AnimatePresence mode="wait">
          {/* Tech Menu View */}
          {viewMode === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                Choose a Technology
              </p>
              {docRegistry.map((tech, i) => (
                <motion.button
                  key={tech.slug}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  onClick={() => handleTechSelect(tech.slug)}
                  className={`w-full text-left px-3 py-3 rounded-xl mb-1 group transition-all duration-150 ${
                    activeTech === tech.slug
                      ? "bg-gray-900 dark:bg-white border border-gray-900 dark:border-white shadow-sm"
                      : "bg-transparent border border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xl shrink-0">{tech.icon}</span>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate mb-0.5 transition-colors ${
                            activeTech === tech.slug
                              ? "text-white dark:text-gray-900"
                              : "text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white"
                          }`}
                        >
                          {tech.label}
                        </p>
                        <p
                          className={`text-xs line-clamp-1 leading-relaxed ${
                            activeTech === tech.slug
                              ? "text-gray-300 dark:text-gray-600"
                              : "text-gray-500 dark:text-gray-500"
                          }`}
                        >
                          {tech.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-all duration-150 ${
                          activeTech === tech.slug
                            ? "text-gray-300 dark:text-gray-600 opacity-100"
                            : "text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                        }`}
                        strokeWidth={2}
                      />
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                          activeTech === tech.slug
                            ? "bg-white/10 dark:bg-black/10 text-gray-200 dark:text-gray-700"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {tech.totalDocs} docs
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Docs View */}
          {viewMode === "docs" && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18 }}
            >
              {filteredSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 px-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center mb-1">
                    <Search
                      className="w-4 h-4 text-gray-400 dark:text-gray-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    No docs found
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
                    Try a different search or filter
                  </p>
                </div>
              ) : (
                filteredSections.map((section, si) => (
                  <SectionBlock
                    key={section.id}
                    section={section}
                    index={si}
                    expanded={expandedSections.has(section.id)}
                    onToggle={() => toggleExpanded(section.id)}
                    expandedNested={expandedNested}
                    onToggleNested={toggleNestedExpanded}
                    onDocSelect={handleDocSelect}
                    isDocActive={isDocActive}
                    query={query}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center">
          {viewMode === "docs" && activeTech
            ? `${totalDocs} document${totalDocs !== 1 ? "s" : ""} · ${techInfo?.label ?? ""}`
            : `${docRegistry.length} technolog${docRegistry.length !== 1 ? "ies" : "y"} available`}
        </p>
      </div>
    </aside>
  );
}

// ── Section Block ──────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: SidebarSection;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  expandedNested: Set<string>;
  onToggleNested: (id: string) => void;
  onDocSelect: (label: string) => void;
  isDocActive: (label: string) => boolean;
  query: string;
}

function SectionBlock({
  section,
  index,
  expanded,
  onToggle,
  expandedNested,
  onToggleNested,
  onDocSelect,
  isDocActive,
  query,
}: SectionBlockProps) {
  const hasActive = section.children.some(function check(c): boolean {
    if (isDocActive(c.label)) return true;
    if (c.children) return c.children.some(check);
    return false;
  });

  const isOpen = expanded || hasActive || query.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.18 }}
      className="mb-1"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg group hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
          {section.label}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-700" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pb-1">
              {section.children.map((child) => (
                <DocItem
                  key={child.id}
                  item={child}
                  depth={0}
                  expandedNested={expandedNested}
                  onToggleNested={onToggleNested}
                  onDocSelect={onDocSelect}
                  isDocActive={isDocActive}
                  query={query}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Doc Item ───────────────────────────────────────────────────────────────────

interface DocItemProps {
  item: SidebarChild;
  depth: number;
  expandedNested: Set<string>;
  onToggleNested: (id: string) => void;
  onDocSelect: (label: string) => void;
  isDocActive: (label: string) => boolean;
  query: string;
}

function DocItem({
  item,
  depth,
  expandedNested,
  onToggleNested,
  onDocSelect,
  isDocActive,
  query,
}: DocItemProps) {
  const isActive = isDocActive(item.label);
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedNested.has(item.id);
  const childHasActive =
    hasChildren &&
    item.children!.some(function check(c): boolean {
      if (isDocActive(c.label)) return true;
      if (c.children) return c.children.some(check);
      return false;
    });
  const shouldExpand = isExpanded || childHasActive || query.length > 0;

  const paddingLeft = depth === 0 ? "pl-2.5" : depth === 1 ? "pl-5" : "pl-8";

  const highlight = (text: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-900/60 text-gray-900 dark:text-yellow-200 rounded-sm px-0.5">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div>
      <div
        className={`group flex items-center justify-between gap-1 rounded-lg mb-0.5 transition-all duration-150 ${paddingLeft} ${
          isActive
            ? "bg-gray-900 dark:bg-white border border-gray-900 dark:border-white shadow-sm"
            : "border border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700"
        }`}
      >
        <button
          onClick={() => {
            if (hasChildren) onToggleNested(item.id);
            else onDocSelect(item.label);
          }}
          className="flex-1 text-left py-2 pr-1"
        >
          <span
            className={`text-[12.5px] font-medium transition-colors leading-snug ${
              isActive
                ? "text-white dark:text-gray-900"
                : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
            }`}
          >
            {highlight(item.label)}
          </span>
        </button>

        {hasChildren ? (
          <button
            onClick={() => onToggleNested(item.id)}
            className="p-1 shrink-0"
          >
            <motion.span
              animate={{ rotate: shouldExpand ? 180 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown
                className={`w-3 h-3 ${
                  isActive
                    ? "text-gray-300 dark:text-gray-600"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              />
            </motion.span>
          </button>
        ) : (
          <ChevronRight
            className={`w-3 h-3 shrink-0 mr-1 transition-all duration-150 ${
              isActive
                ? "text-gray-300 dark:text-gray-600 opacity-100"
                : "text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
            }`}
            strokeWidth={2}
          />
        )}
      </div>

      {hasChildren && (
        <AnimatePresence>
          {shouldExpand && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {item.children!.map((child) => (
                <DocItem
                  key={child.id}
                  item={child}
                  depth={depth + 1}
                  expandedNested={expandedNested}
                  onToggleNested={onToggleNested}
                  onDocSelect={onDocSelect}
                  isDocActive={isDocActive}
                  query={query}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
