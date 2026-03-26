"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/configs/env.config";
import {
  FolderOpen,
  ExternalLink,
  Github,
  ArrowRight,
  Loader2,
  Tag,
  Layers,
} from "lucide-react";
import ProjectsSkeletonLoader from "../components/Loader";

const BASE_URL = api.projects;

interface Project {
  projectName: string;
  projectSlug: string;
  projectDescription: string;
  projectOverview: string;
  projectType: string;
  projectTags: string[];
  projectTechnologies: string[];
  projectLiveDemo: string;
  projectFrontendRepository: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(BASE_URL)
      .then((r) => r.json())
      .then((res) => setProjects(res.data ?? []))
      .catch(() => setError("Failed to load projects."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <ProjectsSkeletonLoader/>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="px-5 py-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <Layers
              className="w-4 h-4 text-gray-600 dark:text-gray-400"
              strokeWidth={1.8}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            All Projects
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500 ml-12">
          {projects.length} projects — click any card to explore details
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {projects.map((project, i) => (
          <motion.div
            key={project.projectSlug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.07,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => router.push(`/projects/${project.projectSlug}`)}
            className="
              group cursor-pointer rounded-2xl flex flex-col gap-4 p-5
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-800
              hover:border-gray-300 dark:hover:border-gray-700
              hover:shadow-md dark:hover:shadow-black/30
              transition-all duration-200
            "
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <FolderOpen
                    className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0"
                    strokeWidth={1.8}
                  />
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">
                    {project.projectType}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors truncate">
                  {project.projectName}
                </h2>
              </div>
              <ArrowRight
                className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-1"
                strokeWidth={1.8}
              />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
              {project.projectDescription}
            </p>

            {/* Overview excerpt */}
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed line-clamp-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
              {project.projectOverview?.slice(0, 200)}…
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {project.projectTags.map((tag) => (
                <span
                  key={tag}
                  className="
                    inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg
                    bg-gray-100 dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    text-gray-500 dark:text-gray-400
                  "
                >
                  <Tag className="w-2.5 h-2.5" strokeWidth={2} />
                  {tag}
                </span>
              ))}
            </div>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-1">
              {project.projectTechnologies.slice(0, 6).map((tech) => (
                <span
                  key={tech}
                  className="
                    text-[11px] px-2 py-0.5 rounded-md font-medium
                    bg-gray-900 dark:bg-white
                    text-white dark:text-gray-900
                    border border-gray-900 dark:border-white
                  "
                >
                  {tech}
                </span>
              ))}
              {project.projectTechnologies.length > 6 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md text-gray-400 dark:text-gray-600">
                  +{project.projectTechnologies.length - 6} more
                </span>
              )}
            </div>

            {/* Footer links */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <a
                href={project.projectLiveDemo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                Live Demo
              </a>
              <a
                href={project.projectFrontendRepository}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Github className="w-3.5 h-3.5" strokeWidth={1.8} />
                Repository
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
