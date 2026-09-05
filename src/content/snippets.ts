/* Todos os blocos de código do guia. */

export const springInitCurl = `# Gera o esqueleto do projeto direto do terminal (alternativa ao site)
curl https://start.spring.io/starter.tgz \\
  -d type=maven-project \\
  -d language=java \\
  -d baseDir=cripto-ledger \\
  -d groupId=com.exemplo \\
  -d artifactId=cripto-ledger \\
  -d name=cripto-ledger \\
  -d description="Ledger de posicoes em cripto com cotacoes via CoinGecko" \\
  -d packageName=com.exemplo.criptoledger \\
  -d packaging=jar \\
  -d javaVersion=21 \\
  -d dependencies=web,data-jpa,validation,h2,postgresql,webflux,cache,actuator \\
  | tar -xzvf -`;

export const pomSnippet = `<?xml version="1.0" encoding="UTF-8"?>
<project ...>
    <!-- O Initializr gera o pom completo; confira os pontos abaixo -->
    <properties>
        <java.version>21</java.version> <!-- LTS: 21 ou 25 -->
    </properties>

    <dependencies>
        <!-- API REST + MVC -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Persistência: JPA + Hibernate -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Bean Validation (@Valid, @NotNull...) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Banco em memória para desenvolvimento -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Driver PostgreSQL para produção -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Traz o WebClient (+ Reactor) para consumir APIs externas -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>

        <!-- Cache (usado com Caffeine na resiliência) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-cache</artifactId>
        </dependency>
        <dependency>
            <groupId>com.github.ben-manes.caffeine</groupId>
            <artifactId>caffeine</artifactId>
        </dependency>

        <!-- Health check para a plataforma de deploy -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Testes: JUnit 5 + Mockito + AssertJ já vêm juntos -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`;

export const runApp = `cd cripto-ledger

# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run

# Ao final do log: "Started CriptoLedgerApplication in X seconds"
# Health check: http://localhost:8080/actuator/health`;

export const applicationYml = `# src/main/resources/application.yml (perfil default = desenvolvimento)
spring:
  application:
    name: cripto-ledger

  # H2 em memória: zero configuração para desenvolver
  datasource:
    url: jdbc:h2:mem:criptoledger;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password: ""

  jpa:
    hibernate:
      ddl-auto: update          # cria/atualiza tabelas sozinho (só em dev!)
    open-in-view: false         # boa prática: desligar a sessão preguiçosa
    properties:
      hibernate:
        format_sql: true

  h2:
    console:
      enabled: true             # acesse em /h2-console (JDBC URL acima)
      path: /h2-console

# Nosso bloco customizado, lido por @ConfigurationProperties
coingecko:
  base-url: https://api.coingecko.com/api/v3
  api-key: \${COINGECKO_API_KEY:}   # opcional: chave Demo gratuita
  timeout-ms: 4000

management:
  endpoints:
    web:
      exposure:
        include: health,info`;

export const applicationProdYml = `# src/main/resources/application-prod.yml (ativado com SPRING_PROFILES_ACTIVE=prod)
spring:
  datasource:
    # A plataforma de nuvem injeta estas variáveis de ambiente
    url: \${DATABASE_URL}
    username: \${DATABASE_USER}
    password: \${DATABASE_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 5      # planos gratuitos têm poucas conexões

  jpa:
    hibernate:
      ddl-auto: validate        # nunca deixe "update/create" em produção
    open-in-view: false

  h2:
    console:
      enabled: false            # console H2 desligado em produção

coingecko:
  api-key: \${COINGECKO_API_KEY:}`;

export const dockerCompose = `# docker-compose.yml — sobe um PostgreSQL local idêntico ao de produção
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: criptoledger
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`;

export const auditableEntity = `package com.exemplo.criptoledger.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;

/**
 * HERANÇA + ENCAPSULAMENTO: toda entidade do sistema herda a auditoria.
 * Sem setters — o ciclo de vida das datas é controlado pelo próprio JPA.
 */
@MappedSuperclass
public abstract class EntidadeAuditavel {

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @PrePersist
    void aoCriar() {
        this.criadoEm = Instant.now();
        this.atualizadoEm = this.criadoEm;
    }

    @PreUpdate
    void aoAtualizar() {
        this.atualizadoEm = Instant.now();
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}`;

