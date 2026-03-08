import ProjectsSidebar from "@/app/components/Project.sidebar";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-56px)] bg-white dark:bg-gray-900 overflow-hidden">
      <ProjectsSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
