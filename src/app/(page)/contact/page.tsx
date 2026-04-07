import ContactPage from "./Contact.page";

export const metadata = {
  title: "Contact Me",
  description:
    "Get in touch with me! Whether you have a question, want to collaborate, or just want to say hi, I'm always open to connecting. Fill out the contact form or find my social media links here.",
};

function page() {
  return (
    <div>
      <ContactPage />
    </div>
  );
}

export default page;
