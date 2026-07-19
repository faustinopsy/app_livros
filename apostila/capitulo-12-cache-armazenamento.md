# Capítulo 12: Estratégias de cache e os armazenamentos do navegador

## O problema que ninguém vê até medir

No capítulo anterior nossa aplicação aprendeu a buscar dados na internet. Agora ela tem um vício caro: busca os mesmos dados repetidas vezes. Abra a página de personagens da API Rick and Morty, navegue para a página 2, volte para a 1. A aba Network do DevTools mostra a verdade: a página 1 foi baixada de novo, inteirinha, mesmo que nada tenha mudado nos últimos dez segundos.

Isso desperdiça em três frentes ao mesmo tempo:

- Tempo do usuário: cada revisita espera a rede de novo
- Dados do usuário: em rede móvel, cada requisição repetida consome o pacote de internet
- Recursos do servidor: APIs públicas têm limites de uso, e cada chamada desnecessária ocupa a cota

A pergunta que guia este capítulo é simples de formular e valiosa de responder: por que buscar de novo algo que já temos? A resposta tem nome, cache, e é uma das técnicas mais importantes de toda a computação.

## Cache no mundo real: você usa o dia inteiro

Cache é qualquer cópia local de um dado que custa caro buscar na origem. Antes de ver o código, repare como a ideia está em toda parte:

- O navegador guarda imagens, CSS e scripts de sites que você visita. Por isso a segunda visita a um site é sempre mais rápida que a primeira
- O Instagram e o X mostram o feed antigo na hora quando você abre o aplicativo sem internet, e atualizam quando a conexão volta. Aquele feed é um cache
- O Spotify guarda as músicas baixadas para tocar sem rede
- A Netflix instala servidores de cache dentro dos provedores de internet (as CDNs) para o filme sair de perto de você, e não do outro lado do planeta
- O seu processador tem memórias de cache (L1, L2, L3) porque buscar na memória RAM é lento demais para ele
- O DNS, que traduz nomes como google.com em endereços IP, é cacheado pelo sistema operacional para não perguntar de novo a cada clique

Um dado do mercado que justifica todo o esforço: estudos da Amazon e do Google associam cada 100 milissegundos a mais de espera a quedas mensuráveis de vendas e de engajamento. Velocidade é funcionalidade, e cache é a forma mais barata de comprá-la.

E uma frase clássica da área, atribuída a Phil Karlton, para manter a humildade: existem apenas duas coisas difíceis na computação, invalidação de cache e dar nome às coisas. Vamos encontrar as duas neste capítulo.

## Os armazenamentos do navegador, um tour completo

Para ter cache no front-end, precisamos de um lugar para guardar as cópias. O navegador oferece cinco opções, cada uma com sua vocação. Conhecer as cinco é o que permite escolher bem.

### Cookies

O mais antigo dos armazenamentos. Guardam textos minúsculos (por volta de 4 KB) e têm uma característica única: são enviados automaticamente ao servidor em toda requisição para aquele domínio. Por isso servem para identificação de sessão (o servidor reconhece que você é você), e por isso mesmo não servem para cache: inflariam cada requisição com dados que o servidor não pediu.

```javascript
document.cookie = "tema=noite; max-age=31536000";
```

### localStorage

Um armário de chave e valor com cerca de 5 a 10 MB por site. O que for guardado persiste para sempre, mesmo fechando o navegador, até alguém apagar. A API é síncrona e tem quatro métodos:

```javascript
localStorage.setItem("tema", "noite");   // guardar
localStorage.getItem("tema");            // ler, devolve null se nao existir
localStorage.removeItem("tema");         // remover uma chave
localStorage.clear();                    // apagar tudo do site
```

Regra de ouro que pega todo mundo: o localStorage só guarda texto. Um objeto vira a string inútil "[object Object]". A ponte é o JSON, que conhecemos no capítulo anterior:

```javascript
const livro = { id: 1, titulo: "Dom Casmurro" };
localStorage.setItem("livro", JSON.stringify(livro));      // objeto vira texto
const salvo = JSON.parse(localStorage.getItem("livro"));   // texto vira objeto
```

Você pode inspecionar tudo que está guardado no DevTools, aba Application, seção Local Storage. Acostume-se a olhar ali enquanto estuda este capítulo.

### sessionStorage

Mesma API do localStorage, métodos idênticos, mas o tempo de vida é outro: os dados morrem quando a aba fecha. Pense no localStorage como um armário em casa e no sessionStorage como o bolso durante um passeio. É ideal para rascunhos de formulário e estados temporários de navegação.

