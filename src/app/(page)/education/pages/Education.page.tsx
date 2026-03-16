/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { fetchAllEducation } from "@/app/lib/features/education/education.slice";
import {
  selectAllEducation,
  selectEducationLoading,
  selectEducationError,
} from "@/app/lib/features/education/education.selector";

interface Duration {
  start: string | null;
  end: string | null;
}

const STREAM_COLORS: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  "Science Stream": {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  "Computer Applications": {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  "Software Testing & Automation": {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    dot: "bg-purple-500 dark:bg-purple-400",
  },
  "MERN Stack Development": {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  "Cybersecurity & Ethical Hacking": {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500 dark:bg-red-400",
  },
};

const DEFAULT_COLOR = {
  bg: "bg-gray-50 dark:bg-gray-800",
  text: "text-gray-600 dark:text-gray-400",
  border: "border-gray-200 dark:border-gray-700",
  dot: "bg-gray-400 dark:bg-gray-500",
};

function getDuration(d: Duration): string {
  const start = d.start ?? "—";
  const end = d.end ?? "Present";
  if (!d.start) return `Until ${end}`;
  return `${start} – ${end}`;
}

function getYears(d: Duration): string {
  if (!d.start || !d.end) return "";
  const startDate = new Date(d.start);
  const endDate = new Date(d.end);
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  if (months < 12) return `${months}mo`;
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${yrs}y ${rem}mo` : `${yrs}y`;
}

function GradeBadge({ grade }: { grade: string }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white border border-gray-900 dark:border-white flex items-center justify-center shrink-0">
      <span className="text-[10px] font-bold text-white dark:text-gray-900 leading-none">
        {grade}
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center gap-1 pt-1">
        <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="w-px flex-1 bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="flex-1 pb-8">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-24 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
            <div className="h-5 w-32 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EducationPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectAllEducation);
  const loading = useAppSelector(selectEducationLoading);
  const error = useAppSelector(selectEducationError);

  useEffect(() => {
    dispatch(fetchAllEducation());
  }, [dispatch]);

  return (
    <div className="main-scrollbar flex-1 flex flex-col h-[calc(100vh-56px)] bg-white overflow-hidden dark:bg-gray-950">
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {loading && (
            <div className="space-y-0">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

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

          {!loading && !error && data.length > 0 && (
            <div>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-6 mb-8 px-1"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                    <GraduationCap
                      className="w-4 h-4 text-white dark:text-gray-900"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {data.length}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Qualifications
                    </p>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Award
                      className="w-4 h-4 text-white dark:text-gray-900"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      All A++
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Grades
                    </p>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Calendar
                      className="w-4 h-4 text-white dark:text-gray-900"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      2021 – 2025
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Timeline
                    </p>
                  </div>
                </div>
              </motion.div>

              <div>
                {data.map((edu, i) => {
                  const colors =
                    STREAM_COLORS[(edu as any).stream] ?? DEFAULT_COLOR;
                  const duration = getDuration(
                    (edu as any).duration ?? { start: null, end: null },
                  );
                  const years = getYears(
                    (edu as any).duration ?? { start: null, end: null },
                  );
                  const isLast = i === data.length - 1;

                  return (
                    <div key={i} className="flex gap-5">
                      <div className="flex flex-col items-center pt-5 shrink-0">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: i * 0.1,
                            duration: 0.25,
                            type: "spring",
                          }}
                          className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 shadow-sm ${colors.dot} z-10`}
                        />
                        {!isLast && (
                          <div className="w-px flex-1 bg-gray-200 dark:bg-gray-800 mt-1" />
                        )}
                      </div>

                      <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: i * 0.1 + 0.05,
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex-1 pb-6"
                      >
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-150">
                          <div className="flex items-start gap-3 mb-3.5">
                            <GradeBadge grade={(edu as any).grade ?? ""} />
                            <div className="flex-1 min-w-0">
                              <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-0.5">
                                {edu.title}
                              </h2>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {edu.institution}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}
                            >
                              <BookOpen
                                className="w-2.5 h-2.5"
                                strokeWidth={2}
                              />
                              {edu.stream}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                                <MapPin className="w-3 h-3" strokeWidth={1.8} />
                                <span>{(edu as any).location ?? ""}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                                <Calendar
                                  className="w-3 h-3"
                                  strokeWidth={1.8}
                                />
                                <span>{duration}</span>
                                {years && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium">
                                    {years}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <GraduationCap
                className="w-8 h-8 text-gray-300 dark:text-gray-700"
                strokeWidth={1.5}
              />
              <p className="text-sm text-gray-400 dark:text-gray-600">
                No education entries found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
