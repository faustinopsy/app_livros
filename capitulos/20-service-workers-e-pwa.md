# Capítulo 20 — Service Workers e PWA: o app que funciona offline

No capítulo anterior aprendemos a guardar **dados** no navegador e a cachear
respostas de API para economizar rede. Mas ficou uma pergunta no ar: e se
pudéssemos guardar o **próprio aplicativo** — o HTML, o CSS, o JavaScript, as
imagens — de modo que ele **abrisse mesmo sem internet**?

É isso que os **Service Workers** tornam possível, e é o passo que transforma o
nosso App Livros de um "site" em um **aplicativo instalável** (um PWA). Este é o
capítulo mais "avançado" do curso — mas você vai perceber que ele se apoia
inteiramente em conceitos que já domina: eventos, callbacks, Promises,
`async/await` e a mesma lógica de cache do Capítulo 19.

---

## 20.1 O que é um Service Worker

Um **Service Worker** é um arquivo JavaScript especial que roda **em segundo
plano**, **separado** da sua página. Ele funciona como um **intermediário entre a
aplicação e a rede** — um "porteiro" por onde passam as requisições.

Compare com o que fizemos até agora:

```
SEM Service Worker:
  página  ──fetch──►  internet

COM Service Worker:
  página  ──fetch──►  [ Service Worker ]  ──►  internet
                             │
                             └──►  cache (pode responder sem ir à rede!)
```

Como o Service Worker intercepta **toda** requisição, ele pode decidir: "isto eu
já tenho no cache, respondo na hora" ou "isto preciso buscar na rede". É a mesma
ideia do `buscarComCache` (Cap. 19), mas num nível muito mais poderoso — agora
para **qualquer** recurso do app, não só as chamadas de API.

Características importantes que o tornam especial:

- **Roda separado da página** — continua "vivo" mesmo depois de a aba fechar, e é
  compartilhado por todas as abas do site.
- **Não tem acesso ao DOM** — ele não desenha nada na tela; sua função é
  gerenciar rede e cache. Para falar com a página, usa mensagens.
- **É orientado a eventos** — assim como aprendemos no Capítulo 5, ele
  "escuta" eventos (`install`, `activate`, `fetch`) e reage a eles.

> ⚠️ **Cuidado — só funciona em HTTPS (ou localhost)**
> Por serem tão poderosos (interceptam requisições!), os Service Workers só são
> permitidos em conexões seguras: **HTTPS** em produção, ou **`localhost`** no
> desenvolvimento. Aquele nosso Live Server (`localhost`) funciona perfeitamente.
> Abrir com `file://` **não** funciona — mais um motivo para sempre usar um
> servidor, como falamos lá no Capítulo 0.

---

## 20.2 A Cache API

Antes do Service Worker em si, precisamos conhecer a ferramenta que ele usa para
guardar arquivos: a **Cache API**. Diferente do `localStorage` (que guarda texto
chave→valor), a Cache API é feita para guardar **pares de requisição e resposta**
— ou seja, arquivos inteiros (páginas, folhas de estilo, scripts, imagens).

```js
// abrir (ou criar) um cache com um nome de versão
const cache = await caches.open("app-livros-v1");

// guardar vários arquivos de uma vez
await cache.addAll(["/", "/index.html", "/src/css/microframework.css"]);

// procurar uma resposta no cache
const resposta = await caches.match("/index.html");
```

Repare que já é tudo **`async/await`** (Cap. 14) — a Cache API é baseada em
Promises, então você já sabe conversar com ela. `caches` é um objeto global,
como `document` ou `window`.

> 💡 **Nos bastidores — por que o nome tem "v1"?**
> Chamamos o cache de `"app-livros-v1"`. Esse número de versão é uma prática
> essencial: quando você atualizar o app (novo CSS, novo JS), vai mudar para
> `"v2"`, o que permite **descartar o cache antigo** e forçar o navegador a
> guardar os arquivos novos. Sem versionar, o usuário poderia ficar preso a uma
> versão velha para sempre — o problema de "invalidação de cache" que citamos no
> Capítulo 19, agora do lado dos arquivos.

---

## 20.3 O ciclo de vida: `install`, `activate`, `fetch`