### IndexedDB

Um banco de dados de verdade dentro do navegador: guarda objetos sem conversão para texto, aceita volumes na casa de centenas de MB, tem índices de busca e transações, e toda a API é assíncrona. É o que aplicações grandes usam para trabalhar offline com muitos dados (o Google Docs, por exemplo). O custo é uma API verbosa; para o nosso volume de dados, o localStorage resolve. Fica registrado como o próximo degrau quando o cache crescer.

### Cache API

Feita sob medida para cache de rede: em vez de chave e texto, ela guarda pares de requisição e resposta HTTP completas, como um mini servidor dentro do navegador:

```javascript
const cache = await caches.open("app-livros-v1");
await cache.add("https://rickandmortyapi.com/api/character/?page=1");
const resposta = await caches.match("https://rickandmortyapi.com/api/character/?page=1");
```

Ela é a parceira natural dos Service Workers, que veremos no fim do capítulo.

### Tabela de decisão

| Armazenamento | Capacidade | Vive até | Vocação |
|---|---|---|---|
| Cookies | ~4 KB | expiração definida | sessão e identificação junto ao servidor |
| localStorage | ~5 a 10 MB | ser apagado | preferências e cache simples de dados |
| sessionStorage | ~5 MB | a aba fechar | rascunhos e estado temporário |
| IndexedDB | centenas de MB | ser apagado | grandes volumes estruturados, offline pesado |
| Cache API | grande (cota do site) | ser apagado | respostas HTTP completas, Service Workers |

Atenção de segurança que vale para todos: qualquer script da página consegue ler esses armazenamentos. Nunca guarde senhas, tokens sensíveis ou dados de cartão neles. Cache é para dados públicos e preferências, não para segredos.

## Antes do cache, uma refatoração: a camada de serviços

Quando implementamos o CEP no capítulo anterior, a função de busca morava dentro do próprio componente da página. Funcionava, mas cada página nova que consumisse API copiaria a mesma estrutura de fetch, try/catch e json(). Repetição é convite para bug.

A solução foi criar a pasta `src/js/components/services` e centralizar a busca em um único arquivo:

```javascript
// services/api.js
async function buscarServicos(url, dados='', forma=''){
    try {
        const formataURL = `${url}${dados}${forma}`
        const response = await fetch(formataURL);
        const result = await response.json();
        return result
    } catch (error) {
        console.error(error);
    };
}

export default buscarServicos;
```

Uma função genérica que monta a URL em três partes (base, dado variável e sufixo) e serve qualquer API. A tela de cadastro agora chama:

```javascript
const dados = await buscarServicos("https://viacep.com.br/ws/", event.target.value, "/json/")
```

E a página de personagens chama a mesma função para outra API:

```javascript
const detalhes = await buscarServicos("https://rickandmortyapi.com/api/character/", nPagina);
```

Guarde esse movimento: concentrar toda a conversa com a rede em um ponto único. Ele parece só organização, mas é o que vai tornar o cache quase de graça daqui a pouco.

## O padrão Strategy: estratégias de armazenamento intercambiáveis

Antes de escrever o cache, uma decisão de projeto: onde guardar as cópias? Em memória (um Map, rápido, mas morre no F5)? No localStorage (sobrevive ao F5)? Amanhã, no IndexedDB?

Em vez de amarrar o cache a uma resposta, o projeto define um contrato: qualquer armazenamento serve, desde que saiba responder `has`, `get` e `set`. Cada implementação desse contrato é uma estratégia, e o arquivo `services/storageStrategy.js` traz duas:

```javascript
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

Repare que a estratégia `LocalStorage` esconde dentro de si o detalhe do JSON.stringify e do JSON.parse. Quem usar a estratégia não precisa saber que o localStorage só aceita texto; o contrato entrega e recebe objetos prontos.

Isso é um padrão de projeto clássico chamado Strategy: uma família de algoritmos intercambiáveis atrás de uma mesma interface. Trocar de estratégia é trocar uma palavra, como veremos já já. É o mesmo espírito do contrato das nossas páginas (url, label, pagina): quem cumpre o contrato entra no jogo sem que o resto do código mude.

## O decorator: um cache que envolve a busca

Agora a peça central. O arquivo `services/apiCache.js` cria uma função que envolve a `buscarServicos` original, adicionando o comportamento de cache por fora, sem alterar uma linha dela:

```javascript
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

