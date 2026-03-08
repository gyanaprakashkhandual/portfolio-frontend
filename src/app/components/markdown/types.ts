export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export interface CodeBlockProps {
  code: string;
  language: string;
}

export interface ListItem {
  depth: number;
  text: string;
  checked: boolean | null;
  children: ListItem[];
}

export interface TocItem {
  level: number;
  text: string;
  id: string;
}
