/* eslint-disable @next/next/no-img-element */
"use client";
import { motion } from "framer-motion";
import { Download, ArrowUpRight, Github } from "lucide-react";
import { BackgroundStrokes } from "./Strokes";
import { containerVariants, itemVariants } from "./Data";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-12">
      <BackgroundStrokes />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[60px_60px]" />

      <div className="relative w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-screen py-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase px-4 py-2 border border-black/10 dark:border-white/10 rounded-full bg-black/3 dark:bg-white/3 text-black/60 dark:text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Available for work · Full Stack Web Developer & SDET
              </span>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <p className="text-sm font-medium tracking-widest uppercase text-black/40 dark:text-white/40">
                Hello, I&apos;m
              </p>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]">
                <span className="block">Gyana</span>
                <span className="block text-transparent bg-clip-text bg-linear-to-br from-black via-slate-600 to-slate-400 dark:from-white dark:via-slate-300 dark:to-slate-500">
                  Prakash
                </span>
              </h1>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-2"
            >
              {[
                "Full-Stack Developer",
                "QA Engineer",
                "Ethical Hacker",
                "SDET",
              ].map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-black/5 dark:bg-white/8 border border-black/8 dark:border-white/8 text-black/70 dark:text-white/70"
                >
                  {role}
                </span>
              ))}
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-lg text-black/60 dark:text-white/55 leading-relaxed max-w-lg"
            >
              Building robust SaaS applications integrated with AI. Specialized
              in end-to-end quality assurance, security-first architecture, and
              delivering excellence across the full stack.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 pt-2"
            >
              <motion.a
                href="#"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-2.5 px-7 py-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </motion.a>
              <motion.a
                href="/projects"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-2.5 px-7 py-3.5 border border-black/15 dark:border-white/15 text-black/80 dark:text-white/80 font-semibold rounded-lg text-sm hover:bg-black/4 dark:hover:bg-white/4 transition-colors"
              >
                View Projects
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.a>
              <motion.a
                href="https://github.com/GyanaprakashKhandual"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 px-5 py-3.5 border border-black/15 dark:border-white/15 text-black/70 dark:text-white/70 font-medium rounded-lg text-sm hover:bg-black/4 dark:hover:bg-white/4 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              delay: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 70%, rgba(0,0,0,0.06) 100%)",
                  transform: "scale(1.15)",
                }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-black/8 dark:border-white/8"
                style={{ transform: "scale(1.3)" }}
              />
              {[0, 90, 180, 270].map((deg) => (
                <motion.div
                  key={deg}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-start justify-center"
                  style={{ transform: `scale(1.3) rotate(${deg}deg)` }}
                >
                  <div className="w-2 h-2 rounded-full bg-black/20 dark:bg-white/20 -mt-1" />
                </motion.div>
              ))}

              <div className="relative w-82 h-82 sm:w-112.5 sm:h-112.5 rounded-full overflow-hidden border-4 border-white dark:border-black">
                <img
                  src="https://res.cloudinary.com/dvytvjplt/image/upload/v1765866608/profile_pricture_oemv94.jpg"
                  alt="Gyana Prakash Khandual"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
