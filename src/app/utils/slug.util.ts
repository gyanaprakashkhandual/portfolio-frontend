export function labelToSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function flattenSidebarItems(
  sections: import("../script/doc.sidebar.item").SidebarSection[],
): { id: string; label: string; slug: string; sectionLabel: string }[] {
  const result: {
    id: string;
    label: string;
    slug: string;
    sectionLabel: string;
  }[] = [];

  function walk(
    items: import("../script/doc.sidebar.item").SidebarSection["children"],
    sectionLabel: string,
  ) {
    for (const item of items) {
      result.push({
        id: item.id,
        label: item.label,
        slug: labelToSlug(item.label),
        sectionLabel,
      });
      if (item.children) {
        walk(item.children, sectionLabel);
      }
    }
  }

  for (const section of sections) {
    walk(section.children, section.label);
  }

  return result;
}
