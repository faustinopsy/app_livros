# Capítulo 19 — Guardando dados no navegador: armazenamentos, cache e estratégias

No Capítulo 18 fizemos um panorama dos próximos passos. Agora vamos **colocar a
mão na massa** no primeiro deles — e talvez o de melhor custo-benefício de todo o
projeto. Nosso App Livros sofre de uma "amnésia": toda vez que você entra na tela
de livros ou de personagens, ele vai **de novo** à internet buscar exatamente os
mesmos dados. Feche a aba, reabra, e todo o trabalho é refeito do zero.

Neste capítulo vamos curar essa amnésia conhecendo **todos os armazenamentos do
navegador**, construindo um **cache de verdade** sobre a camada de serviços — com
dois padrões de projeto clássicos, o **Decorator/Proxy** e o **Strategy** — e
aprendendo o vocabulário de **estratégias de cache** que o mercado usa todos os
dias.

> 💡 **Nos bastidores — onde este capítulo se encaixa**
> Esta é a sequência natural depois do consumo de API (Caps. 15 a 17). A ordem
> completa da nossa jornada de dados é: **buscar da API → guardar/cachear
> localmente (este capítulo) → funcionar offline com Service Workers (próximo
> capítulo)**. Cada peça se apoia na anterior.

---

## 19.1 O problema, medido com os próprios olhos

Antes de resolver, vamos **enxergar** o desperdício. Abra o App Livros, entre na
tela de personagens e abra as DevTools (`F12`) na aba **Network** (Rede). Navegue
para a página 2, volte para a 1, vá para a 3, volte para a 1 de novo.

Cada ida e volta dispara uma **nova requisição** — inclusive para páginas que
você **já tinha visto**. A página 1 foi baixada da internet duas, três vezes,
sempre com o mesmo conteúdo. Isso é desperdício em três frentes:

- **Tempo** — o usuário espera o "Carregando..." de novo a cada visita.
- **Dados** — em uma rede móvel, cada requisição consome o pacote de internet do
  usuário.
- **Servidor** — cada chamada ocupa recursos de quem hospeda a API (que muitas
  vezes tem limites de uso).

A pergunta que guia este capítulo é: *por que buscar de novo algo que já temos?*

### Cache está em todo lugar (você usa o dia inteiro)

A resposta a essa pergunta tem nome — **cache**: uma **cópia local** de um dado
que custa caro buscar na origem. Antes do código, repare como a indústria inteira
funciona sobre camadas de cache:

- O **navegador** guarda imagens, CSS e scripts dos sites que você visita — por
  isso a segunda visita é sempre mais rápida que a primeira.
- O **Instagram** e o **X** mostram o feed antigo na hora quando você abre o app
  sem internet, e atualizam quando a conexão volta. Aquele feed é um cache.
- O **Spotify** guarda as músicas baixadas para tocar sem rede.
- A **Netflix** instala servidores de cache dentro dos provedores de internet (as
  famosas **CDNs**) para o filme sair de perto de você, e não do outro lado do
  planeta.
- O seu **processador** tem memórias de cache (L1, L2, L3), porque ir até a RAM é
  lento demais para ele.
- O **DNS**, que traduz `google.com` em endereço IP, é cacheado pelo sistema
  operacional para não perguntar de novo a cada clique.

Estudos famosos da Amazon e do Google associam **cada 100 ms a mais de espera** a
quedas mensuráveis de vendas e engajamento. Velocidade é funcionalidade — e cache
é a forma mais barata de comprá-la.

> "Existem apenas duas coisas difíceis na computação: invalidação de cache e dar
> nomes às coisas." — Phil Karlton

Vamos encontrar as duas neste capítulo.

---

## 19.2 O tour completo: os cinco armazenamentos do navegador

Para ter cache no front-end, precisamos de um lugar para guardar as cópias. O
navegador oferece **cinco opções**, cada uma com sua vocação. Conhecer as cinco é
o que permite escolher bem.

### Cookies — o veterano

