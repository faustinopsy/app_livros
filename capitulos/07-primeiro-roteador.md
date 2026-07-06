# Capítulo 7 — Renderização dinâmica com `hash` (o primeiro roteador)

Chega de teoria. Neste capítulo vamos escrever, do zero, a **primeira versão
funcional da nossa SPA**. Ela será simples — cheia de defeitos que corrigiremos
depois — mas fará a mágica acontecer: trocar de "página" sem recarregar o
navegador. É o esqueleto sobre o qual todo o App Livros será construído.

Vamos deliberadamente começar "errado" (ou melhor, ingênuo) para que você
**sinta na pele** os problemas e entenda por que as soluções elegantes dos
próximos capítulos existem.

---

## 7.1 O ponto de partida: o `index.html`

Toda SPA começa com um HTML mínimo, contendo apenas os **pontos de montagem** —
os lugares onde o JavaScript vai injetar conteúdo. Crie o arquivo
`index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Livros</title>
</head>
<body>
  <main id="app"></main>
  <script src="app.js"></script>
</body>
</html>
```

Note como o `<body>` está quase vazio: só um `<main id="app">` (nosso ponto de
montagem) e a inclusão do arquivo `app.js`. **Todo o resto será desenhado por
JavaScript.** Esse vazio é a assinatura de uma SPA.

> 💡 **Nos bastidores**
> Por que `<main id="app">`? O `id="app"` é o "gancho" que o JavaScript usa para
> encontrar o elemento (`getElementById("app")`). A tag `<main>` é semântica —
> indica que ali está o conteúdo principal da página. Poderia ser uma `<div>`,
> mas `<main>` comunica melhor a intenção.

---

## 7.2 A primeira renderização

Crie o arquivo `app.js` ao lado do `index.html`. Vamos guardar o conteúdo de
cada página em uma constante (uma template string com HTML) e mostrar uma delas:

```js
const app = document.getElementById("app");

const home = `<h1>Home</h1>
              <p>Bem-vindo à nossa página inicial!</p>`;

const sobre = `<h1>Sobre</h1>
               <p>Saiba mais sobre nós nesta página.</p>`;

const contato = `<h1>Contato</h1>
                 <p>Fale conosco por esta página.</p>`;

app.innerHTML = home;
```

Abra o `index.html` com o Live Server. Você deve ver o título "Home" na tela.
**Parabéns — você renderizou conteúdo dinamicamente!** O HTML que aparece não
está no arquivo `.html`; foi injetado pelo JavaScript via `innerHTML`.

Reconheça as peças: uma **variável** que aponta para o elemento do DOM
(Cap. 5), **template strings** com o HTML (Cap. 1) e o **`innerHTML`** fazendo a
injeção (Cap. 5). Tudo o que estudamos, junto.

---

## 7.3 Decidindo a página pelo `hash`

Mostrar sempre a Home é pouco. Queremos mostrar a página **de acordo com o
hash** da URL. Lembra do Capítulo 6? Vamos ler `window.location.hash` e decidir
com um `if/else` (Cap. 1):

```js
const app = document.getElementById("app");

const home = `<h1>Home</h1><p>Bem-vindo!</p>`;
const sobre = `<h1>Sobre</h1><p>Sobre nós.</p>`;
const contato = `<h1>Contato</h1><p>Fale conosco.</p>`;

const hash = window.location.hash;

if (hash === "#home") {
  app.innerHTML = home;
} else if (hash === "#sobre") {
  app.innerHTML = sobre;
} else if (hash === "#contato") {
  app.innerHTML = contato;
}
```

Agora teste: abra a página e, na barra de endereço, adicione `#sobre` ao final da
URL e pressione Enter. Depois `#contato`. O conteúdo muda!

Mas você já deve ter notado **dois problemas**:

1. Ao mudar o hash na barra, **nem sempre** a tela atualiza — às vezes você
   precisa recarregar. Isso porque o código roda **uma única vez**, quando a
   página carrega. Ele não fica "escutando" mudanças.
2. Se a URL não tiver hash nenhum (`#`), a tela fica **em branco**, porque nenhum
   `if` foi satisfeito.

Vamos resolver os dois.

---

## 7.4 Reagindo às mudanças com `hashchange`

Para a tela reagir **toda vez** que o hash mudar, precisamos escutar o evento
`hashchange` (Cap. 6) e colocar a lógica de decisão dentro de uma **função**
(Cap. 3), para poder chamá-la sempre que necessário:

```js
const app = document.getElementById("app");

const home = `<h1>Home</h1><p>Bem-vindo!</p>`;
const sobre = `<h1>Sobre</h1><p>Sobre nós.</p>`;
const contato = `<h1>Contato</h1><p>Fale conosco.</p>`;

function renderizar() {
  const hash = window.location.hash || "#home"; // padrão: home

  if (hash === "#home") {
    app.innerHTML = home;
  } else if (hash === "#sobre") {
    app.innerHTML = sobre;
  } else if (hash === "#contato") {
    app.innerHTML = contato;
  } else {
    app.innerHTML = "<h1>Página não encontrada (404)</h1>";
  }
}

// renderiza a página inicial ao carregar
renderizar();

// e re-renderiza sempre que o hash mudar
window.addEventListener("hashchange", renderizar);
```

Analise as melhorias:

- Envolvemos a lógica numa função `renderizar()` — agora podemos chamá-la
  quantas vezes quisermos.
- Chamamos `renderizar()` **uma vez** ao carregar (para a tela não começar
  vazia).
