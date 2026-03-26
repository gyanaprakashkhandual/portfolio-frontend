import { motion } from "framer-motion";

// ─── Shimmer pulse animation variant ───────────────────────────────────────
const shimmer = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.85, 0.4],
    transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
  },
};

// Stagger children entrance
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ─── Single skeleton line ───────────────────────────────────────────────────
function SkeletonLine({
  width = "100%",
  height = "h-3.5",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      className={`rounded-full bg-gray-200 dark:bg-gray-700 ${height} ${className}`}
      style={{ width }}
    />
  );
}

// ─── Tag pill skeleton ──────────────────────────────────────────────────────
function SkeletonTag({ width = "w-20" }: { width?: string }) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      className={`h-6 ${width} rounded-full bg-gray-200 dark:bg-gray-700`}
    />
  );
}

// ─── Tech badge skeleton (black pill) ──────────────────────────────────────
function SkeletonBadge({ width = "w-16" }: { width?: string }) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      className={`h-7 ${width} rounded-full bg-gray-300 dark:bg-gray-600`}
    />
  );
}

// ─── Single project card skeleton ──────────────────────────────────────────
function ProjectCardSkeleton() {
  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col gap-4"
    >
      {/* Category label row */}
      <div className="flex items-center gap-2">
        <motion.div
          variants={shimmer}
          initial="initial"
          animate="animate"
          className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"
        />
        <SkeletonLine width="38%" height="h-2.5" />
      </div>

      {/* Title */}
      <SkeletonLine width="55%" height="h-6" />

      {/* Short description */}
      <div className="flex flex-col gap-2">
        <SkeletonLine width="100%" />
        <SkeletonLine width="80%" />
      </div>

      {/* Inner description box */}
      <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3.5 flex flex-col gap-2">
        <SkeletonLine width="100%" height="h-2.5" />
        <SkeletonLine width="95%" height="h-2.5" />
        <SkeletonLine width="60%" height="h-2.5" />
      </div>

      {/* Tag pills */}
      <div className="flex flex-wrap gap-2">
        <SkeletonTag width="w-28" />
        <SkeletonTag width="w-32" />
        <SkeletonTag width="w-20" />
        <SkeletonTag width="w-16" />
      </div>

      {/* Tech badges */}
      <div className="flex flex-wrap gap-2">
        <SkeletonBadge width="w-14" />
        <SkeletonBadge width="w-20" />
        <SkeletonBadge width="w-18" />
        <SkeletonBadge width="w-24" />
        <SkeletonBadge width="w-12" />
        <SkeletonBadge width="w-16" />
      </div>

      {/* Footer links */}
      <div className="flex items-center gap-5 pt-1">
        <div className="flex items-center gap-1.5">
          <motion.div
            variants={shimmer}
            initial="initial"
            animate="animate"
            className="w-3.5 h-3.5 rounded bg-blue-200 dark:bg-blue-900"
          />
          <SkeletonLine width="60px" height="h-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            variants={shimmer}
            initial="initial"
            animate="animate"
            className="w-3.5 h-3.5 rounded bg-gray-200 dark:bg-gray-700"
          />
          <SkeletonLine width="68px" height="h-3" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Full skeleton loader (drop-in replacement) ─────────────────────────────
export function ProjectsSkeletonLoader() {
  return (
    <div className="w-full px-4 py-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-3">
          <motion.div
            variants={shimmer}
            initial="initial"
            animate="animate"
            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700"
          />
          <SkeletonLine width="160px" height="h-7" />
        </div>
        <SkeletonLine width="220px" height="h-3.5" className="ml-11" />
      </div>

      {/* 2-column grid of cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";

const shimmer = {
  initial: { opacity: 0.35 },
  animate: {
    opacity: [0.35, 0.75, 0.35],
    transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
  },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

function SkeletonLine({
  width = "100%",
  height = "h-3",
  delay = 0,
}: {
  width?: string;
  height?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      style={{ transitionDelay: `${delay}s` } as React.CSSProperties}
      className={`rounded-full bg-gray-200 dark:bg-gray-700 ${height}`}
      style={{ width }}
    />
  );
}

function SkeletonPill({ width = "w-24", delay = 0 }: { width?: string; delay?: number }) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      style={{ transitionDelay: `${delay}s` } as React.CSSProperties}
      className={`h-6 ${width} rounded-full bg-gray-200 dark:bg-gray-700`}
    />
  );
}

function SidebarItemSkeleton() {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col gap-2 py-4 border-b border-gray-100 dark:border-gray-800"
    >
      {/* Title */}
      <SkeletonLine width="46%" height="h-4" />
      {/* Description lines */}
      <div className="flex flex-col gap-1.5">
        <SkeletonLine width="100%" />
        <SkeletonLine width="68%" />
      </div>
      {/* Tag pills */}
      <div className="flex flex-wrap gap-2 pt-0.5">
        <SkeletonPill width="w-28" />
        <SkeletonPill width="w-32" />
      </div>
    </motion.div>
  );
}

export function SidebarProjectsSkeleton() {
  return (
    <div className="w-full max-w-[340px] px-1">
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center px-3 gap-2">
          <motion.div
            variants={shimmer}
            initial="initial"
            animate="animate"
            className="w-3.5 h-3.5 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0"
          />
          <SkeletonLine width="55%" height="h-3" />
        </div>
        <motion.div
          variants={shimmer}
          initial="initial"
          animate="animate"
          className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0"
        />
      </div>

      {/* Active filter pills */}
      <div className="flex flex-wrap gap-2 mb-2">
        <SkeletonPill width="w-28" />
        <SkeletonPill width="w-36" />
      </div>

      {/* Project list items */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <SidebarItemSkeleton key={i} />
        ))}
      </motion.div>

      {/* Footer count */}
      <div className="flex justify-center pt-4 pb-1">
        <SkeletonLine width="96px" height="h-3" />
      </div>
    </div>
  );
}
