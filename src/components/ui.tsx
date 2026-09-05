import { useEffect, useRef, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Reveal on scroll                                                    */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "figure";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            obs.disconnect();
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className="reveal"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Callouts                                                            */
/* ------------------------------------------------------------------ */
const CALLOUT_TONES = {
  dica: { border: "rgba(139,212,80,.45)", bg: "rgba(139,212,80,.06)", fg: "#9fe06a", label: "Dica" },
  atencao: { border: "rgba(240,180,41,.5)", bg: "rgba(240,180,41,.07)", fg: "#f0b429", label: "Atenção" },
  erro: { border: "rgba(242,112,138,.5)", bg: "rgba(242,112,138,.07)", fg: "#f2708a", label: "Erro comum" },
  info: { border: "rgba(95,184,216,.5)", bg: "rgba(95,184,216,.07)", fg: "#5fb8d8", label: "Conceito" },
} as const;

export function Callout({
  tone = "dica",
  title,
  children,
}: {
  tone?: keyof typeof CALLOUT_TONES;
  title?: string;
  children: ReactNode;
}) {
  const t = CALLOUT_TONES[tone];
  return (
    <div
      className="my-5 flex gap-3.5 rounded-lg border px-4 py-3.5"
      style={{ borderColor: t.border, background: t.bg }}
      role="note"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden>
        {tone === "dica" && (
          <path
            d="M12 2.5a6.5 6.5 0 0 0-3.6 11.9c.6.45 1.1 1.2 1.1 1.9v.4h5v-.4c0-.7.5-1.45 1.1-1.9A6.5 6.5 0 0 0 12 2.5ZM9.6 19.5h4.8M10.4 22h3.2"
            stroke={t.fg} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
          />
        )}
        {tone === "atencao" && (
          <path
            d="M12 3.5 2.5 20h19L12 3.5Zm0 6v5m0 3.2v.3"
            stroke={t.fg} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
          />
        )}
        {tone === "erro" && (
          <path
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3.2-12.2 6.4 6.4m0-6.4-6.4 6.4"
            stroke={t.fg} strokeWidth="1.7" strokeLinecap="round"
          />
        )}
        {tone === "info" && (
          <path
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-9.5V16m0-7.5v-.3"
            stroke={t.fg} strokeWidth="1.7" strokeLinecap="round"
          />
        )}
      </svg>
      <div className="min-w-0 text-[15px] leading-relaxed" style={{ color: "var(--mist)" }}>
        <p
          className="font-display mb-0.5 text-[12.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: t.fg }}
        >
          {title ?? t.label}
        </p>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section / Step headers                                              */
/* ------------------------------------------------------------------ */
export function Kicker({ children, color = "var(--leaf-bright)" }: { children: ReactNode; color?: string }) {
  return (
    <p
      className="font-mono mb-3 flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.22em]"
      style={{ color }}
    >
      <span className="inline-block h-px w-8" style={{ background: color, opacity: 0.6 }} />
      {children}
    </p>
  );
}

export function StepHead({
  numero,
  kicker,
  titulo,
  lead,
  tempo,
}: {
  numero: string;
  kicker: string;
  titulo: string;
  lead?: string;
  tempo?: string;
}) {
  return (
    <Reveal>
      <div className="mb-2 flex items-start gap-5">
        <span
          className="step-ghost font-display select-none text-[64px] font-bold leading-[0.9] sm:text-[92px]"
          aria-hidden
        >
          {numero}
        </span>
        <div className="pt-1.5 sm:pt-3">
          <Kicker>{kicker}</Kicker>
          <h2 className="font-display text-[26px] font-bold leading-tight sm:text-[34px]" style={{ color: "var(--mist)" }}>
            {titulo}
          </h2>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3 sm:ml-[104px] sm:pl-1">
        {lead && (
          <p className="max-w-2xl text-[16px]" style={{ color: "var(--mist-dim)" }}>
            {lead}
          </p>
        )}
        {tempo && <TempoChip tempo={tempo} />}
      </div>
    </Reveal>
  );
}

export function TempoChip({ tempo }: { tempo: string }) {
  return (
    <span
      className="font-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px]"
      style={{ borderColor: "var(--line)", color: "var(--mist-dim)" }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M12 9v4l2.5 2M9 2.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {tempo}
    </span>
  );
}

export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3
      id={id}
      className="font-display mt-9 mb-3 flex items-center gap-2.5 text-[19px] font-semibold scroll-mt-28"
      style={{ color: "var(--mist)" }}
    >
      <span aria-hidden style={{ color: "var(--leaf-bright)" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="m8 4 10 8-10 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {children}
    </h3>
  );
}

export function C({ children }: { children: ReactNode }) {
  return (
    <code
      className="font-mono rounded-[5px] border px-[5px] py-[1.5px] text-[13px]"
      style={{ background: "rgba(139,212,80,.08)", borderColor: "rgba(139,212,80,.22)", color: "#b9e793" }}
    >
      {children}
    </code>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="my-3.5 max-w-[72ch] text-[15.5px] leading-[1.75]" style={{ color: "var(--mist)" }}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Completion button                                                   */
/* ------------------------------------------------------------------ */
export function DoneButton({
  done,
  onToggle,
  label = "Marcar passo como concluído",
}: {
  done: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="btn-press font-display mt-8 inline-flex items-center gap-2.5 rounded-lg border px-5 py-2.5 text-[14px] font-semibold"
      style={{
        borderColor: done ? "rgba(139,212,80,.6)" : "var(--line)",
        background: done ? "rgba(139,212,80,.14)" : "var(--panel)",
        color: done ? "var(--leaf-bright)" : "var(--mist)",
        boxShadow: done ? "0 0 24px -8px rgba(139,212,80,.55)" : "none",
      }}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full border"
        style={{
          borderColor: done ? "var(--leaf-bright)" : "var(--mist-faint)",
          background: done ? "var(--leaf-bright)" : "transparent",
        }}
      >
        {done && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4.5 12.5 9.5 17.5 19.5 7" stroke="#0c120e" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {done ? "Passo concluído" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Endpoint table                                                      */
/* ------------------------------------------------------------------ */
export interface EndpointRow {
  metodo: "GET" | "POST" | "PUT" | "DELETE";
  rota: string;
  descricao: string;
  status: string;
}

const METHOD_COLOR: Record<EndpointRow["metodo"], string> = {
  GET: "#8bd450",
  POST: "#f0b429",
  PUT: "#5fb8d8",
  DELETE: "#f2708a",
};

export function EndpointTable({ rows }: { rows: EndpointRow[] }) {
  return (
    <Reveal>
      <div className="my-5 overflow-x-auto rounded-lg border" style={{ borderColor: "var(--line-soft)" }}>
        <table className="w-full min-w-[560px] border-collapse text-[14px]">
          <thead>
            <tr style={{ background: "var(--panel)", color: "var(--mist-dim)" }}>
              {["Método", "Rota", "Descrição", "Sucesso"].map((h) => (
                <th
                  key={h}
                  className="font-mono px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.16em]"
                  style={{ borderBottom: "1px solid var(--line-soft)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.metodo + r.rota}
                className="transition-colors hover:bg-[rgba(139,212,80,.045)]"
                style={{ borderBottom: "1px solid var(--line-soft)" }}
              >
                <td className="px-4 py-2.5">
                  <span
                    className="font-mono rounded px-2 py-0.5 text-[11.5px] font-bold"
                    style={{ color: METHOD_COLOR[r.metodo], background: `${METHOD_COLOR[r.metodo]}1a`, border: `1px solid ${METHOD_COLOR[r.metodo]}44` }}
                  >
                    {r.metodo}
                  </span>
                </td>
                <td className="font-mono px-4 py-2.5 text-[13px]" style={{ color: "var(--mist)" }}>
                  {r.rota}
                </td>
                <td className="px-4 py-2.5" style={{ color: "var(--mist-dim)" }}>
                  {r.descricao}
                </td>
                <td className="font-mono px-4 py-2.5 text-[13px]" style={{ color: "var(--leaf-bright)" }}>
                  {r.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* File tree                                                           */
/* ------------------------------------------------------------------ */
export interface TreeNode {
  name: string;
  type?: "file" | "dir";
  note?: string;
  children?: TreeNode[];
}

function TreeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth < 3);
  const isDir = node.type === "dir" || !!node.children;

  return (
    <div>
      <button
        onClick={() => isDir && setOpen(!open)}
        className={`font-mono flex w-full items-center gap-2 rounded px-2 py-[3.5px] text-left text-[13px] ${isDir ? "cursor-pointer hover:bg-[rgba(139,212,80,.06)]" : "cursor-default"}`}
        style={{ paddingLeft: 10 + depth * 18 }}
      >
        {isDir ? (
          <>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .18s ease", flexShrink: 0 }}>
              <path d="m8 4 10 8-10 8" stroke="var(--mist-faint)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
              <path
                d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4L12 7.5h6.5A2.5 2.5 0 0 1 21 10v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17v-9.5Z"
                fill="rgba(240,180,41,.18)" stroke="#f0b429" strokeWidth="1.4"
              />
            </svg>
            <span style={{ color: "var(--amber)" }}>{node.name}</span>
          </>
        ) : (
          <>
            <span style={{ width: 10, flexShrink: 0 }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
              <path d="M6 2.8h8L19 8v13.2H6V2.8Z" stroke="var(--mist-faint)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M14 3v5h5" stroke="var(--mist-faint)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span style={{ color: "var(--mist)" }}>{node.name}</span>
          </>
        )}
        {node.note && (
          <span className="hidden text-[11.5px] italic sm:inline" style={{ color: "var(--mist-faint)" }}>
            — {node.note}
          </span>
        )}
      </button>
      {isDir && open && node.children?.map((c) => <TreeRow key={c.name} node={c} depth={depth + 1} />)}
    </div>
  );
}

export function FileTree({ nodes }: { nodes: TreeNode[] }) {
  return (
    <Reveal>
      <div
        className="tree-scroll my-5 overflow-x-auto rounded-lg border p-3"
        style={{ borderColor: "var(--line-soft)", background: "#0a0f0b" }}
      >
        {nodes.map((n) => (
          <TreeRow key={n.name} node={n} depth={0} />
        ))}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Checklist simples                                                   */
/* ------------------------------------------------------------------ */
export function Checklist({ items, tone = "var(--leaf-bright)" }: { items: ReactNode[]; tone?: string }) {
  return (
    <ul className="my-4 space-y-2">
      {items.map((item, i) => (
        <Reveal as="li" key={i} delay={i * 40}>
          <span className="flex items-start gap-3 text-[15px] leading-relaxed" style={{ color: "var(--mist)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="mt-[3px] shrink-0" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke={tone} strokeWidth="1.6" opacity="0.45" />
              <path d="m7.5 12.3 3 3 6-6.6" stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{item}</span>
          </span>
        </Reveal>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Ordered steps (deploy)                                              */
/* ------------------------------------------------------------------ */
export function NumSteps({ steps }: { steps: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="my-5 space-y-4">
      {steps.map((s, i) => (
        <Reveal as="li" key={s.title} delay={i * 60}>
          <div className="flex gap-4">
            <span
              className="font-display mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[15px] font-bold"
              style={{ borderColor: "rgba(139,212,80,.4)", color: "var(--leaf-bright)", background: "rgba(139,212,80,.07)" }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="font-display text-[16px] font-semibold" style={{ color: "var(--mist)" }}>
                {s.title}
              </p>
              <div className="mt-1 text-[14.5px] leading-relaxed" style={{ color: "var(--mist-dim)" }}>
                {s.body}
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Env vars table                                                      */
/* ------------------------------------------------------------------ */
export function EnvTable({ rows }: { rows: { chave: string; valor: string; desc: string }[] }) {
  return (
    <Reveal>
      <div className="my-5 overflow-x-auto rounded-lg border" style={{ borderColor: "var(--line-soft)" }}>
        <table className="w-full min-w-[540px] border-collapse text-[13.5px]">
          <thead>
            <tr style={{ background: "var(--panel)", color: "var(--mist-dim)" }}>
              {["Variável", "Valor de exemplo", "Para quê"].map((h) => (
                <th
                  key={h}
                  className="font-mono px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.16em]"
                  style={{ borderBottom: "1px solid var(--line-soft)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.chave} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                <td className="font-mono px-4 py-2.5 text-[12.5px]" style={{ color: "var(--amber)" }}>
                  {r.chave}
                </td>
                <td className="font-mono px-4 py-2.5 text-[12.5px]" style={{ color: "var(--mist)" }}>
                  {r.valor}
                </td>
                <td className="px-4 py-2.5" style={{ color: "var(--mist-dim)" }}>
                  {r.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}
