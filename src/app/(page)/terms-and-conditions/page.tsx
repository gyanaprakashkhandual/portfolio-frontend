import TermsPage from "@/app/pages/app/Terms";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Read the terms and conditions for using this portfolio website and its open source code. By using this site you agree to these terms. The code is MIT licensed — use it freely.",
};
export default function TermsConditions() {
  return (
    <div>
      <TermsPage />
    </div>
  );
}
