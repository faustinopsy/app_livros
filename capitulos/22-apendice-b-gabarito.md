# Apêndice B — Gabarito comentado dos exercícios

Aqui estão soluções de referência para os exercícios de programação mais
importantes de cada capítulo. Tente resolver sozinho **antes** de consultar — o
aprendizado está na tentativa, não na resposta pronta. Há muitas formas corretas;
estas são apenas uma delas.

---

## Capítulo 1 — Variáveis e condicionais

**Ex. 2 — Classificar nota:**

```js
let nota = 8;
if (nota >= 7) {
  console.log("Aprovado");
} else if (nota >= 5) {
  console.log("Recuperação");
} else {
  console.log("Reprovado");
}
```

**Ex. 3 — Aluno aprovado (tabela verdade):**

```js
let nota = 7.5;
let faltas = 15;
if (nota >= 7.0 && faltas <= 20) {
  console.log("Aprovado");
} else {
  console.log("Reprovado");
}
// Teste as 4 combinações: (nota alta/baixa) x (faltas ok/altas)
```

**Ex. 6 — Segurança do banco com ternário:**

```js
const nomeValido = true;
const senhaCorreta = true;
console.log(nomeValido && senhaCorreta ? "Acesso permitido" : "Acesso negado");
```

---

## Capítulo 2 — Arrays e objetos

**Ex. 1 — Painel de fila com prioridade:**

```js
const fila = [];

function chegou(idade) {
  if (idade > 65) {
    fila.unshift(idade); // prioridade: vai para o início
  } else {
    fila.push(idade);    // fim da fila
  }
}

function atender() {
  return fila.shift();   // remove e retorna o primeiro
}

chegou(30); chegou(70); chegou(40);
console.log(fila);       // [70, 30, 40]
console.log(atender());  // 70
```

**Ex. 4 — Ano do livro "Python":**

```js
const livros = [{ titulo: "PHP", ano: 1995 }, { titulo: "Python", ano: 1991 }];
console.log(livros[1].ano); // 1991
```

---

## Capítulo 3 — Funções

**Ex. 1 e 2 — Calculadora (tradicional e arrow):**

```js
// tradicionais
function somar(a, b)       { return a + b; }
function subtrair(a, b)    { return a - b; }
function multiplicar(a, b) { return a * b; }
function dividir(a, b)     { return a / b; }

// como arrow functions
const somar       = (a, b) => a + b;
const subtrair    = (a, b) => a - b;
const multiplicar = (a, b) => a * b;
const dividir     = (a, b) => a / b;
```

**Ex. 4 — Callback:**

```js
function processar(valor, callback) {
  callback(valor);
}
processar("olá", (v) => console.log(v.toUpperCase())); // "OLÁ"
```

**Ex. 5 — Recursão:**

```js
function contagemRegressiva(n) {
  console.log(n);
  if (n <= 0) return;
  contagemRegressiva(n - 1);
}
contagemRegressiva(5); // 5, 4, 3, 2, 1, 0
```

---

## Capítulo 4 — Loops

**Ex. 1 — Inverter array:**

```js
const original = [1, 2, 3, 4, 5];
const inverso = [];
for (let i = original.length - 1; i >= 0; i--) {
  inverso.push(original[i]);
}
console.log(inverso); // [5, 4, 3, 2, 1]
```

**Ex. 2 — Maior número:**

```js
const numeros = [5, 3, 9, 1, 6];
let max = numeros[0];
for (let i = 1; i < numeros.length; i++) {
  if (numeros[i] > max) max = numeros[i];
}
console.log(max); // 9
```

**Ex. 3 — Contar caracteres:**

```js
const palavra = "banana";
const alvo = "a";
let conta = 0;
for (const letra of palavra) {
  if (letra === alvo) conta++;
}
console.log(`'${alvo}' aparece ${conta} vezes.`); // 3
```

**Ex. 4 — Números pares:**

```js
const N = 5;
const pares = [];
for (let i = 1; i <= N; i++) {
  pares.push(i * 2);
}
console.log(pares); // [2, 4, 6, 8, 10]
```

---

## Capítulo 5 — DOM e eventos

**Ex. 3 — Formulário que adiciona `<li>`:**

```js
const form = document.getElementById("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const valor = document.getElementById("campo").value;
  const li = document.createElement("li");
  li.textContent = valor;
  document.getElementById("lista").appendChild(li);
});
```

