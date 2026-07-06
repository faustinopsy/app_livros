# Capítulo 5 — Manipulando o DOM e reagindo a eventos

Até aqui, todo o nosso código viveu no Console. Chegou a hora de **mexer na
página de verdade**. A ponte entre o JavaScript e o HTML se chama **DOM**, e é
ela que nos permite criar, alterar e remover elementos na tela — e reagir ao que
o usuário faz.

Este é o capítulo em que a "programação" vira "página web".

---

## 5.1 O que é o DOM?

**DOM** significa *Document Object Model* (Modelo de Objetos do Documento).
Quando o navegador carrega uma página HTML, ele constrói na memória uma
representação daquele HTML em forma de **árvore de objetos**. Cada tag vira um
"nó" (um objeto) que o JavaScript pode acessar e manipular.

Considere este HTML:

```html
<!DOCTYPE html>
<html>
  <head><title>Exemplo DOM</title></head>
  <body>
    <h1 id="titulo">Aula DOM!</h1>
    <p class="paragrafo">Este é um parágrafo.</p>
    <button id="botao">Clique aqui!</button>
  </body>
</html>
```

O navegador o transforma em uma árvore mais ou menos assim:

```
document
 └── html
      ├── head
      │    └── title  → "Exemplo DOM"
      └── body
           ├── h1#titulo       → "Aula DOM!"
           ├── p.paragrafo      → "Este é um parágrafo."
           └── button#botao     → "Clique aqui!"
```

O objeto global **`document`** é a porta de entrada para essa árvore. A partir
dele, alcançamos qualquer elemento.

> 💡 **Nos bastidores**
> "Saber o que tem por baixo dos panos nos dá mais poder." Frameworks como React
> mantêm uma cópia virtual dessa árvore para otimizar mudanças. Nós vamos
> manipular a árvore **real**, diretamente — e é exatamente isso que os
> frameworks fazem por baixo, só que escondido.

---

## 5.2 Selecionando elementos

Para manipular um elemento, primeiro precisamos **encontrá-lo**. Os principais
métodos de seleção são:

```js
// por ID (o mais específico — retorna um único elemento)
document.getElementById("titulo");

// por seletor CSS (o mais versátil — retorna o primeiro que casar)
document.querySelector("#titulo");   // # = id
document.querySelector(".paragrafo"); // . = classe
document.querySelector("button");     // nome da tag

// todos os que casam com o seletor (retorna uma lista)
document.querySelectorAll(".bem-card");
```

Repare na lógica dos seletores do `querySelector`, idêntica à do CSS:

- **`#`** seleciona por **id**: `#titulo`
- **`.`** seleciona por **classe**: `.paragrafo`
- **o nome direto** seleciona pela **tag**: `button`

> 💡 **Nos bastidores — `getElementById` vs `querySelector`**
> `getElementById("titulo")` e `querySelector("#titulo")` fazem quase a mesma
> coisa. O `getElementById` é ligeiramente mais rápido e recebe **apenas o id**
> (sem o `#`). O `querySelector` é mais flexível, aceitando qualquer seletor
> CSS. No App Livros usamos os dois — `getElementById` para pegar elementos por
> id e `querySelectorAll` para pegar vários cards de uma vez.

---

## 5.3 Modificando elementos

Uma vez selecionado, o elemento é um objeto com propriedades que podemos ler e
alterar. As três mais usadas:

### Conteúdo de texto — `textContent`

```js
document.getElementById("titulo").textContent = "DOM Manipulado!";
```

### Conteúdo HTML — `innerHTML`

```js
document.getElementById("app").innerHTML = "<h1>Olá</h1><p>Bem-vindo!</p>";
```

A diferença é fundamental:

- **`textContent`** trata tudo como **texto puro**. Se você atribuir
  `"<b>oi</b>"`, aparecerá literalmente `<b>oi</b>` na tela.
- **`innerHTML`** **interpreta as tags** como HTML. `"<b>oi</b>"` vira um **oi**
  em negrito.

> 🧩 **Montando o quebra-cabeça**
> O `innerHTML` é, sem exagero, **a técnica central de todo o App Livros**. Cada
> página monta um bloco de HTML numa template string e o "injeta" no elemento
> `<main id="app">`:
> ```js
> app.innerHTML = `<h1>Esta é a página Inicial</h1>`;
> ```
> Trocar o `innerHTML` do `#app` é o que faz a SPA "mudar de página" sem
> recarregar o navegador. Guarde bem isso: **renderizar = montar HTML numa
> string e jogar no `innerHTML`.**

### Estilo — `style`

