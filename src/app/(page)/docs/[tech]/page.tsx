import { notFound } from "next/navigation";
import docRegistry from "@/app/utils/doc.registry";
import sidebarItems from "@/app/script/doc.sidebar.item";
import { labelToSlug } from "@/app/utils/slug.util";
import Link from "next/link";

interface DocsPageProps {
  params: { tech: string };
}

export async function generateStaticParams() {
  return docRegistry.map((d) => ({ tech: d.slug }));
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { tech: techSlug } = await params;
  const tech = docRegistry.find((d) => d.slug === techSlug);
  if (!tech) notFound();

  const sections = sidebarItems[techSlug] ?? [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{tech.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {tech.label}
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
          {tech.description}
        </p>
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            {tech.totalDocs} documents
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            {sections.length} sections
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {section.label}
              </h2>
            </div>
            <div className="p-3 flex flex-wrap gap-2">
              {section.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/docs/${techSlug}/${labelToSlug(child.label)}`}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-white transition-all duration-150"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}