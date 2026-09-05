export type Lang = "java" | "yaml" | "bash" | "dockerfile" | "xml" | "json" | "text";

type Rule = [source: string, cls: string];

const JAVA: Rule[] = [
  ["\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/", "cm"],
  ['"(?:\\\\.|[^"\\\\\\n])*"', "st"],
  ["@[\\w.]+", "an"],
  [
    "\\b(?:package|import|public|private|protected|class|record|interface|enum|extends|implements|static|final|void|new|return|if|else|for|while|do|try|catch|finally|throw|throws|this|super|abstract|default|switch|case|break|continue|var|instanceof|null|true|false|sealed|permits|assert)\\b",
    "kw",
  ],
  ["\\b[A-Z][A-Za-z0-9_]*\\b", "ty"],
  ["\\b\\d[\\d_]*(?:\\.\\d+)?[fFdDlL]?\\b", "nu"],
];

const YAML: Rule[] = [
  ["#[^\\n]*", "cm"],
  ['"(?:[^"\\\\\\n]|\\\\.)*"|\'[^\']*\'', "st"],
  ["\\$\\{[^}]*\\}|\\$[\\w]+", "vr"],
  ["^ *(?:- *)?[\\w.$-]+(?= *:)", "ky"],
  ["\\b(?:true|false|null|yes|no|on|off)\\b", "kw"],
  ["\\b-?\\d[\\d.]*(?:ms|s|m|h|%)?\\b", "nu"],
];

const BASH: Rule[] = [
  ["#[^\\n]*", "cm"],
  ['"(?:[^"\\\\\\n]|\\\\.)*"|\'[^\']*\'', "st"],
  ["\\$\\{[^}]*\\}|\\$[\\w]+", "vr"],
  ["(?<=^|\\n|&& *|; *)(?:sudo +)?(?:curl|tar|mvn|docker|java|git|cd|ls|cat|export|mkdir|echo|./mvnw|./gradlew)\\b", "fn"],
  ["(?<= )--?[\\w][\\w-]*", "fl"],
];

const DOCKERFILE: Rule[] = [
  ["#[^\\n]*", "cm"],
  ['"(?:[^"\\\\\\n]|\\\\.)*"', "st"],
  ["\\$\\{[^}]*\\}|\\$[\\w]+", "vr"],
  ["(?<=^|\\n)(?:FROM|RUN|COPY|ADD|WORKDIR|EXPOSE|ENV|ENTRYPOINT|CMD|ARG|LABEL|USER|HEALTHCHECK|AS)\\b", "kw"],
  ["(?<= )--?[\\w][\\w-]*", "fl"],
];

const XML: Rule[] = [
  ["<!--[\\s\\S]*?-->", "cm"],
  ['"[^"]*"', "st"],
  ["</?[A-Za-z][\\w.:-]*|/?>", "tg"],
  ["(?<= )[\\w:-]+(?==)", "at"],
];

const JSON_: Rule[] = [
  ['"(?:\\\\.|[^"\\\\])*"(?=\\s*:)', "ky"],
  ['"(?:\\\\.|[^"\\\\])*"', "st"],
  ["\\b(?:true|false|null)\\b", "kw"],
  ["-?\\b\\d+(?:\\.\\d+)?\\b", "nu"],
];

const RULES: Record<Lang, Rule[]> = {
  java: JAVA,
  yaml: YAML,
  bash: BASH,
  dockerfile: DOCKERFILE,
  xml: XML,
  json: JSON_,
  text: [],
};

const cache = new Map<string, RegExp>();

function master(lang: Lang): RegExp | null {
  const rules = RULES[lang];
  if (rules.length === 0) return null;
  const key = lang;
  let re = cache.get(key);
  if (!re) {
    re = new RegExp(rules.map(([src]) => `(${src})`).join("|"), "gm");
    cache.set(key, re);
  }
  return re;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Gera HTML com spans de sintaxe. O código já sai escapado — usar com dangerouslySetInnerHTML. */
export function highlight(code: string, lang: Lang): string {
  const re = master(lang);
  if (!re) return esc(code);
  const rules = RULES[lang];
  re.lastIndex = 0;
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    out += esc(code.slice(last, m.index));
    let cls = "cm";
    for (let i = 0; i < rules.length; i++) {
      if (m[i + 1] !== undefined) {
        cls = rules[i][1];
        break;
      }
    }
    out += `<span class="tk-${cls}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  out += esc(code.slice(last));
  return out;
}
