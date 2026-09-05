import { useMemo, useState } from "react";
import { highlight, type Lang } from "../lib/highlight";

const LANG_LABEL: Record<Lang, string> = {
  java: "Java",
  yaml: "YAML",
  bash: "Shell",
  dockerfile: "Dockerfile",
  xml: "XML",
  json: "JSON",
  text: "Texto",
};

export interface CodeTab {
  label: string;
  filename?: string;
  lang: Lang;
  code: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      onClick={copiar}
      className="btn-press font-mono flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11.5px] tracking-wide"
      style={{
        borderColor: copied ? "rgba(139,212,80,.55)" : "var(--line)",
        background: copied ? "rgba(139,212,80,.12)" : "var(--panel-2)",
        color: copied ? "var(--leaf-bright)" : "var(--mist-dim)",
      }}
      aria-label="Copiar código"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 12.5 9.5 18 20 6.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="9" y="9" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="2" />
            <path d="M5 15H4.5A2.5 2.5 0 0 1 2 12.5v-8A2.5 2.5 0 0 1 4.5 2h8A2.5 2.5 0 0 1 15 4.5V5" stroke="currentColor" strokeWidth="2" />
          </svg>
          Copiar
        </>
      )}
    </button>
  );
}

export function CodeBlock({
  lang,
  code,
  filename,
  maxH,
  showHeader = true,
}: {
  lang: Lang;
  code: string;
  filename?: string;
  maxH?: number;
  showHeader?: boolean;
}) {
  const html = useMemo(() => highlight(code, lang), [code, lang]);

  return (
    <div
      className={`overflow-hidden border ${showHeader ? "my-4" : ""}`}
      style={{
        borderColor: showHeader ? "var(--line-soft)" : "rgba(139,212,80,.4)",
        borderTopLeftRadius: showHeader ? 8 : 0,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        background: "#0a0f0b",
      }}
    >
      {showHeader && (
        <div
          className="flex items-center justify-between gap-3 border-b px-3.5 py-2"
          style={{ borderColor: "var(--line-soft)", background: "var(--panel)" }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex shrink-0 gap-1.5" aria-hidden>
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#f2708a88" }} />
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#f0b42988" }} />
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#8bd45088" }} />
            </span>
            <span className="font-mono truncate text-[12px]" style={{ color: "var(--mist-dim)" }}>
              {filename ?? LANG_LABEL[lang]}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="font-mono hidden rounded px-1.5 py-0.5 text-[10.5px] uppercase tracking-widest sm:inline"
              style={{ color: "var(--leaf-bright)", background: "rgba(139,212,80,.1)" }}
            >
              {LANG_LABEL[lang]}
            </span>
            <CopyButton code={code} />
          </div>
        </div>
      )}
      <pre
        className="font-mono overflow-x-auto p-4 text-[13px] leading-[1.66]"
        style={{ maxHeight: maxH, color: "#d7e4d9" }}
      >
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [ativa, setAtiva] = useState(0);
  const tab = tabs[Math.min(ativa, tabs.length - 1)];

  return (
    <div className="my-5">
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg border border-b-0 px-2.5 pt-2"
        style={{ borderColor: "rgba(139,212,80,.4)", background: "var(--panel)" }}
      >
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setAtiva(i)}
              className="btn-press font-mono rounded-t-md border border-b-0 px-3.5 py-1.5 text-[12px]"
              style={{
                background: i === ativa ? "#0a0f0b" : "transparent",
                borderColor: i === ativa ? "rgba(139,212,80,.4)" : "transparent",
                color: i === ativa ? "var(--leaf-bright)" : "var(--mist-dim)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pb-1.5">
          <span className="font-mono hidden text-[11px] sm:inline" style={{ color: "var(--mist-faint)" }}>
            {tab.filename}
          </span>
          <CopyButton code={tab.code} />
        </div>
      </div>
      <CodeBlock lang={tab.lang} code={tab.code} showHeader={false} />
    </div>
  );
}
