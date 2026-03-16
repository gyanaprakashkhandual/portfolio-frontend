import ExperiencePage from "./pages/Experience.page";

export const metadata = {
  title: "My Work - Experience",
  description:
    "Discover my professional journey, from software engineering roles to impactful internships. Explore the companies I've worked with, the projects I've contributed to, and the skills I've honed along the way.",
};

function page() {
  return (
    <div>
      <ExperiencePage />
    </div>
  );
}

export default page;
