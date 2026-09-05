import { CodeBlock, CodeTabs } from "../components/CodeBlock";
import {
  C,
  Callout,
  Checklist,
  EnvTable,
  H3,
  Kicker,
  NumSteps,
  P,
  Reveal,
  StepHead,
} from "../components/ui";
import type { SectionDef } from "../components/visuals";
import {
  dockerfile,
  dockerIgnore,
  dockerRun,
  globalHandler,
  mercadoTest,
  problemExample,
  renderYaml,
  serviceTest,
} from "./snippets";

/* ================================================================== */
/* PASSO 5 — TRATAMENTO GLOBAL DE ERROS                                */
/* ================================================================== */
const passo5: SectionDef = {
  id: "passo-5",
  nav: "Erros globais · RFC 7807",
  num: "5",
  body: (
    <>
      <StepHead
        numero="5"
        kicker="Passo 5"
        titulo="Tratamento global de exceções (RFC 7807)"
        lead="Toda exceção do sistema — nossa ou do framework — vira uma resposta estruturada no padrão Problem Details. O cliente máquina lê 'type/title/status'; o cliente humano lê o resto."
        tempo="~10 min"
      />

      <P>
        O padrão <strong>RFC 7807</strong> (atualizado pela <strong>RFC 9457</strong>) define um formato JSON comum para
        erros de APIs: <C>type</C> (URI que documenta o erro), <C>title</C>, <C>status</C>, <C>detail</C> e{" "}
        <C>instance</C> — com espaço para propriedades extras, como a nossa lista de <C>violacoes</C>. O Spring Boot 3
        implementa o padrão nativamente na classe <C>ProblemDetail</C>: não precisamos escrever serialização nenhuma.
      </P>
      <P>
        Duas escolhas de design no handler abaixo:
      </P>
      <Checklist
        items={[
          <>
            Herdar <C>ResponseEntityExceptionHandler</C> faz os erros <strong>do próprio framework</strong> (rota 404,
            método 405, media type 415...) saírem no mesmo formato — consistência total;
          </>,
          <>
            Handlers <strong>mais específicos antes</strong> dos genéricos: o Spring escolhe o handler mais específico
            por tipo de exceção, então o <C>LimiteDeRequisicoesException</C> (429) ganha do handler da superclasse{" "}
            <C>ServicoExternoIndisponivelException</C> (503).
          </>,
        ]}
      />
      <CodeBlock lang="java" filename="api/TratamentoGlobalDeErros.java" code={globalHandler} maxH={640} />

      <H3>Como o cliente vê</H3>
      <P>
        Lembra do curl com <C>"simbolo": "BITCOIN"</C> e quantidade negativa, no Passo 4? A resposta agora é esta — cada
        campo problemático listado, sem o cliente precisar adivinhar:
      </P>
      <CodeBlock lang="json" filename="HTTP/1.1 400 · application/problem+json" code={problemExample} />

      <Callout tone="erro" title="O 500 genérico é proposital">
        <p style={{ margin: 0 }}>
          O handler de <C>Exception.class</C> loga o stack trace completo internamente, mas devolve uma mensagem
          neutra. Vazar <C>NullPointerException em tal linha</C> para o cliente é entregar o mapa da sua implementação —
          e, em casos clássicos, até caminhos de SQL. <strong>Detalhe interno fica no log; o cliente recebe orientação.</strong>
        </p>
      </Callout>

      <Callout tone="dica" title="Teste os erros de propósito">
        <p style={{ margin: 0 }}>
          Rode: <C>GET /api/v1/posicoes/999</C> (404 de recurso), <C>POST</C> com símbolo duplicado (409), e force um
          429 estourando o limite anônimo da CoinGecko. Compare cada corpo com o padrão — todos devem ter{" "}
          <C>type</C>, <C>title</C>, <C>status</C>, <C>detail</C> e <C>instance</C>.
        </p>
      </Callout>
    </>
  ),
};

