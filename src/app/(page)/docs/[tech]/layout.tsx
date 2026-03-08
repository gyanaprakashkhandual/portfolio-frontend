import DocSidebar from "@/app/components/Doc.sidebar";

interface DocsLayoutProps {
  children: React.ReactNode;
  params: { tech: string };
}

export default async function DocsLayout({ children, params }: DocsLayoutProps) {
  const { tech } = await params;
  return (
    <div className="flex h-[calc(100vh-56px)] bg-white dark:bg-gray-950 overflow-hidden">
      <DocSidebar techSlug={tech} />
      <main className="flex-1 overflow-y-auto main-scrollbar">
        {children}
      </main>
    </div>
  );
}