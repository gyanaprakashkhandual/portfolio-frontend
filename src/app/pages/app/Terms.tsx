"use client";

import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Globe,
  Code2,
  AlertTriangle,
  Scale,
  Mail,
} from "lucide-react";

const LAST_UPDATED = "January 01, 2026";

interface Section {
  icon: React.ReactNode;
  title: string;
  content: string | string[];
}

const sections: Section[] = [
  {
    icon: <Globe className="w-4 h-4" strokeWidth={1.8} />,
    title: "Acceptance of Terms",
    content: [
      "By accessing and using this portfolio website, you accept and agree to be bound by these Terms of Use.",
      "If you do not agree to these terms, please discontinue use of the site immediately.",
    ],
  },
  {
    icon: <CheckCircle2 className="w-4 h-4" strokeWidth={1.8} />,
    title: "Permitted Use",
    content: [
      "You may browse, read, and reference any content on this portfolio for personal, educational, or professional purposes.",
      "The source code of this portfolio is open source under the MIT License. You are free to fork, clone, modify, and use it for your own projects — personal or commercial — with attribution.",
      "You may share links to this portfolio or its blog posts freely.",
    ],
  },
  {
    icon: <XCircle className="w-4 h-4" strokeWidth={1.8} />,
    title: "Prohibited Use",
    content: [
      "You may not impersonate the author or misrepresent this portfolio as your own original work without modification.",
      "You may not use this site to transmit spam, malware, or any harmful content.",
      "Scraping or automated harvesting of personal contact information from this site is not permitted.",
    ],
  },
  {
    icon: <Code2 className="w-4 h-4" strokeWidth={1.8} />,
    title: "Intellectual Property",
    content: [
      "The written content, project descriptions, and blog posts on this site are the intellectual property of Gyana Prakash Khandual.",
      "The portfolio source code is released under the MIT License — see the LICENSE file in the repository for full terms.",
      "Third-party libraries, icons, and fonts used in this project retain their own respective licenses.",
    ],
  },
  {
    icon: <AlertTriangle className="w-4 h-4" strokeWidth={1.8} />,
    title: "Disclaimer",
    content: [
      "This portfolio is provided 'as is' without any warranties, express or implied. The author makes no guarantees regarding the accuracy, completeness, or availability of the content.",
      "The author is not liable for any damages arising from the use of or inability to use this website.",
      "External links on this site lead to third-party websites. We are not responsible for their content or practices.",
    ],
  },
  {
    icon: <Scale className="w-4 h-4" strokeWidth={1.8} />,
    title: "Governing Law",
    content: [
      "These terms are governed by the laws of India. Any disputes arising from the use of this site shall be subject to the jurisdiction of courts in Odisha, India.",
    ],
  },
  {
    icon: <Mail className="w-4 h-4" strokeWidth={1.8} />,
    title: "Contact",
    content: [
      "For any questions regarding these Terms of Use, please reach out via GitHub or the contact details listed on this portfolio.",
    ],
  },
];

export default function TermsPage() {
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
                <FileText
                  className="w-5 h-5 text-white dark:text-gray-900"
                  strokeWidth={1.8}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  These terms govern your use of this portfolio website and its
                  open source code. By using this site you agree to these terms.
                  The code is MIT licensed — use it freely.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                    Last updated: {LAST_UPDATED}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-medium">
                    MIT License
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
            transition={{ delay: 0.7, duration: 0.3 }}
            className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-8"
          >
            © {new Date().getFullYear()} Gyana Prakash Khandual · MIT License
          </motion.p>
        </div>
      </div>
    </div>
  );
}
