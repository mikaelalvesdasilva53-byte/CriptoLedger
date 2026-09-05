import { CodeBlock } from "../components/CodeBlock";
import {
  C,
  Callout,
  Checklist,
  H3,
  P,
  Reveal,
  StepHead,
} from "../components/ui";
import type { SectionDef } from "../components/visuals";
import {
  cacheConfig,
  controllers,
  cotacaoController,
  curlCrud,
  enableProps,
  excecoes,
  httpInterface,
  mainClassNote,
  mercadoService,
  proxyFactory,
  repository,
  resumoDtos,
  service,
  webClientConfig,
} from "./snippets";

/* ================================================================== */
/* PASSO 3 — API EXTERNA                                               */
/* ================================================================== */
const passo3: SectionDef = {
  id: "passo-3",
  nav: "Consumo da API externa",
  num: "3",
  body: (
    <>
      <StepHead
        numero="3"
        kicker="Passo 3"
        titulo="Consumo da API RESTful externa"
        lead="A CoinGecko entra como provedora de cotações. A integração nasce robusta: autenticação por chave, timeouts, retry com backoff, tradução de erros HTTP e fallback com cache."
        tempo="~20 min"
      />

      <P>
        A estratégia tem três camadas, cada uma num arquivo:
      </P>
      <Checklist
        items={[
          <>
            <strong style={{ color: "var(--mist)" }}>Configuração</strong> — properties tipadas + <C>WebClient</C> de
            fábrica com chave de API, timeouts, retry e tradução de status;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Contrato</strong> — uma <C>HTTP Interface</C> que descreve a API da
            CoinGecko como uma interface Java;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Serviço</strong> — <C>MercadoService</C> com cache Caffeine e
            fallback para dados obsoletos quando a API cai.
          </>,
        ]}
      />

      <H3>3.1 Properties tipadas (adeus, @Value solto)</H3>
      <P>
        O bloco <C>coingecko.*</C> do Passo 1 vira um record validado pelo Boot. Se a URL base sumir do YAML, a app
        reclama na inicialização — não em produção.
      </P>
      <CodeBlock lang="java" filename="infra/cotacoes/CoinGeckoProperties.java" code={enablePropsNote()} />

      <P>
        E a classe principal ganha <C>@ConfigurationPropertiesScan</C> para registrar o record automaticamente:
      </P>
      <CodeBlock lang="java" filename="CriptoLedgerApplication.java" code={mainClassNote + "\n" + enableProps} />

      <H3>3.2 WebClient de fábrica: autenticação, timeout, retry e erros</H3>
      <P>
        Este é o arquivo mais denso do guia — leia os comentários. Três mecanismos merecem sua atenção:
      </P>
      <Checklist
        items={[
          <>
            <strong style={{ color: "var(--mist)" }}>Autenticação</strong>: um <C>ExchangeFilterFunction</C> injeta a
            chave Demo no cabeçalho <C>x-cg-demo-api-key</C> em toda requisição;
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Resiliência de transporte</strong>: timeouts de conexão e resposta +
            retry com backoff exponencial <em>apenas</em> para erros transitórios (5xx / timeout);
          </>,
          <>
            <strong style={{ color: "var(--mist)" }}>Tradução de erros</strong>: <C>defaultStatusHandler</C> converte
            status HTTP em exceções de domínio — 429, 4xx e 5xx viram exceções <em>diferentes</em>, com tratamentos diferentes.
          </>,
        ]}
      />
      <CodeBlock lang="java" filename="infra/cotacoes/CoinGeckoConfig.java" code={webClientConfig} maxH={600} />
      <Callout tone="info" title="E se a API usasse OAuth2 / Bearer?">
        <p style={{ margin: 0 }}>
          O encaixe é o mesmo: troque o filtro <C>chaveDeApi</C> por um que resolve o token e chame{" "}
          <C>headers.setBearerAuth(token)</C>. Para fluxos completos de <em>client credentials</em>, o Spring Security
          OAuth2 Client oferece o <C>ServletOAuth2AuthorizedClientExchangeFilterFunction</C> — ele busca, cacheia e
          renova o token sozinho. A estrutura do guia não muda em nada.
        </p>
      </Callout>

      <H3>3.3 HTTP Interface: a API externa vira uma interface Java</H3>
      <P>
        Em vez de montar URIs e desserializar na mão em cada chamada, você <strong>declara</strong> o contrato. O Spring
        gera o proxy; o Jackson cuida do JSON (<C>usd_24h_change</C> vira <C>variacao24h</C> via <C>@JsonProperty</C>).
      </P>
      <CodeBlock lang="java" filename="infra/cotacoes/CoinGeckoClient.java" code={httpInterface} />
      <CodeBlock lang="java" filename="infra/cotacoes/CoinGeckoClientConfig.java" code={proxyFactory} />

      <H3>3.4 A hierarquia de exceções da integração</H3>
      <P>
        <strong>Polimorfismo aplicado ao tratamento de erros</strong>: <C>LimiteDeRequisicoesException</C> e{" "}
        <C>RespostaInvalidaDaApiException</C> <em>são</em> <C>ServicoExternoIndisponivelException</C>. O handler global
        pode tratar a família inteira com um <C>@ExceptionHandler</C> da raiz e refinar o que for especial — a ordem de
        declaração importa, e veremos isso no Passo 5.
      </P>
      <CodeBlock lang="java" filename="excecao/*.java (5 classes)" code={excecoes} maxH={460} />

      <H3>3.5 Cache Caffeine + MercadoService com fallback</H3>
      <P>
        Primeiro o cache — 60 segundos de validade, o bastante para uma cotação de demonstração e para segurar a onda em
        picos de acesso:
      </P>
      <CodeBlock lang="java" filename="infra/cotacoes/CacheConfig.java" code={cacheConfig} />
      <P>
        Agora o serviço. O fluxo é: <strong>cache → API → cache</strong>; se a API falhar e houver algo guardado,
        devolvemos o dado <em>marcado como obsoleto</em> (o campo <C>obsoleta</C> viaja até a resposta da API — o cliente
        sabe que está vendo um dado de até 60s atrás, melhor do que ver um 503). Sem cache e sem API, a exceção sobe e o
        tratamento global responde 503 honestamente.
      </P>
      <CodeBlock lang="java" filename="negocio/MercadoService.java" code={mercadoService} maxH={600} />
      <Callout tone="atencao" title="Fallback não é milagre">
        <p style={{ margin: 0 }}>
          Degradar com dados obsoletos só faz sentido quando <strong>dados levemente velhos &gt; erro</strong> — cotação
          de portfólio é o caso clássico. Num fluxo de pagamento, o certo seria falhar rápido. Resiliência é decisão de
          domínio, não receita de bolo.
        </p>
      </Callout>
    </>
  ),
};

