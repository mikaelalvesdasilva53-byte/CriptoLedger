import { useEffect, useState, type ReactNode } from "react";
import { Reveal } from "./ui";

export interface SectionDef {
  id: string;
  nav: string;
  num: string;
  body: ReactNode;
}

/* ------------------------------------------------------------------ */
/* Logo                                                                */
/* ------------------------------------------------------------------ */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#131d16" stroke="rgba(139,212,80,.35)" />
      <path d="M21.5 11a7 7 0 1 0 0 10" stroke="#8bd450" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="22.5" cy="16" r="1.8" fill="#f0b429" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Ticker de cotações (elemento vivo)                                  */
/* ------------------------------------------------------------------ */
const QUOTES = [
  { sym: "BTC", val: "US$ 104.218,44", chg: "+2,41%", up: true },
  { sym: "ETH", val: "US$ 3.912,07", chg: "+1,12%", up: true },
  { sym: "SOL", val: "US$ 216,93", chg: "-0,86%", up: false },
  { sym: "ADA", val: "US$ 1,184", chg: "+0,34%", up: true },
  { sym: "DOT", val: "US$ 9,42", chg: "-1,97%", up: false },
  { sym: "AVAX", val: "US$ 47,55", chg: "+3,08%", up: true },
  { sym: "LINK", val: "US$ 24,17", chg: "+0,77%", up: true },
  { sym: "MATIC", val: "US$ 0,892", chg: "-0,12%", up: false },
  { sym: "DOGE", val: "US$ 0,231", chg: "+5,62%", up: true },
  { sym: "XRP", val: "US$ 2,61", chg: "+1,44%", up: true },
];

