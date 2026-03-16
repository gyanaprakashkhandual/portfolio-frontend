/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";
import { FaCoffee } from "react-icons/fa";
import { useTheme } from "../context/Theme.context";
import { Tooltip } from "./ui/Tooltip.ui";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavLink {
  label: string;
  href: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_LINKS: NavLink[] = [
  { label: "Skills", href: "/skills" },
  { label: "Projects", href: "/projects" },
  { label: "Education", href: "/education" },
  { label: "Experience", href: "/experience" },
  { label: "Blogs", href: "/blogs" },
  { label: "Docs", href: "/docs" },
  { label: "Music", href: "/music" },
  { label: "Contact", href: "/contact" },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { theme, resolvedTheme, setTheme, mounted } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close theme menu when clicking outside
  useEffect(() => {
    if (!themeOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('[aria-label="Toggle theme"]') &&
        !target.closest(".theme-menu")
      ) {
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [themeOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navigate = (href: string) => router.push(href);

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 left-0 right-0 z-50
          bg-white/90 dark:bg-neutral-950/90
          backdrop-blur-md
          border-b border-neutral-200/80 dark:border-neutral-800/80
          transition-shadow duration-300
          ${scrolled ? "shadow-sm shadow-black/5 dark:shadow-black/30" : ""}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* ── Logo ── */}
            <motion.button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 shrink-0 group"
            >
              <span className="flex items-center justify-center w-8 h-8 text-black dark:text-blue-950 transition-colors">
                <FaCoffee className="w-8 h-8" strokeWidth={2} />
              </span>
              <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                Gyan
              </span>
            </motion.button>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.button
                    key={link.href}
                    onClick={() => navigate(link.href)}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i + 0.2, duration: 0.3 }}
                    className={`
                      relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150
                      ${
                        isActive
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                      }
                    `}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-neutral-100 dark:bg-neutral-800"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              {mounted && (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setThemeOpen(!themeOpen)}
                    aria-label="Toggle theme"
                    title={`Current theme: ${theme}`}
                    className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {resolvedTheme === "dark" ? (
                        <motion.span
                          key="sun"
                          initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                          exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="flex"
                        >
                          <Sun className="w-4 h-4" strokeWidth={1.8} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="moon"
                          initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                          exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="flex"
                        >
                          <Moon className="w-4 h-4" strokeWidth={1.8} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Theme dropdown menu */}
                  <AnimatePresence>
                    {themeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="theme-menu absolute right-0 mt-2 w-40 rounded-lg bg-white dark:bg-neutral-900 shadow-lg shadow-black/10 dark:shadow-black/40 border border-neutral-200 dark:border-neutral-800 overflow-hidden z-60"
                      >
                        {(["light", "dark", "system"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setTheme(t);
                              setThemeOpen(false);
                            }}
                            className={`
                              w-full px-4 py-2.5 text-left text-sm font-medium transition-colors
                              ${
                                theme === t
                                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white"
                              }
                            `}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)} theme
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile hamburger */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden ml-1 p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex"
                  >
                    {mobileOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
            >
              <div className="px-4 py-3 space-y-0.5">
                {NAV_LINKS.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.button
                      key={link.href}
                      initial={{ x: -12, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}
                      onClick={() => navigate(link.href)}
                      className={`
                        w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${
                          isActive
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white"
                        }
                      `}
                    >
                      {link.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer so content doesn't hide under fixed navbar */}
      <div className="h-14" />
    </>
  );
}
