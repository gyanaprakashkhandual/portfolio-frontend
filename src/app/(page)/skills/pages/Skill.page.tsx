/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  BookOpen,
  Briefcase,
  Clock,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Github,
} from "lucide-react";
import { useSkillsContext } from "../layout";
import { ISkill } from "@/app/lib/types";

type SortKey = "skillName" | "totalProjects" | "totalExperience";
type SortDir = "asc" | "desc";

function ExperienceBadge({ exp }: { exp: string }) {
  const years = parseInt(exp);
  const color =
    years >= 5
      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
      : years >= 4
        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        : years >= 3
          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${color}`}
    >
      <Clock className="w-2.5 h-2.5" strokeWidth={2} />
      {exp}
    </span>
  );
}

function ProjectsBadge({ count }: { count: string }) {
  const num = parseInt(count);
  const color =
    num >= 20
      ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
      : num >= 15
        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
        : num >= 10
          ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800"
          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${color}`}
    >
      <Briefcase className="w-2.5 h-2.5" strokeWidth={2} />
      {count}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse"
            style={{ width: `${50 + i * 10}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (col !== sortKey)
    return (
      <ChevronUp
        className="w-3 h-3 text-gray-300 dark:text-gray-700"
        strokeWidth={2}
      />
    );
  return sortDir === "asc" ? (
    <ChevronUp
      className="w-3 h-3 text-gray-900 dark:text-white"
      strokeWidth={2}
    />
  ) : (
    <ChevronDown
      className="w-3 h-3 text-gray-900 dark:text-white"
      strokeWidth={2}
    />
  );
}

export default function SkillsPage() {
  const { skills, loading, selectedKey } = useSkillsContext();

  const [tableQuery, setTableQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("skillName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(col: SortKey) {
    if (sortKey === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(col);
      setSortDir("asc");
    }
  }

  const filtered = (
    skills as (ISkill & {
      totalProjects?: string;
      totalExperience?: string;
      description?: string;
      githubLink?: string;
      learningLink?: string;
      learningSource?: string;
    })[]
  ).filter(
    (s) =>
      !tableQuery ||
      s.skillName.toLowerCase().includes(tableQuery.toLowerCase()) ||
      (s.description ?? "").toLowerCase().includes(tableQuery.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => {
    let va = (a as any)[sortKey] ?? "";
    let vb = (b as any)[sortKey] ?? "";
    if (sortKey !== "skillName") {
      va = String(parseInt(va));
      vb = String(parseInt(vb));
    }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const labelParts = selectedKey.split("/");
  const breadcrumb = labelParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" / ");

  const thBase =
    "px-4 py-3 text-left cursor-pointer select-none transition-colors duration-150";
  const thActive = "text-gray-900 dark:text-white";
  const thInactive =
    "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium mb-0.5">
            Skills
          </p>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {breadcrumb}
          </h1>
        </div>

        <div className="relative w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
            strokeWidth={1.8}
          />
          <input
            type="text"
            value={tableQuery}
            onChange={(e) => setTableQuery(e.target.value)}
            placeholder="Filter table…"
            className="w-full pl-9 pr-8 py-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
          />
          <AnimatePresence>
            {tableQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setTableQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!loading && skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400"
        >
          <span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {skills.length}
            </span>{" "}
            skills total
          </span>
          {tableQuery && (
            <>
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filtered.length}
                </span>{" "}
                matched
              </span>
              <span className="text-blue-500 dark:text-blue-400">
                Filtering: &quot;{tableQuery}&rdquo;
              </span>
            </>
          )}
        </motion.div>
      )}

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-6">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <tbody>
                  {[...Array(8)].map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 p-8">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
              <AlertTriangle
                className="w-5 h-5 text-gray-400"
                strokeWidth={1.8}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                No skills found
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                This category may be empty or unavailable.
              </p>
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Search
              className="w-8 h-8 text-gray-300 dark:text-gray-700"
              strokeWidth={1.5}
            />
            <p className="text-sm text-gray-400 dark:text-gray-600">
              No skills match &quot;{tableQuery}&quot;
            </p>
          </div>
        ) : (
          <motion.div
            key={selectedKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="p-6"
          >
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950">
              <div className="overflow-x-auto">
                <table className="w-full min-w-175">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                      <th
                        className={`${thBase} ${sortKey === "skillName" ? thActive : thInactive}`}
                        onClick={() => handleSort("skillName")}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-widest">
                            Skill
                          </span>
                          <SortIcon
                            col="skillName"
                            sortKey={sortKey}
                            sortDir={sortDir}
                          />
                        </div>
                      </th>
                      <th
                        className={`${thBase} ${sortKey === "totalProjects" ? thActive : thInactive}`}
                        onClick={() => handleSort("totalProjects")}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-widest">
                            Projects
                          </span>
                          <SortIcon
                            col="totalProjects"
                            sortKey={sortKey}
                            sortDir={sortDir}
                          />
                        </div>
                      </th>
                      <th
                        className={`${thBase} ${sortKey === "totalExperience" ? thActive : thInactive}`}
                        onClick={() => handleSort("totalExperience")}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-widest">
                            Experience
                          </span>
                          <SortIcon
                            col="totalExperience"
                            sortKey={sortKey}
                            sortDir={sortDir}
                          />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Links
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((skill, i) => (
                      <motion.tr
                        key={skill.skillName}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        className="border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-100"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white border border-gray-900 dark:border-white flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-bold text-white dark:text-gray-900">
                                {skill.skillName.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                              {skill.skillName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <ProjectsBadge
                            count={(skill as any).totalProjects ?? "0"}
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <ExperienceBadge
                            exp={(skill as any).totalExperience ?? "0"}
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                            {(skill as any).description ?? ""}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <a
                              href={(skill as any).githubLink ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900 dark:hover:bg-white dark:hover:text-gray-900 dark:hover:border-white transition-all duration-150"
                            >
                              <Github className="w-3 h-3" strokeWidth={1.8} />
                              GitHub
                            </a>
                            <a
                              href={(skill as any).learningLink ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900 dark:hover:bg-white dark:hover:text-gray-900 dark:hover:border-white transition-all duration-150"
                            >
                              <BookOpen className="w-3 h-3" strokeWidth={1.8} />
                              {(skill as any).learningSource ?? "Docs"}
                            </a>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center">
                  Showing {sorted.length} of {skills.length} skill
                  {skills.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
