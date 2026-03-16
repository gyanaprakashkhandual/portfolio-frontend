import EducationPage from "./pages/Education.page";

export const metadata = {
  title: "My Education",
  description:
    "Explore my academic background, including degrees, certifications, and relevant coursework that have shaped my knowledge and skills in software development.",
};

function page() {
  return (
    <div>
      <EducationPage />
    </div>
  );
}

export default page;