```js
document.querySelector(".paragrafo").style.color = "blue";
```

Cada propriedade CSS vira uma propriedade do objeto `style` (em camelCase:
`background-color` → `backgroundColor`). Na prática, para muitas mudanças de
estilo, é mais organizado adicionar/remover **classes** (veja a seção 5.7).

---

## 5.4 Criando e removendo elementos

Além de trocar o conteúdo de elementos existentes, podemos **criar novos nós** e
inseri-los na árvore.

```js
// 1. criar o elemento (ainda solto, fora da página)
let novoParagrafo = document.createElement("p");

// 2. configurar o elemento
novoParagrafo.className = "paragrafo";
novoParagrafo.textContent = "Este é um novo parágrafo!";

// 3. anexá-lo como filho de outro elemento
document.body.appendChild(novoParagrafo);
```

Os três verbos essenciais:

- **`document.createElement("p")`** — cria um novo elemento (uma tag `<p>`).
- **`elementoPai.appendChild(filho)`** — anexa um elemento como filho de outro.
- **`elemento.removeChild(filho)`** ou, mais moderno, **`elemento.remove()`** —
  remove um elemento da página.

```js
// removendo um elemento
let paragrafo = document.querySelector(".paragrafo");
paragrafo.remove(); // some da tela
```

> 💡 **Nos bastidores — dois estilos de construir a tela**
> Existem duas abordagens para montar interface:
> 1. **`innerHTML` com template strings** — escrever o HTML como texto. É mais
>    rápido de ler/escrever para blocos grandes. É o estilo principal do App
>    Livros.
> 2. **`createElement` + `appendChild`** — construir nó por nó. É mais verboso,
>    porém mais seguro contra certos problemas e melhor para adicionar itens um a
>    um.
>
> No projeto, você verá os dois. Na página de contato, por exemplo, cada nova
> mensagem enviada é um `<li>` criado com `createElement` e anexado com
> `appendChild` à lista. Já as páginas inteiras nascem de `innerHTML`.

---

## 5.5 Eventos: reagindo ao usuário

Uma página só é "viva" se responde às ações do usuário: cliques, digitação,
envio de formulários. Essas ações são **eventos**, e nós "escutamos" por elas
com o método `addEventListener`:

```js
elemento.addEventListener(evento, callback);
```

O nome já explica: `add` + `Event` + `Listener` = "adicione um ouvinte de
evento". Você diz **em qual elemento**, **qual evento** e **qual função** rodar
quando ele acontecer.

```js
document.querySelector("button").addEventListener("click", function () {
  alert("Botão clicado!");
});
```

Lembre-se do Capítulo 3: aquela função anônima é um **callback**. Você não a
chama; o navegador a chama por você **quando** o clique acontecer.

Alguns tipos de evento comuns:

| Evento      | Dispara quando...                                |
|-------------|--------------------------------------------------|
| `click`     | o usuário clica no elemento                      |
| `submit`    | um formulário é enviado                          |
| `input`     | o valor de um campo muda enquanto digita         |
| `blur`      | um campo **perde** o foco (o usuário sai dele)   |
| `mouseover` | o mouse passa por cima do elemento               |
| `keyup`     | uma tecla é solta                                |

> 🧩 **Montando o quebra-cabeça**
> O evento **`blur`** vai protagonizar um momento marcante do curso. Na tela de
> cadastro, quando o usuário digita o CEP e **sai do campo** (evento `blur`),
> disparamos uma busca à API dos Correios e preenchemos o endereço
> automaticamente. É o Capítulo 15 — e é puro `addEventListener`.

---

## 5.6 Manipulando formulários

Formulários são a principal forma de o usuário **enviar dados**. Três tarefas
aparecem o tempo todo: ler o valor de um campo, reagir ao envio e impedir o
recarregamento padrão da página.

```html
<form id="formulario">
  <input type="text" id="nome" placeholder="Digite seu nome">
  <button type="submit">Enviar</button>
</form>
```

```js
const form = document.getElementById("formulario");

form.addEventListener("submit", function (event) {
  event.preventDefault(); // impede o recarregamento da página
  let nome = document.getElementById("nome").value;
  alert("Nome: " + nome);
});
```

Dois pontos merecem destaque:

- **`.value`** lê (ou escreve) o conteúdo de um campo de formulário. Guarde:
  para campos de input, é `.value`; para outros elementos, é `.textContent`.
- **`event.preventDefault()`** é **obrigatório** aqui. Por padrão, enviar um
  formulário faz o navegador **recarregar a página** (comportamento antigo, de
  quando o servidor processava tudo). Numa SPA, isso destruiria nossa aplicação.
  O `preventDefault()` cancela esse comportamento padrão, deixando o JavaScript
  no controle.

