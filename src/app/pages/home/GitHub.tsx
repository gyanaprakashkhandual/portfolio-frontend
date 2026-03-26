"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  RefreshCw,
  Activity,
  Flame,
  Code2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────
const USERNAME = "gyanaprakashkhandual";

const PINNED_REPOS = [
  {
    name: "cypress",
    description:
      "End-to-end test automation suite built with Cypress — covers UI flows, assertions, and CI integration for modern web applications.",
    language: "JavaScript",
    color: "#f7df1e",
    topics: ["e2e", "testing", "automation", "cypress"],
  },
  {
    name: "selenium",
    description:
      "Browser automation framework using Selenium WebDriver — cross-browser test scripts for robust QA pipelines.",
    language: "Java",
    color: "#b07219",
    topics: ["selenium", "webdriver", "automation", "testing"],
  },
  {
    name: "fetch-frontend",
    description:
      "Frontend data-fetching patterns — SWR, React Query, and native fetch implementations with loading/error states.",
    language: "TypeScript",
    color: "#3178c6",
    topics: ["react", "fetch", "typescript", "frontend"],
  },
  {
    name: "fetch-backend",
    description:
      "REST API backend with Express — structured routes, middleware, error handling, and fetch-based integrations.",
    language: "JavaScript",
    color: "#f7df1e",
    topics: ["node", "express", "api", "backend"],
  },
];

// ── Types ──────────────────────────────────────────────────────
interface ContribDay {
  date: string;
  count: number;
  level: number;
}

interface RepoMeta {
  stars: number;
  forks: number;
  url: string;
}

// ── Helpers ───────────────────────────────────────────────────
function getCellClass(level: number): string {
  const map = [
    "bg-black/[0.04] border-black/[0.06]",
    "bg-emerald-100 border-emerald-200",
    "bg-emerald-300 border-emerald-300",
    "bg-emerald-500 border-emerald-400",
    "bg-emerald-700 border-emerald-600",
  ];
  return map[Math.min(level, 4)];
}

