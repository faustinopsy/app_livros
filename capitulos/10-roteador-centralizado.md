# Capítulo 10 — Centralizando o roteamento

Nossa SPA já funciona muito bem: o menu se gera sozinho e a navegação percorre a
lista de rotas. Mas ainda há uma pequena ineficiência: a cada navegação,
percorremos o array inteiro com um `for...of` procurando a rota certa. Com
poucas páginas isso é irrelevante, mas é uma ótima oportunidade para aprender uma
técnica elegante e chegar à **versão definitiva** do `main.js` — exatamente como
ela existe no projeto real.

Neste capítulo transformamos a **lista** de rotas em um **mapa** de rotas.

---

## 10.1 Lista x Mapa: o problema da busca

Hoje, para achar a rota de `#contato`, fazemos assim:

```js
for (const rota of roteador) {
  if (rota.url === hash) {
    rota.pagina(app);
    return;
  }
}
```

Isso funciona, mas é uma **busca linear**: no pior caso, percorremos todas as
rotas até achar (ou não achar) a certa. É como procurar um contato no celular
rolando a lista inteira, um por um.

E se, em vez de uma lista, tivéssemos uma estrutura onde pudéssemos ir
**direto** à rota pelo seu hash? Como um dicionário: você abre na palavra que
quer, sem ler da primeira à última página. É isso que um **mapa de rotas** faz.

---

## 10.2 Construindo o mapa de rotas

A ideia: transformar o **array** de rotas em um **objeto** (Cap. 2) onde a
**chave** é o `url` da rota e o **valor** é a própria rota. Assim:

```js
// de um array...
[
  { url: "#home",  label: "Home",  pagina: home  },
  { url: "#sobre", label: "Sobre", pagina: sobre }
]

// ...para um objeto (mapa):
{
  "#home":  { url: "#home",  label: "Home",  pagina: home  },
  "#sobre": { url: "#sobre", label: "Sobre", pagina: sobre }
}
```

Com o mapa, buscar uma rota é instantâneo: `mapa["#sobre"]` já devolve a rota,
sem percorrer nada. Acessar uma propriedade de objeto por chave é uma operação
direta.

Vamos escrever uma função que faz essa transformação. Ela percorre o array
(Cap. 4) e vai preenchendo o objeto:

```js
function criarMapaDeRotas(rotas) {
  const mapa = {};
  for (const rota of rotas) {
    mapa[rota.url] = rota; // a chave é o url; o valor é a rota inteira
  }
  return mapa;
}
```

Repare no uso da **notação de colchetes** (`mapa[rota.url]`), do Capítulo 2: como
a chave (`rota.url`) está numa variável e muda a cada volta, não podemos usar a
notação de ponto. Os colchetes permitem usar o valor da variável como nome da
propriedade.

> 💡 **Nos bastidores**
> Fazemos essa conversão **uma única vez**, quando a aplicação carrega. A partir
> daí, todas as navegações usam o mapa pronto. É o clássico "gaste um pouco na
> preparação para economizar muito no uso repetido".

---

## 10.3 A página 404 como um objeto

E se o usuário digitar um hash que não existe? No mapa, `mapa["#inexistente"]`
devolve `undefined`. Precisamos de um plano B. Vamos criar uma "página" especial
de erro, no mesmo formato das outras (uma função que desenha algo em `app`):

```js
const paginaNaoEncontrada = {
  pagina: (app) => {
    app.innerHTML = "<div>Página não encontrada 404</div>";
  }
};
```

Note que ela é um objeto com uma propriedade `pagina` que é uma **arrow
function** (Cap. 3). Assim ela tem a mesma "cara" das rotas de verdade e pode ser
tratada do mesmo jeito. Essa uniformidade vai deixar o código de renderização
lindo.

---

## 10.4 A função de renderização definitiva

Agora juntamos tudo. A renderização pega o hash, busca a rota no mapa (ou usa a
404) e chama sua função `pagina`:

```js
async function renderizarRotaAtual() {
  const hash = window.location.hash || "#home";
  const rota = mapaDeRotas[hash] || paginaNaoEncontrada;
  await rota.pagina(app);
}
```

Três linhas, e cada uma vale ouro:

1. **`const hash = window.location.hash || "#home";`** — pega o hash atual, ou
   assume `#home` se estiver vazio (a rota padrão, Cap. 7).

2. **`const rota = mapaDeRotas[hash] || paginaNaoEncontrada;`** — busca a rota no
   mapa. Se não existir (`undefined`, que é "falso"), o `||` entrega a
   `paginaNaoEncontrada`. Aqui está o tratamento de 404, elegante e sem `if`.

3. **`await rota.pagina(app);`** — chama a função da página, passando o `app`.

> 💡 **Nos bastidores — por que `await` aqui?**
> Lembra que fizemos as páginas `async` no Capítulo 8? Como algumas vão buscar
> dados de APIs (e isso demora), a função `pagina` pode retornar uma *Promise*.
> O `await` (Capítulo 14) garante que, se a página for assíncrona, esperamos ela
> terminar. Para páginas simples, o `await` não atrapalha em nada. Colocá-lo
> aqui torna o roteador capaz de lidar com **qualquer** página — síncrona ou
> assíncrona — do mesmo jeito. É a padronização do Capítulo 8 dando lucro.

---

## 10.5 O `main.js` completo e final