Guardam textos minúsculos (~4 KB) e têm uma característica única: são **enviados
automaticamente ao servidor** em toda requisição àquele domínio. Por isso servem
para **identificação de sessão** (o servidor reconhece que você é você) — e por
isso mesmo **não** servem para cache: inflariam cada requisição com dados que o
servidor não pediu.

```js
document.cookie = "tema=noite; max-age=31536000";
```

### `localStorage` — o armário permanente

Chave → valor, ~5 a 10 MB por site, **persiste para sempre** (mesmo fechando o
navegador), até alguém apagar. Quatro métodos e você domina o essencial:

```js
localStorage.setItem("tema", "noite");  // guardar
localStorage.getItem("tema");           // ler (null se não existir)
localStorage.removeItem("tema");        // remover uma chave
localStorage.clear();                   // apagar tudo do site
```

### `sessionStorage` — o bolso do passeio

**Mesma API** do `localStorage`, mas os dados **morrem quando a aba fecha**.
Pense no `localStorage` como um armário em casa e no `sessionStorage` como o
bolso durante um passeio: esvazia quando o passeio acaba. Ideal para rascunhos de
formulário e estado temporário (voltaremos a ele na seção 19.9).

### IndexedDB — o banco de dados local

Um banco de dados **de verdade** dentro do navegador: guarda objetos sem
conversão para texto, aceita **centenas de MB**, tem índices de busca e
transações, e toda a API é assíncrona. É o que aplicações grandes (Google Docs,
por exemplo) usam para trabalhar offline com muitos dados. O custo é uma API
verbosa — para o nosso volume, o `localStorage` resolve. Fica registrado como o
próximo degrau quando o cache crescer.

### Cache API — feita para a rede

Em vez de chave → texto, ela guarda **pares de requisição e resposta HTTP
completas** — como um mini servidor dentro do navegador:

```js
const cache = await caches.open("app-livros-v1");
await cache.add("https://rickandmortyapi.com/api/character/?page=1");
const resposta = await caches.match("https://rickandmortyapi.com/api/character/?page=1");
```

É a parceira natural dos **Service Workers**, estrelas do próximo capítulo.

### Tabela de decisão

| Armazenamento      | Capacidade      | Vive até...           | Vocação                                          |
|--------------------|-----------------|------------------------|--------------------------------------------------|
| **Cookies**        | ~4 KB           | a expiração definida   | sessão e identificação junto ao servidor         |
| **`localStorage`** | ~5–10 MB        | ser apagado            | preferências e cache simples de dados            |
| **`sessionStorage`** | ~5 MB         | a aba fechar           | rascunhos e estado temporário                    |
| **IndexedDB**      | centenas de MB  | ser apagado            | grandes volumes estruturados, offline pesado     |
| **Cache API**      | grande (cota)   | ser apagado            | respostas HTTP completas, Service Workers        |

> ⚠️ **Cuidado — o que NÃO guardar**
> Qualquer script da página consegue ler esses armazenamentos. Nunca guarde dados
> **sensíveis** (senhas, tokens de acesso, dados de cartão) neles. Cache é para
> dados públicos e preferências — não para segredos.

> 💡 **Nos bastidores — quanto cabe e onde vejo?**
> Você pode inspecionar tudo o que está guardado nas DevTools: aba
> **Application** (ou *Armazenamento*) → *Local Storage* / *Session Storage* /
> *IndexedDB* / *Cache Storage*. Deixe essa aba aberta durante o capítulo inteiro.

---

## 19.3 O detalhe que pega todo mundo: só texto

Há uma regra de ouro no Web Storage:

> O Web Storage guarda **apenas strings (texto)**. Nada de objetos ou arrays
> diretamente.

Se você tentar guardar um objeto, ele vira o texto inútil `"[object Object]"`:

```js
const livro = { id: 1, titulo: "Dom Casmurro" };
localStorage.setItem("livro", livro);
localStorage.getItem("livro"); // "[object Object]"  ❌ perdeu tudo!
```

