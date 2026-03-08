import docRegistry from "@/app/utils/doc.registry";
import Link from "next/link";

export const metadata = {
  title: "Documentation",
  description: "Browse documentation for various technologies",
};

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Documentation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Browse comprehensive guides and documentation for various technologies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {docRegistry.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{doc.icon}</span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {doc.label}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {doc.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 font-medium">
                  {doc.totalDocs} documents
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
