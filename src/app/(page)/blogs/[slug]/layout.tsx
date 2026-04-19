"use client";

import Sidebar from "../components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 px-8 pt-2 pb-2">{children}</main>
      </div>
    </div>
  );
}