A solução é converter para o formato **JSON** — o mesmo formato de troca de dados
que já vimos no `fetch` (Cap. 13). Duas funções fazem a ponte:

- **`JSON.stringify(objeto)`** — transforma um objeto/array em **texto** JSON
  (para **salvar**).
- **`JSON.parse(texto)`** — transforma o texto JSON de volta em **objeto** (para
  **ler**).

```js
const livro = { id: 1, titulo: "Dom Casmurro" };

localStorage.setItem("livro", JSON.stringify(livro));    // objeto → texto
const salvo = JSON.parse(localStorage.getItem("livro")); // texto → objeto
console.log(salvo.titulo); // "Dom Casmurro"  ✅
```

> 🧩 **Montando o quebra-cabeça**
> Repare na simetria com o Capítulo 13: lá, `resposta.json()` convertia o **texto
> JSON vindo da internet** em objeto. Aqui, `JSON.parse`/`JSON.stringify` fazem a
> mesma conversão nas **duas direções**, agora para guardar localmente. É o mesmo
> formato JSON, o mesmo conceito — você já conhecia metade disso.

---

## 19.4 Primeira vitória: lembrar o tema escolhido

Vamos a um uso simples e direto antes do cache de rede. No Capítulo 11 criamos
temas (dia, tarde, noite) trocáveis via `data-theme`. O problema: ao recarregar a
página, o tema volta ao padrão. Com `localStorage`, fazemos a escolha
**persistir**.

```js
// aplicar e guardar o tema escolhido
function escolherTema(tema) {
  document.documentElement.setAttribute("data-theme", tema); // Cap. 5 e 11
  localStorage.setItem("tema", tema);                        // lembra a escolha
}

// ao iniciar a aplicação, restaura o tema salvo (se houver)
function restaurarTema() {
  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo) {
    document.documentElement.setAttribute("data-theme", temaSalvo);
  }
}
```

Bastaria chamar `restaurarTema()` dentro da função `iniciar()` do `main.js`
(Cap. 10), e o App Livros passaria a respeitar a preferência do usuário entre
visitas. Simples, e já uma melhora real de experiência.

---

## 19.5 O padrão Strategy: estratégias de armazenamento intercambiáveis

Agora rumo ao prêmio principal — o cache de requisições. Antes de escrevê-lo, uma
decisão de projeto: **onde** guardar as cópias? Em memória (um `Map` — rápido,
mas morre no F5)? No `localStorage` (sobrevive ao F5)? Amanhã, no IndexedDB?

Em vez de amarrar o cache a uma resposta, o projeto define um **contrato**:
qualquer armazenamento serve, desde que saiba responder `has`, `get` e `set`.
Cada implementação desse contrato é uma **estratégia**. É o arquivo real
`src/js/components/services/storageStrategy.js` do repositório:

```js
// services/storageStrategy.js
const Memoria = {
    _cache: new Map(),

    has(key) {
        return this._cache.has(key);
    },
    get(key) {
        return this._cache.get(key);
    },
    set(key, value) {
        this._cache.set(key, value);
    }
};

const LocalStorage = {
    has(key) {
        return localStorage.getItem(key) !== null;
    },
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export { Memoria, LocalStorage };
```

Duas observações de mestre de obras:

- A estratégia `LocalStorage` **esconde dentro de si** o `JSON.stringify` /
  `JSON.parse` da seção 19.3. Quem a usa entrega e recebe **objetos prontos**,
  sem saber que por baixo só existe texto.
- As duas estratégias têm **exatamente os mesmos métodos**. Trocar de uma para a
  outra é trocar **uma palavra** — como você verá na próxima seção.

Isso é um padrão de projeto clássico chamado **Strategy**: uma família de
algoritmos intercambiáveis atrás de uma mesma interface.

> 🧩 **Montando o quebra-cabeça**
> É o mesmo espírito do contrato das nossas páginas (`url`, `label`, `pagina`,
> Cap. 9): quem cumpre o contrato entra no jogo sem que o resto do código mude.
> Contratos uniformes são o segredo recorrente de toda a arquitetura do curso.