Um Service Worker "vive" reagindo a três eventos principais. Vamos criar o
arquivo `sw.js` **na raiz do projeto** (a localização importa — veremos por quê) e
tratar cada evento.

### 1. `install` — guardar os arquivos essenciais

Dispara **uma vez**, quando o Service Worker é instalado. É o momento de baixar e
guardar o "esqueleto" do app (o chamado *app shell*):

```js
// sw.js
const CACHE = "app-livros-v1";
const ARQUIVOS = [
  "/",
  "/index.html",
  "/src/css/microframework.css",
  "/src/js/main.js"
  // ...demais módulos e imagens essenciais
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS))
  );
});
```

Duas novidades de vocabulário:

- **`self`** — dentro do Service Worker, `self` é o "eu mesmo" (o equivalente ao
  `window` da página). `self.addEventListener` registra um ouvinte de evento —
  exatamente como fizemos com botões no Capítulo 5.
- **`event.waitUntil(promessa)`** — diz ao navegador "não considere a instalação
  concluída até esta Promise terminar". Garante que todos os arquivos sejam
  guardados antes de o Service Worker seguir em frente.

### 2. `activate` — limpar caches antigos

Dispara quando o Service Worker assume o controle. É o lugar ideal para
**apagar versões antigas** do cache:

```js
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes.filter((nome) => nome !== CACHE)
             .map((nome) => caches.delete(nome))
      )
    )
  );
});
```

Traduzindo a lógica: pegue os nomes de todos os caches, **filtre** (Cap. 18) os
que **não** são a versão atual, e **apague** cada um. Quando você subir a `v2`,
essa função limpa a `v1` automaticamente.

### 3. `fetch` — interceptar as requisições