function TickerItem({ q }: { q: (typeof QUOTES)[number] }) {
  return (
    <span className="font-mono mx-6 flex items-center gap-2 whitespace-nowrap text-[12px]">
      <span style={{ color: "var(--amber)" }}>{q.sym}</span>
      <span style={{ color: "var(--mist-dim)" }}>{q.val}</span>
      <span className="flex items-center gap-0.5" style={{ color: q.up ? "#8bd450" : "#f2708a" }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden style={{ transform: q.up ? "none" : "rotate(180deg)" }}>
          <path d="M12 4 21 17H3L12 4Z" fill="currentColor" />
        </svg>
        {q.chg}
      </span>
      <span className="ml-4 text-[10px]" style={{ color: "var(--line)" }}>
        ///
      </span>
    </span>
  );
}

export function Ticker() {
  const list = [...QUOTES, ...QUOTES];
  return (
    <div
      className="ticker-shell overflow-hidden border-y"
      style={{ borderColor: "var(--line-soft)", background: "rgba(16,25,19,.85)" }}
      aria-hidden
    >
      <div className="ticker-track py-1.5">
        {list.map((q, i) => (
          <TickerItem key={i} q={q} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Terminal com digitação animada                                      */
/* ------------------------------------------------------------------ */
const TERMINAL_SCRIPT: { cmd: string; out?: string[] }[] = [
  {
    cmd: "curl https://start.spring.io/starter.tgz -d dependencies=web,data-jpa,validation,h2,postgresql,webflux,cache,actuator -d javaVersion=21 | tar -xz",
    out: ["  Using project base directory: cripto-ledger"],
  },
  {
    cmd: "cd cripto-ledger && ./mvnw spring-boot:run",
    out: ["  Tomcat started on port 8080 (http)", "  Started CriptoLedgerApplication in 2.8s"],
  },
  {
    cmd: 'curl -X POST localhost:8080/api/v1/posicoes -H "Content-Type: application/json" -d \'{"simbolo":"bitcoin","quantidade":0.25,"precoMedioCompraUsd":41500}\'',
    out: ['  {"id":1,"simbolo":"bitcoin","quantidade":0.25,...}  → 201 Created'],
  },
  {
    cmd: "curl -s localhost:8080/api/v1/posicoes/resumo | jq .valorTotalUsd",
    out: ["  26114.2500"],
  },
];

interface TerminalLine {
  text: string;
  kind: "cmd" | "out";
  typing?: boolean;
}

export function TerminalTyper() {
  const [lines, setLines] = useState<TerminalLine[]>([]);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const push = (line: TerminalLine) =>
      setLines((prev) => (cancelled ? prev : [...prev, line]));
    const updateLast = (line: TerminalLine) =>
      setLines((prev) => {
        if (cancelled || prev.length === 0) return prev;
        const copy = [...prev];
        copy[copy.length - 1] = line;
        return copy;
      });

    async function loop() {
      while (!cancelled) {
        setLines([]);
        await sleep(700);
        for (const step of TERMINAL_SCRIPT) {
          if (cancelled) return;
          push({ text: "", kind: "cmd", typing: true });
          for (let i = 1; i <= step.cmd.length; i++) {
            if (cancelled) return;
            updateLast({ text: step.cmd.slice(0, i), kind: "cmd", typing: true });
            await sleep(i % 19 === 0 ? 44 : 8);
          }
          updateLast({ text: step.cmd, kind: "cmd" });
          await sleep(360);
          for (const o of step.out ?? []) {
            if (cancelled) return;
            push({ text: o, kind: "out" });
            await sleep(170);
          }
          await sleep(850);
        }
        await sleep(2800);
      }
    }

    loop();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="overflow-hidden rounded-xl border shadow-[0_24px_60px_-30px_rgba(0,0,0,.9)]"
      style={{ borderColor: "var(--line)", background: "#0a0f0b" }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: "var(--line-soft)", background: "var(--panel)" }}
      >
        <span className="flex gap-1.5" aria-hidden>
          <i className="h-3 w-3 rounded-full" style={{ background: "#f2708a" }} />
          <i className="h-3 w-3 rounded-full" style={{ background: "#f0b429" }} />
          <i className="h-3 w-3 rounded-full" style={{ background: "#8bd450" }} />
        </span>
        <span className="font-mono ml-2 text-[12px]" style={{ color: "var(--mist-faint)" }}>
          dev@notebook: ~/projetos
        </span>
      </div>
      <div className="font-mono min-h-[268px] overflow-x-auto p-4 text-[12.5px] leading-[1.8] sm:text-[13px]">
        {lines.map((l, i) => {
          const isLast = i === lines.length - 1;
          return (
            <div key={i} className="whitespace-pre-wrap break-all">
              {l.kind === "cmd" ? (
                <>
                  <span style={{ color: "var(--leaf-bright)" }}>$ </span>
                  <span style={{ color: "#d7e4d9" }}>{l.text}</span>
                  {isLast && <span className="caret" />}
                </>
              ) : (
                <span style={{ color: "var(--mist-faint)" }}>{l.text}</span>
              )}
            </div>
          );
        })}
        {lines.length === 0 && (
          <div>
            <span style={{ color: "var(--leaf-bright)" }}>$ </span>
            <span className="caret" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Diagrama de arquitetura (SVG próprio)                               */
/* ------------------------------------------------------------------ */
function Box({
  x, y, w, h, label, sub, fill, stroke, text = "#e7efe8",
}: {
  x: number; y: number; w: number; h: number; label: string; sub?: string;
  fill: string; stroke: string; text?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={fill} stroke={stroke} strokeWidth="1.4" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 4 : h / 2 + 4.5)} textAnchor="middle" fill={text} fontSize="13.5" fontWeight="600" fontFamily="Space Grotesk, sans-serif">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fill="#9cb3a2" fontSize="10.5" fontFamily="JetBrains Mono, monospace">
          {sub}
        </text>
      )}
    </g>
  );
}

export function ArchitectureDiagram() {
  return (
    <Reveal>
      <div
        className="my-6 overflow-x-auto rounded-xl border p-4 sm:p-6"
        style={{ borderColor: "var(--line-soft)", background: "linear-gradient(180deg, #0e1712, #0a0f0b)" }}
      >
        <svg viewBox="0 0 780 340" className="mx-auto block w-full max-w-[720px]" role="img" aria-label="Diagrama de arquitetura em camadas">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10 z" fill="#6d8473" />
            </marker>
          </defs>

          {/* cliente */}
          <Box x={20} y={140} w={120} h={56} label="Cliente" sub="curl · navegador" fill="#17231a" stroke="#24382a" />

          {/* camadas */}
          <Box x={190} y={140} w={150} h={56} label="Controller" sub="/api/v1" fill="rgba(139,212,80,.10)" stroke="rgba(139,212,80,.5)" />
          <Box x={390} y={140} w={150} h={56} label="Service" sub="regras + orquestração" fill="rgba(240,180,41,.09)" stroke="rgba(240,180,41,.5)" />

          <Box x={590} y={52} w={170} h={56} label="Repository" sub="Spring Data JPA" fill="rgba(95,184,216,.09)" stroke="rgba(95,184,216,.5)" />
          <Box x={590} y={232} w={170} h={56} label="CoinGeckoClient" sub="WebClient · HTTP Interface" fill="rgba(199,146,234,.10)" stroke="rgba(199,146,234,.5)" />

          <Box x={318} y={296} w={150} h={38} label="DTO + Mapper" fill="#17231a" stroke="#24382a" />

          {/* externos */}
          <g>
            <rect x={180} y={16} width={170} height={46} rx="22" fill="#17231a" stroke="#24382a" strokeWidth="1.4" />
            <text x={265} y={44} textAnchor="middle" fill="#9cb3a2" fontSize="12" fontFamily="JetBrains Mono, monospace">
              H2 (dev) · PostgreSQL (prod)
            </text>
            <rect x={430} y={16} width={170} height={46} rx="22" fill="#17231a" stroke="#24382a" strokeWidth="1.4" />
            <text x={515} y={44} textAnchor="middle" fill="#9cb3a2" fontSize="12" fontFamily="JetBrains Mono, monospace">
              api.coingecko.com
            </text>
          </g>

          {/* setas */}
          <line x1={142} y1={168} x2={186} y2={168} stroke="#6d8473" strokeWidth="1.6" markerEnd="url(#arrow)" className="flow-line" />
          <line x1={342} y1={168} x2={386} y2={168} stroke="#6d8473" strokeWidth="1.6" markerEnd="url(#arrow)" className="flow-line" />
          <path d="M540 158 C 570 150, 570 100, 586 84" fill="none" stroke="#6d8473" strokeWidth="1.6" markerEnd="url(#arrow)" className="flow-line" />
          <path d="M540 178 C 570 186, 570 236, 586 252" fill="none" stroke="#6d8473" strokeWidth="1.6" markerEnd="url(#arrow)" className="flow-line" />
          <line x1={675} y1={52} x2={352} y2={39} stroke="#4a5f50" strokeWidth="1.3" strokeDasharray="3 5" />
          <line x1={675} y1={232} x2={602} y2={62} stroke="none" />
          <path d="M760 260 C 775 180, 775 110, 676 62" fill="none" stroke="#4a5f50" strokeWidth="1.3" strokeDasharray="3 5" />

          {/* rótulos das fronteiras */}
          <text x={390} y={130} textAnchor="middle" fill="#6d8473" fontSize="10.5" fontFamily="JetBrains Mono, monospace" letterSpacing="2">
            NOSSA APLICAÇÃO
          </text>
        </svg>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Cartão estilo Spring Initializr                                     */
/* ------------------------------------------------------------------ */
const INITIALIZR_FIELDS: [string, string][] = [
  ["Project", "Maven"],
  ["Language", "Java"],
  ["Spring Boot", "3.5.x (estável)"],
  ["Group", "com.exemplo"],
  ["Artifact", "cripto-ledger"],
  ["Name", "cripto-ledger"],
  ["Description", "Ledger de posições em cripto com cotações via CoinGecko"],
  ["Package name", "com.exemplo.criptoledger"],
  ["Packaging", "Jar"],
  ["Java", "21"],
];

export function InitializrCard() {
  return (
    <Reveal>
      <div className="my-6 overflow-hidden rounded-xl border" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--line-soft)", background: "var(--panel)" }}>
          <div className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9.2" stroke="var(--leaf-bright)" strokeWidth="2" />
              <path d="M15.8 8.6a5.2 5.2 0 1 0 0 6.8" stroke="var(--leaf-bright)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-display text-[15px] font-semibold" style={{ color: "var(--mist)" }}>
              start.spring.io
            </span>
          </div>
          <span className="font-mono rounded-full px-2.5 py-0.5 text-[10.5px] uppercase tracking-widest" style={{ color: "var(--amber)", background: "rgba(240,180,41,.1)", border: "1px solid rgba(240,180,41,.3)" }}>
            preenchimento exato
          </span>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2">
          {INITIALIZR_FIELDS.map(([k, v], i) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-4 border-b px-4 py-2.5 sm:odd:border-r"
              style={{ borderColor: "var(--line-soft)", background: i % 2 ? "var(--panel)" : "var(--ink-2)" }}
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--mist-faint)" }}>
                {k}
              </dt>
              <dd className="font-mono truncate text-[12.5px]" style={{ color: k === "Spring Boot" || k === "Java" ? "var(--leaf-bright)" : "var(--mist)" }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Dependências do Initializr                                          */
/* ------------------------------------------------------------------ */
const DEPENDENCIES: { nome: string; id: string; motivo: string }[] = [
  { nome: "Spring Web", id: "web", motivo: "API REST com Spring MVC e Tomcat embutido." },
  { nome: "Spring Data JPA", id: "data-jpa", motivo: "Persistência relacional com Hibernate + repositórios prontos." },
  { nome: "Validation", id: "validation", motivo: "Bean Validation: @NotBlank, @Positive, @Pattern etc." },
  { nome: "H2 Database", id: "h2", motivo: "Banco em memória para desenvolvimento e testes." },
  { nome: "PostgreSQL Driver", id: "postgresql", motivo: "Driver JDBC do banco de produção." },
  { nome: "Spring Reactive Web", id: "webflux", motivo: "Traz o WebClient + Reactor (a app continua MVC)." },
  { nome: "Cache", id: "cache", motivo: "Abstração de cache — usada com Caffeine na resiliência." },
  { nome: "Actuator", id: "actuator", motivo: "Health check /actuator/health para a plataforma de deploy." },
];

export function DependencyGrid() {
  return (
    <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {DEPENDENCIES.map((d, i) => (
        <Reveal key={d.id} delay={i * 45}>
          <div className="card-hover h-full rounded-lg border p-4" style={{ borderColor: "var(--line-soft)", background: "var(--panel)" }}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-[15px] font-semibold" style={{ color: "var(--mist)" }}>
                {d.nome}
              </p>
              <code
                className="font-mono rounded px-1.5 py-0.5 text-[11px]"
                style={{ color: "var(--sky)", background: "rgba(95,184,216,.09)", border: "1px solid rgba(95,184,216,.25)" }}
              >
                {d.id}
              </code>
            </div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--mist-dim)" }}>
              {d.motivo}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* POO pillars strip                                                   */
/* ------------------------------------------------------------------ */
export function PooStrip() {
  const pilares = [
    { t: "Encapsulamento", d: "Entidade sem setters: mutação só por métodos de negócio." },
    { t: "Herança", d: "@MappedSuperclass repassa auditoria a todas as entidades." },
    { t: "Polimorfismo", d: "Exceções especializadas tratadas por tipo no @ControllerAdvice." },
    { t: "Abstração", d: "HTTP Interface: a API externa vira uma interface Java." },
  ];
  return (
    <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {pilares.map((p, i) => (
        <Reveal key={p.t} delay={i * 70}>
          <div className="card-hover h-full rounded-lg border p-4" style={{ borderColor: "var(--line-soft)", background: "var(--panel)" }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--amber)" }}>
              0{i + 1}
            </p>
            <p className="font-display mt-1 text-[15.5px] font-semibold" style={{ color: "var(--mist)" }}>
              {p.t}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--mist-dim)" }}>
              {p.d}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