/* ================================================================== */
/* PASSO 6 — TESTES UNITÁRIOS                                          */
/* ================================================================== */
const passo6: SectionDef = {
  id: "passo-6",
  nav: "Testes unitários",
  num: "6",
  body: (
    <>
      <StepHead
        numero="6"
        kicker="Passo 6"
        titulo="Testes unitários com JUnit 5 e Mockito"
        lead="Testamos a camada de serviço sem subir Spring nem banco: Mockito isola as dependências, AssertJ deixa as asserções legíveis e o contrato de resiliência vira um teste."
        tempo="~15 min"
      />

      <P>
        Por que a camada de serviço? É onde vivem as <strong>regras</strong> — e regras são o que mais dá bug. O
        desenho do guia cobra seu prêmio aqui: como <C>PosicaoService</C> depende de interfaces/injetáveis,{" "}
        <C>@Mock</C> + <C>@InjectMocks</C> e o teste roda em milissegundos, sem contexto.
      </P>

      <H3>6.1 PosicaoService: criação, conflito e 404</H3>
      <P>
        Três testes, três técnicas: <C>ArgumentCaptor</C> para inspecionar o que chegou ao repositório,{" "}
        <C>verify(never())</C> para garantir ausência de efeito colateral e <C>assertThatThrownBy</C> para o caminho
        infeliz.
      </P>
      <CodeBlock lang="java" filename="test/.../negocio/PosicaoServiceTest.java" code={serviceTest} maxH={640} />

      <H3>6.2 MercadoService: o fallback É um contrato — teste-o</H3>
      <P>
        Resiliência que não tem teste é torcida. Este teste prova o comportamento mais importante da integração: API no
        ar → dados frescos; API caída → cache devolvido como obsoleto. O <C>CacheManager</C> aqui é o{" "}
        <strong>real</strong> (Caffeine puro), porque o cache é o coração do comportamento testado.
      </P>
      <CodeBlock lang="java" filename="test/.../negocio/MercadoServiceTest.java" code={mercadoTest} maxH={560} />

      <H3>6.3 Rodando a suíte</H3>
      <CodeBlock
        lang="bash"
        filename="terminal"
        code={`./mvnw test

# Esperado no final:
# [INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
# [INFO] BUILD SUCCESS`}
      />
      <Callout tone="info" title="Unitário, de integração e além">
        <p style={{ margin: 0 }}>
          Estes são testes <strong>unitários</strong>: rápidos, isolados, ideais para regras. Para a outra ponta do
          espectro, o <C>@SpringBootTest</C> sobe o contexto inteiro (com H2) e testa a API de ponta a ponta via{" "}
          <C>MockMvc</C> — ótimo para o tratamento de erros do Passo 5. E quando quiser um banco real nos testes,{" "}
          <strong>Testcontainers</strong> sobe um PostgreSQL descartável via Docker. Caminho natural de evolução.
        </p>
      </Callout>
      <Callout tone="dica" title="Leia os nomes dos testes como frases">
        <p style={{ margin: 0 }}>
          <C>@DisplayName</C> em português, no formato <em>"dado X, quando Y, deve Z"</em>, transforma a suíte em
          documentação executável da regra de negócio. Quando o produto perguntar "como o sistema se comporta com
          símbolo duplicado?", a resposta é um teste verde.
        </p>
      </Callout>
    </>
  ),
};