export const posicaoEntity = `package com.exemplo.criptoledger.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Entidade principal do sistema: uma POSIÇÃO em um ativo cripto.
 *
 * Decisões de POO aplicadas aqui:
 *  - Encapsulamento: campos privados, sem setters públicos; mutações
 *    acontecem apenas por métodos de negócio com regras.
 *  - Fábrica estática: "abrir(...)" concentra as invariantes de criação.
 *  - Domínio rico: a própria entidade sabe calcular valor e resultado,
 *    em vez de espalhar contas pelo Service (Tell, don't ask).
 */
@Entity
@Table(name = "posicoes")
public class Posicao extends EntidadeAuditavel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Id do ativo na CoinGecko: "bitcoin", "ethereum", "solana"... */
    @Column(nullable = false, length = 40)
    private String simbolo;

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal quantidade;

    @Column(name = "preco_medio_compra_usd", nullable = false, precision = 18, scale = 2)
    private BigDecimal precoMedioCompraUsd;

    @Column(length = 280)
    private String anotacoes;

    /** Construtor privado vazio: exigência do JPA, não faz parte da API pública. */
    protected Posicao() {
    }

    private Posicao(String simbolo, BigDecimal quantidade,
                    BigDecimal precoMedioCompraUsd, String anotacoes) {
        this.simbolo = simbolo;
        this.quantidade = quantidade;
        this.precoMedioCompraUsd = precoMedioCompraUsd;
        this.anotacoes = anotacoes;
    }

    /** Fábrica: única porta de entrada para criar uma posição válida. */
    public static Posicao abrir(String simbolo, BigDecimal quantidade,
                                BigDecimal precoMedioCompraUsd, String anotacoes) {
        if (quantidade.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser positiva.");
        }
        if (precoMedioCompraUsd.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Preço médio deve ser positivo.");
        }
        return new Posicao(simbolo.toLowerCase().trim(), quantidade,
                precoMedioCompraUsd, anotacoes);
    }

    /** Atualização total da posição, preservando as mesmas invariantes. */
    public void reajustar(BigDecimal novaQuantidade, BigDecimal novoPrecoMedio,
                          String novasAnotacoes) {
        if (novaQuantidade.compareTo(BigDecimal.ZERO) <= 0
                || novoPrecoMedio.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valores devem ser positivos.");
        }
        this.quantidade = novaQuantidade;
        this.precoMedioCompraUsd = novoPrecoMedio;
        this.anotacoes = novasAnotacoes;
    }

    // ---- Comportamento de negócio (domínio rico) ----

    /** Custo total aportado: quantidade x preço médio. */
    public BigDecimal custoTotal() {
        return quantidade.multiply(precoMedioCompraUsd);
    }

    /** Valor de mercado atual: quantidade x cotação do dia. */
    public BigDecimal valorDeMercado(BigDecimal cotacaoUsd) {
        return quantidade.multiply(cotacaoUsd);
    }

    /** Lucro/prejuízo não realizado frente à cotação atual. */
    public BigDecimal resultadoEm(BigDecimal cotacaoUsd) {
        return valorDeMercado(cotacaoUsd).subtract(custoTotal());
    }

    // ---- Getters (somente leitura) ----

    public Long getId() {
        return id;
    }

    public String getSimbolo() {
        return simbolo;
    }

    public BigDecimal getQuantidade() {
        return quantidade;
    }

    public BigDecimal getPrecoMedioCompraUsd() {
        return precoMedioCompraUsd;
    }

    public String getAnotacoes() {
        return anotacoes;
    }
}`;

export const dtosSnippet = `package com.exemplo.criptoledger.api.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO de ENTRADA: record já nasce imutável.
 * As anotações de Bean Validation são aplicadas pelo @Valid no Controller.
 */
public record PosicaoRequest(

        @NotBlank(message = "O símbolo é obrigatório.")
        @Size(max = 40, message = "O símbolo deve ter no máximo 40 caracteres.")
        @Pattern(regexp = "^[a-z0-9-]+$",
                 message = "Use o id da CoinGecko em minúsculas, ex.: bitcoin.")
        String simbolo,

        @NotNull(message = "A quantidade é obrigatória.")
        @Positive(message = "A quantidade deve ser positiva.")
        @Digits(integer = 10, fraction = 8,
                message = "Quantidade inválida (máx. 10 dígitos, 8 casas).")
        BigDecimal quantidade,

        @NotNull(message = "O preço médio de compra é obrigatório.")
        @Positive(message = "O preço médio deve ser positivo.")
        @Digits(integer = 16, fraction = 2,
                message = "Preço inválido (máx. 16 dígitos, 2 casas).")
        BigDecimal precoMedioCompraUsd,

        @Size(max = 280, message = "Anotações devem ter no máximo 280 caracteres.")
        String anotacoes
) {
}

/** DTO de SAÍDA: o que a API devolve — nunca exponha a entidade JPA. */
public record PosicaoResponse(
        Long id,
        String simbolo,
        BigDecimal quantidade,
        BigDecimal precoMedioCompraUsd,
        String anotacoes,
        Instant criadoEm,
        Instant atualizadoEm
) {
}`;

export const mapperSnippet = `package com.exemplo.criptoledger.api.dto;

import com.exemplo.criptoledger.dominio.Posicao;
import java.util.List;

/**
 * MAPPER dedicado (S de SOLID — Single Responsibility):
 * a conversão Entidade <-> DTO vive em um único lugar.
 * Para projetos grandes, considere MapStruct (mesma ideia, código gerado).
 */
public final class PosicaoMapper {

    private PosicaoMapper() {
        // classe utilitária: não instanciar
    }

    /** DTO de entrada -> entidade nova (via fábrica do domínio). */
    public static Posicao paraEntidade(PosicaoRequest dto) {
        return Posicao.abrir(dto.simbolo(), dto.quantidade(),
                dto.precoMedioCompraUsd(), dto.anotacoes());
    }

    /** Entidade -> DTO de saída. */
    public static PosicaoResponse paraDto(Posicao posicao) {
        return new PosicaoResponse(
                posicao.getId(),
                posicao.getSimbolo(),
                posicao.getQuantidade(),
                posicao.getPrecoMedioCompraUsd(),
                posicao.getAnotacoes(),
                posicao.getCriadoEm(),
                posicao.getAtualizadoEm()
        );
    }

    public static List<PosicaoResponse> paraListaDto(List<Posicao> posicoes) {
        return posicoes.stream().map(PosicaoMapper::paraDto).toList();
    }
}`;

