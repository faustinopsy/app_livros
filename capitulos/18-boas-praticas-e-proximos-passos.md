# Capítulo 18 — Boas práticas, organização e próximos passos

Você construiu uma SPA completa do zero. Neste capítulo final, vamos dar um passo
atrás para enxergar o **quadro geral**: os princípios que guiaram cada decisão do
projeto, as boas práticas que valem para qualquer código que você escrever daqui
em diante, e o caminho para continuar evoluindo — inclusive rumo aos frameworks.

---

## 18.1 Os princípios que nos guiaram

Ao longo do curso, algumas ideias apareceram repetidamente. Elas não são
específicas do App Livros — são princípios universais da boa engenharia de
software. Guarde-os:

### Responsabilidade única

Cada arquivo, cada função, faz **uma coisa**. `api.js` só faz requisições.
`navbar.js` só desenha o menu. `buscarListaLivros` só busca e limpa a lista. Quando
cada peça tem um propósito claro, o projeto inteiro fica fácil de entender e de
consertar.

### DRY — Don't Repeat Yourself

Cada informação tem uma **fonte única de verdade**. A lista de rotas em
`rotas.js` alimenta tanto o menu quanto o roteamento. A função `buscarDados`
centraliza toda requisição. Duplicação é dívida: um dia você muda um lugar e
esquece o outro.

### Separação de responsabilidades (camadas)

Separamos **estrutura** (HTML), **apresentação** (CSS) e **comportamento**
(JavaScript). E, dentro do JS, separamos **interface** (`components/paginas/`) de
**dados** (`services/`). Essa arquitetura em camadas é o que permite trocar uma
API sem tocar na tela, ou redesenhar a tela sem tocar nos dados.

### Nomes que comunicam

`renderizarRotaAtual`, `buscarDetalheLivro`, `mostrarCarregando`. Os nomes
**dizem o que fazem**. Código é lido muitas mais vezes do que é escrito — escreva
para quem vai ler (que muitas vezes é você mesmo, meses depois).

> 💡 **Nos bastidores**
> Esses quatro princípios são exatamente o que os frameworks impõem por baixo dos
> panos. React separa componentes; Angular tem serviços; todos pregam
> responsabilidade única e DRY. Você não aprendeu "JavaScript puro" como algo
> menor — aprendeu os **fundamentos** que todo framework apenas empacota.

---

## 18.2 Boas práticas de código

Um apanhado de hábitos que fazem diferença, muitos já vistos em contexto:

- **Use `const` por padrão**, `let` só quando o valor mudar, e evite `var`.
- **Compare com `===` e `!==`** — sempre estrito.
- **Trate erros** em toda operação assíncrona (`try/catch`), e limpe no
  `finally`.
- **Dê feedback ao usuário**: um "Carregando..." durante esperas, uma mensagem em
  caso de erro. Interface silenciosa parece quebrada.
- **Desenhe primeiro, escute depois**: registre eventos só após os elementos
  existirem no DOM.
- **Não confie em dados externos**: valide o que vem de formulários e de APIs
  (lembra do CEP inválido?).
- **Comente o "porquê", não o "o quê"**: o código já diz o que faz; um bom
  comentário explica uma decisão não óbvia.
- **Constantes nomeadas** em vez de "números mágicos": `ITENS_POR_PAGINA = 32` é
  melhor que um `32` solto no meio de uma conta.

---

## 18.3 Ferramentas do dia a dia

Você usou algumas o tempo todo; vale reconhecê-las como parte do ofício:

- **O Console do navegador (DevTools)** — seu laboratório e seu detetive. Use
  `console.log` para inspecionar valores, a aba *Network* para ver as requisições
  e a aba *Elements* para examinar o DOM ao vivo.