O evento estrela. Dispara a **cada requisição** que a página faz. Aqui decidimos:
responder do cache ou ir à rede?

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resposta) => {
      return resposta || fetch(event.request);
    })
  );
});
```

Leia o miolo com carinho: **`resposta || fetch(event.request)`**. Se
`caches.match` achou uma resposta no cache, usamos ela (sem rede!). Se não achou
(`undefined`, que é "falso"), o `||` vai buscar na rede. É **o mesmíssimo padrão**
do nosso roteador — lembra de `mapaDeRotas[hash] || paginaNaoEncontrada`
(Cap. 10)? Você já pensava assim desde a Parte IV; agora aplica a estratégia à
rede inteira.

> 🧩 **Montando o quebra-cabeça**
> Note como cada peça deste Service Worker é um reencontro:
> **`addEventListener`** (Cap. 5), **callbacks** e **arrow functions** (Cap. 3),
> **Promises** e `.then()` (Cap. 13), **`async`/Cache API** (Cap. 14), o operador
> **`||`** para fallback (Cap. 10) e o **`.filter()`/`.map()`** (Caps. 9 e 18).
> Não há nada realmente novo aqui — há a **combinação** de tudo o que você
> aprendeu, aplicada a um problema novo. É assim que conhecimento sólido rende
> juros.

---

## 20.4 Registrando o Service Worker na aplicação

O arquivo `sw.js` sozinho não faz nada — a página precisa **registrá-lo**.
Fazemos isso no `main.js` (Cap. 10), com uma verificação de suporte:

```js
// no final do main.js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Service Worker registrado:", reg.scope))
      .catch((erro) => console.error("Falha ao registrar:", erro));
  });
}
```

Analisando:

- **`if ("serviceWorker" in navigator)`** — checa se o navegador suporta a
  tecnologia antes de usá-la. Isso se chama *melhoria progressiva*: em navegadores
  antigos, o app continua funcionando normalmente (só sem o modo offline).
- **`navigator.serviceWorker.register("/sw.js")`** — registra nosso arquivo.
  Retorna uma Promise, então encadeamos `.then()`/`.catch()` (Cap. 13).
- Registramos após o evento **`load`** para não competir com o carregamento
  inicial da página.

> ⚠️ **Cuidado — a localização do `sw.js` define o "escopo"**
> O Service Worker só controla requisições **dentro da pasta onde ele está** (e
> subpastas). Isso se chama **escopo**. Se você colocar o `sw.js` na raiz do
> projeto, ele controla o site inteiro (`/`). Se colocá-lo em `/src/js/`, ele só
> controlaria `/src/js/...`. **Por isso o `sw.js` fica na raiz** — para "enxergar"
> tudo. É a regra que mais confunde iniciantes; anote-a.

---

## 20.5 Testando no navegador

Como saber se funcionou? As DevTools têm uma seção dedicada:

1. Abra `F12` → aba **Application** (ou *Aplicativo*).
2. No menu lateral, clique em **Service Workers**. Você verá o seu registrado, com
   status "activated and running".
3. Em **Cache Storage**, veja os arquivos que foram guardados no `app-livros-v1`.
4. O teste definitivo: marque a caixa **Offline** (ainda em Application →
   Service Workers, ou na aba Network) e **recarregue a página**. Se tudo estiver
   certo, **o App Livros abre mesmo sem internet** — servido inteiramente do
   cache. 🎉

> 💡 **Nos bastidores — o "pulo" da atualização**
> Um comportamento que assusta no começo: depois de mudar o `sw.js`, o navegador
> **não** aplica a nova versão de imediato — o Service Worker antigo continua no
> comando até todas as abas do site fecharem. Durante o desenvolvimento, marque
> **"Update on reload"** na aba Application → Service Workers para forçar a
> atualização a cada recarga. Isso evita horas de confusão do tipo "mudei o
> código e nada muda".

---

## 20.6 Estratégias de cache

No `fetch` acima usamos a estratégia mais simples, **"cache primeiro"**. Mas,
como vimos no Capítulo 19, existem outras, cada uma com seu compromisso entre
**velocidade** e **frescor**:

| Estratégia               | Como funciona                                          | Boa para                          |
|--------------------------|--------------------------------------------------------|-----------------------------------|
| **Cache primeiro**       | tenta o cache; só vai à rede se faltar                  | arquivos que mudam pouco (CSS, JS, logos) |
| **Rede primeiro**        | tenta a rede; cai no cache se estiver offline           | dados que mudam sempre (API de livros) |
| **Stale-while-revalidate** | responde do cache **na hora** e atualiza em segundo plano | o melhor de percepção de velocidade |

Um exemplo de **"rede primeiro"**, ideal para as chamadas de API do App Livros
(onde queremos dados novos, mas com o cache como rede de segurança offline):

```js
// dentro do fetch, para requisições à API:
event.respondWith(
  fetch(event.request)
    .then((resposta) => {
      // deu certo na rede: atualiza o cache e devolve
      const copia = resposta.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copia));
      return resposta;
    })
    .catch(() => caches.match(event.request)) // offline: usa o cache
);
```

Numa aplicação real, você combina estratégias: "cache primeiro" para os arquivos
do app (o *shell*) e "rede primeiro" para os dados da API. O Service Worker pode
inspecionar `event.request.url` e escolher a estratégia conforme o recurso.

> 🧩 **Montando o quebra-cabeça**
> Percebe a simetria? No Capítulo 19, o cache de **dados** (via `localStorage`)
> economizava as chamadas de API. Aqui, o cache de **arquivos** (via Service
> Worker) permite o app abrir offline. Juntas, as duas camadas cobrem tudo: dados
> **e** aplicação, ambos disponíveis sem rede. É a diferença entre um site que
> "quebra sem internet" e um aplicativo de verdade.

---

## 20.7 O toque final: o manifesto e o PWA

Falta uma peça para o App Livros virar um **PWA** (*Progressive Web App*) — um app
**instalável**, com ícone na tela inicial e abertura em tela cheia. Essa peça é um
pequeno arquivo de configuração: o **manifesto**.

Crie `manifest.json` na raiz do projeto:

```json
{
  "name": "App Livros",
  "short_name": "Livros",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/src/img/icone-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/src/img/icone-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Cada campo tem um papel:

- **`name` / `short_name`** — o nome completo e o nome curto (para o ícone).
- **`start_url`** — a página que abre quando o app é iniciado.
- **`display: "standalone"`** — abre **sem a barra do navegador**, com cara de app
  nativo.
- **`theme_color`** — a cor da barra de status (usamos o azul primário do nosso
  microframework — Cap. 11).
- **`icons`** — os ícones do app em vários tamanhos.

E ligamos o manifesto no `<head>` do `index.html`:

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3b82f6">
```

Pronto. Com um **Service Worker ativo** + um **manifesto válido** + **HTTPS**, o
navegador passa a oferecer um botão **"Instalar"** na barra de endereço. O usuário
clica, e o App Livros ganha um ícone na área de trabalho ou na tela do celular,
abrindo em tela cheia como qualquer aplicativo. Você cruzou a fronteira entre
"site" e "aplicativo".

> 💡 **Nos bastidores — os critérios de "instalável"**
> Para o navegador oferecer a instalação, ele checa alguns requisitos ("critérios
> de instalabilidade"): servir em HTTPS, ter um manifesto com `name`, `icons`
> (pelo menos 192px e 512px) e `start_url`, e ter um Service Worker registrado. As
> DevTools (aba Application → Manifest) apontam exatamente o que falta — use-as
> como checklist.

---

## 20.8 O quadro completo

Vale ver, em uma imagem mental, tudo o que a Parte VI construiu sobre o App
Livros já pronto:

```
                    ┌─────────────────────────────┐
   Usuário  ◄────►  │        App Livros (SPA)      │
                    │  páginas · roteador · CSS    │
                    └──────────────┬──────────────┘
                                   │ fetch
                    ┌──────────────▼──────────────┐
                    │      Service Worker (sw.js)   │  ← Cap. 20: cache de ARQUIVOS
                    │   intercepta e decide         │     (app abre offline)
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  services/cache.js            │  ← Cap. 19: cache de DADOS
                    │  (localStorage + validade)    │     (economia de rede)
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  services/api.js (fetch)      │  ← Cap. 14
                    └──────────────┬──────────────┘
                                   │
                              APIs na internet          ← Caps. 15–17
```

Da tela ao servidor, cada camada tem uma responsabilidade única, e você entende
**todas**. Isso é uma aplicação web moderna, completa, construída peça por peça —
sem frameworks, sem mágica.

---

## Recapitulando

- Um **Service Worker** é um script que roda em segundo plano e **intercepta as
  requisições** da aplicação, funcionando como um porteiro entre app e rede.
- Só funciona em **HTTPS** ou **`localhost`**, e seu **escopo** depende de **onde
  o arquivo está** (por isso, na raiz).
- A **Cache API** (`caches.open`, `addAll`, `match`) guarda **arquivos inteiros**;
  versione o nome do cache (`v1`, `v2`) para poder atualizá-lo.
- O ciclo de vida tem três eventos: **`install`** (guarda o *app shell*),
  **`activate`** (limpa caches antigos) e **`fetch`** (decide cache × rede).
- Registramos o SW com `navigator.serviceWorker.register("/sw.js")`, com
  verificação de suporte (melhoria progressiva).
- Existem **estratégias** de cache (cache primeiro, rede primeiro,
  stale-while-revalidate) — combine-as por tipo de recurso.
- Um **manifesto** + Service Worker + HTTPS transformam o site num **PWA**
  instalável, que abre offline e em tela cheia.

---

> **Exercícios do Capítulo 20**
>
> 1. Crie o `sw.js` na raiz com os eventos `install` e `fetch` (estratégia "cache
>    primeiro") e registre-o no `main.js`. Confirme na aba **Application** que ele
>    está "activated".
> 2. Adicione ao `ARQUIVOS` todos os módulos JS e o CSS do App Livros. Marque
>    **Offline** nas DevTools e recarregue: o app deve abrir sem internet.
> 3. Implemente o evento **`activate`** que limpa caches antigos. Suba a versão do
>    cache para `"app-livros-v2"` e confirme que a `v1` é apagada.
> 4. Crie o `manifest.json` e ligue-o no `index.html`. Verifique na aba
>    Application → **Manifest** se o navegador considera o app instalável (e o que
>    falta, se não).
> 5. **Desafio de estratégia:** faça o `fetch` do Service Worker usar "cache
>    primeiro" para arquivos `.css`/`.js` e "rede primeiro" para as chamadas de
>    API (dica: cheque `event.request.url`).
> 6. **Reflexão:** explique, com suas palavras, a diferença entre o cache de
>    **dados** do Capítulo 19 e o cache de **arquivos** deste capítulo. Por que
>    precisamos dos dois?