export const propsSnippet = `package com.exemplo.criptoledger.infra.cotacoes;

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

export const webClientConfig = `package com.exemplo.criptoledger.infra.cotacoes;

import io.netty.channel.ChannelOption;
import java.time.Duration;
import java.util.concurrent.TimeoutException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.util.retry.Retry;

import com.exemplo.criptoledger.excecao.LimiteDeRequisicoesException;
import com.exemplo.criptoledger.excecao.RespostaInvalidaDaApiException;
import com.exemplo.criptoledger.excecao.ServicoExternoIndisponivelException;

@Configuration
public class CoinGeckoConfig {

    /**
     * WebClient "de fábrica": base URL, cabeçalhos, timeouts,
     * autenticação (chave de API) e tradução de erros HTTP.
     */
    @Bean
    WebClient coinGeckoWebClient(CoinGeckoProperties props) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3000)
                .responseTimeout(Duration.ofMillis(props.timeoutMs()));

        return WebClient.builder()
                .baseUrl(props.baseUrl())
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .filter(chaveDeApi(props.apiKey()))     // autenticação
                .filter(novaTentativa())                // resiliência: retry
                .defaultStatusHandler(HttpStatusCode::isError, resposta -> {
                    int status = resposta.statusCode().value();
                    return switch (status) {
                        case 429 -> new LimiteDeRequisicoesException(
                                "Limite de requisições da CoinGecko atingido.");
                        case 400, 401, 403, 404 -> new RespostaInvalidaDaApiException(
                                "A CoinGecko rejeitou a requisição (HTTP " + status + ").");
                        default -> new ServicoExternoIndisponivelException(
                                "CoinGecko respondeu HTTP " + status + ".");
                    };
                })
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    /**
     * AUTENTICAÇÃO: injeta a chave Demo no cabeçalho esperado pela CoinGecko.
     * Para APIs com OAuth2, troque este filtro por um que resolve
     * o token (ex.: ServletOAuth2AuthorizedClientExchangeFilterFunction)
     * e use headers.setBearerAuth(token).
     */
    private ExchangeFilterFunction chaveDeApi(String apiKey) {
        return (requisicao, proximo) -> {
            if (apiKey != null && !apiKey.isBlank()) {
                requisicao.headers().set("x-cg-demo-api-key", apiKey);
            }
            return proximo.exchange(requisicao);
        };
    }

    /**
     * RESILIÊNCIA: até 2 novas tentativas com backoff exponencial
     * apenas para erros transitórios (5xx / timeouts).
     * 429 e 4xx seguem direto para o tratamento global.
     */
    private ExchangeFilterFunction novaTentativa() {
        return (requisicao, proximo) -> proximo.exchange(requisicao)
                .retryWhen(Retry.backoff(2, Duration.ofMillis(400))
                        .maxBackoff(Duration.ofSeconds(2))
                        .filter(erro -> erro instanceof ServicoExternoIndisponivelException
                                || erro instanceof TimeoutException));
    }
}`;

export const httpInterface = `package com.exemplo.criptoledger.infra.cotacoes;

import java.math.BigDecimal;
import java.util.Map;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * HTTP INTERFACE (Spring 6.1+): você declara a API externa como uma
 * interface Java e o Spring gera o proxy que chama o WebClient.
 * Chega de montar URIs na mão em cada chamada.
 */
@HttpExchange(accept = "application/json")
public interface CoinGeckoClient {

    /** GET /simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true */
    @GetExchange("/simple/price")
    Map<String, PrecoMoeda> precos(
            @RequestParam("ids") String ids,
            @RequestParam("vs_currencies") String vsCurrencies,
            @RequestParam("include_24hr_change") boolean incluirVariacao24h
    );

    /** Resposta da CoinGecko para UM ativo (ex.: chave "bitcoin"). */
    record PrecoMoeda(
            BigDecimal usd,
            @JsonProperty("usd_24h_change") BigDecimal variacao24h
    ) {
    }
}`;

export const proxyFactory = `package com.exemplo.criptoledger.infra.cotacoes;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.support.WebClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@Configuration
public class CoinGeckoClientConfig {

    /** Transforma a interface acima num Bean invocável. */
    @Bean
    CoinGeckoClient coinGeckoClient(WebClient coinGeckoWebClient) {
        return HttpServiceProxyFactory
                .builderFor(WebClientAdapter.create(coinGeckoWebClient))
                .build()
                .createClient(CoinGeckoClient.class);
    }
}`;

export const excecoes = `package com.exemplo.criptoledger.excecao;

/** Raiz das falhas de integração (POLIMORFISMO no tratamento de erros). */
public class ServicoExternoIndisponivelException extends RuntimeException {
    public ServicoExternoIndisponivelException(String mensagem) {
        super(mensagem);
    }
}

/** HERANÇA de exceção: 429 É um erro de serviço externo, só que especial. */
public class LimiteDeRequisicoesException extends ServicoExternoIndisponivelException {
    public LimiteDeRequisicoesException(String mensagem) {
        super(mensagem);
    }
}

/** A API respondeu, mas rejeitou nossa requisição (4xx). Não adianta retry. */
public class RespostaInvalidaDaApiException extends ServicoExternoIndisponivelException {
    public RespostaInvalidaDaApiException(String mensagem) {
        super(mensagem);
    }
}

