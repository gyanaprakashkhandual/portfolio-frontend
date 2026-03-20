import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import docRegistry from "@/app/utils/doc.registry";
import fileMap from "@/app/script/doc.file.map";
import sidebarItems from "@/app/script/doc.sidebar.item";
import { flattenSidebarItems } from "@/app/utils/slug.util";
import DocPageClient from "./Doc.page.client";

interface DocSlugPageProps {
  params: { tech: string; slug: string };
}

export async function generateStaticParams() {
  const params: { tech: string; slug: string }[] = [];
  for (const tech of docRegistry) {
    const sections = sidebarItems[tech.slug] ?? [];
    const flat = flattenSidebarItems(sections);
    for (const item of flat) {
      
      params.push({ tech: tech.slug, slug: item.slug });
    }
  }
  return params;
}

export default async function DocSlugPage({ params }: DocSlugPageProps) {
  const { tech: techSlug, slug } = await params;
  const tech = docRegistry.find((d) => d.slug === techSlug);
  if (!tech) notFound();

  const techFileMap = fileMap[techSlug];
  if (!techFileMap) notFound();

  const entry = techFileMap[slug];
  if (!entry) notFound();

  let content = "";
  try {
    const fullPath = path.join(process.cwd(), "src/app", entry.filePath);
    content = fs.readFileSync(fullPath, "utf-8");
  } catch {
    content = `# ${slug}\n\nContent for this page is not yet available.`;
  }

  const sections = sidebarItems[techSlug] ?? [];
  const flat = flattenSidebarItems(sections);
  const currentIndex = flat.findIndex((f) => f.slug === slug);
  const prevItem = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const nextItem =
    currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null;

  return (
    <DocPageClient
      content={content}
      fileName={entry.fileName}
      techSlug={techSlug}
      docSlug={slug}
      prevItem={
        prevItem ? { label: prevItem.label, slug: prevItem.slug } : null
      }
      nextItem={
        nextItem ? { label: nextItem.label, slug: nextItem.slug } : null
      }
    />
  );
}