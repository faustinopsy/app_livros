# Capítulo 9 — Páginas como objetos e o menu dinâmico

No capítulo anterior, cada página passou a exportar um objeto
`{ url, label, pagina }`. Foi uma decisão de projeto aparentemente pequena, mas
que agora vai render frutos enormes. Neste capítulo, vamos usar essa estrutura
para **gerar o menu de navegação automaticamente** — de modo que adicionar uma
página nova ao projeto seja trivial.

Este é o momento em que o projeto começa a parecer "mágico": você adiciona uma
rota, e o menu se atualiza sozinho.

---

## 9.1 O problema que vamos resolver

Lembra do desconforto do Capítulo 7? Tínhamos **duas listas** para manter
sincronizadas manualmente:

1. A cadeia de `if/else` que decidia qual página mostrar.
2. O HTML do menu, com um `<li>` para cada página.

Toda vez que adicionávamos uma página, precisávamos mexer nos **dois** lugares.
Esquecer um deles gerava bugs ("a página existe mas não aparece no menu", ou "o
link está no menu mas não faz nada"). Isso viola um princípio importante da
programação:

> **DRY — Don't Repeat Yourself** ("não se repita"). Cada informação deve ter
> uma **única fonte de verdade**.

Nossa fonte de verdade será **uma lista de rotas**. Dela nascerão tanto a
navegação quanto o menu. Uma lista, dois usos, zero duplicação.

---

## 9.2 A lista de rotas: `rotas.js`

Vamos criar um módulo que **reúne todas as páginas** numa única lista. Como cada
página já exporta um objeto, basta importá-las e colocá-las num array (Cap. 2).

Crie `src/js/components/rotas/rotas.js`:

```js
// src/js/components/rotas/rotas.js
import home from "../paginas/home.js";
import sobre from "../paginas/sobre.js";
import servicos from "../paginas/servicos.js";
import contato from "../paginas/contato.js";

const roteador = [
  home,
  sobre,
  servicos,
  contato
];

export default roteador;
```

Simples assim. `roteador` é um **array de objetos** — exatamente a estrutura que
estudamos no Capítulo 2. Cada elemento é o objeto `{ url, label, pagina }` de uma
página. Se quisermos ver seu conteúdo, seria algo como:

```js
[
  { url: "#home",     label: "Home",     pagina: home     },
  { url: "#sobre",    label: "Sobre",    pagina: sobre    },
  { url: "#servicos", label: "Serviços", pagina: servicos },
  { url: "#contato",  label: "Contato",  pagina: contato  }
]
```

> 🧩 **Montando o quebra-cabeça**
> Esta lista é o **coração** do App Livros. Ela é a tal "fonte única de verdade".
> Adicionar uma página ao projeto vai se resumir a: (1) criar o módulo da página
> e (2) importá-lo e incluí-lo neste array. Só isso. O menu e o roteamento se
> viram sozinhos a partir daqui. Ao final do curso, este array terá sete
> páginas — e nunca precisaremos tocar no menu ou no roteador para isso.

---

## 9.3 Gerando o menu com `.map()`

Agora a estrela do capítulo. Queremos transformar aquele array de rotas em HTML
de menu. Para cada rota, queremos um item assim:

```html
<li><a href="#home">Home</a></li>
```

Poderíamos usar um `for...of` (Cap. 4) e ir concatenando numa string. Funciona.
Mas existe um método de array feito sob medida para "transformar cada item em
outra coisa": o **`.map()`**.

O `.map()` percorre um array, aplica uma função (Cap. 3) a **cada** elemento, e
devolve um **novo array** com os resultados transformados:

```js
const numeros = [1, 2, 3];
const dobrados = numeros.map(n => n * 2); // [2, 4, 6]
```

Aplicando às rotas: para cada `item` (uma rota), devolvemos uma string de HTML:

```js
const links = roteador.map(item => `
  <li class="bem-navbar__item">
    <a href="${item.url}" class="bem-navbar__link">${item.label}</a>
  </li>`);
```

O resultado é um **array de strings de HTML**, uma para cada rota. Repare como
usamos `item.url` e `item.label` — as mesmas propriedades que definimos lá no
módulo de cada página. Tudo se conecta.

### Juntando com `.join("")`

`.map()` nos dá um **array** de strings, mas o `innerHTML` precisa de **uma
string só**. Para colar todos os pedaços, usamos `.join("")` (Cap. 2), que une os
elementos do array sem nenhum separador:

```js
const links = roteador.map(item => `...${item.label}...`).join("");
```

> ⚠️ **Cuidado — não esqueça o `.join("")`**
> Se você jogar o array direto no `innerHTML`, o JavaScript vai juntar os itens
> com **vírgulas** (comportamento padrão ao converter array em texto), e
> aparecerão vírgulas estranhas entre os itens do menu. O `.join("")` (com string
> vazia) elimina qualquer separador. É um erro clássico — fique atento.

---

## 9.4 O componente `navbar.js`

Vamos empacotar essa lógica num componente reutilizável. Crie
`src/js/components/navbar/navbar.js`:

```js
// src/js/components/navbar/navbar.js
function navbar(itens) {
  const nav = document.getElementById("navbar");

  const links = itens.map(item => `
    <li class="bem-navbar__item">
      <a href="${item.url}" class="bem-navbar__link">${item.label}</a>
    </li>`).join("");

  nav.innerHTML = `
    <nav class="bem-navbar">
      <a href="#" class="bem-navbar__brand">Brand</a>
      <ul class="bem-navbar__menu">${links}</ul>
    </nav>`;
}

export default navbar;
```

Analisando:

- `navbar` é uma **função** que recebe `itens` (a lista de rotas) como
  parâmetro. Ela não sabe *quais* são as rotas — recebe-as de fora. Isso a torna
  genérica e reutilizável.
- Encontra o ponto de montagem `<header id="navbar">` (definido no `index.html`
  do capítulo anterior).
- Usa `.map()` + `.join("")` para transformar as rotas em `<li>`s.
- Injeta tudo num `<nav>` com uma marca ("Brand") e o menu.

> 💡 **Nos bastidores — o que é `bem-navbar`?**
> As classes `bem-navbar`, `bem-navbar__item`, `bem-navbar__link` seguem uma
> convenção de nomes chamada **BEM** (Bloco, Elemento, Modificador), que dá
> organização ao CSS. O `bem-` é o prefixo do nosso microframework de estilos.
> Vamos entender tudo isso no Capítulo 11. Por enquanto, apenas mantenha as
> classes — elas farão o menu ficar bonito quando o CSS entrar.

---

## 9.5 Ligando o menu no `main.js`

Agora usamos o componente `navbar` a partir do ponto de entrada. Atualize o
`main.js` para importar as rotas e a navbar, e chamar a navbar passando a lista:

```js
// src/js/main.js
import navbar from "./components/navbar/navbar.js";
import roteador from "./components/rotas/rotas.js";

const app = document.getElementById("app");

function renderizarRotaAtual() {
  const hash = window.location.hash || "#home";

  // encontra a rota cujo url bate com o hash atual
  for (const rota of roteador) {
    if (rota.url === hash) {
      rota.pagina(app);
      return;
    }
  }
  app.innerHTML = "<h1>Página não encontrada (404)</h1>";
}

function iniciar() {
  navbar(roteador);              // desenha o menu a partir das rotas
  renderizarRotaAtual();         // desenha a página inicial
  window.addEventListener("hashchange", renderizarRotaAtual);
}

iniciar();
```

Duas grandes conquistas aqui:

1. **O menu nasce das rotas.** `navbar(roteador)` passa a lista para o
   componente, que gera os itens automaticamente. Sem mais HTML de menu escrito à
   mão.

2. **O roteamento também percorre as rotas.** Em vez de um `if/else` para cada
   página, um único `for...of` (Cap. 4) procura a rota cujo `url` bate com o
   hash e chama sua função `pagina`. Adicionar uma página não exige mais um novo
   `else if`.

Agora faça o teste que vale ouro: adicione uma página nova. Crie o módulo,
importe-o em `rotas.js`, inclua-o no array `roteador`. **Pronto** — ela aparece
no menu e funciona na navegação, sem você tocar em mais nada. Essa é a
recompensa da fonte única de verdade.

> 🧩 **Montando o quebra-cabeça**
> A função `iniciar()` que acabamos de escrever é **quase idêntica** à versão
> final do projeto. Compare com o `main.js` real:
> ```js
> function iniciar() {
>   navbar(roteador);
>   renderizarRotaAtual();
>   window.addEventListener("hashchange", renderizarRotaAtual);
> }
> iniciar();
> ```
> É exatamente o que temos agora! A única evolução que falta é trocar o
> `for...of` de busca por uma estrutura ainda mais rápida e elegante — o **mapa
> de rotas** — que é o assunto do próximo capítulo.

---

## 9.6 Um segundo exemplo de `.map()`: a página de serviços

Para fixar o `.map()` (ou seu primo `for`), vale ver outra tela do projeto que
transforma dados em HTML: a página de **serviços**, que exibe uma grade de cards
a partir de um array de objetos. Crie `src/js/components/paginas/servicos.js`:

```js
// src/js/components/paginas/servicos.js
const detalhes = [
  { titulo: "Jogo das quartas de final",  descricao: "...", imagem: "src/img/2002_1.webp" },
  { titulo: "Jogo especial",              descricao: "...", imagem: "src/img/2002_2.jpg"  },
  { titulo: "Camisa azul",                descricao: "...", imagem: "src/img/2002_3.jpg"  },
  { titulo: "Ronaldos",                   descricao: "...", imagem: "src/img/2002_4.webp" }
];

function servicos(app) {
  let cardServico = `<div class="bem-grid-auto">`;

  for (let i = 0; i < detalhes.length; i++) {
    cardServico += `
      <div class="bem-card">
        <img class="bem-card__image" src="${detalhes[i].imagem}" alt="${detalhes[i].titulo}">
        <div class="bem-card__body">
          <h3 class="bem-card__title">${detalhes[i].titulo}</h3>
          <p>${detalhes[i].descricao}</p>
        </div>
      </div>`;
  }

  cardServico += `</div>`;
  app.innerHTML = cardServico;
}

export default {
  url: "#servicos",
  label: "Serviços",
  pagina: servicos
};
```

Aqui usamos o **`for` clássico** (Cap. 4) em vez do `.map()`, para você ver que
ambos servem — a escolha é de estilo. O padrão é o mesmo do Capítulo 5:
`let cardServico = "..."` → laço que faz `cardServico += ...` → `innerHTML`.
Percorremos um **array de objetos** e transformamos cada um num **card**.

> 💡 **Nos bastidores — `.map()` ou `for`?**
> O `.map()` brilha quando você quer **transformar** uma lista em outra e já
> devolvê-la. O `for`/`for...of` é mais flexível quando há lógica extra no meio.
> No App Livros usamos `.map()` para o menu (transformação limpa) e `for...of`
> para as listagens de cards. Não existe "certo" e "errado" — existe legível.

---

## Recapitulando

- O princípio **DRY** manda ter uma **fonte única de verdade**; a nossa é o
  array **`roteador`** em `rotas.js`.
- Esse array reúne os objetos `{ url, label, pagina }` de todas as páginas.
- O **`.map()`** transforma cada rota num `<li>` de menu; o **`.join("")`** cola
  tudo numa string.
- O componente **`navbar(itens)`** gera o menu automaticamente a partir das
  rotas.
- O `main.js` agora **percorre** as rotas para renderizar e monta o menu com uma
  linha (`navbar(roteador)`).
- Adicionar uma página passou a ser trivial: criar o módulo e incluí-lo no array.

---

> **Exercícios do Capítulo 9**
>
> 1. Monte o `rotas.js` com as quatro páginas (home, sobre, serviços, contato) e
>    o `navbar.js`. Confirme que o menu aparece com os quatro itens.
> 2. Crie uma nova página `faq.js` (Perguntas Frequentes) e adicione-a às rotas.
>    Confirme que ela aparece no menu e funciona **sem** você editar o `navbar.js`
>    nem o roteamento.
> 3. Explique, com suas palavras, por que o `.join("")` é necessário depois do
>    `.map()`. Teste remover o `.join("")` e observe o que acontece no menu.
> 4. Reescreva a geração de cards da página de serviços usando `.map()` +
>    `.join("")` em vez do `for` clássico.
> 5. **Reflexão:** o parâmetro `itens` da função `navbar` poderia se chamar
>    `roteador`. Por que dar a ele um nome genérico (`itens`) torna a função mais
>    reutilizável?