/** Recurso local não encontrado -> 404. */
public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String recurso, Object id) {
        super(recurso + " não encontrado(a): " + id);
    }
}

/** Violação de regra de negócio -> 409 Conflict. */
public class RegraDeNegocioException extends RuntimeException {
    public RegraDeNegocioException(String mensagem) {
        super(mensagem);
    }
}`;

export const mercadoService = `package com.exemplo.criptoledger.negocio;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import com.exemplo.criptoledger.excecao.ServicoExternoIndisponivelException;
import com.exemplo.criptoledger.infra.cotacoes.CoinGeckoClient;
import com.exemplo.criptoledger.infra.cotacoes.CoinGeckoClient.PrecoMoeda;

/**
 * Cotação de mercado com RESILIÊNCIA em três camadas:
 *  1) retry com backoff (no WebClient — erros transitórios);
 *  2) cache local (Caffeine, 60s — evita bater na API à toa);
 *  3) fallback para dados "obsoletos" do cache quando a API cai.
 */
@Service
public class MercadoService {

    /** Visão interna de uma cotação (já normalizada para o domínio). */
    public record Cotacao(String simbolo, BigDecimal usd,
                          BigDecimal variacao24h, boolean obsoleta) {

        static List<Cotacao> todasObsoletas(List<Cotacao> originais) {
            return originais.stream()
                    .map(c -> new Cotacao(c.simbolo(), c.usd(), c.variacao24h(), true))
                    .toList();
        }
    }

    private final CoinGeckoClient client;
    private final Cache cache;

    public MercadoService(CoinGeckoClient client, CacheManager cacheManager) {
        this.client = client;
        this.cache = cacheManager.getCache("cotacoes");
    }

    @SuppressWarnings("unchecked")
    public List<Cotacao> cotacoes(List<String> simbolos) {
        String chave = simbolos.stream()
                .map(s -> s.toLowerCase().trim())
                .distinct()
                .sorted()
                .toList()
                .toString();

        List<Cotacao> guardadas = cache.get(chave, List.class);

        try {
            Map<String, PrecoMoeda> resposta = client.precos(
                    String.join(",", simbolos), "usd", true);

            List<Cotacao> frescas = resposta.entrySet().stream()
                    .map(e -> new Cotacao(e.getKey(),
                            e.getValue().usd(),
                            e.getValue().variacao24h(),
                            false))
                    .toList();

            cache.put(chave, frescas);   // abastece o fallback
            return frescas;

        } catch (ServicoExternoIndisponivelException falha) {
            // Fallback: API caiu, mas temos dados recentes -> degradar com dignidade
            if (guardadas != null) {
                return Cotacao.todasObsoletas(guardadas);
            }
            throw falha; // sem cache: deixa o @ControllerAdvice responder 503
        }
    }
}`;

export const repository = `package com.exemplo.criptoledger.repositorio;

import com.exemplo.criptoledger.dominio.Posicao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA: a interface vira implementação em tempo de execução.
 * "findAllByOrderByCriadoEmDesc" é derivado do nome — sem escrever SQL.
 * "criadoEm" vem da superclasse EntidadeAuditavel (a herança paga a conta).
 */
public interface PosicaoRepository extends JpaRepository<Posicao, Long> {

    List<Posicao> findAllByOrderByCriadoEmDesc();

    boolean existsBySimboloIgnoreCase(String simbolo);
}`;

export const service = `package com.exemplo.criptoledger.negocio;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.exemplo.criptoledger.api.dto.PosicaoMapper;
import com.exemplo.criptoledger.api.dto.PosicaoRequest;
import com.exemplo.criptoledger.api.dto.PosicaoResponse;
import com.exemplo.criptoledger.api.dto.ResumoPortfolioResponse;
import com.exemplo.criptoledger.dominio.Posicao;
import com.exemplo.criptoledger.excecao.RecursoNaoEncontradoException;
import com.exemplo.criptoledger.excecao.RegraDeNegocioException;
import com.exemplo.criptoledger.infra.cotacoes.CoinGeckoClient;
import com.exemplo.criptoledger.repositorio.PosicaoRepository;

/**
 * Camada de SERVIÇO: orquestra domínio + repositório + integrações.
 * Controllers jamais falam com o Repository diretamente.
 */
@Service
@Transactional
public class PosicaoService {

    private final PosicaoRepository repository;
    private final MercadoService mercadoService;

    // Injeção por construtor (Spring 5+ dispensa @Autowired):
    // dependências explícitas + classe testável com Mockito.
    public PosicaoService(PosicaoRepository repository, MercadoService mercadoService) {
        this.repository = repository;
        this.mercadoService = mercadoService;
    }

    @Transactional(readOnly = true)
    public List<PosicaoResponse> listar() {
        return PosicaoMapper.paraListaDto(repository.findAllByOrderByCriadoEmDesc());
    }

    @Transactional(readOnly = true)
    public PosicaoResponse buscar(Long id) {
        return PosicaoMapper.paraDto(posicaoOuFalhe(id));
    }

    /** C (do CRUD): abre uma nova posição, barrando símbolo duplicado. */
    public PosicaoResponse abrir(PosicaoRequest request) {
        if (repository.existsBySimboloIgnoreCase(request.simbolo())) {
            throw new RegraDeNegocioException(
                    "Já existe uma posição aberta para o símbolo '"
                            + request.simbolo() + "'. Use PUT para reajustá-la.");
        }
        Posicao nova = PosicaoMapper.paraEntidade(request); // fábrica valida invariantes
        return PosicaoMapper.paraDto(repository.save(nova));
    }