---

## 19.6 O Decorator/Proxy: um cache que envolve a busca

Agora a peça central. O arquivo real `services/apiCache.js` cria uma função que
**envolve** a função genérica da camada de serviços, adicionando o comportamento
de cache **por fora**, sem alterar uma linha dela:

```js
// services/apiCache.js
import buscarServicos from "./api.js";
import { Memoria, LocalStorage } from "./storageStrategy.js";

const storage = LocalStorage;

async function buscarComCache(url, dados = '', forma = '') {
    const formataURL = `${url}${dados}${forma}`;
    if (storage.has(formataURL)) {
        console.time(`[CACHE] Tempo para: ${dados || 'página inicial'}`);
        const resultadoEmCache = storage.get(formataURL);
        console.timeEnd(`[CACHE] Tempo para: ${dados || 'página inicial'}`);
        return resultadoEmCache;
    }
    console.time(`[SERVIDOR] Tempo para: ${dados || 'página inicial'}`);
    try {
        const resultadoServidor = await buscarServicos(url, dados, forma);
        storage.set(formataURL, resultadoServidor);
        console.timeEnd(`[SERVIDOR] Tempo para: ${dados || 'página inicial'}`);
        return resultadoServidor;
    } catch (error) {
        console.timeEnd(`[SERVIDOR] Tempo para: ${dados || 'página inicial'}`);
        console.error("Erro na busca:", error);
        throw error;
    }
}

export default buscarComCache;
```

> 💡 **Nos bastidores — `buscarServicos`?**
> No repositório, a função genérica da camada de serviços chama-se
> `buscarServicos(url, dados, forma)` — ela monta a URL em três partes (base,
> dado variável, sufixo) e serve qualquer API. É a mesma personagem que chamamos
> de `buscarDados` nos Capítulos 14 a 17; mudou o nome, não o papel.

Vamos apreciar as decisões, uma a uma:

- **A URL completa é a chave do cache.** Genial na simplicidade:
  `...character/?page=1` e `...character/?page=2` têm entradas separadas e
  independentes, automaticamente.
- **Cache primeiro** (`if (storage.has(...))`). Se a estratégia tem a chave,
  devolvemos a cópia local e a rede **nem é acordada**.
- **A estratégia é plugável.** A linha `const storage = LocalStorage` é o
  interruptor: troque por `Memoria` e toda a persistência muda — sem tocar em
  mais nada. O Strategy da seção anterior em ação.
- **A prova está no cronômetro.** `console.time`/`console.timeEnd` medem e
  imprimem o tempo de cada caminho. Navegue com o console aberto: a busca no
  servidor leva **dezenas ou centenas de milissegundos**; a resposta do cache,
  **frações de milissegundo**. Não acredite em mim — leia os seus números.

Esse desenho — uma função que envolve outra **preservando a mesma assinatura** e
adicionando comportamento — é o padrão **Decorator** (e, quando a intenção é
controlar o acesso ao original, **Proxy**). O detalhe que sustenta tudo:
`buscarComCache(url, dados, forma)` recebe **os mesmos parâmetros** de
`buscarServicos(url, dados, forma)`. Assinaturas iguais tornam as duas
**intercambiáveis**.

### A troca de uma linha

E aqui a camada de serviços paga todos os seus dividendos. Para a tela de
cadastro (Cap. 15) e a página de personagens (Cap. 17) ganharem cache, a mudança
foi **somente o import**:

```js
// antes:
// import buscarServicos from "../services/api.js"

// depois:
import buscarServicos from "../services/apiCache.js"
```

Nada mais mudou nas páginas — o decorator responde pelo original sem que ninguém
perceba a troca. **Refaça o teste da seção 19.1**: página 1, página 2, volta
para a 1. A aba Network fica **quieta** na revisita e o console imprime o tempo
do caminho `[CACHE]`.