Reunindo cada peça, este é o `main.js` **definitivo** do App Livros — o mesmo do
projeto real:

```js
// src/js/main.js
import navbar from "./components/navbar/navbar.js";
import roteador from "./components/rotas/rotas.js";

const ROTA_PADRAO = "#home";

const app = document.getElementById("app");
const mapaDeRotas = criarMapaDeRotas(roteador);
const paginaNaoEncontrada = {
  pagina: (app) => { app.innerHTML = "<div>Página não encontrada 404</div>"; }
};

function criarMapaDeRotas(rotas) {
  const mapa = {};
  for (const rota of rotas) {
    mapa[rota.url] = rota;
  }
  return mapa;
}

async function renderizarRotaAtual() {
  const hash = window.location.hash || ROTA_PADRAO;
  const rota = mapaDeRotas[hash] || paginaNaoEncontrada;
  await rota.pagina(app);
}

function iniciar() {
  navbar(roteador);
  renderizarRotaAtual();
  window.addEventListener("hashchange", renderizarRotaAtual);
}

iniciar();
```

Vamos ler o arquivo inteiro, de cima a baixo, como um mapa da aplicação:

- **Imports:** trazemos o menu (`navbar`) e a lista de rotas (`roteador`).
- **`ROTA_PADRAO`:** uma constante para a rota inicial. Usar uma constante
  nomeada (em vez de espalhar `"#home"` pelo código) é boa prática — se um dia
  mudar a home, muda num lugar só.
- **`app`:** o ponto de montagem principal, buscado uma vez.
- **`mapaDeRotas`:** o dicionário de rotas, criado na hora.
- **`paginaNaoEncontrada`:** o plano B para hashes inválidos.
- **`criarMapaDeRotas`:** a função que converte lista em mapa.
- **`renderizarRotaAtual`:** decide e desenha a página atual.
- **`iniciar`:** orquestra a inicialização — desenha o menu, renderiza a
  primeira página e passa a escutar o `hashchange`.
- **`iniciar()`:** dá a partida em tudo.

> ⚠️ **Cuidado — hoisting em ação**
> Repare que usamos `criarMapaDeRotas(roteador)` na linha do `const mapaDeRotas`,
> **antes** de a função aparecer no arquivo. Isso só funciona porque funções
> declaradas com `function` sofrem **hoisting** (Cap. 3) — são "içadas" para o
> topo. Se `criarMapaDeRotas` fosse uma arrow function guardada em `const`,
> daria erro. É um exemplo real de por que entender hoisting importa.

---

## 10.6 O ciclo de vida completo da navegação

Vamos rastrear, passo a passo, o que acontece quando o usuário clica em "Sobre".
Este é o resumo de **tudo** que construímos na Parte IV:

```
1. Usuário clica no link <a href="#sobre"> do menu
        │
2. O navegador muda window.location.hash para "#sobre" (sem recarregar!)
        │
3. A mudança dispara o evento "hashchange"
        │
4. O navegador chama renderizarRotaAtual() (nosso callback)
        │
5. A função lê o hash: "#sobre"
        │
6. Busca no mapa: mapaDeRotas["#sobre"] → a rota do Sobre
        │
7. Chama rota.pagina(app) → a função sobre(app)
        │
8. sobre(app) faz app.innerHTML = "<h1>Sobre</h1>..."
        │
9. A tela mostra a página Sobre. Fim.
```

Cada seta desse fluxo passa por um conceito que estudamos: eventos (Cap. 5),
hash (Cap. 6), funções e callbacks (Cap. 3), objetos e mapas (Cap. 2), DOM
(Cap. 5). **Você construiu um roteador de SPA do zero, entendendo cada peça.**
Isso é exatamente o que bibliotecas como o React Router fazem — só que agora não
é mágica para você.

---

## Recapitulando

- Um **mapa de rotas** (objeto cuja chave é o `url`) permite achar uma rota
  **instantaneamente**, sem percorrer a lista.
- `criarMapaDeRotas` converte o array em objeto usando a **notação de colchetes**.
- A **página 404** é modelada como um objeto com `pagina`, igual às demais —
  uniformidade que simplifica o código.
- `renderizarRotaAtual` resume tudo em três linhas, usando `||` para rota padrão
  e para o fallback 404, e `await` para suportar páginas assíncronas.
- O `main.js` final orquestra menu + render + escuta do `hashchange`.
- Você domina, agora, o **ciclo de vida completo** de uma navegação em SPA.

---

> **Exercícios do Capítulo 10**
>
> 1. Implemente o `main.js` final e confirme que a navegação continua
>    funcionando exatamente como antes — mas agora via mapa de rotas.
> 2. No Console, depois que a página carregar, digite `mapaDeRotas` para
>    inspecionar o objeto gerado. Confirme que as chaves são os hashes.
> 3. Digite um hash inexistente na barra (ex.: `#xyz`) e confirme que a página
>    404 aparece.
> 4. Explique por que `mapaDeRotas[hash] || paginaNaoEncontrada` trata o caso de
>    rota inexistente sem precisar de um `if`.
> 5. **Desafio:** o `for...of` do Capítulo 9 e o mapa deste capítulo produzem o
>    mesmo resultado visível. Escreva um parágrafo explicando a vantagem do mapa
>    e em que cenário (muitas rotas, muitas navegações) ela ficaria perceptível.