    /** U (do CRUD): reajusta quantidade / preço médio / anotações. */
    public PosicaoResponse reajustar(Long id, PosicaoRequest request) {
        Posicao posicao = posicaoOuFalhe(id);
        posicao.reajustar(request.quantidade(), request.precoMedioCompraUsd(),
                request.anotacoes());
        return PosicaoMapper.paraDto(posicao); // dirty checking: save nem precisa
    }

    /** D (do CRUD): encerra (remove) a posição. */
    public void encerrar(Long id) {
        Posicao posicao = posicaoOuFalhe(id);
        repository.delete(posicao);
    }

    /**
     * O ponto alto do guia: casa as posições locais com cotações externas
     * e devolve o portfólio valorizado — tudo pronto para a tela.
     */
    @Transactional(readOnly = true)
    public ResumoPortfolioResponse resumir() {
        List<Posicao> posicoes = repository.findAllByOrderByCriadoEmDesc();
        if (posicoes.isEmpty()) {
            return ResumoPortfolioResponse.vazio();
        }

        List<String> simbolos = posicoes.stream()
                .map(Posicao::getSimbolo).distinct().toList();

        List<MercadoService.Cotacao> cotacoes = mercadoService.cotacoes(simbolos);
        Map<String, MercadoService.Cotacao> porSimbolo = cotacoes.stream()
                .collect(Collectors.toMap(MercadoService.Cotacao::simbolo,
                        Function.identity()));

        BigDecimal valorTotal = BigDecimal.ZERO;
        BigDecimal custoTotal = BigDecimal.ZERO;
        List<ResumoPortfolioResponse.Item> itens = new ArrayList<>();

        for (Posicao posicao : posicoes) {
            MercadoService.Cotacao cotacao = porSimbolo.get(posicao.getSimbolo());
            if (cotacao == null) {
                continue; // símbolo inválido na CoinGecko: pula, não derruba tudo
            }
            BigDecimal valorAtual = posicao.valorDeMercado(cotacao.usd());
            valorTotal = valorTotal.add(valorAtual);
            custoTotal = custoTotal.add(posicao.custoTotal());

            itens.add(new ResumoPortfolioResponse.Item(
                    PosicaoMapper.paraDto(posicao),
                    cotacao.usd(),
                    cotacao.variacao24h(),
                    valorAtual,
                    posicao.resultadoEm(cotacao.usd())
            ));
        }

        boolean obsoletas = cotacoes.stream()
                .anyMatch(MercadoService.Cotacao::obsoleta);

        return new ResumoPortfolioResponse(valorTotal, custoTotal,
                valorTotal.subtract(custoTotal), itens, Instant.now(), obsoletas);
    }

    private Posicao posicaoOuFalhe(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Posição", id));
    }
}`;

export const resumoDtos = `package com.exemplo.criptoledger.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Visão consolidada do portfólio (posições locais x cotações externas). */
public record ResumoPortfolioResponse(
        BigDecimal valorTotalUsd,
        BigDecimal custoTotalUsd,
        BigDecimal resultadoUsd,
        List<Item> posicoes,
        Instant geradoEm,
        boolean cotacoesObsoletas   // true quando veio do fallback
) {

    public static ResumoPortfolioResponse vazio() {
        return new ResumoPortfolioResponse(BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, List.of(), Instant.now(), false);
    }

    /** Uma posição já multiplicada pela cotação do dia. */
    public record Item(
            PosicaoResponse posicao,
            BigDecimal cotacaoUsd,
            BigDecimal variacao24h,
            BigDecimal valorAtualUsd,
            BigDecimal resultadoUsd
    ) {
    }
}`;

export const controllers = `package com.exemplo.criptoledger.api;

import com.exemplo.criptoledger.api.dto.PosicaoRequest;
import com.exemplo.criptoledger.api.dto.PosicaoResponse;
import com.exemplo.criptoledger.api.dto.ResumoPortfolioResponse;
import com.exemplo.criptoledger.negocio.PosicaoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Camada de API: fina de propósito.
 * Recebe -> valida (@Valid) -> delega ao Service -> devolve status correto.
 */
@RestController
@RequestMapping("/api/v1/posicoes")
public class PosicaoController {

    private final PosicaoService service;