**Ex. 4 — Renderizar produtos:**

```js
const produtos = [
  { nome: "Produto 1", preco: "R$ 10,00" },
  { nome: "Produto 2", preco: "R$ 20,00" }
];
let html = "";
for (const p of produtos) {
  html += `<div class="card">${p.nome} - ${p.preco}</div>`;
}
document.getElementById("app").innerHTML = html;
```

---

## Capítulo 7 — Primeiro roteador

**Ex. 1 — SPA mínima:**

```js
const app = document.getElementById("app");
const paginas = {
  "#home": "<h1>Home</h1>",
  "#sobre": "<h1>Sobre</h1>",
  "#contato": "<h1>Contato</h1>"
};
function renderizar() {
  const hash = window.location.hash || "#home";
  app.innerHTML = paginas[hash] || "<h1>404</h1>";
}
renderizar();
window.addEventListener("hashchange", renderizar);
```

(Repare: já usamos um "mapa" aqui, antecipando o Capítulo 10!)

---

## Capítulo 9 — Rotas e menu dinâmico

**Ex. 4 — Cards de serviço com `.map()`:**

```js
function servicos(app) {
  const cards = detalhes.map(d => `
    <div class="bem-card">
      <img class="bem-card__image" src="${d.imagem}" alt="${d.titulo}">
      <div class="bem-card__body">
        <h3 class="bem-card__title">${d.titulo}</h3>
        <p>${d.descricao}</p>
      </div>
    </div>`).join("");
  app.innerHTML = `<div class="bem-grid-auto">${cards}</div>`;
}
```

---

## Capítulo 13 — Promises e fetch

**Ex. 1 — Fetch do CEP:**

```js
fetch("https://viacep.com.br/ws/01001000/json/")
  .then(r => r.json())
  .then(dados => {
    console.log(dados.localidade);  // São Paulo
    console.log(dados.logradouro);  // Praça da Sé
  })
  .catch(err => console.error(err));
```

**Ex. 3 — Promise manual:**

```js
const espera = new Promise((resolve) => {
  setTimeout(() => resolve("Pronto!"), 2000);
});
espera.then(msg => console.log(msg)); // "Pronto!" após 2s
```

---

## Capítulo 14 — async/await

**Ex. 1 — Reescrever com async/await:**

```js
async function buscarDados() {
  try {
    const resposta = await fetch("https://viacep.com.br/ws/01001000/json/");
    const dados = await resposta.json();
    console.log(dados);
  } catch (erro) {
    console.error(erro);
  }
}
```

---

## Capítulo 15 — Formulário CEP

**Ex. 2 — Validação de CEP inexistente:**

```js
const dados = await buscarDados(`https://viacep.com.br/ws/${event.target.value}/json/`);
if (dados.erro) {
  Swal.fire("CEP não encontrado");
  document.getElementById("logradouro").value = "";
  document.getElementById("bairro").value = "";
  document.getElementById("localidade").value = "";
  document.getElementById("estado").value = "";
  return;
}
// ...preenche normalmente
```

---

## Capítulo 16 — API de Livros

**Ex. 3 — Fechar o modal ao clicar no fundo:**

```js
document.getElementById("modalDetalhes").addEventListener("click", (event) => {
  // fecha só se o clique foi no fundo (não no diálogo)
  if (event.target.id === "modalDetalhes") {
    fecharDetalhes();
  }
});
```

**Ex. 4 — Placeholder para imagem ausente:**

```js
const imagem = livro.imagem || "src/img/sem-capa.png";
// use ${imagem} no template do card
```

---

## Capítulo 17 — Rick and Morty

**Ex. 4 — Busca por nome:**

```js
// no serviço:
async function buscarListaPersonagens(pagina, termo = "") {
  const url = `${BASE_URL}?page=${pagina}&name=${termo}`;
  const dados = await buscarDados(url);
  // ...resto igual
}

// na página: um <input id="busca"> e
document.getElementById("busca").addEventListener("input", (e) => {
  termoBusca = e.target.value;
  paginaAtual = 1;
  renderizarPagina();
});
```

---

> **Nota final:** os exercícios de "reflexão" não têm resposta única — a intenção
> é fazer você **verbalizar** o entendimento. Escreva suas respostas com suas
> próprias palavras; ensinar (mesmo a um caderno) é a melhor forma de aprender.