- **O Git** — o histórico do projeto conta a sua evolução, commit a commit
  ("criação da tela de cadastro", "componente auto-montável", "centralização do
  roteamento"). Versionar seu código é inegociável. Cada funcionalidade merece
  seu commit.
- **Um servidor local (Live Server)** — indispensável para os ES Modules.

> 🧩 **Montando o quebra-cabeça**
> O próprio App Livros nasceu assim: um repositório Git em que cada sábado de
> aula virou um ou mais commits. Se você reproduziu o projeto seguindo esta
> apostila, considere fazer o mesmo — um commit ao final de cada capítulo. Daqui
> a um ano, seu histórico contará a sua jornada de aprendizado.

---

## 18.4 O que ainda dá para melhorar no projeto

Nenhum projeto está "pronto". Alguns aprimoramentos que seriam ótimos exercícios:

1. **Validação de formulários** — checar CEP, e-mail e campos obrigatórios,
   mostrando mensagens de erro amigáveis (o CSS já tem as classes
   `bem-form__error` e `bem-form__input--error`).
2. **Estado de "nenhum resultado"** — quando uma busca não retorna nada, mostrar
   "Nenhum item encontrado" em vez de uma grade vazia.
3. **Tratamento de imagens ausentes** — um placeholder quando o livro não tem
   capa.
4. **Abstração da tela de listagem** — a "regra dos três" (Cap. 17): unificar as
   telas de livros e personagens numa função genérica.
5. **Persistência** — salvar dados no `localStorage` (por exemplo, as mensagens
   de contato) para que sobrevivam ao recarregamento.
6. **Acessibilidade** — atributos ARIA, foco no modal, navegação por teclado.
7. **Botão de troca de tema** — a base CSS de temas já existe (Cap. 11); falta a
   interface para o usuário escolher.

---

## 18.5 A continuação imediata do curso: guardar dados no navegador

Nosso App Livros já busca dados da internet — mas ele tem uma "amnésia": toda vez
que você abre a tela de livros, ele vai **de novo** à API buscar tudo, mesmo que
os dados sejam os mesmos de segundos atrás. Feche a aba, reabra, e todo o
trabalho é refeito do zero. O próximo passo natural da sua jornada é ensinar a
aplicação a **lembrar**. Para isso, o navegador oferece o **Web Storage**:
`localStorage` e `sessionStorage`.

### O que são

São dois "cofrinhos" que o navegador dá para cada site guardar dados no formato
**chave → valor** (texto), do jeitinho que já conhecemos dos objetos (Cap. 2):

```js
// guardar
localStorage.setItem("tema", "noite");

// ler
const tema = localStorage.getItem("tema"); // "noite"

// remover
localStorage.removeItem("tema");

// apagar tudo
localStorage.clear();
```

A diferença entre os dois está no **tempo de vida**:

| Recurso            | Vive enquanto...                            | Uso típico                        |
|--------------------|---------------------------------------------|-----------------------------------|
| **`localStorage`** | ...você não apagar — **persiste** para sempre, mesmo fechando o navegador | tema escolhido, dados em cache, "lembrar de mim" |
| **`sessionStorage`** | ...a **aba** estiver aberta — some ao fechá-la | dados de um formulário em preenchimento, estado temporário |

> ⚠️ **Cuidado — só guarda texto**
> O Web Storage só armazena **strings**. Para guardar um objeto ou array,
> converta-o para texto com **`JSON.stringify`** ao salvar e de volta para objeto
> com **`JSON.parse`** ao ler:
> ```js
> const livros = [{ id: 1, titulo: "Dom Casmurro" }];
> localStorage.setItem("livros", JSON.stringify(livros)); // objeto → texto
> const salvos = JSON.parse(localStorage.getItem("livros")); // texto → objeto
> ```
> Lembra do `resposta.json()` do Capítulo 13, que virava texto JSON em objeto? Aqui
> é o mesmo formato JSON, agora no sentido inverso ao salvar.

### O grande motivo: economizar rede e criar cache

Aqui está a ideia mais valiosa deste tópico, e o motivo pelo qual ele vem **logo
depois** do consumo de API. Cada requisição à internet **custa**: custa tempo (o
usuário espera), custa dados (importante em redes móveis) e custa recursos do
servidor (que atende a chamada). Buscar **o mesmo recurso várias vezes** é
desperdício puro.

O `localStorage` permite construir um **cache** — uma cópia local dos dados já
buscados. A lógica é simples e poderosa:

> Antes de ir à internet, **pergunte ao cache**. Se o dado já estiver lá, use-o e
> **evite a requisição**. Se não estiver, busque na API e **guarde no cache** para
> a próxima vez.

Veja como aplicaríamos isso ao nosso próprio `services/api.js`, criando um cache
personalizado por cima da função `buscarDados` que já construímos no Capítulo 14:

```js
// uma versão da busca que consulta o cache antes de ir à rede
async function buscarComCache(url) {
  const emCache = localStorage.getItem(url); // a própria URL é a chave!

  if (emCache) {
    console.log("Servido do cache (sem rede):", url);
    return JSON.parse(emCache); // devolve a cópia local, instantâneo
  }

  console.log("Buscando na internet:", url);
  const dados = await buscarDados(url);          // nossa função do Cap. 14
  localStorage.setItem(url, JSON.stringify(dados)); // guarda para a próxima
  return dados;
}
```

Repare na elegância: usamos a **própria URL como chave** do cache. Assim, a
página 2 dos livros (`.../books/?page=2`) e a página 3 (`.../books/?page=3`) têm
caches separados e independentes. Ao revisitar a página 2, os dados aparecem
**instantaneamente**, sem uma única requisição — nem o "Carregando..." pisca.

> 💡 **Nos bastidores — cache com validade**
> Um cache "eterno" tem um risco: os dados podem **ficar velhos** (a API mudou,
> mas você continua mostrando a cópia antiga). Caches profissionais guardam,
> junto com o dado, um **carimbo de tempo** e uma **validade** (o famoso "TTL",
> *time to live*). Ao ler, você checa: "esse cache tem menos de 10 minutos? Se
> sim, uso; se não, busco de novo e atualizo". É um ótimo exercício para
> evoluir o `buscarComCache` acima — guarde `{ dados, salvoEm: Date.now() }` e
> compare com `Date.now()` na leitura.

> 🧩 **Montando o quebra-cabeça**
> Este é o gancho perfeito para a continuação do curso. O App Livros está
> **pronto** para receber cache: como toda requisição já passa por um único
> lugar (`services/api.js`, o princípio DRY do Cap. 9), basta trocar as chamadas
> de `buscarDados` por `buscarComCache` e **toda** a aplicação — livros,
> personagens, CEP — ganha cache de uma vez. É a recompensa de ter uma
> arquitetura bem separada em camadas.

---

## 18.6 Indo além: Service Workers e o app que funciona offline

O `localStorage` guarda **dados**. Mas e se pudéssemos guardar o **próprio
aplicativo** — HTML, CSS, JS, imagens — para que ele abrisse **sem internet**? É
isso que os **Service Workers** permitem, e é o passo seguinte natural depois do
Web Storage.

Um **Service Worker** é um script especial que roda **em segundo plano**,
separado da sua página, funcionando como um **intermediário entre a aplicação e a
rede**. Toda requisição que a aplicação faz pode passar por ele primeiro. Isso lhe
dá superpoderes:

- **Interceptar requisições** e responder com uma cópia em cache — levando a
  economia de rede da seção anterior a outro nível, agora para os arquivos do
  próprio site.
- **Funcionar offline**: com os arquivos essenciais guardados, o app abre mesmo
  sem conexão.
- **Estratégias de cache** inteligentes ("cache primeiro", "rede primeiro",
  "rede com fallback para cache").

```js
// exemplo mínimo: guardar os arquivos do app na instalação
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("app-livros-v1").then((cache) =>
      cache.addAll(["/", "/index.html", "/src/css/microframework.css"])
    )
  );
});

// interceptar requisições: tentar o cache antes da rede
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resposta) => resposta || fetch(event.request))
  );
});
```

Não se assuste com a sintaxe nova (`self`, `caches`, `event.respondWith`) — o
que importa agora é reconhecer o **conceito**, que é o mesmo do
`buscarComCache`: *pergunte ao cache antes de ir à rede*. Repare no
`caches.match(...) || fetch(...)`: é o mesmíssimo padrão do `||` que usamos no
roteador (`mapaDeRotas[hash] || paginaNaoEncontrada`, Cap. 10). Você já pensa
assim.

> 💡 **Nos bastidores — isso vira um PWA**
> Um site com Service Worker, um cache bem planejado e um pequeno arquivo de
> configuração (o *manifest*) se transforma num **PWA** (*Progressive Web App*):
> um site que **pode ser instalado** como um aplicativo, com ícone na tela
> inicial, tela cheia e funcionamento offline. É a fronteira entre "site" e
> "aplicativo" — e o App Livros está a poucos passos de cruzá-la.

> 🧩 **Montando o quebra-cabeça — o roteiro da sequência**
> Juntando tudo, a continuação imediata do que você construiu tem uma ordem clara
> e cada etapa se apoia na anterior:
> 1. **Consumo de API** *(feito — Caps. 15 a 17)*: trazer dados da internet.
> 2. **`localStorage` / `sessionStorage`**: lembrar dados e **cachear** respostas
>    para economizar rede.
> 3. **Service Workers**: cachear o próprio app, interceptar requisições e
>    funcionar **offline**.
> 4. **PWA**: empacotar tudo num aplicativo instalável.
> Cada peça encaixa na anterior — exatamente o espírito de quebra-cabeça deste
> curso.

---

## 18.7 Aprofunde o JavaScript

Paralelamente, vale robustecer a linguagem em si:

- Métodos de array além do `.map()`: **`.filter()`** (filtrar), **`.reduce()`**
  (acumular), **`.find()`** (achar um), **`.forEach()`** (percorrer). Eles
  substituem muitos loops com elegância.
- **Desestruturação** e **spread/rest** (`...`), que você já viu de relance.
- **`JSON.stringify` / `JSON.parse`** a fundo (essenciais para o cache acima).
- **Datas** (`Date`) e o objeto **`Math`**, que já usamos no `Math.ceil`.
- **Módulos mais avançados** e organização de projetos maiores.

---

## 18.8 Conheça um framework — agora com fundamento

Quando você abrir o **React**, vai reconhecer tudo:

| No App Livros (você construiu)          | No React (equivalente)              |
|-----------------------------------------|-------------------------------------|
| Página = função que retorna HTML string | Componente = função que retorna JSX |
| Roteador com `hash` e mapa de rotas     | React Router                        |
| `paginaAtual` como variável de estado   | `useState`                          |
| Camada `services/` com `fetch`          | ...exatamente igual!                |
| `navbar(roteador)` gerando o menu        | Renderização de listas com `.map()` |

A diferença é que o framework **automatiza** a atualização da tela e oferece
ferramentas prontas. Mas o **modelo mental** — componentes, estado, dados
assíncronos, roteamento — é **o mesmo que você já domina**. Você não vai aprender
React do zero; vai apenas aprender a sintaxe de algo que já entende.

### Qual framework escolher?

Todos partem das mesmas ideias que você construiu na mão. As opções mais comuns:

- **React** — o mais usado no mercado; ecossistema gigante. Ótimo para
  empregabilidade. É o que mais se parece com o que fizemos: componentes que são
  funções retornando "HTML".
- **Vue** — considerado o mais amigável para quem vem do JavaScript puro; a curva
  de aprendizado é suave e a documentação é excelente.
- **Angular** — mais "robusto" e opinativo, usado em grandes empresas; já traz
  tudo embutido (roteamento, requisições, formulários), à maneira do nosso
  `services/`, só que oficial.
- **Svelte** — o mais moderno e enxuto; compila para JavaScript puro parecido com
  o que você já escreve.

> 💡 **Nos bastidores — como estudar um framework partindo daqui**
> Sugestão de método: pegue o **próprio App Livros** e reconstrua-o no framework
> escolhido, tela por tela. Comece pela navbar (uma lista com `.map()`), depois
> uma página estática (Sobre), depois a tela de livros (estado + `fetch` +
> lista). Como você **já conhece o resultado esperado**, poderá focar 100% na
> sintaxe nova, sem se preocupar com a lógica. É a forma mais rápida de aprender:
> traduzir algo que você domina para uma nova linguagem.

### O que também sustenta o front-end profissional

- **HTTP e APIs REST** a fundo (métodos GET/POST/PUT/DELETE, status codes,
  cabeçalhos).
- **Ferramentas de build** (Vite) e **npm** para gerenciar dependências.
- **TypeScript** — JavaScript com tipos, que previne muitos erros.
- **Testes automatizados** — para ter confiança ao mudar o código.

---

## 18.9 O outro lado da força: o backend

Até aqui, sempre **consumimos** APIs feitas por outras pessoas (ViaCEP,
Gutendex, Rick and Morty). Mas quem **constrói** essas APIs? O **backend** — o
lado do servidor. Aprender backend é o que fecha o ciclo e te torna capaz de
construir uma **aplicação completa**, do banco de dados até a tela.

Pense no que sempre esteve "do outro lado" do nosso `fetch`:

```
Front-end (você domina)          Back-end (o próximo passo)
─────────────────────            ──────────────────────────
fetch("...gutendex.com/books")  →  um servidor recebe o pedido
                                 →  consulta um banco de dados
                                 ←  devolve os livros em JSON
mostra na tela (você fez isso)
```

O que estudar para dominar esse lado:

- **Node.js** — rodar JavaScript **fora** do navegador, no servidor. A grande
  vantagem para você: é **a mesma linguagem** que já aprendeu. Funções, arrays,
  objetos, `async/await` — tudo se aplica, agora no servidor.
- **Express** (ou Fastify) — um framework para **criar as suas próprias APIs**,
  definindo rotas como `GET /livros` e `POST /livros`. É o espelho do nosso
  roteador de front-end, do lado do servidor.
- **Bancos de dados** — onde os dados **realmente** ficam guardados de forma
  permanente. Duas famílias: **SQL** (PostgreSQL, MySQL — dados em tabelas) e
  **NoSQL** (MongoDB — dados em documentos parecidos com objetos JS).
- **Autenticação e autorização** — logins, senhas, tokens (JWT), sessões:
  garantir que cada usuário acesse só o que pode.
- **Deploy** — colocar a aplicação no ar (Vercel, Netlify para o front; Render,
  Railway, ou um servidor na nuvem para o back).

> 🧩 **Montando o quebra-cabeça — o projeto que fecha o ciclo**
> O exercício definitivo: **construa a sua própria API de livros** com Node +
> Express + banco de dados, e faça o App Livros consumir **a sua API** em vez da
> Gutendex. Você teria escrito as **duas pontas** — e entenderia, de verdade, o
> que acontece dos dois lados de cada `fetch`. Esse é o momento em que você deixa
> de ser "quem faz telas" e passa a ser **desenvolvedor full-stack**: capaz de
> construir uma aplicação inteira sozinho.

---

## 18.10 Um roteiro de estudos sugerido

Reunindo tudo, uma ordem possível para os próximos meses — cada etapa se apoia na
anterior:

1. **Web Storage** (`localStorage`/`sessionStorage`) e **cache** de requisições —
   *a continuação direta deste curso*.
2. **Service Workers** e **PWA** — offline e app instalável.
3. **Métodos de array** avançados e **desestruturação** — polir o JavaScript.
4. **Um framework** (React ou Vue) — reconstruindo o App Livros nele.
5. **TypeScript** — tipos para código mais seguro.
6. **Node + Express + banco de dados** — o backend, criando a sua própria API.
7. **Autenticação e deploy** — colocar uma aplicação completa no ar.

Não precisa correr. Cada item, bem estudado, é uma competência valiosa por si só.

---

## 18.11 Palavras finais

Comece de novo, do topo, e repare no tamanho da jornada. No Capítulo 1, você
declarava variáveis. No Capítulo 17, você orquestrava duas APIs, com paginação,
modais e tratamento de erros, tudo numa arquitetura em camadas. Entre um ponto e
outro, cada conceito se encaixou no anterior como uma peça de quebra-cabeça:

- Variáveis e condicionais viraram **decisões de rota**.
- Arrays de objetos viraram **a lista de rotas e os dados das telas**.
- Funções viraram **páginas e serviços**.
- Loops viraram **renderização de listas**.
- O DOM virou **a tela viva**.
- O assincronismo virou **dados do mundo real**.

Você não decorou receitas — você **entendeu o mecanismo**. E entender o mecanismo
é o que separa quem apenas usa ferramentas de quem as domina, adapta e, um dia,
constrói as suas.

O melhor código que você vai escrever ainda está à sua frente. Continue montando
quebra-cabeças. 🧩🚀

---

## Recapitulando

- Os pilares do projeto — **responsabilidade única**, **DRY**, **separação em
  camadas** e **nomes claros** — são princípios universais.
- Boas práticas: `const` por padrão, `===`, tratar erros, dar feedback, desenhar
  antes de escutar, validar entradas.
- Domine as ferramentas: **DevTools**, **Git**, servidor local.
- A continuação imediata é o **Web Storage**: `localStorage`/`sessionStorage`
  para lembrar dados e **cachear** requisições, economizando rede; depois
  **Service Workers** e **PWA** para funcionar offline.
- Guardar objetos exige **`JSON.stringify`** ao salvar e **`JSON.parse`** ao ler.
- Um **framework** (React/Vue) vai parecer familiar, porque você já construiu na
  mão o que ele automatiza; e o **backend** (Node/Express/banco) fecha o ciclo
  rumo ao **full-stack**.

---

> **Exercícios do Capítulo 18 (projeto final)**
>
> 1. Escolha **três** melhorias da seção 18.4 e implemente-as no seu App Livros.
> 2. Implemente o **botão de troca de tema** usando a base CSS do Capítulo 11 e
>    **guarde a escolha no `localStorage`**, de modo que o tema persista ao
>    recarregar a página.
> 3. **Cache de rede:** implemente a função `buscarComCache` da seção 18.5 e faça
>    o serviço de livros usá-la. Abra o Console e a aba *Network* das DevTools e
>    confirme que, ao revisitar uma página já vista, **nenhuma requisição nova**
>    é feita.
> 4. **Cache com validade:** evolua o `buscarComCache` para guardar
>    `{ dados, salvoEm: Date.now() }` e só usar o cache se ele tiver menos de 10
>    minutos; caso contrário, busque de novo e atualize.
> 5. Use o **`sessionStorage`** para salvar o que o usuário digitou no formulário
>    de contato, de forma que, ao trocar de página e voltar, os campos continuem
>    preenchidos (mas sejam esquecidos ao fechar a aba).
> 6. Versione seu projeto no Git com commits organizados, um por funcionalidade.
> 7. **Projeto full-stack:** usando a mesma arquitetura, crie uma tela que
>    consome **outra** API pública (ex.: PokéAPI, TheMealDB). Como desafio maior,
>    construa a **sua própria** API com Node + Express e faça o App Livros
>    consumi-la.