    public PosicaoController(PosicaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<PosicaoResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public PosicaoResponse buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    public ResponseEntity<PosicaoResponse> abrir(@Valid @RequestBody PosicaoRequest request) {
        PosicaoResponse criada = service.abrir(request);

        // 201 Created + header Location apontando para o novo recurso
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(criada.id()).toUri();
        return ResponseEntity.created(location).body(criada);
    }

    @PutMapping("/{id}")
    public PosicaoResponse reajustar(@PathVariable Long id,
                                     @Valid @RequestBody PosicaoRequest request) {
        return service.reajustar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> encerrar(@PathVariable Long id) {
        service.encerrar(id);
        return ResponseEntity.noContent().build();   // 204, sem corpo
    }

    /** Posições locais x cotações da CoinGecko = portfólio valorizado. */
    @GetMapping("/resumo")
    public ResumoPortfolioResponse resumir() {
        return service.resumir();
    }
}`;

export const cotacaoController = `package com.exemplo.criptoledger.api;

import com.exemplo.criptoledger.negocio.MercadoService;
import com.exemplo.criptoledger.negocio.MercadoService.Cotacao;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Endpoint "puro" da API externa — ótimo para testar a integração isolada. */
@RestController
@RequestMapping("/api/v1/cotacoes")
public class CotacaoController {

    private final MercadoService mercadoService;

    public CotacaoController(MercadoService mercadoService) {
        this.mercadoService = mercadoService;
    }

    /** Ex.: GET /api/v1/cotacoes?symbols=bitcoin,ethereum,solana */
    @GetMapping
    public List<Cotacao> cotacoes(
            @RequestParam(name = "symbols",
                          defaultValue = "bitcoin,ethereum") String symbols) {
        List<String> ids = List.of(symbols.toLowerCase().split(","));
        return mercadoService.cotacoes(ids);
    }
}`;

export const globalHandler = `package com.exemplo.criptoledger.api;

import com.exemplo.criptoledger.excecao.LimiteDeRequisicoesException;
import com.exemplo.criptoledger.excecao.RecursoNaoEncontradoException;
import com.exemplo.criptoledger.excecao.RegraDeNegocioException;
import com.exemplo.criptoledger.excecao.RespostaInvalidaDaApiException;
import com.exemplo.criptoledger.excecao.ServicoExternoIndisponivelException;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * TRATAMENTO GLOBAL DE EXCEÇÕES.
 * Toda exceção vira um RFC 7807 (Problem Details): a máquina entende
 * "type/title/status/detail/instance" e o humano entende o resto.
 * Herdar ResponseEntityExceptionHandler já resolve os 404 de rota,
 * 405, 406, 415 etc. no mesmo formato.
 */
@RestControllerAdvice
public class TratamentoGlobalDeErros extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(TratamentoGlobalDeErros.class);

    /** 404 de RECURSO (não de rota): posição inexistente etc. */
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ProblemDetail naoEncontrado(RecursoNaoEncontradoException ex, WebRequest request) {
        return problem(HttpStatus.NOT_FOUND,
                "https://criptoledger.example/erros/recurso-nao-encontrado",
                "Recurso não encontrado", ex.getMessage(), request);
    }

    /** 409: violação de regra de negócio (símbolo duplicado etc.). */
    @ExceptionHandler(RegraDeNegocioException.class)
    public ProblemDetail regraDeNegocio(RegraDeNegocioException ex, WebRequest request) {
        return problem(HttpStatus.CONFLICT,
                "https://criptoledger.example/erros/regra-de-negocio",
                "Regra de negócio violada", ex.getMessage(), request);
    }

    /** 400 do Bean Validation: lista campo a campo o que falhou. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail validacao(MethodArgumentNotValidException ex, WebRequest request) {
        ProblemDetail body = problem(HttpStatus.BAD_REQUEST,
                "https://criptoledger.example/erros/dados-invalidos",
                "Dados de entrada inválidos",
                "Um ou mais campos não passaram na validação.", request);

        List<Map<String, String>> violacoes = ex.getBindingResult().getFieldErrors().stream()
                .map(erro -> Map.of(
                        "campo", erro.getField(),
                        "mensagem", erro.getDefaultMessage() == null
                                ? "valor inválido" : erro.getDefaultMessage()))
                .toList();

        body.setProperty("violacoes", violacoes);   // propriedade extra do RFC 7807
        return body;
    }

    /** 429: limite da API externa — devolvemos Retry-After para o cliente esperar. */
    @ExceptionHandler(LimiteDeRequisicoesException.class)
    public ResponseEntity<ProblemDetail> limiteDeRequisicoes(LimiteDeRequisicoesException ex,
                                                             WebRequest request) {
        ProblemDetail body = problem(HttpStatus.TOO_MANY_REQUESTS,
                "https://criptoledger.example/erros/limite-de-requisicoes",
                "Muitas requisições", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, "60")
                .body(body);
    }

    /** 4xx vindos da API externa: repassamos a mensagem, sem retry. */
    @ExceptionHandler(RespostaInvalidaDaApiException.class)
    public ProblemDetail respostaDaApi(RespostaInvalidaDaApiException ex, WebRequest request) {
        return problem(HttpStatus.BAD_GATEWAY,
                "https://criptoledger.example/erros/api-externa",
                "Falha na API externa", ex.getMessage(), request);
    }

    /** 503: API externa fora do ar E sem cache disponível. */
    @ExceptionHandler(ServicoExternoIndisponivelException.class)
    public ProblemDetail servicoExterno(ServicoExternoIndisponivelException ex,
                                        WebRequest request) {
        return problem(HttpStatus.SERVICE_UNAVAILABLE,
                "https://criptoledger.example/erros/servico-indisponivel",
                "Serviço externo indisponível",
                ex.getMessage() + " Tente novamente em instantes.", request);
    }

    /**
     * Rede de segurança: log com stack trace interno, resposta genérica externa.
     * JAMAIS vaze detalhes de implementação para o cliente.
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail inesperado(Exception ex, WebRequest request) {
        log.error("Erro não tratado", ex);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR,
                "https://criptoledger.example/erros/erro-interno",
                "Erro interno",
                "Algo deu errado do nosso lado. Nossa equipe já foi notificada.", request);
    }

    /** Monta o esqueleto ProblemDetail padrão da casa. */
    private ProblemDetail problem(HttpStatus status, String type,
                                  String title, String detail, WebRequest request) {
        ProblemDetail body = ProblemDetail.forStatusAndDetail(status, detail);
        body.setType(URI.create(type));
        body.setTitle(title);
        body.setInstance(URI.create(request.getDescription(false)
                .replaceFirst("^uri=", "")));
        body.setProperty("timestamp", Instant.now().toString());
        return body;
    }
}`;

export const curlCrud = `# 1) Criar uma posição (repare no Location do header da resposta)
curl -i -X POST http://localhost:8080/api/v1/posicoes \\
  -H "Content-Type: application/json" \\
  -d '{
        "simbolo": "bitcoin",
        "quantidade": 0.25,
        "precoMedioCompraUsd": 41500.00,
        "anotacoes": "Aporte mensal"
      }'

