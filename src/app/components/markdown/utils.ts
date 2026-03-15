export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─────────────────────────────────────────────────────────────
//  syntaxHighlight  –  single-pass tokenizer
//
//  Root cause of the old bug:
//    Each .replace() call ran on the *already-modified* string, so
//    the HTML injected by an earlier rule (e.g. style="color:#cf9cff")
//    was matched and re-wrapped by a later rule (e.g. the string regex
//    matching the quoted colour value).  The result was broken markup
//    like  #a3e4a1">"color:#cf9cff">mkdir …  visible in the screenshot.
//
//  Fix:
//    Scan the raw (escaped) source exactly once with a combined regex.
//    Every match is classified and immediately converted to a <span>.
//    Unmatched text between tokens is emitted as-is.
//    Because we never run a second regex over already-emitted HTML,
//    cascading corruption is impossible.
// ─────────────────────────────────────────────────────────────

export function syntaxHighlight(code: string, lang: string): string {
  // ------------------------------------------------------------------
  // 1.  HTML-escape the raw source ONCE, before any span is injected.
  // ------------------------------------------------------------------
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const src = escape(code);

  // ------------------------------------------------------------------
  // 2.  Colour palette (change here to retheme everything at once).
  // ------------------------------------------------------------------
  const C = {
    keyword:   "#cf9cff",
    literal:   "#f8965d",   // booleans, numbers, null/undefined
    string:    "#a3e4a1",
    comment:   "#8b8b8b",
    number:    "#f8965d",
    decorator: "#ffd700",
    jsonKey:   "#cf9cff",
    jsonNum:   "#69b3ff",
    variable:  "#f8965d",   // bash $VAR
    selector:  "#f8965d",   // css selectors
    property:  "#cf9cff",   // css properties
    value:     "#a3e4a1",   // css values
  } as const;

  // ------------------------------------------------------------------
  // 3.  Helper: wrap text in a coloured span.
  // ------------------------------------------------------------------
  const span = (colour: string, text: string) =>
    `<span style="color:${colour}">${text}</span>`;

  const spanComment = (text: string) =>
    `<span style="color:${C.comment};font-style:italic">${text}</span>`;

  const spanDecorator = (text: string) =>
    `<span style="color:${C.decorator};font-style:italic">${text}</span>`;

  // ------------------------------------------------------------------
  // 4.  Language-specific single-pass tokeniser.
  //
  //     Each branch builds ONE combined RegExp whose alternation groups
  //     are labelled by capture-group index.  We iterate matches, check
  //     which group fired, emit the appropriate span, and advance past
  //     the match.  Text between matches is appended verbatim.
  // ------------------------------------------------------------------

  /** Tokenise `src` with `pattern` (global flag required).
   *  `classify(match)` receives the RegExpExecArray and returns the
   *  coloured HTML for that token. */
  function tokenise(
    pattern: RegExp,
    classify: (m: RegExpExecArray) => string,
  ): string {
    let result = "";
    let lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = pattern.exec(src)) !== null) {
      // Emit any plain text before this token.
      if (m.index > lastIndex) {
        result += src.slice(lastIndex, m.index);
      }
      result += classify(m);
      lastIndex = m.index + m[0].length;

      // Guard against zero-length matches causing infinite loops.
      if (pattern.lastIndex === m.index) pattern.lastIndex++;
    }

    // Emit any remaining plain text.
    result += src.slice(lastIndex);
    return result;
  }

  // ── JavaScript / TypeScript / JSX / TSX ──────────────────────────
  if (["javascript", "js", "typescript", "ts", "tsx", "jsx"].includes(lang)) {
    const keywords = new Set([
      "const","let","var","function","class","return","if","else","for",
      "while","do","switch","case","break","continue","import","export",
      "default","from","async","await","try","catch","finally","new",
      "delete","typeof","instanceof","void","in","of","throw","extends",
      "implements","interface","type","enum","namespace","declare",
      "abstract","public","private","protected","static","readonly","override",
    ]);
    const literals = new Set(["true","false","null","undefined","NaN","Infinity"]);

    // Group indices:
    //  1 – block comment   /* … */
    //  2 – line comment    // …
    //  3 – template string ` … `
    //  4 – double-quoted string
    //  5 – single-quoted string
    //  6 – number
    //  7 – identifier (keyword or literal)
    const pattern =
      /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|(`)(?:[^`\\]|\\.)*`|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|\b(\d+\.?\d*)\b|\b([A-Za-z_$][\w$]*)\b/g;

    return tokenise(pattern, (m) => {
      if (m[1]) return spanComment(m[1]);                        // block comment
      if (m[2]) return spanComment(m[2]);                        // line comment
      if (m[0].startsWith("`")) return span(C.string, m[0]);     // template literal
      if (m[4]) return span(C.string, m[4]);                     // double-quoted
      if (m[5]) return span(C.string, m[5]);                     // single-quoted
      if (m[6] !== undefined) return span(C.literal, m[6]);      // number
      const word = m[7];
      if (word) {
        if (keywords.has(word)) return span(C.keyword, word);
        if (literals.has(word)) return span(C.literal, word);
      }
      return m[0]; // plain identifier
    });
  }

  // ── Python ───────────────────────────────────────────────────────
  if (["python", "py"].includes(lang)) {
    const keywords = new Set([
      "def","class","return","if","elif","else","for","while","import",
      "from","as","pass","break","continue","try","except","finally",
      "with","lambda","yield","global","nonlocal","del","assert","raise",
      "not","and","or","in","is","None","True","False",
    ]);

    // Groups:
    //  1 – triple-double-quoted string
    //  2 – triple-single-quoted string
    //  3 – double-quoted string
    //  4 – single-quoted string
    //  5 – comment
    //  6 – decorator
    //  7 – number
    //  8 – identifier
    const pattern =
      /("""[\s\S]*?""")|('''[\s\S]*?''')|(```)|((?:"(?:[^"\\]|\\.)*")|(?:'(?:[^'\\]|\\.)*'))|(#[^\n]*)|(@[\w.]+)\b|\b(\d+\.?\d*)\b|\b([A-Za-z_][\w]*)\b/g;

    return tokenise(pattern, (m) => {
      if (m[1]) return span(C.string, m[1]);
      if (m[2]) return span(C.string, m[2]);
      if (m[4]) return span(C.string, m[4]);
      if (m[5]) return spanComment(m[5]);
      if (m[6]) return spanDecorator(m[6]);
      if (m[7] !== undefined) return span(C.number, m[7]);
      const word = m[8];
      if (word && keywords.has(word)) return span(C.keyword, word);
      return m[0];
    });
  }

  // ── CSS / SCSS ────────────────────────────────────────────────────
  if (["css", "scss"].includes(lang)) {
    // Groups:
    //  1 – block comment
    //  2 – string
    //  3 – selector  (.foo, #bar, div)
    //  4 – property name  (comes before a colon)
    //  5 – property value  (comes after a colon, up to ; or })
    const pattern =
      /(\/\*[\s\S]*?\*\/)|((?:"[^"]*"|'[^']*'))|([.#][\w-]+|[a-zA-Z][\w-]*(?=\s*\{))|([\w-]+)(?=\s*:)|(?<=:\s*)([^;{}]+)/g;

    return tokenise(pattern, (m) => {
      if (m[1]) return spanComment(m[1]);
      if (m[2]) return span(C.string, m[2]);
      if (m[3]) return span(C.selector, m[3]);
      if (m[4]) return span(C.property, m[4]);
      if (m[5]) return span(C.value, m[5]);
      return m[0];
    });
  }

  // ── Bash / Shell ─────────────────────────────────────────────────
  if (["bash", "sh", "shell"].includes(lang)) {
    const keywords = new Set([
      "echo","cd","ls","mkdir","rm","cp","mv","cat","grep","sed","awk",
      "find","chmod","chown","sudo","apt","npm","yarn","git","docker",
      "curl","wget","export","source","set","unset","if","then","else",
      "fi","for","do","done","while","function","return","exit","read",
      "test","true","false","case","esac","in","select","until","time",
    ]);

    // Groups:
    //  1 – comment
    //  2 – double-quoted string
    //  3 – single-quoted string
    //  4 – $VARIABLE or ${VARIABLE}
    //  5 – keyword / command
    const pattern =
      /(#[^\n]*)|(```)|((?:"(?:[^"\\]|\\.)*")|(?:'[^']*'))|(\$\{?[\w]+\}?)|(\b[a-zA-Z_][\w-]*\b)/g;

    return tokenise(pattern, (m) => {
      if (m[1]) return spanComment(m[1]);
      if (m[3]) return span(C.string, m[3]);
      if (m[4]) return span(C.variable, m[4]);
      const word = m[5];
      if (word && keywords.has(word)) return span(C.keyword, word);
      return m[0];
    });
  }

  // ── SQL ───────────────────────────────────────────────────────────
  if (lang === "sql") {
    const kwPattern =
      /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|VIEW|FUNCTION|PROCEDURE|AS|AND|OR|NOT|IN|LIKE|ILIKE|BETWEEN|IS|NULL|DISTINCT|COUNT|SUM|AVG|MAX|MIN|COALESCE|CASE|WHEN|THEN|ELSE|END|WITH|UNION|ALL|EXISTS|ANY|SOME|RETURNING|BEGIN|COMMIT|ROLLBACK|TRANSACTION)\b/gi;

    // Groups:
    //  1 – comment  (-- or #)
    //  2 – string
    //  3 – number
    const pattern = /(--[^\n]*|#[^\n]*)|((?:"[^"]*"|'[^']*'))|(\b\d+\.?\d*\b)/g;

    // Two-phase: first tokenise comments / strings / numbers (safe),
    // then apply keyword highlighting only to the plain-text segments.
    // We achieve this by building the output piecemeal.
    const tokens: Array<{ plain: string } | { html: string }> = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(src)) !== null) {
      if (m.index > lastIndex) {
        tokens.push({ plain: src.slice(lastIndex, m.index) });
      }
      if (m[1]) tokens.push({ html: spanComment(m[1]) });
      else if (m[2]) tokens.push({ html: span(C.string, m[2]) });
      else if (m[3]) tokens.push({ html: span(C.literal, m[3]) });
      lastIndex = m.index + m[0].length;
    }
    tokens.push({ plain: src.slice(lastIndex) });

    return tokens
      .map((t) => {
        if ("html" in t) return t.html;
        // Apply keyword highlighting to plain segments only.
        return t.plain.replace(kwPattern, (kw) => span(C.keyword, kw));
      })
      .join("");
  }

  // ── JSON ──────────────────────────────────────────────────────────
  if (lang === "json") {
    // Groups:
    //  1 – object key  ("key" followed by :)
    //  2 – string value  (string NOT followed by :)
    //  3 – boolean / null
    //  4 – number
    const pattern =
      /("(?:[^"\\]|\\.)*")(?=\s*:)|("(?:[^"\\]|\\.)*")|\b(true|false|null)\b|\b(\d+\.?\d*)\b/g;

    return tokenise(pattern, (m) => {
      if (m[1]) return `"${span(C.jsonKey, m[1].slice(1, -1))}"`;
      if (m[2]) return span(C.string, m[2]);
      if (m[3]) return span(C.literal, m[3]);
      if (m[4] !== undefined) return span(C.jsonNum, m[4]);
      return m[0];
    });
  }

  // ── Fallback: return escaped source with no highlighting ──────────
  return src;
}
