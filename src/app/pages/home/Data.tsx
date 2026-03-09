import {
  Code2,
  Shield,
  TestTube,
  Gauge,
  Terminal,
  Github,
  Rocket,
  Award,
} from "lucide-react";

export const skills = [
  {
    name: "TypeScript",
    category: "Language",
    color: "from-blue-500/10 to-blue-600/5",
  },
  {
    name: "React.js",
    category: "Frontend",
    color: "from-cyan-500/10 to-cyan-600/5",
  },
  {
    name: "Express.js",
    category: "Backend",
    color: "from-gray-500/10 to-gray-600/5",
  },
  {
    name: "MongoDB",
    category: "Database",
    color: "from-green-500/10 to-green-600/5",
  },
  {
    name: "Next.js",
    category: "Full Stack",
    color: "from-slate-500/10 to-slate-600/5",
  },
  {
    name: "Selenium",
    category: "Testing",
    color: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    name: "REST Assured",
    category: "API Testing",
    color: "from-orange-500/10 to-orange-600/5",
  },
  {
    name: "Grafana",
    category: "Monitoring",
    color: "from-amber-500/10 to-amber-600/5",
  },
  {
    name: "Metasploit",
    category: "Security",
    color: "from-red-500/10 to-red-600/5",
  },
  { name: "Docker", category: "DevOps", color: "from-sky-500/10 to-sky-600/5" },
];

export const stats = [
  { label: "Full Stack Apps", value: "16+", icon: Rocket, accent: "#3b82f6" },
  { label: "Automation Tests", value: "7+", icon: TestTube, accent: "#10b981" },
  { label: "API Tests", value: "7+", icon: Terminal, accent: "#f59e0b" },
  { label: "Perf. Tests", value: "12+", icon: Gauge, accent: "#8b5cf6" },
  { label: "Custom Reports", value: "130+", icon: Award, accent: "#ec4899" },
  { label: "Lines of Code", value: "700K+", icon: Code2, accent: "#06b6d4" },
  { label: "Devices Secured", value: "16+", icon: Shield, accent: "#ef4444" },
  { label: "GitHub Repos", value: "124+", icon: Github, accent: "#6366f1" },
];

export const projects = [
  {
    name: "Caffetest",
    tag: "Bug Tracking · AI",
    description:
      "A next-generation bug tracking application integrated with Anthropic AI. Features intelligent auto bug lock based on real-time test results, automated reports, and smart defect analysis.",
    users: "400+",
    tech: ["Next.js", "MongoDB", "Anthropic API"],
    links: {
      app: "https://caffetest.vercel.app",
      frontend: "https://github.com/GyanaprakashKhandual/Caffetest-app",
      backend: "https://github.com/GyanaprakashKhandual/Caffetest-web",
    },
    gradient: "from-blue-500/5 to-indigo-500/5",
  },
  {
    name: "Fetch",
    tag: "API Testing · AI",
    description:
      "Automatic API testing powered by Anthropic. Intelligently scans your entire codebase, maps all endpoints, and generates comprehensive test suites — completely autonomously.",
    users: "200+",
    tech: ["React.js", "Express.js", "Anthropic API"],
    links: {
      app: "https://fetch.metronique.vercel.app",
      frontend: "https://github.com/GyanaprakashKhandual/Metronique-Fetch-App",
      backend: "https://github.com/GyanaprakashKhandual/Metronique-Fetch-Web",
    },
    gradient: "from-emerald-500/5 to-teal-500/5",
  },
];

export const extensions = [
  {
    name: "Selenium Cucumber",
    description:
      "Auto-generates step definition code from raw Cucumber BDD. Slashes boilerplate and accelerates test automation workflows inside VS Code.",
    installs: "6,661+",
    color: "from-green-500/10",
  },
  {
    name: "Caffetest Tracker",
    description:
      "Brings bug tracking and reporting directly into VS Code. Seamlessly integrates Caffetest's full power into your development environment.",
    installs: "224+",
    color: "from-blue-500/10",
  },
];

export const testimonials = [
  {
    name: "Dharmendra Kumar",
    role: "Product Manager",
    company: "Avidus Interactive",
    feedback:
      "Gyan's expertise in full-stack development and test automation has been invaluable. The quality of work is exceptional.",
    avatar: "DK",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Adishree Agrwal",
    role: "CEO",
    company: "Avidus Interactive",
    feedback:
      "Working with Gyan was a game-changer. The AI-integrated solutions delivered exceeded our expectations every single time.",
    avatar: "AA",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Ankshika Mishra",
    role: "Lead Developer",
    company: "Avidus Interactive",
    feedback:
      "Outstanding technical skills and problem-solving abilities. The automation tools built saved us countless hours of manual work.",
    avatar: "AM",
    color: "from-violet-500 to-purple-500",
  },
];

export const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

import { Variants } from "framer-motion";

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};