# 2) Validação em ação: símbolo em maiúsculas gera 400 + violações (RFC 7807)
curl -X POST http://localhost:8080/api/v1/posicoes \\
  -H "Content-Type: application/json" \\
  -d '{ "simbolo": "BITCOIN", "quantidade": -1, "precoMedioCompraUsd": 10 }'

# 3) Mais uma posicao e o resumo valorizado (posicoes x CoinGecko)
curl -X POST http://localhost:8080/api/v1/posicoes \\
  -H "Content-Type: application/json" \\
  -d '{ "simbolo": "solana", "quantidade": 12, "precoMedioCompraUsd": 98.40 }'

curl -s http://localhost:8080/api/v1/posicoes/resumo | jq

# 4) Listar / atualizar / remover
curl -s http://localhost:8080/api/v1/posicoes | jq
curl -X PUT http://localhost:8080/api/v1/posicoes/1 \\
  -H "Content-Type: application/json" \\
  -d '{ "simbolo": "bitcoin", "quantidade": 0.30, "precoMedioCompraUsd": 43120.00 }'
curl -i -X DELETE http://localhost:8080/api/v1/posicoes/2   # 204 No Content`;

export const problemExample = `{
  "type": "https://criptoledger.example/erros/dados-invalidos",
  "title": "Dados de entrada inválidos",
  "status": 400,
  "detail": "Um ou mais campos não passaram na validação.",
  "instance": "/api/v1/posicoes",
  "timestamp": "2026-02-11T14:32:07.882Z",
  "violacoes": [
    { "campo": "simbolo", "mensagem": "Use o id da CoinGecko em minúsculas, ex.: bitcoin." },
    { "campo": "quantidade", "mensagem": "A quantidade deve ser positiva." }
  ]
}`;

export const serviceTest = `package com.exemplo.criptoledger.negocio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.exemplo.criptoledger.api.dto.PosicaoRequest;
import com.exemplo.criptoledger.api.dto.PosicaoResponse;
import com.exemplo.criptoledger.dominio.Posicao;
import com.exemplo.criptoledger.excecao.RecursoNaoEncontradoException;
import com.exemplo.criptoledger.excecao.RegraDeNegocioException;
import com.exemplo.criptoledger.repositorio.PosicaoRepository;

/**
 * Teste UNITÁRIO de verdade: sem Spring, sem banco.
 * Mockito isola o repositório e o serviço de mercado;
 * AssertJ deixa as asserções legíveis.
 */
@ExtendWith(MockitoExtension.class)
class PosicaoServiceTest {

    @Mock
    private PosicaoRepository repository;

    @Mock
    private MercadoService mercadoService;

    @InjectMocks
    private PosicaoService service;

    private PosicaoRequest requestValida() {
        return new PosicaoRequest("bitcoin",
                new BigDecimal("0.25"), new BigDecimal("41500.00"), "aporte mensal");
    }

    @Test
    @DisplayName("abrir() deve persistir a posição criada pela fábrica do domínio")
    void abrirDevePersistirPosicao() {
        given(repository.existsBySimboloIgnoreCase("bitcoin")).willReturn(false);
        given(repository.save(any(Posicao.class)))
                .willAnswer(invocacao -> invocacao.getArgument(0)); // devolve o que recebeu

        PosicaoResponse resposta = service.abrir(requestValida());

        // AssertJ: leitura em linguagem quase natural
        assertThat(resposta.simbolo()).isEqualTo("bitcoin");
        assertThat(resposta.quantidade()).isEqualByComparingTo("0.25");

        // ArgumentCaptor: inspeciona EXATAMENTE o que chegou ao repositório
        ArgumentCaptor<Posicao> captor = ArgumentCaptor.forClass(Posicao.class);
        verify(repository).save(captor.capture());

        Posicao salva = captor.getValue();
        assertThat(salva.getSimbolo()).isEqualTo("bitcoin");
        assertThat(salva.getPrecoMedioCompraUsd()).isEqualByComparingTo("41500.00");
    }

    @Test
    @DisplayName("abrir() com símbolo duplicado deve lançar 409 e NÃO salvar")
    void abrirComSimboloDuplicadoDeveLancarConflito() {
        given(repository.existsBySimboloIgnoreCase("bitcoin")).willReturn(true);

        assertThatThrownBy(() -> service.abrir(requestValida()))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("Já existe uma posição");

        verify(repository, never()).save(any());   // garante o efeito colateral zero
    }

    @Test
    @DisplayName("buscar() com id inexistente deve lançar RecursoNaoEncontradoException")
    void buscarInexistenteDeveLancarNaoEncontrado() {
        given(repository.findById(99L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscar(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("99");
    }
}`;