- Registramos `renderizar` como **callback** do `hashchange` — agora a tela
  reage a cada navegação.
- Usamos `window.location.hash || "#home"` para definir uma **rota padrão**: se
  o hash estiver vazio, assume `#home`. (O `||` retorna o primeiro valor
  "verdadeiro"; string vazia é "falsa", então cai no `"#home"`.)
- Adicionamos um `else` final para tratar rotas inexistentes — nossa página
  **404**.

> ⚠️ **Cuidado — o callback vai sem parênteses**
> Escrevemos `addEventListener("hashchange", renderizar)`, e **não**
> `renderizar()`. Sem os parênteses, entregamos a **função** para o navegador
> chamar depois. Com os parênteses, chamaríamos a função **agora** e passaríamos
> o seu retorno (que é `undefined`). Esse detalhe pega muita gente.

---

## 7.5 Adicionando a navegação

Falta o menu para o usuário clicar. Como os links de uma SPA apontam para
hashes, basta usar âncoras comuns com `href="#..."`. Vamos gerar o menu também
por JavaScript e inseri-lo no topo do `<body>`:

```js
function carregarMenu() {
  const menu = `
    <nav>
      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>
    </nav>`;
  document.body.insertAdjacentHTML("afterbegin", menu);
}

carregarMenu();
renderizar();
window.addEventListener("hashchange", renderizar);
```

O método `insertAdjacentHTML("afterbegin", ...)` insere o HTML **logo no início**
do `<body>`, antes do `<main>`. Assim o menu fica no topo.

Agora clique nos links. A cada clique:

1. O `href="#sobre"` muda o `window.location.hash` para `"#sobre"`.
2. A mudança dispara o evento `hashchange`.
3. O navegador chama `renderizar()`.
4. `renderizar()` lê o novo hash e troca o `innerHTML` do `#app`.

**Você tem uma SPA funcionando.** Navega entre páginas, sem recarregar, com URL
que muda e até botão "voltar" do navegador funcionando. Reserve um momento para
apreciar: você construiu do zero o que os frameworks chamam de "roteador".

---

## 7.6 Por que essa versão não escala

Nossa SPA funciona, mas tem defeitos sérios que apareceriam num projeto de
verdade:

1. **Tudo num arquivo só.** Conteúdo, lógica de rota e menu misturados no
   `app.js`. Com 10 páginas, vira um caos de milhares de linhas.
2. **Repetição no `if/else`.** Cada página nova exige mais um `else if`. E o menu
   precisa ser editado à mão em paralelo. Duas listas para manter sincronizadas
   — fonte garantida de erros.
3. **Conteúdo como strings soltas.** Uma página real tem lógica própria (reagir a
   formulários, buscar dados). Strings não comportam isso.

Cada um desses problemas será resolvido nos próximos capítulos:

| Problema                       | Solução                       | Capítulo |
|--------------------------------|-------------------------------|----------|
| Tudo num arquivo               | Módulos (`import`/`export`)   | 8        |
| Página é só string, sem lógica | Página vira **função**        | 8        |
| Menu e rotas duplicados        | Rotas como **array de objetos** e menu com `.map()` | 9 |
| `if/else` que cresce sem parar | **Mapa de rotas** centralizado | 10      |

> 🧩 **Montando o quebra-cabeça**
> Guarde este `app.js` — ele é o **embrião** do `main.js` final do projeto.
> Compare, desde já, o que temos agora com o destino:
> ```js
> // versão final (Cap. 10) — não copie ainda, só observe a semelhança
> function iniciar() {
>   navbar(roteador);
>   renderizarRotaAtual();
>   window.addEventListener("hashchange", renderizarRotaAtual);
> }
> iniciar();
> ```
> A estrutura é a mesma que você acabou de escrever: montar o menu, renderizar a
> rota atual, escutar o `hashchange`. Vamos apenas torná-la organizada e
> escalável.

---

## Recapitulando

- Uma SPA começa com um `index.html` quase vazio, só com o ponto de montagem
  `<main id="app">`.
- Renderizar é **montar HTML numa string e jogar no `innerHTML`**.
- Decidimos a página lendo `window.location.hash` com um `if/else`.
- Envolvemos a lógica numa **função** e a registramos no evento **`hashchange`**
  para reagir às navegações.
- Definimos uma **rota padrão** (`|| "#home"`) e uma **404** (o `else` final).
- Esta versão funciona, mas **não escala** — os próximos capítulos a
  reorganizam com módulos, arrays de objetos e um mapa de rotas.

---

> **Exercícios do Capítulo 7**
>
> 1. Reproduza a SPA deste capítulo do zero: crie `index.html` e `app.js` e
>    confirme que a navegação entre Home, Sobre e Contato funciona sem
>    recarregar.
> 2. Adicione uma quarta página, "Serviços" (`#servicos`), com um `else if` e um
>    novo item no menu. Sinta o "trabalho dobrado" de editar dois lugares.
> 3. Faça a rota padrão ser `#home` também quando o usuário digitar um hash
>    inexistente (dica: já está no `else`, teste com `#qualquercoisa`).
> 4. No callback do `hashchange`, adicione um `console.log` que registra para
>    qual hash o usuário navegou. Observe no Console durante a navegação.
> 5. **Reflexão:** imagine que o projeto terá 15 páginas. Liste os problemas que
>    o `if/else` gigante causaria e proponha, com suas palavras, como resolvê-los.
