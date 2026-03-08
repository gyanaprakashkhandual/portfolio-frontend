import BlogSidebar from "@/app/components/Blog.sidebar";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-56px)] bg-white overflow-hidden dark:bg-gray-950 main-scrollbar">
      <BlogSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