> 🧩 **Montando o quebra-cabeça**
> Porque **toda** requisição do projeto passa por um ponto único (Cap. 14),
> adotar cache custou **uma linha por página**. Se o `fetch` estivesse espalhado
> pelos componentes, teríamos que caçar e alterar dezenas de lugares. **Boas
> decisões de estrutura tornam melhorias futuras baratas** — essa lição vale
> mais que o próprio cache.

---

## 19.7 O problema do cache eterno: dados que envelhecem

Nosso cache tem uma falha: ele é **eterno**. Uma vez guardado, o dado nunca é
atualizado. Se a API mudar, continuaríamos mostrando a cópia antiga para sempre —
eis a **invalidação de cache** da frase do Karlton.

A técnica mais comum é dar ao cache uma **validade** (o **TTL**, *time to live*):
guardar, junto com os dados, o **momento** em que foram salvos, e conferir a
idade na leitura. E repare **onde** a mudança mora na nossa arquitetura: dentro
da **estratégia**, não no decorator — o `apiCache.js` continua intocado:

```js
// evolução da estratégia LocalStorage com validade de 10 minutos
const VALIDADE_MS = 10 * 60 * 1000;

const LocalStorage = {
    has(key) {
        return this.get(key) !== null; // reusa o get, que já checa validade
    },
    get(key) {
        const bruto = localStorage.getItem(key);
        if (!bruto) return null;
        const { dados, salvoEm } = JSON.parse(bruto);
        if (Date.now() - salvoEm > VALIDADE_MS) return null; // expirou!
        return dados;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify({ dados: value, salvoEm: Date.now() }));
    }
};
```

- Guardamos **`{ dados, salvoEm }`** em vez dos dados crus; `Date.now()` é o
  carimbo de tempo (milissegundos desde 1970).
- Na leitura, calculamos a idade e devolvemos `null` para cache vencido — o
  decorator então busca de novo e regrava com carimbo novo, sem saber de nada.

Agora temos **velocidade** (dados recentes vêm do cache) e **frescor** (dados
velhos são renovados). Ajustar `VALIDADE_MS` é ajustar o compromisso: catálogo de
livros clássicos pode ter validade longa; cotações e estoque pedem validade
curta.

---

## 19.8 As estratégias de cache clássicas (o vocabulário do mercado)

O que implementamos tem nome na indústria: **cache first** — olhe o cache antes,
rede só na falta. Existe um vocabulário completo, e cada estratégia resolve um
compromisso diferente entre **velocidade** e **frescor**:

| Estratégia                  | Como age                                                        | Ideal para                          |
|-----------------------------|------------------------------------------------------------------|-------------------------------------|
| **Cache first**             | responde do cache; rede apenas se não houver cópia               | dados que mudam pouco (a nossa!)    |
| **Network first**           | tenta a rede; se falhar, cai para o cache                        | dados que precisam estar frescos, com plano B offline |
| **Stale-while-revalidate**  | responde o cache **na hora** e atualiza em segundo plano         | feeds e notícias — ninguém espera   |
| **Network only / Cache only** | os extremos, sem fallback                                      | casos especiais                     |

Você acabou de construir a primeira **à mão** — e por isso as outras três são
variações que você já sabe ler: mude a ordem do `if`, adicione um `catch` que
consulta a estratégia, dispare a revalidação sem `await`.

> 💡 **Nos bastidores — onde esses nomes brilham**
> Esses mesmos nomes são o **coração dos Service Workers** (próximo capítulo):
> um script que intercepta **todas** as requisições do site — HTML, CSS, imagens,
> scripts, não só as chamadas de API — e aplica uma dessas estratégias a cada
> uma, usando a **Cache API** da seção 19.2. É o que permite o feito máximo: o
> App Livros **abrir sem internet nenhuma**. A base conceitual você acabou de
> construir; o Capítulo 20 é a promoção dela para o app inteiro.

---

## 19.9 `sessionStorage` na prática: rascunho de formulário

