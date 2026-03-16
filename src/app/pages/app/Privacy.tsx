"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  Database,
  Lock,
  Mail,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const LAST_UPDATED = "January 01, 2026";

interface Section {
  icon: React.ReactNode;
  title: string;
  content: string | string[];
}

const sections: Section[] = [
  {
    icon: <Eye className="w-4 h-4" strokeWidth={1.8} />,
    title: "Information We Collect",
    content: [
      "This is a personal portfolio website. We do not collect any personally identifiable information unless you contact us directly.",
      "If you reach out via email or a contact form, we may retain your name and email address solely to respond to your inquiry.",
      "No accounts, registrations, or sign-ups are required to browse this site.",
    ],
  },
  {
    icon: <Database className="w-4 h-4" strokeWidth={1.8} />,
    title: "Cookies & Tracking",
    content: [
      "This site does not use any tracking cookies, advertising pixels, or third-party analytics services.",
      "Basic browser session data (such as dark mode preference) may be stored locally in your browser using localStorage. This data never leaves your device.",
      "No data is sold, shared, or used for advertising purposes.",
    ],
  },
  {
    icon: <Lock className="w-4 h-4" strokeWidth={1.8} />,
    title: "Data Storage & Security",
    content: [
      "No user data is stored on our servers beyond what is necessary to serve the website.",
      "All communication between your browser and this site is encrypted via HTTPS.",
      "We do not maintain any user databases or store personal information long-term.",
    ],
  },
  {
    icon: <RefreshCw className="w-4 h-4" strokeWidth={1.8} />,
    title: "Third-Party Services",
    content: [
      "This portfolio may link to external websites such as GitHub, LinkedIn, or other platforms. We are not responsible for the privacy practices of those sites.",
      "Any third-party integrations (fonts, icons) are loaded from trusted CDNs and do not collect personal data on our behalf.",
    ],
  },
  {
    icon: <Mail className="w-4 h-4" strokeWidth={1.8} />,
    title: "Contact",
    content: [
      "If you have any questions about this Privacy Policy or how your data is handled, you can reach out directly via GitHub or the contact details listed on this portfolio.",
    ],
  },
  {
    icon: <AlertTriangle className="w-4 h-4" strokeWidth={1.8} />,
    title: "Changes to This Policy",
    content: [
      "This policy may be updated occasionally. Any changes will be reflected on this page with a revised 'Last Updated' date.",
      "Continued use of the site after changes constitutes acceptance of the updated policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white border border-gray-900 dark:border-white flex items-center justify-center shrink-0">
                <Shield
                  className="w-5 h-5 text-white dark:text-gray-900"
                  strokeWidth={1.8}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Your privacy matters. This policy explains clearly what data
                  this portfolio collects, how it is used, and your rights.
                  Short version — we collect almost nothing.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                    Last updated: {LAST_UPDATED}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.08 + i * 0.07,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
              >
                {/* Section header */}
                <div className="flex items-center gap-2.5 mb-3.5">
                  <span className="text-gray-500 dark:text-gray-400">
                    {section.icon}
                  </span>
                  <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                    {section.title}
                  </h2>
                </div>

                {/* Content */}
                <div className="space-y-2.5">
                  {Array.isArray(section.content) ? (
                    section.content.map((para, j) => (
                      <p
                        key={j}
                        className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                      >
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.content}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-8"
          >
            © {new Date().getFullYear()} Gyana Prakash Khandual · MIT License
          </motion.p>
        </div>
      </div>
    </div>
  );
}