export const mercadoTest = `package com.exemplo.criptoledger.negocio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;

import com.exemplo.criptoledger.excecao.ServicoExternoIndisponivelException;
import com.exemplo.criptoledger.infra.cotacoes.CacheConfig;
import com.exemplo.criptoledger.infra.cotacoes.CoinGeckoClient;
import com.exemplo.criptoledger.infra.cotacoes.CoinGeckoClient.PrecoMoeda;

/**
 * Prova o contrato de RESILIÊNCIA: se a CoinGecko cair,
 * o último valor em cache volta marcado como "obsoleto".
 * Usamos o CacheManager REAL (Caffeine) — cache é o coração do teste.
 */
@ExtendWith(MockitoExtension.class)
class MercadoServiceTest {

    @Mock
    private CoinGeckoClient client;

    private MercadoService service;

    @BeforeEach
    void preparar() {
        CacheManager cacheManager = new CacheConfig().cacheManager();
        service = new MercadoService(client, cacheManager);
    }

    @Test
    @DisplayName("API fora do ar deve devolver cotações do cache marcadas como obsoletas")
    void quedaDaApiDeveAcionarFallback() {
        // 1ª chamada: API responde e abastece o cache
        given(client.precos("bitcoin", "usd", true)).willReturn(Map.of(
                "bitcoin", new PrecoMoeda(new BigDecimal("104200.00"), new BigDecimal("2.4"))));

        List<MercadoService.Cotacao> frescas = service.cotacoes(List.of("bitcoin"));
        assertThat(frescas).first()
                .extracting(MercadoService.Cotacao::obsoleta).isEqualTo(false);

        // 2ª chamada: API caiu -> fallback devolve o cache, marcado como obsoleto
        given(client.precos("bitcoin", "usd", true"))
                .willThrow(new ServicoExternoIndisponivelException("HTTP 500"));

        List<MercadoService.Cotacao> degradadas = service.cotacoes(List.of("bitcoin"));

        assertThat(degradadas).hasSize(1);
        assertThat(degradadas.get(0).usd()).isEqualByComparingTo("104200.00");
        assertThat(degradadas.get(0).obsoleta()).isTrue();   // o cliente sabe que é fallback
    }
}`;

export const cacheConfig = `package com.exemplo.criptoledger.infra.cotacoes;

import com.github.benmanes.caffeine.Caffeine;
import java.time.Duration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    /** Cache local de cotações: expira em 60s e guarda no máximo 200 chaves. */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("cotacoes");
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(60))
                .maximumSize(200));
        return manager;
    }
}`;

export const enableProps = `package com.exemplo.criptoledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan   // registra o record CoinGeckoProperties automaticamente
public class CriptoLedgerApplication {

    public static void main(String[] args) {
        SpringApplication.run(CriptoLedgerApplication.class, args);
    }
}`;

export const dockerfile = `# ===== Estágio 1: BUILD =====
# Imagem com JDK 21 + Maven: compila o fat-jar do Spring Boot
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copia só o pom primeiro para cachear o download das dependências
# (muda código não baixa tudo de novo — build muito mais rápido)
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ===== Estágio 2: RUNTIME =====
# Apenas JRE: imagem menor, superfície de ataque menor
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# O Render/Railway injeta a porta via variável PORT
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=\${PORT:8080} -jar app.jar"]`;

export const dockerIgnore = `# .dockerignore — não mande lixo para o contexto do build
target/
.idea/
*.iml
.git/
.mvn/wrapper/maven-wrapper.jar
Dockerfile
docker-compose.yml
README.md`;

export const dockerRun = `# 1) Build da imagem (o ponto final é obrigatório)
docker build -t cripto-ledger .

# 2) Rodar localmente com perfil de produção apontando para o Postgres do compose
docker run --rm -p 8080:8080 \\
  --network host \\
  -e SPRING_PROFILES_ACTIVE=prod \\
  -e DATABASE_URL=jdbc:postgresql://localhost:5432/criptoledger \\
  -e DATABASE_USER=dev \\
  -e DATABASE_PASSWORD=dev123 \\
  -e COINGECKO_API_KEY=sua-chave-demo \\
  cripto-ledger

# 3) Teste o health check
curl http://localhost:8080/actuator/health`;

export const renderYaml = `# render.yaml — Infra as Code: o Render lê este arquivo na raiz do repositório
services:
  - type: web
    name: cripto-ledger-api
    runtime: docker            # usa o nosso Dockerfile multi-stage
    plan: free
    healthCheckPath: /actuator/health
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: prod
      - key: COINGECKO_API_KEY
        sync: false            # você preenche no painel (segredo)
      - key: DATABASE_URL
        fromDatabase:
          name: cripto-ledger-db
          property: connectionString
      - key: DATABASE_USER
        fromDatabase:
          name: cripto-ledger-db
          property: user
      - key: DATABASE_PASSWORD
        fromDatabase:
          name: cripto-ledger-db
          property: password

databases:
  - name: cripto-ledger-db
    plan: free
    postgresMajorVersion: "16"`;

export const mainClassNote = `// src/main/java/com/exemplo/criptoledger/CriptoLedgerApplication.java
// Gerada pelo Initializr — o @ConfigurationPropertiesScan é o único acréscimo:`;
