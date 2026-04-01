"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Music2,
  Play,
  Disc3,
  Headphones,
  Radio,
  Mic2,
  ArrowRight,
} from "lucide-react";

const floatingNotes = ["♩", "♪", "♫", "♬", "♭", "♮"];

const features = [
  {
    icon: <Disc3 className="w-4 h-4" strokeWidth={1.6} />,
    label: "Full Library",
    desc: "Browse every track",
  },
  {
    icon: <Headphones className="w-4 h-4" strokeWidth={1.6} />,
    label: "Rich Player",
    desc: "Play, pause, seek",
  },
  {
    icon: <Mic2 className="w-4 h-4" strokeWidth={1.6} />,
    label: "Lyrics",
    desc: "Follow along",
  },
  {
    icon: <Radio className="w-4 h-4" strokeWidth={1.6} />,
    label: "Up Next",
    desc: "Auto-queue tracks",
  },
];

export default function MusicWelcomePage() {
  const router = useRouter();

  return (
    <div
      className="
        relative flex flex-1 flex-col items-center justify-center overflow-hidden
        w-full bg-white dark:bg-gray-950
        h-[calc(100vh-56px)] main-scrollbar min-w-[50vw] max-w-[50vw]
      "
    >
      {/* ── Subtle grid background ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Soft radial glow ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-150 h-150 rounded-full bg-gray-100 dark:bg-gray-900 blur-[120px] opacity-60" />
      </div>

      {/* ── Floating music notes ── */}
      {floatingNotes.map((note, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-gray-200 dark:text-gray-800 select-none font-serif"
          style={{
            fontSize: `${14 + (i % 3) * 6}px`,
            left: `${8 + i * 14}%`,
            top: `${15 + (i % 4) * 18}%`,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{
            duration: 3 + i * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        >
          {note}
        </motion.span>
      ))}

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Icon badge */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center shadow-lg mx-auto">
            <Music2
              className="w-7 h-7 text-white dark:text-gray-900"
              strokeWidth={1.8}
            />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500 mb-3">
            Welcome to
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
            Music World
          </h1>
          <p className="text-base sm:text-lg font-light text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
            Your personal music library — listen, explore,
            <br className="hidden sm:block" /> and lose yourself in sound.
          </p>
        </motion.div>

        {/* Animated waveform bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-end gap-0.75 my-7 h-8"
        >
          {[4, 10, 6, 14, 8, 18, 10, 14, 6, 10, 4].map((h, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-gray-300 dark:bg-gray-700"
              style={{ height: h }}
              animate={{ height: [h, h * 1.8, h] }}
              transition={{
                duration: 0.9 + i * 0.07,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.08,
              }}
            />
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <button
            onClick={() => router.push("/music")}
            className="
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto
              px-6 py-3 rounded-2xl
              bg-gray-900 dark:bg-white
              text-white dark:text-gray-900
              text-sm font-semibold
              hover:opacity-90 active:scale-[0.97]
              transition-all shadow-sm
            "
          >
            <Play
              className="w-4 h-4 translate-x-0.5"
              strokeWidth={2}
              fill="currentColor"
            />
            Browse Library
          </button>

          <button
            onClick={() => router.push("/music")}
            className="
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto
              px-6 py-3 rounded-2xl
              bg-transparent
              border border-gray-200 dark:border-gray-800
              text-gray-700 dark:text-gray-300
              text-sm font-medium
              hover:bg-gray-50 dark:hover:bg-gray-900
              active:scale-[0.97]
              transition-all
            "
          >
            Featured Track
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.07, duration: 0.3 }}
              className="
                inline-flex items-center gap-2
                px-3 py-2 rounded-xl
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                shadow-sm
              "
            >
              <span className="text-gray-500 dark:text-gray-400">{f.icon}</span>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 leading-none">
                  {f.label}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Bottom hint ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute bottom-5 text-[10px] text-gray-300 dark:text-gray-700 tracking-wide select-none"
      >
        Powered by your local music API
      </motion.p>
    </div>
  );
}