Vamos apreciar as decisões, uma a uma:

A URL completa é a chave do cache. Simples e genial: `...character/?page=1` e `...character/?page=2` geram entradas separadas automaticamente. Cada recurso único tem seu próprio cache sem nenhum esforço extra.

Cache primeiro. Se a estratégia tem a chave, devolvemos a cópia local e a rede nem é acordada. Se não tem, buscamos pela função original e guardamos o resultado para a próxima.

A estratégia é plugável. A linha `const storage = LocalStorage` é o interruptor: troque por `Memoria` e todo o comportamento de persistência muda, sem tocar em mais nada. O Strategy do arquivo anterior em ação.

A prova está no cronômetro. Os `console.time` e `console.timeEnd` medem e imprimem no console o tempo de cada caminho. Abra o console e navegue: a busca no servidor leva dezenas ou centenas de milissegundos; a resposta do cache, frações de milissegundo. Não acredite em mim, leia os seus próprios números.

Esse desenho, uma função que envolve outra preservando a mesma assinatura e adicionando comportamento, é conhecido como decorator (e, quando o objetivo é controlar o acesso ao objeto original, proxy). Repare no detalhe que sustenta tudo: `buscarComCache(url, dados, forma)` recebe exatamente os mesmos parâmetros de `buscarServicos(url, dados, forma)`. Assinaturas iguais tornam as duas intercambiáveis.

## A troca de uma linha

E aqui a recompensa da refatoração para a camada de serviços. Para a tela de cadastro e a página de personagens ganharem cache, a mudança foi somente o import:

```javascript
// antes
import buscarServicos from "../services/api.js"

// depois
import buscarServicos from "../services/apiCache.js"
```

Nada mais mudou nas páginas: como o decorator tem a mesma assinatura da função original, o resto do código nem percebe a troca. Se o fetch estivesse espalhado por cada componente, essa melhoria exigiria caçar e editar todos eles. Boas decisões de estrutura tornam melhorias futuras baratas; essa lição vale mais que o próprio cache.

Faça o teste de medição do início do capítulo de novo: página 1, página 2, volta para a 1. Agora a aba Network fica quieta na revisita e o console imprime o tempo do caminho `[CACHE]`.

## As estratégias de cache clássicas

O que implementamos tem nome no mercado: cache first, olhe o cache antes, rede só na falta. Existe um vocabulário de estratégias, e cada uma resolve um compromisso diferente entre velocidade e frescor dos dados:

- Cache first: responde do cache; rede apenas quando não há cópia. Máxima velocidade, ideal para dados que mudam pouco. É a nossa
- Network first: tenta a rede; se falhar (offline, servidor fora), cai para o cache. Ideal para dados que precisam estar atualizados, com o cache como plano B
- Stale while revalidate: responde o cache imediatamente e, em paralelo, busca a versão nova para a próxima visita. O usuário nunca espera e o dado nunca fica muito velho. É o queridinho de feeds e notícias
- Network only e cache only: os extremos, sem cache e somente cache, para casos especiais

E a peça que falta na nossa: validade. Nosso cache é eterno; se a API mudar, mostraremos a cópia velha para sempre (eis a invalidação de cache da frase do Karlton). A técnica clássica é o TTL, time to live: guardar junto com o dado o momento em que foi salvo e, na leitura, conferir a idade:

```javascript
// evolucao da estrategia LocalStorage com validade de 10 minutos
const VALIDADE_MS = 10 * 60 * 1000;

set(key, value) {
    localStorage.setItem(key, JSON.stringify({ dados: value, salvoEm: Date.now() }));
},
get(key) {
    const bruto = localStorage.getItem(key);
    if (!bruto) return null;
    const { dados, salvoEm } = JSON.parse(bruto);
    if (Date.now() - salvoEm > VALIDADE_MS) return null;   // expirou
    return dados;
}
```

Repare onde a mudança mora: dentro da estratégia, não no decorator. O apiCache continua intocado. Cada peça da arquitetura absorve a evolução que lhe diz respeito.

## A estratégia que falta no projeto: o Service Worker

Todas as estratégias acima rodam dentro da página. Existe um nível acima, que ainda não está no nosso código e fica aqui como fronteira a explorar: o Service Worker.

Um Service Worker é um script que o navegador roda em segundo plano, separado da página, e que funciona como um porteiro da rede: toda requisição do site passa por ele, incluindo o HTML, o CSS, as imagens e os scripts, não só as chamadas de API:

```
sem service worker:
  pagina ── fetch ──► internet

com service worker:
  pagina ── fetch ──► [ service worker ] ──► internet
                            │
                            └──► Cache API (pode responder sem rede)
```

Com ele, as estratégias de cache saem do nosso decorator e passam a valer para a aplicação inteira, o que permite o feito máximo: o site abrir sem internet nenhuma. É a tecnologia por trás dos PWAs, os aplicativos instaláveis feitos com tecnologia web. Um esqueleto para reconhecer as peças:

```javascript
// sw.js: o porteiro da rede
const CACHE = "app-livros-v1";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) =>
            cache.addAll(["/", "/index.html", "/src/css/microframework.css", "/src/js/main.js"])
        )
    );
});

self.addEventListener("fetch", (event) => {
    // estrategia cache first para tudo
    event.respondWith(
        caches.match(event.request).then((doCache) => doCache || fetch(event.request))
    );
});

// e na pagina, o registro:
// navigator.serviceWorker.register("/sw.js");
```

Você reconhece tudo: `addEventListener` do Capítulo 7, Promises do Capítulo 10, a Cache API deste capítulo e a estratégia cache first que acabamos de implementar à mão. O Service Worker exige HTTPS (ou localhost) justamente por ser poderoso demais, e tem um ciclo de vida próprio (install, activate, fetch) que merece um estudo dedicado. Fica como o desafio de fronteira do curso: os fundamentos você já tem todos.

## Resumo do capítulo

- Cache é uma cópia local de um dado caro de buscar; a web inteira funciona sobre camadas de cache
- O navegador oferece cinco armazenamentos: cookies (sessão com o servidor), localStorage (persistente), sessionStorage (por aba), IndexedDB (banco local) e Cache API (respostas HTTP)
- O localStorage só guarda texto; JSON.stringify e JSON.parse fazem a ponte
- A camada de serviços (`services/api.js`) centralizou a rede e tornou o cache uma troca de import
- O `storageStrategy.js` aplica o padrão Strategy: Memoria e LocalStorage cumprem o mesmo contrato has, get e set
- O `apiCache.js` é um decorator/proxy: envolve a busca original com a lógica de cache, mantendo a mesma assinatura, e prova o ganho com console.time
- Estratégias clássicas: cache first (a nossa), network first, stale while revalidate, e TTL para invalidar cache velho
- O Service Worker leva as estratégias para toda a aplicação e habilita o offline completo; é o próximo degrau

## Para praticar

1. Navegue pelas páginas de personagens com o console aberto e anote os tempos de `[SERVIDOR]` e `[CACHE]`. Calcule quantas vezes o cache é mais rápido.
2. Troque a estratégia para `Memoria` no apiCache, recarregue com F5 e explique a diferença de comportamento em relação à `LocalStorage`.
3. Implemente o TTL dentro da estratégia LocalStorage com validade de 30 segundos e observe no console o cache expirar.
4. Crie uma terceira estratégia, `SessionStorage`, cumprindo o mesmo contrato, e ligue-a no apiCache.
5. Escreva uma função `limparCache()` que remove do localStorage apenas as chaves que começam com http, preservando outras preferências. Dica: percorra `Object.keys(localStorage)`.
6. Desafio: aplique o esqueleto de Service Worker ao projeto rodando no Live Server, e confirme na aba Application do DevTools que ele foi registrado. Depois desligue a rede e recarregue.
7. Reflexão: para um site de notícias, qual estratégia você escolheria, cache first, network first ou stale while revalidate? Justifique pelo compromisso entre velocidade e frescor.

## Referências

- MDN Web Docs, Web Storage API: https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Storage_API
- MDN Web Docs, IndexedDB API: https://developer.mozilla.org/pt-BR/docs/Web/API/IndexedDB_API
- MDN Web Docs, Cache API: https://developer.mozilla.org/pt-BR/docs/Web/API/Cache
- MDN Web Docs, Service Worker API: https://developer.mozilla.org/pt-BR/docs/Web/API/Service_Worker_API
- MDN Web Docs, HTTP caching: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Caching
- web.dev (Google), Caching strategies e offline: https://web.dev/learn/pwa/caching
- W3Schools, Web Storage: https://www.w3schools.com/html/html5_webstorage.asp
- Refactoring Guru, padrões Strategy, Decorator e Proxy: https://refactoring.guru/pt-br/design-patterns
