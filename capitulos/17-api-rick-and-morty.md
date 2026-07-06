# Capítulo 17 — Reaproveitando o padrão: a API do Rick and Morty

Um dos maiores prazeres da programação bem-feita é quando você percebe que já
tem o padrão pronto e só precisa aplicá-lo de novo. Neste capítulo vamos
construir a tela do **Rick and Morty** — personagens de um desenho, com lista,
paginação e modal de detalhes. E você vai notar algo revelador: é
**praticamente idêntica** à tela de livros. Essa repetição não é preguiça — é a
prova de que criamos uma **arquitetura sólida e reutilizável**.

---

## 17.1 A mesma receita, outros ingredientes

Compare mentalmente com o capítulo anterior. A estrutura é a mesma:

- Uma camada de **serviço** que busca e limpa os dados.
- Uma **página** com variável de estado, renderização de cards, paginação e
  modal.
- Os mesmos padrões: `async/await`, `try/catch/finally`, `data-id`, `classList`.

O que muda? Só **os dados e os campos**. Livros têm `titulo` e `autores`;
personagens têm `nome`, `status` e `especie`. A "forma" da solução é idêntica.
Isso é o que chamamos de **padrão de projeto**: uma solução testada que você
reaplica em problemas semelhantes.

> 💡 **Nos bastidores — a API Rick and Morty**
> A [Rick and Morty API](https://rickandmortyapi.com) é gratuita e não exige
> cadastro. A lista de personagens vem de:
> ```
> https://rickandmortyapi.com/api/character?page=2
> ```
> A resposta traz `info` (com `pages`, o total de páginas — já calculado por
> eles!) e `results` (o array de personagens). E cada personagem tem campos
> **aninhados** como `origin.name` e `location.name` — lembra dos objetos
> aninhados do Capítulo 2? Chegou a hora de usá-los.

---

## 17.2 O serviço: `services/rickandmorty.js`

Crie `src/js/services/rickandmorty.js`. Note como ele é ainda mais simples que o
de livros, porque a API já entrega os dados de forma amigável:

```js
// src/js/services/rickandmorty.js
import buscarDados from "./api.js";

const BASE_URL = "https://rickandmortyapi.com/api/character";

async function buscarListaPersonagens(pagina) {
  const dados = await buscarDados(`${BASE_URL}?page=${pagina}`);

  const personagens = [];
  for (const item of dados.results) {
    personagens.push({
      id: item.id,
      nome: item.name,
      imagem: item.image,
      status: item.status,
      especie: item.species
    });
  }

  return { totalPaginas: dados.info.pages, personagens };
}

async function buscarDetalhePersonagem(id) {
  const dados = await buscarDados(`${BASE_URL}/${id}`);

  return {
    id: dados.id,
    nome: dados.name,
    imagem: dados.image,
    status: dados.status,
    especie: dados.species,
    genero: dados.gender,
    origem: dados.origin.name,
    localizacaoAtual: dados.location.name
  };
}

export { buscarListaPersonagens, buscarDetalhePersonagem };
```

Compare com `services/livros.js`. É a **mesma estrutura**:

- Importa o `buscarDados` genérico (Cap. 14).
- `buscarListaPersonagens` percorre `dados.results` com `for...of` e monta um
  array de objetos limpos.
- `buscarDetalhePersonagem` traz o detalhe de um personagem.
- Exportação nomeada das duas funções.

Duas diferenças dignas de nota:

1. **O total de páginas vem pronto:** `dados.info.pages`. Não precisamos calcular
   com `Math.ceil` como fizemos nos livros — cada API tem suas peculiaridades, e
   o serviço é justamente o lugar de lidar com elas.
2. **Objetos aninhados:** `dados.origin.name` e `dados.location.name`. Aqui está
   o Capítulo 2 em ação — "cavamos" dentro de um objeto que está dentro de outro
   objeto. `dados.origin` é um objeto; `.name` é a propriedade dentro dele. Nós
   achatamos isso para `origem` e `localizacaoAtual`, campos simples que a tela
   consumirá sem esforço.

> 🧩 **Montando o quebra-cabeça**
> Repare que a página **não faz ideia** de que os dados de origem estavam
> aninhados na API. Ela vai usar `personagem.origem`, um campo simples. Toda a
> complexidade do formato da API ficou contida no serviço. **É exatamente esse o
> propósito da camada de serviços** — e agora você viu o mesmo princípio
> funcionar para duas APIs diferentes, com formatos diferentes, sem a página
> perceber a diferença.

---

## 17.3 A página: `paginas/rickandmorty.js`

A página é um "gêmeo" da de livros. Crie
`src/js/components/paginas/rickandmorty.js`:

```js
// src/js/components/paginas/rickandmorty.js
import { buscarListaPersonagens, buscarDetalhePersonagem } from "../../services/rickandmorty.js";
import { mostrarCarregando, esconderCarregando } from "../../services/loading.js";

let paginaAtual = 1;

async function telaRickAndMorty(app) {
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
      <h1 class="bem-mb-md">Rick and Morty</h1>
      <div id="listaPersonagens" class="bem-grid-auto"></div>
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

async function mudarPagina(direcao) {
  paginaAtual += direcao;
  if (paginaAtual < 1) paginaAtual = 1;
  await renderizarPagina();
}

async function renderizarPagina() {
  mostrarCarregando();
  try {
    const { totalPaginas, personagens } = await buscarListaPersonagens(paginaAtual);

    let html = "";
    for (const personagem of personagens) {
      html += `
        <div class="bem-card" data-id="${personagem.id}">
          <img src="${personagem.imagem}" alt="${personagem.nome}" class="bem-card__image">
          <div class="bem-card__body">
            <h3 class="bem-card__title">${personagem.nome}</h3>
            <p class="bem-card__subtitle">${personagem.status} - ${personagem.especie}</p>
          </div>
        </div>
      `;
    }
    document.getElementById("listaPersonagens").innerHTML = html;

    document.getElementById("indicadorPagina").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    document.getElementById("paginaAnterior").disabled = paginaAtual <= 1;
    document.getElementById("proximaPagina").disabled = paginaAtual >= totalPaginas;

    for (const card of document.querySelectorAll("#listaPersonagens .bem-card")) {
      card.addEventListener("click", () => abrirDetalhes(card.dataset.id));
    }
  } catch (erro) {
    console.error(erro);
  } finally {
    esconderCarregando();
  }
}

async function abrirDetalhes(id) {
  mostrarCarregando();
  try {
    const personagem = await buscarDetalhePersonagem(id);

    document.getElementById("detalheTitulo").textContent = personagem.nome;
    document.getElementById("detalheCorpo").innerHTML = `
      <img src="${personagem.imagem}" alt="${personagem.nome}" class="bem-card__image bem-max-w-xs bem-mx-auto">
      <p><strong>Status:</strong> ${personagem.status}</p>
      <p><strong>Espécie:</strong> ${personagem.especie}</p>
      <p><strong>Gênero:</strong> ${personagem.genero}</p>
      <p><strong>Origem:</strong> ${personagem.origem}</p>
      <p><strong>Localização atual:</strong> ${personagem.localizacaoAtual}</p>
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

export default {
  url: "#rickandmorty",
  label: "Rick and Morty",
  pagina: telaRickAndMorty
};
```

Se você comparar este arquivo com o `livros.js` do capítulo anterior, verá que a
**estrutura é idêntica** — mudam apenas os nomes (`personagens` em vez de
`livros`, `#listaPersonagens` em vez de `#listaLivros`) e os campos exibidos no
card e no modal. Adicione a rota no `rotas.js` e a tela está no ar.

---

## 17.4 A lição mais importante: reconhecer padrões

Você pode estar pensando: "mas isso é código repetido, não é ruim?" É uma
pergunta excelente, e a resposta tem duas camadas.

**Primeiro:** repetir um padrão que você entende é infinitamente melhor do que
inventar uma solução diferente para cada tela. A consistência torna o projeto
previsível — quem entende a tela de livros entende a de personagens em segundos.

**Segundo:** o fato de as duas telas serem tão parecidas é um **sinal**. Em
projetos maiores, esse é o momento em que um desenvolvedor experiente pensa em
**abstrair** — criar uma função ou componente genérico "tela de listagem com
paginação e modal" que receba a fonte de dados e os campos como parâmetros. Não
faremos isso agora (seria um salto de complexidade), mas plantamos a semente: a
capacidade de **enxergar a repetição** é o primeiro passo para eliminá-la quando
valer a pena.

> 💡 **Nos bastidores — a regra dos três**
> Uma heurística famosa: na **primeira** vez, escreva a solução. Na **segunda**,
> tolere a duplicação (como fizemos aqui). Na **terceira**, abstraia. Duplicar
> cedo demais cria abstrações erradas; abstrair no momento certo, depois de ver o
> padrão se repetir, gera código realmente bom. Você acabou de viver a segunda
> ocorrência — e agora tem olhos para reconhecer a terceira.

---

## 17.5 O projeto completo

Com esta tela, o App Livros está **completo**. Vamos revisar a estrutura final de
arquivos que você construiu, capítulo a capítulo:

```
app_livros/
├── index.html                          # Cap. 7, 8, 11
├── src/
│   ├── css/microframework.css          # Cap. 11
│   └── js/
│       ├── main.js                     # Cap. 7 → 10 (roteador)
│       ├── components/
│       │   ├── navbar/navbar.js        # Cap. 9
│       │   ├── rotas/rotas.js          # Cap. 9
│       │   └── paginas/
│       │       ├── home.js             # Cap. 8
│       │       ├── sobre.js            # Cap. 8
│       │       ├── servicos.js         # Cap. 9
│       │       ├── contato.js          # Cap. 8
│       │       ├── formCad.js          # Cap. 15
│       │       ├── livros.js           # Cap. 16
│       │       └── rickandmorty.js     # Cap. 17
│       └── services/
│           ├── api.js                  # Cap. 14
│           ├── loading.js              # Cap. 14
│           ├── livros.js               # Cap. 16
│           └── rickandmorty.js         # Cap. 17
```

Cada arquivo dessa árvore tem uma responsabilidade clara, e você entende o
porquê de cada um. Isso é uma aplicação de verdade — e você a construiu peça por
peça, sem frameworks, entendendo cada linha. **Parabéns.**

---

## Recapitulando

- A tela do Rick and Morty **reaproveita o padrão** da tela de livros — só mudam
  os dados e os campos.
- Cada API tem particularidades (o total de páginas vinha pronto em `info.pages`;
  os dados vinham aninhados em `origin.name`), e o **serviço** é o lugar de
  lidar com elas.
- A página **nunca percebe** essas diferenças — a camada de serviços a protege do
  formato cru.
- Reconhecer a repetição é uma habilidade: aplique a **regra dos três** antes de
  abstrair.
- O projeto está **completo**: sete páginas, roteador, camada de serviços e CSS,
  tudo em JavaScript puro.

---

> **Exercícios do Capítulo 17**
>
> 1. Construa o serviço e a página do Rick and Morty e confirme que lista,
>    paginação e modal funcionam.
> 2. Adicione ao modal o campo `episódios` (dica: a API traz `episode`, um array
>    — mostre quantos episódios usando `.length`).
> 3. **Desafio de abstração:** liste, no papel, tudo o que a tela de livros e a
>    de personagens têm em comum. Desenhe a assinatura de uma função genérica
>    `criarTelaListagem(config)` que poderia gerar as duas.
> 4. Adicione um campo de **busca por nome** à tela (a API aceita
>    `?name=rick`). Um input, um evento, e passe o termo ao serviço.
> 5. **Reflexão:** em suas palavras, por que "código repetido que você entende" é
>    preferível a "uma solução criativa e diferente para cada tela"?
