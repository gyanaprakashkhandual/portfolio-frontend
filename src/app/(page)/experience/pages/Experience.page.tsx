"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Calendar,
  Code2,
  Star,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronUp,
  Layers,
  Shield,
  Zap,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { fetchAllExperience } from "@/app/lib/features/experience/experience.slice";
import {
  selectAllExperience,
  selectExperienceLoading,
  selectExperienceError,
} from "@/app/lib/features/experience/experience.selector";

interface Achievement {
  title: string;
  description: string;
}

interface Duration {
  start: string;
  end: string;
}

interface Experience {
  slug: string;
  company: string;
  role: string;
  location: string;
  duration: Duration;
  summary: string;
  highlights: string[];
  achievements: Achievement[];
  skills: string[];
  techStack: string[];
  about: string;
}

function getDuration(d: Duration): string {
  return `${d.start} – ${d.end}`;
}

function getTenure(d: Duration): string {
  const startDate = new Date(d.start);
  const endDate = d.end === "Present" ? new Date() : new Date(d.end);
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  if (months < 1) return "< 1mo";
  if (months < 12) return `${months}mo`;
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${yrs}y ${rem}mo` : `${yrs}y`;
}

function isCurrentRole(end: string) {
  return end === "Present";
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse ${className}`}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-5">
      <div className="flex items-start gap-4">
        <SkeletonPulse className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-5 w-2/3" />
          <SkeletonPulse className="h-3.5 w-1/3" />
          <SkeletonPulse className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonPulse className="h-3 w-full" />
      <SkeletonPulse className="h-3 w-4/5" />
      <div className="flex gap-2 flex-wrap pt-1">
        {[80, 100, 70, 90, 60].map((w, i) => (
          <SkeletonPulse key={i} className={`h-6 rounded-lg w-[${w}%]`} />
        ))}
      </div>
    </div>
  );
}

function AchievementCard({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const icons = [Trophy, Zap, Shield, Star];
  const Icon = icons[index % icons.length];
  const colors = [
    {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800",
      icon: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
    },
    {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800",
      icon: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    },
  ];
  const c = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.08, duration: 0.3 }}
      className={`rounded-xl border p-4 ${c.bg} ${c.border}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}
        >
          <Icon className={`w-4 h-4 ${c.icon}`} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">
            {achievement.title}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            {achievement.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const tenure = getTenure(exp.duration);
  const isCurrent = isCurrentRole(exp.duration.end);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.12,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
    >
      <div className="p-6 pb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white border border-gray-900 dark:border-white flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white dark:text-gray-900">
                {exp.company.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  {exp.role}
                </h2>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400 text-white dark:text-gray-900 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-gray-900 animate-pulse" />
                    Current
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {exp.company}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <MapPin className="w-3 h-3" strokeWidth={1.8} />
                  {exp.location}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <Calendar className="w-3 h-3" strokeWidth={1.8} />
                  {getDuration(exp.duration)}
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium">
                    {tenure}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shrink-0"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {exp.summary}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-1 space-y-5 border-t border-gray-100 dark:border-gray-800">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="pt-4"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Layers
                    className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
                    strokeWidth={1.8}
                  />
                  <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    About This Role
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {exp.about}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
                    strokeWidth={1.8}
                  />
                  <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Highlights
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {exp.highlights.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.04 }}
                      className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 shrink-0" />
                      {h}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {exp.achievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy
                      className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
                      strokeWidth={1.8}
                    />
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Key Achievements
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {exp.achievements.map((a, i) => (
                      <AchievementCard key={i} achievement={a} index={i} />
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Star
                      className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
                      strokeWidth={1.8}
                    />
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Skills
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.skills.map((s, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.38 + i * 0.03 }}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium"
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Code2
                      className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
                      strokeWidth={1.8}
                    />
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Tech Stack
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.techStack.map((t, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.42 + i * 0.03 }}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-900 dark:bg-white border border-gray-900 dark:border-white text-white dark:text-gray-900 font-medium"
                      >
                        {t}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ExperiencePage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectAllExperience) as unknown as Experience[];
  const loading = useAppSelector(selectExperienceLoading);
  const error = useAppSelector(selectExperienceError);

  useEffect(() => {
    dispatch(fetchAllExperience());
  }, [dispatch]);

  const totalTech = [...new Set(data.flatMap((e) => e.techStack ?? []))].length;
  const totalSkills = [...new Set(data.flatMap((e) => e.skills ?? []))].length;
  const currentRoles = data.filter((e) =>
    isCurrentRole(e.duration?.end ?? ""),
  ).length;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-56px)] bg-white overflow-hidden dark:bg-gray-950">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {loading && (
            <div className="space-y-5">
              {[...Array(2)].map((_, i) => (
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
                className="flex items-center gap-6 mb-8 px-1 flex-wrap"
              >
                {[
                  {
                    icon: Briefcase,
                    label: "Roles",
                    value: String(data.length),
                  },
                  {
                    icon: Users,
                    label: "Active Now",
                    value: String(currentRoles),
                  },
                  {
                    icon: Code2,
                    label: "Technologies",
                    value: String(totalTech),
                  },
                  { icon: Star, label: "Skills", value: String(totalSkills) },
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

              <div className="space-y-5">
                {data.map((exp, i) => (
                  <ExperienceCard key={exp.slug} exp={exp} index={i} />
                ))}
              </div>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Briefcase
                className="w-8 h-8 text-gray-300 dark:text-gray-700"
                strokeWidth={1.5}
              />
              <p className="text-sm text-gray-400 dark:text-gray-600">
                No experience entries found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