function chunkIntoWeeks(days: ContribDay[]): ContribDay[][] {
  const weeks: ContribDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function buildMonthMarkers(weeks: ContribDay[][]): { label: string; col: number }[] {
  const markers: { label: string; col: number }[] = [];
  let last = -1;
  weeks.forEach((week, i) => {
    if (!week[0]) return;
    const m = new Date(week[0].date).getMonth();
    if (m !== last) {
      markers.push({
        label: new Date(week[0].date).toLocaleString("default", { month: "short" }),
        col: i,
      });
      last = m;
    }
  });
  return markers;
}

// ── Component ─────────────────────────────────────────────────
export default function GitHubSection() {
  const [weeks, setWeeks] = useState<ContribDay[][]>([]);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [repoMeta, setRepoMeta] = useState<Record<string, RepoMeta>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [tooltip, setTooltip] = useState<{ day: ContribDay; key: string } | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  async function fetchAll() {
    setRefreshing(true);
    setError("");
    try {
      const year = new Date().getFullYear();

      // Contribution graph — unofficial API, no token needed
      const r = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=${year}`
      );
      if (!r.ok) throw new Error("Could not load contribution data.");
      const json = await r.json();

      const days: ContribDay[] = json.contributions ?? [];
      setWeeks(chunkIntoWeeks(days));
      setTotal(json.total?.[String(year)] ?? days.reduce((s: number, d: ContribDay) => s + d.count, 0));

      // Streak
      let s = 0;
      for (const d of [...days].reverse()) {
        if (d.count > 0) s++;
        else break;
      }
      setStreak(s);

      // Repo meta — REST API, no token for public repos
      const settled = await Promise.allSettled(
        PINNED_REPOS.map((rp) =>
          fetch(`https://api.github.com/repos/${USERNAME}/${rp.name}`).then((res) =>
            res.ok ? res.json() : null
          )
        )
      );
      const meta: Record<string, RepoMeta> = {};
      settled.forEach((res, i) => {
        if (res.status === "fulfilled" && res.value) {
          meta[PINNED_REPOS[i].name] = {
            stars: res.value.stargazers_count ?? 0,
            forks: res.value.forks_count ?? 0,
            url: res.value.html_url,
          };
        }
      });
      setRepoMeta(meta);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const monthMarkers = buildMonthMarkers(weeks);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white border-b border-black/10 overflow-hidden"
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.045) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Soft emerald left wash */}
      <div className="absolute left-0 top-0 w-80 h-full bg-gradient-to-r from-emerald-50/70 to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-14 space-y-10">

        {/* ── HEADER ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-3.5">
            {/* Icon badge */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.07, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-11 h-11 rounded-xl bg-black/[0.04] border border-black/10 flex items-center justify-center"
              >
                <Github className="w-5 h-5 text-black/70" />
              </motion.div>
              {/* Live dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white">
                <motion.span
                  animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-emerald-400"
                />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase px-2.5 py-0.5 rounded-full border border-black/[0.09] bg-black/[0.03] text-black/45">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  GitHub Activity
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.07] text-black/40">
                  @{USERNAME}
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black tracking-tight text-black leading-tight">
                Contributions &amp; Projects
              </p>
            </div>
          </div>

          {/* Right stats row */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { icon: Activity, label: loading ? "—" : `${total.toLocaleString()} contributions`, accent: "text-emerald-500" },
              { icon: Flame, label: loading ? "—" : `${streak}d streak`, accent: "text-orange-400" },
            ].map(({ icon: Icon, label, accent }) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-black/[0.03] border border-black/[0.07] text-black/55"
              >
                <Icon className={`w-3 h-3 ${accent}`} />
                {label}
              </motion.span>
            ))}

            <motion.button
              onClick={fetchAll}
              disabled={refreshing}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/10 text-black/35 hover:bg-black/[0.03] transition-colors disabled:opacity-40"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : {}}
                transition={{ duration: 0.65, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </motion.div>
            </motion.button>

            <motion.a
              href={`https://github.com/${USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="group hidden sm:flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[11px] font-semibold rounded-lg hover:bg-black/80 transition-all"
            >
              <Github className="w-3.5 h-3.5" />
              Profile
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.a>
          </div>
        </motion.div>

        {/* ── ERROR ──────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-500/80 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── CONTRIBUTION GRAPH ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-black/[0.08] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.045)] overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-center gap-2 px-5 sm:px-6 py-4 border-b border-black/[0.05]">
            <Code2 className="w-3.5 h-3.5 text-black/30" />
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-black/35">
              Contribution Graph — {new Date().getFullYear()}
            </span>
          </div>

          <div className="px-4 sm:px-6 pt-4 pb-5 overflow-x-auto">
            {loading ? (
              /* Skeleton */
              <div className="flex gap-[3px] flex-wrap">
                {Array.from({ length: 52 * 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.25, 0.6, 0.25] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: (i % 25) * 0.04 }}
                    className="w-[11px] h-[11px] rounded-[2px] bg-black/[0.05]"
                  />
                ))}
              </div>
            ) : (
              <div className="min-w-max space-y-[5px]">
                {/* Month labels */}
                <div className="flex gap-[3px]" style={{ height: 14 }}>
                  {weeks.map((_, wi) => {
                    const m = monthMarkers.find((mk) => mk.col === wi);
                    return (
                      <div key={wi} className="w-[11px] shrink-0 relative">
                        {m && (
                          <span className="absolute left-0 top-0 text-[9px] font-semibold text-black/28 whitespace-nowrap leading-none">
                            {m.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cell grid */}
                <div className="flex gap-[3px]">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px] shrink-0">
                      {week.map((day, di) => {
                        const cellKey = `${wi}-${di}`;
                        return (
                          <div key={di} className="relative">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.2 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay: wi * 0.007 + di * 0.0015,
                                duration: 0.22,
                                ease: "backOut",
                              }}
                              onMouseEnter={() => setTooltip({ day, key: cellKey })}
                              onMouseLeave={() => setTooltip(null)}
                              className={`w-[11px] h-[11px] rounded-[2px] border cursor-pointer transition-transform duration-150 hover:scale-[1.4] hover:z-10 ${getCellClass(day.level)}`}
                            />
                            {/* Tooltip */}
                            <AnimatePresence>
                              {tooltip?.key === cellKey && (
                                <motion.div
                                  initial={{ opacity: 0, y: 3, scale: 0.88 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.88 }}
                                  transition={{ duration: 0.14 }}
                                  className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                                >
                                  <div className="bg-black text-white text-[9px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
                                    {tooltip.day.count} contrib{tooltip.day.count !== 1 ? "s" : ""}
                                    <span className="opacity-60 font-normal ml-1">{tooltip.day.date}</span>
                                  </div>
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-black" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1.5 pt-2 justify-end">
                  <span className="text-[9px] font-medium text-black/28">Less</span>
                  {[0, 1, 2, 3, 4].map((l) => (
                    <div key={l} className={`w-[11px] h-[11px] rounded-[2px] border ${getCellClass(l)}`} />
                  ))}
                  <span className="text-[9px] font-medium text-black/28">More</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── PINNED REPOS ───────────────────────────────── */}
        <div className="space-y-3">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-black/38">
              Featured Repositories
            </span>
            <motion.a
              href={`https://github.com/${USERNAME}?tab=repositories`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 2 }}
              className="flex items-center gap-1 text-[10px] font-semibold text-black/38 hover:text-black transition-colors"
            >
              All repos <ChevronRight className="w-3 h-3" />
            </motion.a>
          </motion.div>

          {/* Repo cards stacked */}
          <div className="flex flex-col gap-3">
            {PINNED_REPOS.map((repo, i) => {
              const meta = repoMeta[repo.name];
              const href = meta?.url ?? `https://github.com/${USERNAME}/${repo.name}`;
              return (
                <motion.a
                  key={repo.name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 18 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: 0.32 + i * 0.09,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -3,
                    boxShadow: "0 10px 36px rgba(0,0,0,0.08)",
                    borderColor: "rgba(0,0,0,0.15)",
                  }}
                  className="group block rounded-2xl border border-black/[0.08] bg-white px-5 py-4 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name row */}
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <span className="text-sm font-black tracking-tight text-black group-hover:text-emerald-700 transition-colors duration-200">
                          {repo.name}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-black/45">
                          <span
                            className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: repo.color }}
                          />
                          {repo.language}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-black/48 leading-[1.65] mb-3 line-clamp-2">
                        {repo.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {repo.topics.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-semibold tracking-wide uppercase px-2 py-[3px] rounded-md bg-black/[0.035] border border-black/[0.06] text-black/40"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right meta */}
                    <div className="shrink-0 flex flex-col items-end gap-2.5 pt-0.5">
                      <ExternalLink className="w-3.5 h-3.5 text-black/18 group-hover:text-black/55 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                      <div className="flex items-center gap-3 mt-auto">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-black/38">
                          <Star className="w-3 h-3" />
                          {loading ? "—" : (meta?.stars ?? 0)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-black/38">
                          <GitFork className="w-3 h-3" />
                          {loading ? "—" : (meta?.forks ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM STRIP ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="flex items-center gap-4 overflow-x-auto scrollbar-none pt-2 border-t border-black/[0.06]"
        >
          {[
            { icon: Activity, text: "Live contribution data" },
            { icon: Code2, text: "Open source" },
            { icon: Flame, text: "Daily commits" },
          ].map(({ icon: Icon, text }, i) => (
            <span key={text} className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-medium text-black/33">
              <Icon className="w-3 h-3" />
              {text}
              {i < 2 && <span className="text-black/15 ml-2">·</span>}
            </span>
          ))}
          <motion.a
            href={`https://github.com/${USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 2 }}
            className="ml-auto shrink-0 flex items-center gap-1 text-[10px] font-bold text-black/40 hover:text-black transition-colors"
          >
            Open GitHub <ChevronRight className="w-3 h-3" />
          </motion.a>
        </motion.div>

      </div>
    </section>
  );
}