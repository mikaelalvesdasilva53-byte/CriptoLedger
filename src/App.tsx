import { useEffect, useMemo, useRef, useState } from "react";
import { DoneButton, Reveal } from "./components/ui";
import { Logo, Ticker, type SectionDef } from "./components/visuals";
import { sections1 } from "./content/sections1";
import { sections2 } from "./content/sections2";
import { sections3 } from "./content/sections3";

const SECTIONS: SectionDef[] = [...sections1, ...sections2, ...sections3];
const STORAGE_KEY = "criptoledger-progresso-v1";

function useProgresso() {
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      /* modo privado: sem persistência, sem drama */
    }
  }, [done]);

  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));
  return { done, toggle };
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 15;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" aria-label={`${pct}% do guia concluído`}>
      <circle cx="21" cy="21" r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
      <circle
        cx="21"
        cy="21"
        r={r}
        fill="none"
        stroke="var(--leaf-bright)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        transform="rotate(-90 21 21)"
        style={{ transition: "stroke-dashoffset .5s ease" }}
      />
      <text x="21" y="25.5" textAnchor="middle" fontSize="10.5" fontFamily="JetBrains Mono, monospace" fill="var(--mist)">
        {pct}%
      </text>
    </svg>
  );
}

function CheckCircle({ done, onToggle, label }: { done: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={`${done ? "Desmarcar" : "Marcar"} "${label}" como concluído`}
      className="btn-press flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border"
      style={{
        borderColor: done ? "var(--leaf-bright)" : "var(--mist-faint)",
        background: done ? "var(--leaf-bright)" : "transparent",
      }}
    >
      {done && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4.5 12.5 9.5 17.5 19.5 7" stroke="#0c120e" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function NavList({
  ativo,
  done,
  onNavigate,
  onToggle,
}: {
  ativo: string;
  done: Record<string, boolean>;
  onNavigate: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <ol className="space-y-1">
      {SECTIONS.map((s, i) => {
        const isActive = ativo === s.id;
        const isDone = !!done[s.id];
        return (
          <li key={s.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onNavigate(s.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate(s.id)}
              className="side-link group flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left"
              style={{
                borderColor: isActive ? "rgba(139,212,80,.4)" : "transparent",
                background: isActive ? "rgba(139,212,80,.07)" : "transparent",
              }}
            >
              <span
                className="font-mono w-7 shrink-0 text-[11px] font-medium"
                style={{ color: isActive ? "var(--leaf-bright)" : isDone ? "var(--mist-faint)" : "var(--mist-faint)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="flex-1 text-[13.5px] leading-snug"
                style={{
                  color: isActive ? "var(--mist)" : isDone ? "var(--mist-faint)" : "var(--mist-dim)",
                  textDecoration: isDone && !isActive ? "line-through" : "none",
                  textDecorationColor: "rgba(157,179,162,.5)",
                }}
              >
                {s.nav}
              </span>
              <CheckCircle done={isDone} onToggle={() => onToggle(s.id)} label={s.nav} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function App() {
  const { done, toggle } = useProgresso();
  const [ativo, setAtivo] = useState(SECTIONS[0].id);
  const [pctScroll, setPctScroll] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const total = SECTIONS.length;
  const concluidos = useMemo(() => SECTIONS.filter((s) => done[s.id]).length, [done]);
  const pctGuia = Math.round((concluidos / total) * 100);

  /* seção ativa via IntersectionObserver */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setAtivo(e.target.id);
        });
      },
      { rootMargin: "-32% 0px -58% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  /* progresso de leitura + botão topo */
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPctScroll(max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0);
      setShowTop(h.scrollTop > 700);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navegar = (id: string) => {
    setDrawer(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: "var(--ink)", minHeight: "100vh" }}>
      <div className="ambient" aria-hidden />
      <div className="grid-overlay" aria-hidden />

      {/* ---------------- header ---------------- */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ borderColor: "var(--line-soft)", background: "rgba(12,18,14,.92)", backdropFilter: "blur(10px)" }}
      >
        <div className="mx-auto flex h-[58px] max-w-[1240px] items-center gap-4 px-4 sm:px-6">
          <button
            className="btn-press flex items-center gap-2.5 rounded-lg px-1 py-1"
            onClick={() => navegar(SECTIONS[0].id)}
            aria-label="Voltar ao início do guia"
          >
            <Logo />
            <span className="font-display text-left text-[15.5px] font-bold leading-tight" style={{ color: "var(--mist)" }}>
              CriptoLedger
              <span className="font-mono block text-[10px] font-normal uppercase tracking-[0.2em]" style={{ color: "var(--mist-faint)" }}>
                guia do zero ao deploy
              </span>
            </span>
          </button>

          <nav className="font-mono ml-auto hidden items-center gap-2 md:flex" aria-label="tecnologias">
            {["Java 21 LTS", "Spring Boot 3.5", "PostgreSQL", "Docker"].map((t) => (
              <span
                key={t}
                className="rounded-full border px-2.5 py-0.5 text-[11px]"
                style={{ borderColor: "var(--line)", color: "var(--mist-dim)", background: "var(--panel)" }}
              >
                {t}
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:ml-5" title={`${concluidos} de ${total} seções concluídas`}>
            <ProgressRing pct={pctGuia} />
            <button
              className="btn-press rounded-lg border p-2 lg:hidden"
              style={{ borderColor: "var(--line)", background: "var(--panel)" }}
              onClick={() => setDrawer(true)}
              aria-label="Abrir índice do guia"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h10" stroke="var(--mist)" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        {/* barra de progresso de leitura */}
        <div className="h-[2.5px] w-full" style={{ background: "var(--line-soft)" }}>
          <div
            className="h-full"
            style={{
              width: `${pctScroll}%`,
              background: "linear-gradient(90deg, var(--leaf), var(--leaf-bright), var(--amber))",
              transition: "width .12s linear",
            }}
          />
        </div>
      </header>

      <Ticker />

      {/* ---------------- drawer mobile ---------------- */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Índice do guia">
          <button
            className="absolute inset-0"
            style={{ background: "rgba(6,10,7,.78)" }}
            onClick={() => setDrawer(false)}
            aria-label="Fechar índice"
          />
          <div
            className="absolute right-0 top-0 h-full w-[300px] overflow-y-auto border-l p-5"
            style={{ background: "var(--ink-2)", borderColor: "var(--line)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--mist-faint)" }}>
                Índice · {concluidos}/{total}
              </p>
              <button
                className="btn-press rounded-md border p-1.5"
                style={{ borderColor: "var(--line)" }}
                onClick={() => setDrawer(false)}
                aria-label="Fechar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 5l14 14M19 5L5 19" stroke="var(--mist)" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <NavList ativo={ativo} done={done} onNavigate={navegar} onToggle={toggle} />
          </div>
        </div>
      )}

      {/* ---------------- corpo ---------------- */}
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[272px_1fr]">
        {/* sidebar desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-[82px] max-h-[calc(100vh-100px)] overflow-y-auto pb-10 pr-2 pt-8">
            <p className="font-mono mb-3 text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--mist-faint)" }}>
              Roteiro do guia
            </p>
            <NavList ativo={ativo} done={done} onNavigate={navegar} onToggle={toggle} />

            <div
              className="mt-6 rounded-lg border p-4"
              style={{ borderColor: "var(--line-soft)", background: "var(--panel)" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-[13px] font-semibold" style={{ color: "var(--mist)" }}>
                  Seu progresso
                </p>
                <span className="font-mono text-[12px]" style={{ color: "var(--leaf-bright)" }}>
                  {concluidos}/{total}
                </span>
              </div>
              <div className="mt-2.5 h-[7px] overflow-hidden rounded-full" style={{ background: "var(--line-soft)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pctGuia}%`,
                    background: "linear-gradient(90deg, var(--leaf), var(--leaf-bright))",
                    transition: "width .45s ease",
                  }}
                />
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed" style={{ color: "var(--mist-faint)" }}>
                Marque cada passo ao terminar — o progresso fica salvo neste navegador.
              </p>
              {pctGuia === 100 && (
                <p className="font-display mt-2 text-[13px] font-semibold" style={{ color: "var(--amber)" }}>
                  Guia concluído — API no ar. Agora é evoluir.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* conteúdo */}
        <main ref={mainRef} className="min-w-0 pb-24">
          {SECTIONS.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-[92px] border-b py-12 first:pt-10 sm:py-14"
              style={{ borderColor: "var(--line-soft)" }}
            >
              {s.body}
              <Reveal>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <DoneButton done={!!done[s.id]} onToggle={() => toggle(s.id)} />
                  <span className="font-mono text-[12px]" style={{ color: "var(--mist-faint)" }}>
                    seção {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>
              </Reveal>
            </section>
          ))}

          {/* rodapé */}
          <footer className="pt-10">
            <Reveal>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Logo size={26} />
                  <div>
                    <p className="font-display text-[14px] font-semibold" style={{ color: "var(--mist)" }}>
                      CriptoLedger — guia didático completo
                    </p>
                    <p className="font-mono text-[11.5px]" style={{ color: "var(--mist-faint)" }}>
                      inspirado na didática dos Spring Guides · código livre para estudar e adaptar
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[11.5px]" style={{ color: "var(--mist-faint)" }}>
                  cotações do ticker ilustrativas · API real: CoinGecko
                </p>
              </div>
            </Reveal>
          </footer>
        </main>
      </div>

      {/* voltar ao topo */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="btn-press fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border px-4 py-2.5"
        style={{
          borderColor: "rgba(139,212,80,.45)",
          background: "rgba(19,29,22,.95)",
          color: "var(--leaf-bright)",
          opacity: showTop ? 1 : 0,
          pointerEvents: showTop ? "auto" : "none",
          transform: showTop ? "translateY(0)" : "translateY(12px)",
          transition: "opacity .25s ease, transform .25s ease",
          boxShadow: "0 10px 30px -12px rgba(0,0,0,.8)",
        }}
        aria-label="Voltar ao topo"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 20V4m0 0-6.5 6.5M12 4l6.5 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-mono text-[12px]">topo</span>
      </button>
    </div>
  );
}
