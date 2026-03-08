export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function syntaxHighlight(code: string, lang: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const escaped = escape(code);

  if (["javascript", "js", "typescript", "ts", "tsx", "jsx"].includes(lang)) {
    return escaped
      .replace(
        /\b(const|let|var|function|class|return|if|else|for|while|do|switch|case|break|continue|import|export|default|from|async|await|try|catch|finally|new|delete|typeof|instanceof|void|in|of|throw|extends|implements|interface|type|enum|namespace|declare|abstract|public|private|protected|static|readonly|override)\b/g,
        '<span style="color:#cf9cff">$1</span>',
      )
      .replace(
        /\b(true|false|null|undefined|NaN|Infinity)\b/g,
        '<span style="color:#f8965d">$1</span>',
      )
      .replace(
        /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
        '<span style="color:#a3e4a1">$1</span>',
      )
      .replace(
        /\/\/[^\n]*/g,
        '<span style="color:#8b8b8b;font-style:italic">$&</span>',
      )
      .replace(
        /\/\*[\s\S]*?\*\//g,
        '<span style="color:#8b8b8b;font-style:italic">$&</span>',
      )
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#f8965d">$1</span>');
  }

  if (["python", "py"].includes(lang)) {
    return escaped
      .replace(
        /\b(def|class|return|if|elif|else|for|while|import|from|as|pass|break|continue|try|except|finally|with|lambda|yield|global|nonlocal|del|assert|raise|not|and|or|in|is|None|True|False)\b/g,
        '<span style="color:#cf9cff">$1</span>',
      )
      .replace(
        /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\')/g,
        '<span style="color:#a3e4a1">$1</span>',
      )
      .replace(
        /#[^\n]*/g,
        '<span style="color:#8b8b8b;font-style:italic">$&</span>',
      )
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#f8965d">$1</span>')
      .replace(
        /@[\w.]+/g,
        '<span style="color:#ffd700;font-style:italic">$&</span>',
      );
  }

  if (["css", "scss"].includes(lang)) {
    return escaped
      .replace(
        /([.#][\w-]+|[a-zA-Z][\w-]*(?=\s*\{))/g,
        '<span style="color:#f8965d">$1</span>',
      )
      .replace(/([\w-]+)(?=\s*:)/g, '<span style="color:#cf9cff">$1</span>')
      .replace(/:\s*([^;{]+)/g, ': <span style="color:#a3e4a1">$1</span>')
      .replace(
        /\/\*[\s\S]*?\*\//g,
        '<span style="color:#8b8b8b;font-style:italic">$&</span>',
      );
  }

  if (["bash", "sh", "shell"].includes(lang)) {
    return escaped
      .replace(
        /\b(echo|cd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk|find|chmod|chown|sudo|apt|npm|yarn|git|docker|curl|wget|export|source|set|unset|if|then|else|fi|for|do|done|while|function)\b/g,
        '<span style="color:#cf9cff">$1</span>',
      )
      .replace(
        /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
        '<span style="color:#a3e4a1">$1</span>',
      )
      .replace(
        /#[^\n]*/g,
        '<span style="color:#8b8b8b;font-style:italic">$&</span>',
      )
      .replace(/\$[\w{][^}\s]*/g, '<span style="color:#f8965d">$&</span>');
  }

  if (["sql"].includes(lang)) {
    return escaped
      .replace(
        /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|VIEW|FUNCTION|PROCEDURE|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|DISTINCT|COUNT|SUM|AVG|MAX|MIN|COALESCE|CASE|WHEN|THEN|ELSE|END|WITH|UNION|ALL)\b/gi,
        '<span style="color:#cf9cff">$1</span>',
      )
      .replace(
        /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
        '<span style="color:#a3e4a1">$1</span>',
      )
      .replace(
        /--[^\n]*/g,
        '<span style="color:#8b8b8b;font-style:italic">$&</span>',
      )
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#f8965d">$1</span>');
  }

  if (["json"].includes(lang)) {
    return escaped
      .replace(
        /"([\w\s-]+)"(?=\s*:)/g,
        '"<span style="color:#cf9cff">$1</span>"',
      )
      .replace(
        /:\s*("(?:[^"\\]|\\.)*")/g,
        ': <span style="color:#a3e4a1">$1</span>',
      )
      .replace(
        /\b(true|false|null)\b/g,
        '<span style="color:#f8965d">$1</span>',
      )
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#69b3ff">$1</span>');
  }

  return escaped;
}
