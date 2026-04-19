import { notFound } from "next/navigation";
import { getBlogBySlug } from "../data/Blogs";
import ShowMarkdownPage from "../content/package/Render.md";
import SendenvDocs from "../content/package/Send.env";

const componentMap: Record<string, React.ComponentType> = {
  "how-to-use-showmarkdown-package": ShowMarkdownPage,
  "how-to-use-sendenv": SendenvDocs,
};

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [
    { slug: "how-to-use-showmarkdown-package" },
    { slug: "how-to-use-sendenv" },
  ];
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  const blog = getBlogBySlug(slug);
  const Component = componentMap[slug];

  if (!blog || !Component) {
    notFound();
  }

  return <Component />;
}