/* ================================================================== */
/* PASSO 7 — DOCKER E DEPLOY                                           */
/* ================================================================== */
const passo7: SectionDef = {
  id: "passo-7",
  nav: "Docker & deploy",
  num: "7",
  body: (
    <>
      <StepHead
        numero="7"
        kicker="Passo 7"
        titulo="Dockerfile e deploy na nuvem"
        lead="Build multi-stage: o JDK compila, o JRE roda. A Render empacota a imagem a partir do Dockerfile, injeta o PostgreSQL gratuito e as variáveis — e a API ganha URL pública."
        tempo="~15 min"
      />

      <H3>7.1 Dockerfile multi-stage</H3>
      <P>
        Dois estágios, dois propósitos: o primeiro usa a imagem com Maven + JDK para gerar o fat-jar (cacheando as
        dependências em camada própria); o segundo copia só o jar para uma imagem com <strong>apenas JRE</strong> —
        menor, mais rápida e com menos superfície de ataque.
      </P>
      <CodeBlock lang="dockerfile" filename="Dockerfile" code={dockerfile} />
      <CodeBlock lang="bash" filename=".dockerignore" code={dockerIgnore} />

      <H3>7.2 Testando a imagem localmente</H3>
      <CodeBlock lang="bash" filename="terminal — build & run" code={dockerRun} />

      <H3>7.3 Deploy na Render (plano gratuito)</H3>
      <P>
        A Render lê o arquivo <C>render.yaml</C> na raiz do repositório e provisiona tudo como código — serviço web +
        PostgreSQL + variáveis.
      </P>
      <CodeBlock lang="yaml" filename="render.yaml (raiz do repositório)" code={renderYaml} />
      <NumSteps
        steps={[
          {
            title: "Publique o código",
            body: (
              <>
                Crie um repositório (GitHub/GitLab) e suba tudo — incluindo <C>Dockerfile</C> e <C>render.yaml</C>:{" "}
                <C>git init && git add . && git commit -m "cripto-ledger pronto para deploy" && git push</C>.
              </>
            ),
          },
          {
            title: "Crie o Blueprint na Render",
            body: (
              <>
                Em <strong>render.com</strong> → <em>New</em> → <em>Blueprint</em>, conecte o repositório. A Render lê o{" "}
                <C>render.yaml</C>, cria o serviço <strong>docker</strong> e o banco <strong>PostgreSQL 16 free</strong>,
                e mostra o plano de infraestrutura para você confirmar.
              </>
            ),
          },
          {
            title: "Preencha o segredo da CoinGecko",
            body: (
              <>
                O <C>COINGECKO_API_KEY</C> tem <C>sync: false</C> — a Render pede o valor no painel (e não o salva no
                repositório). Sem chave? Deixe vazio: a API pública funciona, com limite menor.
              </>
            ),
          },
          {
            title: "Aguarde o build e teste a URL pública",
            body: (
              <>
                O build roda o Dockerfile multi-stage (alguns minutos no primeiro deploy). Quando o health check{" "}
                <C>/actuator/health</C> ficar verde, a API estará viva em{" "}
                <C>https://cripto-ledger-api.onrender.com</C> — teste o <C>/api/v1/posicoes/resumo</C> de qualquer lugar
                do mundo.
              </>
            ),
          },
        ]}
      />

      <H3>7.4 As variáveis de ambiente em jogo</H3>
      <EnvTable
        rows={[
          { chave: "SPRING_PROFILES_ACTIVE", valor: "prod", desc: "Ativa o application-prod.yml (PostgreSQL + H2 console off)." },
          { chave: "DATABASE_URL", valor: "jdbc:postgresql://host:5432/db", desc: "Injetada pelo banco provisionado (veja a atenção abaixo)." },
          { chave: "DATABASE_USER / DATABASE_PASSWORD", valor: "••••••", desc: "Credenciais do PostgreSQL, vindas do banco." },
          { chave: "COINGECKO_API_KEY", valor: "CG.demo.xxxx", desc: "Chave Demo opcional da CoinGecko (segredo)." },
          { chave: "PORT", valor: "8080", desc: "Injetada pela plataforma; nosso ENTRYPOINT já a respeita." },
        ]}
      />
      <Callout tone="atencao" title="O clássico postgres:// vs jdbc:postgresql://">
        <p style={{ margin: 0 }}>
          Muitas plataformas entregam a string como <C>postgres://user:pass@host/db</C>. O Spring precisa do formato{" "}
          <C>jdbc:postgresql://...</C>. No <C>render.yaml</C> pedimos a <C>connectionString</C> externa; se vier sem o
          prefixo <C>jdbc:</C>, ajuste a variável <C>DATABASE_URL</C> no painel acrescentando <C>jdbc:</C> — ou derive a
          URL via código. É o ajuste de 30 segundos que separa o deploy verde do vermelho.
        </p>
      </Callout>

      <H3>7.5 Prefere Railway? O caminho equivalente</H3>
      <CodeTabs
        tabs={[
          {
            label: "Railway CLI",
            filename: "terminal — deploy no Railway",
            lang: "bash",
            code: `# 1) Instale a CLI (npm i -g @railway/cli) e autentique
railway login

# 2) No diretório do projeto: cria projeto + serviço
railway init

# 3) Adiciona um PostgreSQL ao projeto
railway add --plugin postgresql

# 4) Variáveis de ambiente
railway variables set SPRING_PROFILES_ACTIVE=prod
railway variables set COINGECKO_API_KEY=sua-chave
railway variables set DATABASE_URL='{{postgres.DATABASE_URL}}'

# 5) Deploy (usa o Dockerfile automaticamente)
railway up

# 6) Gera um domínio público para o serviço
railway domain`,
          },
          {
            label: "Render (resumo)",
            filename: "resumo — caminho Render",
            lang: "bash",
            code: `# Tudo via render.yaml (já no repositório):
#   servico web  -> runtime: docker
#   banco        -> PostgreSQL 16 free
#   health check -> /actuator/health
#
# Painel: New > Blueprint > selecionar repo > Apply.
# URL final: https://cripto-ledger-api.onrender.com/actuator/health`,
          },
        ]}
      />
      <Callout tone="dica" title="Plano gratuito: expectativas honestas">
        <p style={{ margin: 0 }}>
          No free tier, o serviço <em>dorme</em> após ~15 minutos sem tráfego e a primeira requisição depois leva alguns
          segundos (cold start do container + boot do Spring). Para um projeto de estudo é perfeito — e o{" "}
          <C>/actuator/health</C> da Render ajuda a manter o serviço acordado se você configurá-lo como health check.
        </p>
      </Callout>
    </>
  ),
};