> ⚠️ **Cuidado**
> Esquecer o `event.preventDefault()` num formulário de SPA é um erro
> clássico: você clica em "Enviar", a página pisca e recarrega, e parece que
> "nada aconteceu" (na verdade, tudo aconteceu e foi jogado fora). Se um form
> estiver se comportando estranho, verifique isso primeiro.

> 🧩 **Montando o quebra-cabeça**
> A página de contato do App Livros é exatamente este exemplo, ampliado. No
> `submit`, chamamos `event.preventDefault()`, lemos os valores dos campos, e
> criamos um `<li>` com a mensagem, anexando-o a uma lista com `appendChild`.
> Vamos construí-la no Capítulo 8.

---

## 5.7 Bônus: alternando classes com `classList`

Em vez de mexer no `style` propriedade por propriedade, o mais organizado é
definir estilos em classes CSS e apenas **adicionar ou remover** essas classes
via JavaScript. Para isso existe o objeto `classList`:

```js
elemento.classList.add("bem-modal--hidden");    // adiciona a classe
elemento.classList.remove("bem-modal--hidden");  // remove a classe
elemento.classList.toggle("ativo");              // adiciona se não tem, remove se tem
```

> 🧩 **Montando o quebra-cabeça**
> É assim que abrimos e fechamos as **janelas de detalhes (modais)** do App
> Livros. A janela existe no HTML o tempo todo, mas fica escondida por uma
> classe `bem-modal--hidden`. Para mostrá-la, removemos a classe; para
> escondê-la, adicionamos de volta:
> ```js
> modal.classList.remove("bem-modal--hidden"); // abre
> modal.classList.add("bem-modal--hidden");    // fecha
> ```
> Simples e eficiente — sem recriar nada, só mostrando e ocultando.

---

## 5.8 Juntando tudo: renderizando uma lista de dados

Vamos unir os capítulos anteriores (arrays de objetos + loops + template
strings) com o DOM, num exemplo que é praticamente o coração do projeto:

```js
const produtos = [
  { nome: "Produto 1", preco: "R$ 10,00" },
  { nome: "Produto 2", preco: "R$ 20,00" },
  { nome: "Produto 3", preco: "R$ 30,00" }
];

let html = "";
for (const produto of produtos) {
  html += `<div class="card">${produto.nome} - ${produto.preco}</div>`;
}

document.getElementById("app").innerHTML = html;
```

Leia esse trecho reconhecendo cada peça já estudada:

1. Um **array de objetos** (Cap. 2) com os dados.
2. Um **`for...of`** (Cap. 4) percorrendo a lista.
3. **Template strings** (Cap. 1) montando o HTML de cada item.
4. **`innerHTML`** (este capítulo) despejando tudo na página.

Se você entendeu esse bloco, entendeu a mecânica de **toda** tela de listagem do
App Livros — livros, personagens, serviços. O que muda de uma para outra são
apenas os dados e as classes CSS.

---

## Recapitulando

- O **DOM** é a árvore de objetos que o navegador cria a partir do HTML;
  `document` é a porta de entrada.
- Selecione com `getElementById`, `querySelector` e `querySelectorAll`.
- Modifique com `textContent` (texto), **`innerHTML`** (HTML) e `style`.
- Crie e remova nós com `createElement`, `appendChild` e `remove`.
- Reaja ao usuário com **`addEventListener(evento, callback)`**.
- Em formulários, use **`.value`** para ler campos e **`event.preventDefault()`**
  para impedir o recarregamento.
- Alterne visibilidade e estilos com **`classList`**.

---

> **Exercícios do Capítulo 5**
>
> 1. Crie um HTML com um `<h1 id="titulo">` e um `<button id="btn">`. Via
>    JavaScript, faça o botão, ao ser clicado, mudar o `textContent` do título
>    para "Você clicou!".
> 2. Crie um `<input id="nome">` e um botão. Ao clicar, leia o `.value` do input
>    e mostre um `alert` com o texto digitado.
> 3. Crie um formulário com um campo de texto. No evento `submit`, use
>    `event.preventDefault()`, leia o valor e adicione um novo `<li>` (criado
>    com `createElement`) a uma lista `<ul>` na página.
> 4. Dado o array `produtos` da seção 5.8, renderize cada produto como um card
>    na página usando `for...of` + `innerHTML`.
> 5. Crie uma `<div>` escondida com uma classe `escondido` (que tem
>    `display: none` no CSS) e um botão que a mostra usando
>    `classList.remove("escondido")`.
