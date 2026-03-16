import MusicList from "@/app/(page)/music/components/Music.list";


export default function MusicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-56px)] bg-white overflow-hidden main-scrollbar dark:bg-gray-950">
        <MusicList />
      {children}
    </div>
  );
}