function enablePropsNote(): string {
  return `package com.exemplo.criptoledger.infra.cotacoes;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Tipagem forte para o bloco "coingecko.*" do application.yml.
 * Nada de espalhar @Value pelo código.
 */
@ConfigurationProperties(prefix = "coingecko")
public record CoinGeckoProperties(
        String baseUrl,
        String apiKey,
        @DefaultValue("4000") long timeoutMs
) {
}`;
}

/* ================================================================== */
/* PASSO 4 — REGRAS DE NEGÓCIO E CONTROLLERS                           */
/* ================================================================== */
const passo4: SectionDef = {
  id: "passo-4",
  nav: "Regras & Controllers",
  num: "4",
  body: (
    <>
      <StepHead
        numero="4"
        kicker="Passo 4"
        titulo="Regras de negócio, repositório e controllers"
        lead="A hora de juntar tudo: Spring Data JPA para persistir, um Service orquestrador e controllers finos que devolvem os status HTTP corretos."
        tempo="~20 min"
      />

      <H3>4.1 Repository: persistência sem SQL escrito</H3>
      <P>
        Herdar <C>JpaRepository</C> já traz <C>save</C>, <C>findById</C>, <C>delete</C> e cia. Os métodos derivados do
        nome cobrem o resto — repare que <C>criadoEm</C> vem da superclasse auditável: a herança do Passo 2 pagando
        dividendos.
      </P>
      <CodeBlock lang="java" filename="repositorio/PosicaoRepository.java" code={repository} />

      <H3>4.2 O DTO do resumo</H3>
      <P>
        Antes do Service, o contrato do endpoint mais rico: o resumo do portfólio. O campo <C>cotacoesObsoletas</C> é o
        aviso de fallback do Passo 3 chegando até o cliente.
      </P>
      <CodeBlock lang="java" filename="api/dto/ResumoPortfolioResponse.java" code={resumoDtos} />

      <H3>4.3 O Service: coração do sistema</H3>
      <P>
        Regras de negócio moram aqui, <strong>nunca</strong> no Controller. Destaques: injeção por construtor (testável
        com Mockito), <C>@Transactional</C> delimitando unidades de trabalho, <em>dirty checking</em> no reajuste (nem
        precisamos de <C>save</C>) e o <C>resumir()</C> casando dados locais com cotações externas.
      </P>
      <CodeBlock lang="java" filename="negocio/PosicaoService.java" code={service} maxH={640} />
      <Callout tone="dica" title="Símbolo duplicado? 409, não 400">
        <p style={{ margin: 0 }}>
          A entrada é <em>válida</em> (passou no Bean Validation), mas viola uma regra do negócio: já existe posição
          para aquele símbolo. Por isso <C>RegraDeNegocioException</C> → <strong>409 Conflict</strong>, com a mensagem
          indicando o caminho correto (usar PUT). Separar "dados malformados" de "regra violada" é o que deixa uma API
          gostosa de consumir.
        </p>
      </Callout>

      <H3>4.4 Controllers: finos de propósito</H3>
      <P>
        Receber, validar com <C>@Valid</C>, delegar, devolver o status certo. O <C>POST</C> devolve <strong>201</strong>{" "}
        com o header <C>Location</C> apontando o recurso criado; o <C>DELETE</C> devolve <strong>204</strong> sem corpo.
      </P>
      <CodeBlock lang="java" filename="api/PosicaoController.java" code={controllers} maxH={560} />
      <CodeBlock lang="java" filename="api/CotacaoController.java" code={cotacaoController} />

      <H3>4.5 Prove tudo com curl</H3>
      <P>
        Suba a app (<C>./mvnw spring-boot:run</C>) e execute na ordem. Este bloco exercita CRUD, validação falhando do
        jeito certo e o resumo valorizado — o momento "funciona de verdade" do guia.
      </P>
      <CodeBlock lang="bash" filename="terminal — exercitando a API" code={curlCrud} maxH={560} />
      <Callout tone="erro" title="Resumo zerou e você não entendeu?">
        <p style={{ margin: 0 }}>
          Dois suspeitos de sempre: (1) o <C>simbolo</C> não é um id válido da CoinGecko (é <C>bitcoin</C>, não{" "}
          <C>btc</C> — teste antes em <C>/api/v1/cotacoes?symbols=seu-simbolo</C>); (2) você passou do limite de
          requisições anônimas — espere um minuto ou configure a chave Demo no <C>COINGECKO_API_KEY</C>.
        </p>
      </Callout>
    </>
  ),
};

export const sections2: SectionDef[] = [passo3, passo4];