Nem todo dado deve viver para sempre. Um formulário em preenchimento é o cenário
perfeito para o **`sessionStorage`**: se a pessoa troca de página por engano e
volta, o texto continua lá; fechou a aba, o rascunho morre junto.

```js
// salvar o rascunho enquanto digita
const campoMensagem = document.getElementById("mensagem");
campoMensagem.addEventListener("input", (event) => {
  sessionStorage.setItem("rascunho-mensagem", event.target.value);
});

// ao montar a página, restaurar o rascunho (se houver)
const rascunho = sessionStorage.getItem("rascunho-mensagem");
if (rascunho) {
  campoMensagem.value = rascunho;
}

// ao enviar com sucesso, limpar o rascunho
sessionStorage.removeItem("rascunho-mensagem");
```

A escolha entre `localStorage` e `sessionStorage` é, no fundo, uma pergunta de
design: *"esse dado deve sobreviver ao fechamento da aba?"*.

---

## Recapitulando

- O navegador tem **cinco armazenamentos**: cookies (sessão com o servidor),
  `localStorage` (persistente), `sessionStorage` (por aba), IndexedDB (banco
  local) e Cache API (respostas HTTP completas).
- O Web Storage só guarda **texto** — `JSON.stringify`/`JSON.parse` fazem a
  ponte (e a estratégia `LocalStorage` esconde isso de quem a usa).
- O **`storageStrategy.js`** aplica o padrão **Strategy**: `Memoria` e
  `LocalStorage` cumprem o mesmo contrato `has`/`get`/`set` e são
  intercambiáveis com a troca de uma palavra.
- O **`apiCache.js`** é um **Decorator/Proxy**: envolve `buscarServicos` com a
  lógica de cache **mantendo a mesma assinatura**, e prova o ganho com
  `console.time` — servidor em centenas de ms, cache em frações de ms.
- A **URL como chave** dá a cada recurso seu próprio cache, de graça.
- Um **TTL** (validade via `Date.now()`) cura o cache eterno — e mora dentro da
  estratégia, não do decorator.
- O vocabulário do mercado: **cache first** (a nossa), **network first**,
  **stale-while-revalidate** — os mesmos nomes que os Service Workers usam para
  levar o cache ao app inteiro (Cap. 20).
- Cache é onipresente no mundo real: navegador, CDNs, feeds de apps, DNS,
  processador. Velocidade é funcionalidade.

---

> **Exercícios do Capítulo 19**
>
> 1. Implemente o **tema persistente** (seção 19.4): um botão que troca o tema e
>    o salva no `localStorage`, e a restauração ao carregar a página.
> 2. Com o console aberto, navegue pelas páginas de personagens e **anote os
>    tempos** de `[SERVIDOR]` e `[CACHE]`. Calcule quantas vezes o cache é mais
>    rápido.
> 3. Troque a estratégia do `apiCache.js` para `Memoria`, recarregue com F5 e
>    explique a diferença de comportamento em relação à `LocalStorage`.
> 4. Crie uma terceira estratégia, `SessionStorage`, cumprindo o contrato
>    `has`/`get`/`set`, e plugue-a no decorator.
> 5. Evolua a estratégia `LocalStorage` para a versão **com validade** (seção
>    19.7). Teste com `VALIDADE_MS` de 10 segundos e observe o cache expirar.
> 6. Implemente o **rascunho de formulário** com `sessionStorage` (seção 19.9)
>    na página de contato.
> 7. **Desafio:** crie uma função `limparCache()` que remove do `localStorage`
>    apenas as chaves que começam com `http` (as do cache de API), preservando
>    outras como o `tema`. Dica: percorra `Object.keys(localStorage)`.
> 8. **Desafio:** transforme o `apiCache.js` em **network first**: tente a rede
>    e, no `catch`, devolva o que houver na estratégia. Em qual cenário essa
>    versão é superior à nossa?
> 9. **Reflexão:** para um site de notícias, qual estratégia você escolheria —
>    cache first, network first ou stale-while-revalidate? Justifique pelo
>    compromisso entre velocidade e frescor.
