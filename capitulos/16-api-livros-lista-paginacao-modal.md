# Capítulo 16 — Consumindo a API de Livros (lista, paginação e modal)

Este é o capítulo mais ambicioso do curso — e o que dá nome ao projeto. Vamos
construir a tela de **Livros**: uma grade de cards vinda de uma API real, com
**paginação** (botões Anterior/Próxima) e uma **janela de detalhes (modal)** que
abre ao clicar num livro. É a tela mais completa do App Livros, e nela tudo o que
aprendemos se encontra.

Vamos construí-la em duas camadas, como manda a boa arquitetura (Cap. 14):
primeiro o **serviço** (que busca e organiza os dados), depois a **página** (que
os exibe).

---

## 16.1 A API Gutendex

Usaremos a [**Gutendex**](https://gutendex.com), uma API gratuita que expõe o
catálogo do Projeto Gutenberg (milhares de livros de domínio público). Dois
endereços nos interessam:

- **Lista de livros** (com busca e paginação):
  ```
  https://gutendex.com/books/?search=fiction&page=2
  ```
  Repare na **query string** (Cap. 6): `search=fiction` filtra por "fiction" e
  `page=2` pede a segunda página. A resposta traz um objeto com `count` (total de
  livros), `results` (o array de livros desta página) e mais.

- **Detalhe de um livro** (pelo id):
  ```
  https://gutendex.com/books/1342/
  ```

Cada livro no `results` é um objeto rico, com campos como `id`, `title`,
`authors` (um array de objetos!), `formats` (um objeto com URLs de imagem) e
`subjects` (um array de assuntos). Nosso serviço vai **peneirar** essa
complexidade e entregar à tela apenas o que ela precisa.

---

## 16.2 A camada de serviço: `services/livros.js`

O princípio é o mesmo do capítulo anterior: a página **não** deve saber os
detalhes da API. Ela pede "me dê a lista de livros da página 2" e recebe dados
limpos. Quem lida com a bagunça da API é o serviço.

Crie `src/js/services/livros.js`. Começamos com constantes e funções auxiliares:

```js
// src/js/services/livros.js
import buscarDados from "./api.js";

const BASE_URL = "https://gutendex.com/books";
const TERMO_PADRAO = "fiction";
const ITENS_POR_PAGINA = 32;

function extrairAutores(autores) {
  const nomes = [];
  for (const autor of autores) {
    nomes.push(autor.name);
  }
  return nomes.length ? nomes.join(", ") : "Autor desconhecido";
}

function extrairImagem(formatos) {
  return formatos["image/jpeg"] || "";
}
```

Duas funções auxiliares (Cap. 3) que "traduzem" os dados crus da API:

- **`extrairAutores`** recebe o array de autores (cada um um objeto com `.name`)
  e devolve um **texto** com os nomes separados por vírgula. Usa um `for...of`
  (Cap. 4) para coletar os nomes num array e `.join(", ")` (Cap. 2) para
  juntá-los. Se não houver autores (`nomes.length` é 0, que é "falso"), devolve
  "Autor desconhecido" — um ternário disfarçado com `?`.
- **`extrairImagem`** cava no objeto `formats` para pegar a URL da imagem JPEG.
  O `|| ""` garante um texto vazio caso não exista imagem (evita `undefined` na
  tela).

Agora a função que busca a **lista**:

```js
async function buscarListaLivros(pagina) {
  const dados = await buscarDados(`${BASE_URL}/?search=${TERMO_PADRAO}&page=${pagina}`);

  const livros = [];
  for (const item of dados.results) {
    livros.push({
      id: item.id,
      titulo: item.title,
      autores: extrairAutores(item.authors),
      imagem: extrairImagem(item.formats)
    });
  }

  const totalPaginas = Math.ceil(dados.count / ITENS_POR_PAGINA);
  return { totalPaginas, livros };
}
```

Aqui está o **coração da transformação de dados**:

1. **`await buscarDados(...)`** (Cap. 14) — pede a página à API usando nossa
   função genérica. Montamos a URL com a query string por template string.
2. Percorremos `dados.results` (o array cru da API) com `for...of` e, para cada
   `item`, montamos um **objeto limpo** só com o que a tela usa: `id`, `titulo`,
   `autores` (já como texto), `imagem` (já como URL). Isso é o padrão
   "array de objetos" (Cap. 2) sendo **construído** a partir de outro.
3. **`Math.ceil(dados.count / ITENS_POR_PAGINA)`** calcula o total de páginas: o
   total de livros dividido por 32, arredondado para cima (`Math.ceil`).
4. **`return { totalPaginas, livros }`** devolve um objeto com as duas
   informações que a tela precisa.

E a função que busca o **detalhe** de um livro:

```js
async function buscarDetalheLivro(id) {
  const dados = await buscarDados(`${BASE_URL}/${id}/`);

  return {
    titulo: dados.title,
    autores: extrairAutores(dados.authors),
    imagem: extrairImagem(dados.formats),
    descricao: dados.summaries.length ? dados.summaries[0] : "Sem descrição disponível.",
    assuntos: dados.subjects.length ? dados.subjects.slice(0, 5).join(", ") : "Não informado"
  };
}

export { buscarListaLivros, buscarDetalheLivro };
```

Repare no `dados.subjects.slice(0, 5).join(", ")` — exatamente o `slice` que
prometemos no Capítulo 2! Pegamos só os **cinco primeiros** assuntos e os
juntamos num texto. E, de novo, ternários (`? :`) garantem valores padrão quando
os campos vêm vazios. Por fim, **exportação nomeada** (Cap. 8) das duas funções.

> 💡 **Nos bastidores — por que "traduzir" os dados?**
> Poderíamos usar `item.title`, `item.authors[0].name` etc. direto na página.
> Mas aí a página ficaria **acoplada** ao formato da Gutendex. Se um dia
> trocássemos de API, ou a API mudasse seus campos, teríamos que caçar mudanças
> por toda a tela. Com a camada de serviço "traduzindo" para o **nosso** formato
> (`titulo`, `autores`, `imagem`), a página nunca precisa saber de onde os dados
> vêm. Essa independência é ouro em projetos reais.

---

## 16.3 A página: estrutura e o modal

Agora a interface. Crie `src/js/components/paginas/livros.js`. Ela é maior, então
vamos por partes. Primeiro os imports e uma variável de estado:

```js
// src/js/components/paginas/livros.js
import { buscarListaLivros, buscarDetalheLivro } from "../../services/livros.js";
import { mostrarCarregando, esconderCarregando } from "../../services/loading.js";

let paginaAtual = 1;
```

A variável `paginaAtual` guarda em que página da listagem estamos. Ela vive
**fora** das funções (no escopo do módulo) para que todas possam lê-la e
alterá-la — é o "estado" da nossa tela.

A função principal monta a estrutura (incluindo o modal, que fica escondido) e
registra os eventos:

```js
async function telaLivros(app) {
  paginaAtual = 1;
  app.innerHTML = `
    <div id="modalDetalhes" class="bem-modal bem-modal--hidden">
      <div class="bem-modal__dialog">
        <div class="bem-modal__header">
          <h2 class="bem-modal__title" id="detalheTitulo"></h2>
          <button id="fecharDetalhes" class="bem-modal__close">&times;</button>
        </div>
        <div class="bem-modal__body" id="detalheCorpo"></div>
      </div>
    </div>

    <div class="bem-container">
      <h1 class="bem-mb-md">Livros</h1>
      <div id="listaLivros" class="bem-grid-auto"></div>
      <div class="bem-flex bem-justify-center bem-items-center bem-gap-md bem-mt-lg">
        <button id="paginaAnterior" class="bem-btn bem-btn--outline">Anterior</button>
        <span id="indicadorPagina"></span>
        <button id="proximaPagina" class="bem-btn bem-btn--outline">Próxima</button>
      </div>
    </div>
  `;

  document.getElementById("fecharDetalhes").addEventListener("click", fecharDetalhes);
  document.getElementById("paginaAnterior").addEventListener("click", () => mudarPagina(-1));
  document.getElementById("proximaPagina").addEventListener("click", () => mudarPagina(1));

  await renderizarPagina();
}
```

Pontos-chave:

- O **modal** (`#modalDetalhes`) já está no HTML, mas nasce com a classe
  `bem-modal--hidden`, que o esconde (Cap. 11). Vamos mostrá-lo/escondê-lo com
  `classList` (Cap. 5).
- `#listaLivros` é o contêiner da grade (`bem-grid-auto`, Cap. 11) onde os cards
  entrarão.
- Os botões **Anterior/Próxima** e o `#indicadorPagina` formam a paginação.
- Registramos os eventos: fechar o modal, e os cliques de paginação chamando
  `mudarPagina(-1)` e `mudarPagina(1)` — arrow functions como callbacks (Cap. 3).
- Ao final, `await renderizarPagina()` busca e desenha a primeira página.

---

## 16.4 Renderizando a lista

A função que busca os livros da página atual e monta os cards:

```js
async function renderizarPagina() {
  mostrarCarregando();
  try {
    const { totalPaginas, livros } = await buscarListaLivros(paginaAtual);

    let html = "";
    for (const livro of livros) {
      html += `
        <div class="bem-card" data-id="${livro.id}">
          <img src="${livro.imagem}" alt="${livro.titulo}" class="bem-card__image">
          <div class="bem-card__body">
            <h3 class="bem-card__title">${livro.titulo}</h3>
            <p class="bem-card__subtitle">${livro.autores}</p>
          </div>
        </div>
      `;
    }
    document.getElementById("listaLivros").innerHTML = html;

    document.getElementById("indicadorPagina").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    document.getElementById("paginaAnterior").disabled = paginaAtual <= 1;
    document.getElementById("proximaPagina").disabled = paginaAtual >= totalPaginas;

    for (const card of document.querySelectorAll("#listaLivros .bem-card")) {
      card.addEventListener("click", () => abrirDetalhes(card.dataset.id));
    }
  } catch (erro) {
    console.error(erro);
  } finally {
    esconderCarregando();
  }
}
```

Reconheça os padrões — todos já são seus:

- O padrão **carregando → try → catch → finally** (Cap. 14), idêntico ao da tela
  de CEP.
- **Desestruturação**: `const { totalPaginas, livros } = await ...` extrai as duas
  propriedades do objeto retornado pelo serviço, de uma vez. (É um atalho para
  `const resultado = ...; const livros = resultado.livros;`.)
- O padrão de renderização **`let html = ""` → `for...of` com `html += ...` →
  `innerHTML`** (Cap. 5), montando um card por livro.
- **`data-id="${livro.id}"`** — guardamos o id do livro num "atributo de dados" no
  próprio card. Vamos lê-lo depois, no clique, com `card.dataset.id`. É a forma
  elegante de vincular um dado a um elemento do DOM.
- **`.disabled = paginaAtual <= 1`** — o botão "Anterior" é desabilitado na
  primeira página; o "Próxima", na última. Um booleano (Cap. 1) controlando o
  estado do botão.
- **`indicadorPagina.textContent`** mostra "Página X de Y".
- No fim, percorremos todos os cards com **`querySelectorAll`** (Cap. 5) e, em
  cada um, registramos o clique que abre os detalhes daquele livro
  (`card.dataset.id`).

> ⚠️ **Cuidado — registre os eventos DEPOIS de criar os cards**
> Os cards só existem no DOM **depois** de `innerHTML = html`. Por isso o
> `addEventListener` em cada card vem **depois** dessa linha. Tentar adicionar o
> evento antes de o card existir simplesmente não funcionaria — não há o que
> escutar. Sempre: desenhe primeiro, escute depois.

---

## 16.5 Mudando de página

A paginação é surpreendentemente simples graças à nossa variável de estado:

```js
async function mudarPagina(direcao) {
  paginaAtual += direcao;
  if (paginaAtual < 1) paginaAtual = 1;
  await renderizarPagina();
}
```

`direcao` é `+1` (Próxima) ou `-1` (Anterior). Somamos à `paginaAtual`,
garantimos que ela não fique abaixo de 1, e mandamos **re-renderizar**. Como
`renderizarPagina` sempre usa `paginaAtual` para buscar, a tela se atualiza para
a nova página. Elegante: toda a lógica de paginação cabe em quatro linhas porque
o **estado** está centralizado numa variável.

---

## 16.6 Abrindo e fechando o modal de detalhes

Ao clicar num card, buscamos os detalhes daquele livro e os mostramos no modal:

```js
async function abrirDetalhes(id) {
  mostrarCarregando();
  try {
    const livro = await buscarDetalheLivro(id);

    document.getElementById("detalheTitulo").textContent = livro.titulo;
    document.getElementById("detalheCorpo").innerHTML = `
      <img src="${livro.imagem}" alt="${livro.titulo}" class="bem-card__image bem-max-w-xs bem-mx-auto">
      <p><strong>Assuntos:</strong> ${livro.assuntos}</p>
      <p>${livro.descricao}</p>
    `;

    document.getElementById("modalDetalhes").classList.remove("bem-modal--hidden");
  } catch (erro) {
    console.error(erro);
  } finally {
    esconderCarregando();
  }
}

function fecharDetalhes() {
  document.getElementById("modalDetalhes").classList.add("bem-modal--hidden");
}
```

- `abrirDetalhes(id)` recebe o id (que veio do `data-id` do card), busca o
  detalhe pelo serviço, preenche o título e o corpo do modal, e — o pulo do gato
  — **`classList.remove("bem-modal--hidden")`** (Cap. 5 e 11) faz o modal
  **aparecer**.
- `fecharDetalhes()` faz o oposto: **`classList.add("bem-modal--hidden")`**
  esconde o modal de novo.

Repare que **não criamos nem destruímos** o modal — ele existe o tempo todo,
apenas alternamos sua visibilidade com uma classe CSS. Simples e eficiente,
exatamente como prometido no Capítulo 5.

Por fim, o export e a inclusão nas rotas:

```js
export default {
  url: "#livros",
  label: "Livros",
  pagina: telaLivros
};
```

```js
// em rotas.js
import livros from "../paginas/livros.js";
// ...adicione 'livros' ao array roteador
```

---

## 16.7 A tela inteira, em uma frase por função

Vale um resumo de alto nível de como as peças conversam:

| Função              | Responsabilidade                                        |
|---------------------|---------------------------------------------------------|
| `telaLivros`        | monta a estrutura + modal e liga os eventos             |
| `renderizarPagina`  | busca a página atual e desenha os cards + paginação     |
| `mudarPagina`       | ajusta `paginaAtual` e manda re-renderizar              |
| `abrirDetalhes`     | busca o detalhe de um livro e mostra o modal            |
| `fecharDetalhes`    | esconde o modal                                         |
| `buscarListaLivros` | *(serviço)* traz e limpa a lista da API                 |
| `buscarDetalheLivro`| *(serviço)* traz e limpa o detalhe da API               |

Cada função faz **uma coisa**. Essa divisão é o que torna uma tela complexa
compreensível. Se algo der errado na paginação, você sabe onde olhar
(`mudarPagina`); se o modal não abre, o problema está em `abrirDetalhes`. Código
organizado é código depurável.

---

## Recapitulando

- Separe **serviço** (busca e limpa os dados) de **página** (exibe) — a página
  nunca precisa conhecer o formato cru da API.
- O serviço **transforma** o array cru da API num array de objetos limpos,
  usando funções auxiliares, `for...of`, `.join()` e `.slice()`.
- A página usa uma **variável de estado** (`paginaAtual`) para controlar a
  paginação.
- Renderização segue o padrão **`let html = ""` + `for...of` + `innerHTML`**;
  vinculamos dados aos elementos com **`data-id`** / `dataset`.
- Botões são desabilitados com um **booleano** (`disabled = paginaAtual <= 1`).
- O **modal** existe sempre e é alternado com **`classList`
  add/remove("bem-modal--hidden")`**.
- Sempre **desenhe primeiro, registre eventos depois**.

---

> **Exercícios do Capítulo 16**
>
> 1. Construa as duas camadas (serviço + página) e confirme: a grade de livros
>    carrega, a paginação funciona e o modal abre/fecha.
> 2. Troque o `TERMO_PADRAO` de `"fiction"` para outro tema (ex.: `"children"`) e
>    veja a listagem mudar.
> 3. Faça o modal **também** fechar ao clicar fora do diálogo (na área escura de
>    fundo). Dica: registre um clique no `#modalDetalhes` e cheque se
>    `event.target` é o próprio fundo.
> 4. Adicione um tratamento visual para quando um livro **não tem imagem**
>    (`livro.imagem === ""`): mostre uma imagem placeholder no lugar.
> 5. **Reflexão:** explique por que registrar o `addEventListener` dos cards
>    precisa acontecer **depois** de `innerHTML = html`.
