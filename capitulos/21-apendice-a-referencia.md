# Apêndice A — Referência rápida

Um cartão de consulta com o que mais usamos no App Livros. Volte aqui sempre que
precisar relembrar uma sintaxe.

---

## A.1 Variáveis e tipos

```js
const nome = "Maria";   // não reatribuível (padrão)
let contador = 0;        // reatribuível
// evite: var

typeof valor;            // descobre o tipo
`Olá, ${nome}!`          // template string (interpolação)
```

## A.2 Operadores

```js
===  !==                 // comparação estrita (use sempre estes)
<  >  <=  >=             // relacionais
&&   ||   !              // E, OU, NÃO
cond ? a : b             // ternário
valor || padrao          // valor, ou 'padrao' se valor for "falso"
```

## A.3 Arrays

| Método            | O que faz                                        |
|-------------------|--------------------------------------------------|
| `arr.push(x)`     | adiciona no fim                                  |
| `arr.pop()`       | remove do fim (retorna o item)                   |
| `arr.unshift(x)`  | adiciona no início                               |
| `arr.shift()`     | remove do início (retorna o item)                |
| `arr.slice(i, f)` | cópia de um pedaço (fim não incluído)            |
| `arr.map(fn)`     | transforma cada item → novo array                |
| `arr.join(sep)`   | junta os itens num texto                         |
| `arr.length`      | quantidade de itens                              |
| `arr[i]`          | acessa por índice (começa em 0)                  |

```js
// padrão de renderização do projeto
let html = "";
for (const item of lista) {
  html += `<li>${item.nome}</li>`;
}
elemento.innerHTML = html;
```

## A.4 Objetos

```js
const pessoa = { nome: "Ana", idade: 28 };
pessoa.nome;          // notação de ponto
pessoa["idade"];      // notação de colchete (útil com variável)
pessoa.email = "...";  // adiciona/modifica propriedade

// array de objetos (a estrutura rainha do front-end)
const rotas = [
  { url: "#home", label: "Home", pagina: home }
];
rotas[0].label;       // "Home"

// desestruturação
const { totalPaginas, livros } = resultado;
```

## A.5 Funções

```js
function somar(a, b) { return a + b; }        // declaração
const somar = function (a, b) { return a+b; }; // expressão
const somar = (a, b) => a + b;                 // arrow (retorno implícito)
const dobro = x => x * 2;                       // 1 parâmetro, sem ( )
const oi = () => console.log("oi");            // sem parâmetros

// callback
botao.addEventListener("click", () => fazerAlgo());
```

## A.6 Loops

```js
for (let i = 0; i < lista.length; i++) { ... } // clássico (com índice)
for (const item of lista) { ... }               // valores (arrays)
for (const chave in objeto) { ... }             // chaves (objetos)
while (condicao) { ... }                          // enquanto for verdade
do { ... } while (condicao);                      // ao menos uma vez

break;     // encerra o loop
continue;  // pula para a próxima volta
```

## A.7 DOM

```js
document.getElementById("id");
document.querySelector(".classe");     // # id, . classe, tag
document.querySelectorAll(".card");    // vários

el.textContent = "texto";              // texto puro
el.innerHTML = "<b>html</b>";          // interpreta HTML
el.value;                               // valor de inputs
el.style.color = "blue";
el.classList.add("x");                  // .remove("x"), .toggle("x")

document.createElement("li");
pai.appendChild(filho);
el.remove();

el.addEventListener("click", callback);
el.dataset.id;                          // lê data-id="..."
```

Eventos comuns: `click`, `submit`, `input`, `blur`, `mouseover`, `keyup`.

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();              // impede recarregar (essencial na SPA)
  // ...
});
```

## A.8 SPA e roteamento

```js
window.location.hash;                  // "#sobre"
window.location.search;                // "?a=1&b=2"
new URLSearchParams(location.search).get("a");

window.addEventListener("hashchange", renderizar);

// mapa de rotas
const mapa = {};
for (const rota of rotas) { mapa[rota.url] = rota; }
const rota = mapa[hash] || paginaNaoEncontrada;
```

## A.9 Módulos

```js
// export default (uma coisa principal)
export default funcao;
import qualquerNome from "./arquivo.js";

// export nomeado (várias coisas)
export { fnA, fnB };
import { fnA, fnB } from "./arquivo.js";
```

No HTML: `<script type="module" src="main.js"></script>` (exige servidor).

## A.10 Assíncrono e fetch

```js
// async / await (forma preferida)
async function buscar(url) {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
    return resposta.json();
  } catch (erro) {
    console.error(erro);
  } finally {
    // limpeza que roda sempre (ex.: esconder "Carregando...")
  }
}

// Promise com .then / .catch (forma clássica)
fetch(url)
  .then(r => r.json())
  .then(dados => console.log(dados))
  .catch(err => console.error(err));
```

## A.11 Convenção BEM (CSS)

```
.bem-bloco              /* componente        */
.bem-bloco__elemento    /* parte do bloco     */
.bem-bloco--modificador /* variação/estado    */
```

```css
:root { --bem-primary: #3b82f6; }        /* variável CSS */
.x { color: var(--bem-primary); }         /* uso          */
[data-theme="noite"] { --bem-bg: #0f172a; } /* tema        */
```
