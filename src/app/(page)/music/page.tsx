import MusicWelcomePage from './pages/Music.welcome.page';

export const metadata = {
  title: "Discover my music",
  description: "Explore my music projects, tracks, and collaborations in software development.",
};

function page() {
  return (
    <div>
      <MusicWelcomePage/>
    </div>
  )
}

export default page