/* ================================================================== */
/* ENCERRAMENTO — PRÓXIMOS PASSOS                                      */
/* ================================================================== */
const outro: SectionDef = {
  id: "proximos-passos",
  nav: "Próximos passos",
  num: "∞",
  body: (
    <>
      <Reveal>
        <div className="mb-6">
          <Kicker color="var(--amber)">Guia concluído — e agora?</Kicker>
          <h2 className="font-display text-[26px] font-bold sm:text-[34px]" style={{ color: "var(--mist)" }}>
            Do protótipo ao produto
          </h2>
          <p className="mt-2 max-w-2xl text-[16px]" style={{ color: "var(--mist-dim)" }}>
            Você tem uma API em produção com CRUD, integração resiliente, erros padronizados, testes e container. As
            evoluções naturais, em ordem de impacto:
          </p>
        </div>
      </Reveal>
      <Checklist
        tone="var(--amber)"
        items={[
          <>
            <strong style={{ color: "var(--mist)" }}>Flyway</strong> para migrações versionadas de banco (e troque o{" "}
            <C>ddl-auto: validate</C> por migrações de verdade);
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Paginação</strong> com <C>Pageable</C> no <C>GET /posicoes</C> —
            essencial quando a lista cresce;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>springdoc-openapi</strong> para documentação OpenAPI/Swagger
            gerada direto dos controllers;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Spring Security + OAuth2</strong> para proteger os endpoints e
            praticar o fluxo de token Bearer que o Passo 3 deixou preparado;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Testcontainers</strong> para testes de integração com PostgreSQL
            real e <C>@WebMvcTest</C> para os controllers;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Observabilidade</strong>: Micrometer + Prometheus/Grafana (o
            Actuator já está a bordo) e logs estruturados.
          </>,
        ]}
      />

      <Reveal>
        <div
          className="my-8 rounded-xl border p-6"
          style={{ borderColor: "var(--line)", background: "linear-gradient(135deg, rgba(139,212,80,.06), rgba(240,180,41,.05))" }}
        >
          <p className="font-display text-[18px] font-semibold" style={{ color: "var(--mist)" }}>
            Referências oficiais para continuar
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {[
              ["Guias oficiais do Spring", "https://spring.io/guides"],
              ["Referência do Spring Boot", "https://docs.spring.io/spring-boot/index.html"],
              ["WebClient & HTTP Interfaces", "https://docs.spring.io/spring-framework/reference/integration/rest-clients.html"],
              ["Bean Validation", "https://docs.spring.io/spring-boot/reference/io/validation.html"],
              ["RFC 9457 — Problem Details", "https://www.rfc-editor.org/rfc/rfc9457"],
              ["API da CoinGecko", "https://docs.coingecko.com/reference/introduction"],
              ["Dockerfile reference", "https://docs.docker.com/reference/dockerfile/"],
              ["Documentação da Render", "https://docs.render.com/"],
            ].map(([label, href]) => (
              <li key={href} className="text-[14px]">
                <a href={href} target="_blank" rel="noreferrer">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal>
        <blockquote
          className="font-display my-8 border-l-[3px] pl-5 text-[20px] font-medium italic leading-snug sm:text-[24px]"
          style={{ borderColor: "var(--leaf-bright)", color: "var(--mist)" }}
        >
          "Código que roda é o começo. Código com domínio rico, erros honestos, testes verdes e deploy repetível — isso
          é engenharia."
        </blockquote>
      </Reveal>
    </>
  ),
};

export const sections3: SectionDef[] = [passo5, passo6, passo7, outro];
