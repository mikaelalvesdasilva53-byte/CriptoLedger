import { CodeBlock, CodeTabs } from "../components/CodeBlock";
import {
  C,
  Callout,
  Checklist,
  EndpointTable,
  FileTree,
  H3,
  Kicker,
  P,
  Reveal,
  StepHead,
} from "../components/ui";
import { ArchitectureDiagram, DependencyGrid, InitializrCard, PooStrip, TerminalTyper, type SectionDef } from "../components/visuals";
import {
  applicationProdYml,
  applicationYml,
  auditableEntity,
  dockerCompose,
  dtosSnippet,
  mapperSnippet,
  pomSnippet,
  posicaoEntity,
  runApp,
  springInitCurl,
} from "./snippets";

/* ================================================================== */
/* ABERTURA — O que você vai construir                                 */
/* ================================================================== */
const hero: SectionDef = {
  id: "visao-geral",
  nav: "O que você vai construir",
  num: "»",
  body: (
    <>
      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <Reveal>
          <div>
            <Kicker>Guia prático · didática dos Spring Guides</Kicker>
            <h1 className="font-display text-[clamp(34px,5.4vw,62px)] font-bold leading-[1.04] tracking-tight" style={{ color: "var(--mist)" }}>
              Do <code className="font-mono text-[0.72em]" style={{ color: "var(--leaf-bright)" }}>spring init</code>{" "}
              ao <span className="relative inline-block">
                deploy
                <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 220 12" fill="none" preserveAspectRatio="none" aria-hidden>
                  <path d="M3 9c40-6 90-6 132-4 30 1.4 58 1 82-2" stroke="var(--amber)" strokeWidth="3.4" strokeLinecap="round" />
                </svg>
              </span>{" "}
              na nuvem.
            </h1>
            <P>
              Você vai construir o <strong style={{ color: "var(--mist)" }}>CriptoLedger</strong>: uma API REST em Java +
              Spring Boot que registra <strong style={{ color: "var(--mist)" }}>posições em criptoativos</strong> (compra,
              quantidade, preço médio) e as cruza com <strong style={{ color: "var(--mist)" }}>cotações em tempo real da
              CoinGecko</strong> para calcular o valor e o lucro/prejuízo do portfólio — com validação de entrada, erros no
              padrão RFC 7807, testes unitários e container pronto para a nuvem.
            </P>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                ["Java 21 LTS", "var(--leaf-bright)"],
                ["Spring Boot 3.5.x", "var(--leaf-bright)"],
                ["Maven", "var(--amber)"],
                ["H2 → PostgreSQL", "var(--sky)"],
                ["~90 minutos", "var(--mist-dim)"],
              ].map(([label, cor]) => (
                <span
                  key={label}
                  className="font-mono rounded-full border px-3 py-1 text-[12px]"
                  style={{ borderColor: "var(--line)", color: cor, background: "var(--panel)" }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <TerminalTyper />
          <p className="font-mono mt-3 text-[11.5px] italic" style={{ color: "var(--mist-faint)" }}>
            O ciclo completo do guia, em 4 comandos.
          </p>
        </Reveal>
      </div>

      <div className="mt-14">
        <Reveal>
          <H3>A arquitetura, de cima a baixo</H3>
        </Reveal>
        <P>
          Camadas com responsabilidade única: o <C>Controller</C> fala HTTP, o <C>Service</C> concentra as regras,
          o <C>Repository</C> cuida da persistência e o <C>CoinGeckoClient</C> isola o mundo externo. DTOs e mappers
          garantem que a entidade JPA nunca vaze para a API.
        </P>
        <ArchitectureDiagram />

        <Reveal>
          <H3>Os endpoints que estarão no ar no final</H3>
        </Reveal>
        <EndpointTable
          rows={[
            { metodo: "GET", rota: "/api/v1/posicoes", descricao: "Lista as posições abertas", status: "200" },
            { metodo: "GET", rota: "/api/v1/posicoes/{id}", descricao: "Detalha uma posição", status: "200" },
            { metodo: "POST", rota: "/api/v1/posicoes", descricao: "Abre posição (entrada validada)", status: "201 + Location" },
            { metodo: "PUT", rota: "/api/v1/posicoes/{id}", descricao: "Reajusta quantidade / preço / notas", status: "200" },
            { metodo: "DELETE", rota: "/api/v1/posicoes/{id}", descricao: "Encerra a posição", status: "204" },
            { metodo: "GET", rota: "/api/v1/posicoes/resumo", descricao: "Portfólio valorizado com cotações externas", status: "200" },
            { metodo: "GET", rota: "/api/v1/cotacoes?symbols=...", descricao: "Cotação direta da CoinGecko", status: "200" },
          ]}
        />

        <Reveal>
          <H3>O que este guia cobre, sem atalhos</H3>
        </Reveal>
        <Checklist
          items={[
            <>Projeto gerado no <C>start.spring.io</C> e configurado para dev (H2) e produção (PostgreSQL);</>,
            <>POO aplicada de verdade: encapsulamento, herança, polimorfismo, abstração e SOLID — não só citados;</>,
            <>Integração externa com <C>WebClient</C> + <C>HTTP Interfaces</C>: autenticação por chave, timeouts, retry com backoff, cache e fallback;</>,
            <>Tratamento global de exceções com <C>@RestControllerAdvice</C> retornando <C>ProblemDetail</C> (RFC 7807);</>,
            <>Validação de entrada com Bean Validation (<C>@Valid</C>, <C>@NotNull</C>, <C>@Pattern</C>...);</>,
            <>Testes unitários da camada de serviço com JUnit 5 + Mockito + AssertJ;</>,
            <>Dockerfile multi-stage e deploy guiado na Render (com alternativa Railway).</>,
          ]}
        />

        <Reveal>
          <H3>POO: onde cada pilar aparece no código</H3>
        </Reveal>
        <PooStrip />
      </div>
    </>
  ),
};

/* ================================================================== */
/* PRÉ-REQUISITOS                                                      */
/* ================================================================== */
const prereq: SectionDef = {
  id: "pre-requisitos",
  nav: "O que você precisa",
  num: "✓",
  body: (
    <>
      <Reveal>
        <div className="mb-6">
          <Kicker>Antes de começar</Kicker>
          <h2 className="font-display text-[26px] font-bold sm:text-[34px]" style={{ color: "var(--mist)" }}>
            O que você precisa
          </h2>
          <p className="mt-2 max-w-2xl text-[16px]" style={{ color: "var(--mist-dim)" }}>
            Tudo gratuito. Confira as versões com os comandos abaixo — o guia foi validado exatamente com elas.
          </p>
        </div>
      </Reveal>

      <Checklist
        items={[
          <>
            <strong style={{ color: "var(--mist)" }}>JDK 21 (LTS)</strong> ou superior — em 2026, a LTS mais recente é o{" "}
            <C>Java 25</C>; o código do guia roda em ambos;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>IDE</strong>: IntelliJ IDEA (Community basta) ou VS Code com o
            <em> Extension Pack for Java</em>;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Maven</strong> — na prática você usará o <C>mvnw</C> que o
            Initializr gera, então nem precisa instalar;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Docker Desktop</strong> (ou Docker Engine) para o passo final de
            conteinerização;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Conta na Render</strong> (plano gratuito) e, opcionalmente, uma{" "}
            <strong style={{ color: "var(--mist)" }}>chave Demo da CoinGecko</strong> — gratuita, eleva o limite de 5-10
            para 30 chamadas/min;
          </>,
          <>
            Familiaridade básica com Java (classes, interfaces, collections) e com o conceito de API REST.
          </>,
        ]}
      />

      <H3>Conferindo o ambiente</H3>
      <CodeBlock
        lang="bash"
        filename="terminal — verificação"
        code={`java -version
# openjdk version "21.0.x" ...  (qualquer 21+ ou 25 serve)

docker --version
# Docker version 27.x.x ou superior

git --version
# git version 2.x.x`}
      />

      <Callout tone="info" title="Sobre a chave da CoinGecko">
        <p style={{ margin: 0 }}>
          A API pública funciona <strong>sem chave</strong> (limite baixo, perfeito para aprender). Se quiser margem,
          crie uma chave <strong>Demo</strong> gratuita no painel de desenvolvedores da CoinGecko e exporte como{" "}
          <C>COINGECKO_API_KEY</C>. O código do guia injeta a chave no cabeçalho <C>x-cg-demo-api-key</C> — e mostra
          exatamente onde trocar por um token Bearer se a sua API externa usar OAuth2.
        </p>
      </Callout>
    </>
  ),
};

/* ================================================================== */
/* PASSO 1 — SPRING INITIALIZR                                         */
/* ================================================================== */
const arquivoTree = [
  {
    name: "cripto-ledger",
    type: "dir" as const,
    children: [
      { name: "pom.xml", note: "dependências e build (Maven)" },
      { name: "mvnw / mvnw.cmd", note: "Maven wrapper: build sem instalar Maven" },
      { name: ".gitignore" },
      {
        name: "src",
        type: "dir" as const,
        children: [
          {
            name: "main/java/com/exemplo/criptoledger",
            type: "dir" as const,
            children: [{ name: "CriptoLedgerApplication.java", note: "classe principal + @SpringBootApplication" }],
          },
          {
            name: "main/resources",
            type: "dir" as const,
            children: [
              { name: "application.yml", note: "configuração de desenvolvimento" },
              { name: "application-prod.yml", note: "configuração de produção (você cria)" },
            ],
          },
          {
            name: "test/java/com/exemplo/criptoledger",
            type: "dir" as const,
            children: [{ name: "CriptoLedgerApplicationTests.java", note: "teste de contexto já pronto" }],
          },
        ],
      },
    ],
  },
];

const passo1: SectionDef = {
  id: "passo-1",
  nav: "Spring Initializr",
  num: "1",
  body: (
    <>
      <StepHead
        numero="1"
        kicker="Passo 1"
        titulo="Configuração no Spring Initializr"
        lead="O Initializr é o gerador oficial de projetos Spring. Você preenche um formulário (ou roda um curl), ele devolve um projeto compilando, com o Maven Wrapper incluso."
        tempo="~10 min"
      />

      <H3>1.1 Preencha exatamente assim em start.spring.io</H3>
      <P>
        Abra <a href="https://start.spring.io" target="_blank" rel="noreferrer">start.spring.io</a> e preencha os campos
        abaixo. O nome do pacote (<C>com.exemplo.criptoledger</C>) define a raiz de todos os pacotes que criaremos — os
        códigos do guia assumem exatamente este pacote.
      </P>
      <InitializrCard />

      <H3>1.2 As dependências — e o porquê de cada uma</H3>
      <P>
        Na seção <strong style={{ color: "var(--mist)" }}>Dependencies</strong>, adicione estas oito. Passe o mouse:
        cada uma tem um papel claro na arquitetura final.
      </P>
      <DependencyGrid />
      <Callout tone="atencao" title="Webflux sem virar reativo">
        <p style={{ margin: 0 }}>
          <C>spring-boot-starter-webflux</C> entra <strong>apenas</strong> para trazer o <C>WebClient</C> e o Reactor.
          Como o <C>starter-web</C> também está presente, a aplicação continua 100% servlet/MVC — é o padrão recomendado
          pela documentação oficial para quem quer o cliente HTTP reativo num app MVC.
        </p>
      </Callout>

      <H3>1.3 Prefere terminal? Gere com um comando</H3>
      <CodeBlock lang="bash" filename="terminal — gerando o projeto" code={springInitCurl} />
      <Callout tone="dica" title="Sem fixar versão do Boot">
        <p style={{ margin: 0 }}>
          Omitimos o <C>bootVersion</C> de propósito: o Initializr usa a versão estável mais recente. O guia foi escrito
          e validado na linha <strong>3.5.x</strong>; qualquer 3.4+ acompanha sem ajustes.
        </p>
      </Callout>

      <H3>1.4 O pom.xml que chega na sua máquina</H3>
      <P>
        O arquivo gerado traz o <em>spring-boot-starter-parent</em>, o plugin de build e todas as dependências. Os
        trechos que importam para nós:
      </P>
      <CodeBlock lang="xml" filename="pom.xml (trechos relevantes)" code={pomSnippet} maxH={520} />

      <H3>1.5 O esqueleto gerado</H3>
      <P>Clique nas pastas para explorar. A partir daqui, todo arquivo novo do guia aparece nesta árvore.</P>
      <FileTree nodes={arquivoTree} />

      <H3>1.6 Configuração: dev com H2, produção com PostgreSQL</H3>
      <P>
        O Spring Boot configura por perfis: o <C>application.yml</C> padrão serve o desenvolvimento (H2 em memória) e o{" "}
        <C>application-prod.yml</C> entra em cena quando <C>SPRING_PROFILES_ACTIVE=prod</C> — exatamente o que a nuvem
        vai definir no deploy.
      </P>
      <CodeTabs
        tabs={[
          { label: "dev · H2", filename: "src/main/resources/application.yml", lang: "yaml", code: applicationYml },
          { label: "prod · PostgreSQL", filename: "src/main/resources/application-prod.yml", lang: "yaml", code: applicationProdYml },
        ]}
      />
      <Callout tone="erro" title="ddl-auto em produção é armadilha">
        <p style={{ margin: 0 }}>
          <C>update</C>/<C>create</C> deixam o Hibernate alterar o esquema sozinho — aceitável no H2 descartável,
          perigoso num banco real. Em produção usamos <C>validate</C> e, num projeto de verdade, migrações versionadas
          com <strong>Flyway</strong> (deixamos na lista de próximos passos).
        </p>
      </Callout>

      <H3>1.7 (Opcional) PostgreSQL local com Docker Compose</H3>
      <P>
        Quer testar o perfil <C>prod</C> antes da nuvem? Suba um PostgreSQL 16 idêntico ao de produção:
      </P>
      <CodeBlock lang="yaml" filename="docker-compose.yml" code={dockerCompose} />
      <CodeBlock
        lang="bash"
        filename="terminal"
        code={`docker compose up -d          # sobe o Postgres na porta 5432

# e rode a app apontando para ele:
SPRING_PROFILES_ACTIVE=prod \\
DATABASE_URL=jdbc:postgresql://localhost:5432/criptoledger \\
DATABASE_USER=dev \\
DATABASE_PASSWORD=dev123 \\
./mvnw spring-boot:run`}
      />

      <H3>1.8 Primeira subida</H3>
      <CodeBlock lang="bash" filename="terminal — hello, Boot" code={runApp} />
      <P>
        Com a app no ar, abra <C>http://localhost:8080/actuator/health</C> (deve devolver <C>"status": "UP"</C>) e, se
        quiser espiar as tabelas, o console do H2 em <C>/h2-console</C> com a JDBC URL <C>jdbc:h2:mem:criptoledger</C>.
        Ainda não há endpoints nossos — eles chegam nos próximos passos.
      </P>
    </>
  ),
};

/* ================================================================== */
/* PASSO 2 — MODELAGEM POO                                             */
/* ================================================================== */
const passo2: SectionDef = {
  id: "passo-2",
  nav: "Modelagem POO & domínio",
  num: "2",
  body: (
    <>
      <StepHead
        numero="2"
        kicker="Passo 2"
        titulo="Modelagem POO e camada de domínio"
        lead="Nada de entidade anêmica com getter/setter por esporte. A Posicao nasce com invariantes, fábrica e comportamento — e a auditoria vem de herança."
        tempo="~15 min"
      />

      <P>
        Crie os pacotes <C>dominio</C>, <C>api.dto</C>, <C>repositorio</C>, <C>negocio</C>, <C>infra.cotacoes</C> e{" "}
        <C>excecao</C> dentro de <C>com.exemplo.criptoledger</C>. A separação já é arquitetura: cada pacote é uma camada
        com um motivo único para existir (o <strong>S</strong> de SOLID aparecendo na estrutura, não só no discurso).
      </P>
      <PooStrip />

      <H3>2.1 Herança: auditoria para todas as entidades</H3>
      <P>
        Toda entidade do sistema precisa de <C>criadoEm</C> e <C>atualizadoEm</C>. Em vez de repetir colunas e lógica,
        uma superclasse <C>@MappedSuperclass</C> resolve para todas — e os callbacks <C>@PrePersist</C>/<C>@PreUpdate</C>{" "}
        garantem que ninguém esquece de preencher as datas.
      </P>
      <CodeBlock lang="java" filename="dominio/EntidadeAuditavel.java" code={auditableEntity} />

      <H3>2.2 A entidade principal: Posicao</H3>
      <P>
        Três decisões de design para prestar atenção:
      </P>
      <Checklist
        items={[
          <>
            <strong style={{ color: "var(--mist)" }}>Construtor privado + fábrica estática</strong> <C>abrir(...)</C>: a
            criação passa por um único funil que valida as invariantes (quantidade e preço positivos);
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Sem setters públicos</strong>: depois de criada, a posição só muda
            via <C>reajustar(...)</C>, que reaplica as mesmas regras — encapsulamento de verdade;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Domínio rico</strong>: <C>custoTotal()</C>, <C>valorDeMercado()</C>{" "}
            e <C>resultadoEm()</C> vivem na entidade. O Service orquestra; a conta pertence a quem tem os dados
            (<em>Tell, don't ask</em>).
          </>,
        ]}
      />
      <CodeBlock lang="java" filename="dominio/Posicao.java" code={posicaoEntity} maxH={560} />
      <Callout tone="info" title="Por que não Lombok?">
        <p style={{ margin: 0 }}>
          Lombok economiza código, mas esconde o design. Aqui queremos <strong>ver</strong> que não há setters e que a
          fábrica é a única entrada — a verbosidade é didática. Em projetos reais, use Lombok (ou Kotlin) com a mesma
          disciplina de encapsulamento.
        </p>
      </Callout>

      <H3>2.3 DTOs como records + Bean Validation</H3>
      <P>
        Records são a tradução perfeita de DTO: imutáveis, sem cerimônia, com <C>equals</C>/<C>hashCode</C> de graça. As
        anotações de validação ficam no DTO de <strong>entrada</strong> — a entidade não conhece HTTP, e o HTTP não
        conhece JPA.
      </P>
      <CodeBlock lang="java" filename="api/dto/PosicaoRequest.java + PosicaoResponse.java" code={dtosSnippet} />
      <Callout tone="dica" title="A regex do símbolo não é enfeite">
        <p style={{ margin: 0 }}>
          <C>^[a-z0-9-]+$</C> casa exatamente com os ids da CoinGecko (<C>bitcoin</C>, <C>shiba-inu</C>...). Validar na
          entrada evita viagem perdida até a API externa — e devolve um erro claro para quem digitou <C>BTC</C> esperando milagre.
        </p>
      </Callout>

      <H3>2.4 O Mapper: fronteira entre mundos</H3>
      <P>
        Conversão Entidade ↔ DTO numa classe utilitária dedicada. Simples, testável e fácil de trocar por MapStruct
        quando o número de DTOs crescer.
      </P>
      <CodeBlock lang="java" filename="api/dto/PosicaoMapper.java" code={mapperSnippet} />

      <Callout tone="info" title="SOLID até aqui">
        <p style={{ margin: 0 }}>
          <strong>S</strong>: cada classe tem um motivo único para mudar (entidade = regras do domínio; DTO = contrato
          da API; mapper = conversão). <strong>O</strong>: novas entidades herdam a auditoria sem tocá-la. <strong>D</strong>:
          o Service dependerá de <C>PosicaoRepository</C> (interface) e não de uma implementação — o Mockito agradece no Passo 6.
        </p>
      </Callout>
    </>
  ),
};

export const sections1: SectionDef[] = [hero, prereq, passo1, passo2];
