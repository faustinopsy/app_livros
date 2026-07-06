# Capítulo 8 — Componentização com ES Modules

No capítulo anterior, construímos uma SPA funcional — mas tudo amontoado em um
único `app.js`. Agora vamos aprender a técnica que mantém projetos organizados
por mais que cresçam: os **módulos**. Vamos quebrar aquele arquivão em vários
arquivos pequenos, cada um com uma responsabilidade única. Cada página vira um
**componente** independente.

Ao final, teremos a estrutura de pastas real do App Livros começando a tomar
forma.

---

## 8.1 O que são módulos e por que usá-los

Um **módulo** é simplesmente um arquivo JavaScript que **exporta**
funcionalidades (funções, objetos, variáveis) para que **outros arquivos possam
importá-las**. Em vez de um arquivo gigante, temos vários pequenos que colaboram.

Por que vale a pena?

1. **Organização** — código relacionado fica junto; fica fácil achar as coisas.
2. **Reutilização** — uma função útil pode ser importada em vários lugares.
3. **Isolamento** — cada módulo tem seu próprio escopo. Variáveis de um arquivo
   não "vazam" nem colidem com as de outro (adeus, bugs de variável global).
4. **Clareza** — cada arquivo tem um propósito, o que torna o projeto legível.

> 💡 **Nos bastidores**
> Antes dos módulos (padronizados no ES6, 2015), os desenvolvedores despejavam
> tudo no escopo global, e conflitos de nomes eram um pesadelo. Os ES Modules
> resolveram isso de vez. Toda ferramenta moderna (React, Vue, Node) é baseada
> neles. Aprender `import`/`export` aqui é aprender a base de todo o ecossistema.

---

## 8.2 Ativando os módulos no HTML

Para usar `import`/`export`, o navegador precisa ser avisado de que o script é um
módulo. Isso se faz com o atributo `type="module"` na tag `<script>`:

```html
<body>
  <header id="navbar"></header>
  <main id="app"></main>
  <script src="src/js/main.js" type="module"></script>
</body>
```

Duas mudanças em relação ao capítulo anterior:

- Adicionamos `type="module"` ao script.
- Renomeamos o arquivo de entrada para `main.js` e o colocamos em `src/js/`
  (começando a organização em pastas).
- Adicionamos um `<header id="navbar">` — o ponto de montagem do menu, que
  construiremos no próximo capítulo.

> ⚠️ **Cuidado — precisa de servidor!**
> Como avisamos no Capítulo 0: com `type="module"`, o projeto **exige** um
> servidor HTTP. Abrir o `index.html` com `file://` faz os `import` falharem com
> um erro de CORS. Use o **Live Server**. Se algo "parar de funcionar" agora, é
> quase sempre isso.

---

## 8.3 `export` e `import`: as duas formas

Há duas maneiras de exportar de um módulo.

### Exportação default (uma por arquivo)

Use quando o arquivo tem **uma coisa principal** a oferecer:

```js
// arquivo: saudacao.js
export default function saudacao(nome) {
  return `Olá, ${nome}!`;
}
```

```js
// arquivo: main.js
import saudacao from "./saudacao.js";
console.log(saudacao("Maria")); // "Olá, Maria!"
```

Na importação default, você **escolhe o nome** (não precisa ser igual) e **não
usa chaves**.

### Exportação nomeada (várias por arquivo)

Use quando o arquivo oferece **várias** funções:

```js
// arquivo: matematica.js
export function somar(a, b) { return a + b; }
export function subtrair(a, b) { return a - b; }
```

```js
// arquivo: main.js
import { somar, subtrair } from "./matematica.js";
console.log(somar(2, 3)); // 5
```

Na importação nomeada, você usa **chaves `{ }`** e os nomes **devem bater**
exatamente com os exportados.

Resumo:

| Tipo         | Exporta                        | Importa                          |
|--------------|--------------------------------|----------------------------------|
| **default**  | `export default funcao`        | `import qualquerNome from "..."` |
| **nomeada**  | `export function funcao() {}`  | `import { funcao } from "..."`   |

> 🧩 **Montando o quebra-cabeça**
> O App Livros usa as **duas** formas, cada uma no lugar certo:
> - **default** para cada **página** (uma página, um arquivo, um export
>   principal): `export default { url, label, pagina }`.
> - **nomeada** para os **serviços** que oferecem várias funções:
>   `export { buscarListaLivros, buscarDetalheLivro }`.
> Ao longo dos próximos capítulos você verá cada padrão nascer naturalmente.

> ⚠️ **Cuidado — a extensão `.js` é obrigatória**
> No navegador, os caminhos de import precisam da extensão completa:
> `import x from "./home.js"` — **não** `"./home"`. (Em ferramentas como o
> Node/bundlers isso é opcional, mas no navegador puro, não.) Repare também no
> `./` no começo: ele significa "na mesma pasta". Use `../` para "subir uma
> pasta".

---

## 8.4 Transformando cada página em um módulo

Agora a grande mudança de mentalidade. No Capítulo 7, cada página era uma
**string** solta. Vamos promovê-la a um **módulo próprio**, cuja página é uma
**função** (Cap. 3) que recebe o elemento `app` e injeta o conteúdo nele.

Crie a pasta `src/js/components/paginas/` e, dentro, o arquivo `home.js`:

```js
// src/js/components/paginas/home.js
async function home(app) {
  const paginaInicial = `<h1>Esta é a página Inicial</h1>`;
  app.innerHTML = paginaInicial;
}

export default {
  url: "#home",
  label: "Home",
  pagina: home
};
```

Pare e observe a genialidade dessa estrutura — ela é o **DNA de todo o
projeto**. Cada página exporta um **objeto** (Cap. 2) com três informações:

- **`url`** — o hash que ativa esta página (`"#home"`).
- **`label`** — o texto que aparecerá no menu (`"Home"`).
- **`pagina`** — a **função** que sabe desenhar esta página.

Ou seja, cada arquivo carrega tudo o que se precisa saber sobre uma página: seu
endereço, seu nome de menu e como desenhá-la. Isso vai nos permitir montar tanto
o roteador quanto o menu **automaticamente** a partir dessa lista.

Agora a página `sobre.js`, no mesmo formato:

```js
// src/js/components/paginas/sobre.js
function sobre(app) {
  const conteudo = `<h1>Esta é a página Sobre</h1>
    <p>Este site é um exemplo de SPA usando JavaScript puro</p>`;
  app.innerHTML = conteudo;
}

export default {
  url: "#sobre",
  label: "Sobre",
  pagina: sobre
};
```

> 💡 **Nos bastidores — por que `async`?**
> Você reparou que `home` é `async function`, mas `sobre` não. Marcamos as
> páginas como `async` (assíncronas) por **padronização e antecipação**:
> algumas páginas (Livros, Rick and Morty) vão precisar **esperar** dados de uma
> API antes de renderizar, e para isso usarão `await` (Capítulo 14). Deixar
> todas `async` desde já mantém a interface uniforme — o roteador poderá tratar
> qualquer página do mesmo jeito. Por ora, o `async` numa página simples não faz
> diferença nenhuma; é só preparação para o futuro.

---

## 8.5 Uma página com lógica: o formulário de contato

Páginas nem sempre são estáticas. Muitas precisam **reagir ao usuário** depois de
desenhadas. O módulo de página comporta isso perfeitamente: além de montar o
HTML, a função pode registrar eventos (Cap. 5). Vamos construir a página de
**contato**, que exibe um formulário e vai listando as mensagens enviadas.

Crie `src/js/components/paginas/contato.js`:

```js
// src/js/components/paginas/contato.js
async function contato(app) {
  const paginaDeContato = `
    <h1>Esta é a página Contato</h1>
    <form id="formulario-de-contato">
      <div>
        <label for="assunto">Assunto</label>
        <input type="text" name="assunto" id="assunto">
      </div>
      <div>
        <label for="email">E-mail</label>
        <input type="email" name="email" id="email">
      </div>
      <div>
        <label for="mensagem">Mensagem</label>
        <textarea name="mensagem" id="mensagem" rows="5"></textarea>
      </div>
      <button type="submit">Enviar</button>
    </form>
    <ul id="lista_de_contatos"></ul>
  `;

  app.innerHTML = paginaDeContato;
  await capturarFormulario();
}

async function capturarFormulario() {
  const formulario = document.getElementById("formulario-de-contato");

  formulario.addEventListener("submit", function (event) {
    event.preventDefault(); // impede o recarregamento (Cap. 5)

    const lista = document.getElementById("lista_de_contatos");
    const li = document.createElement("li");

    const assunto = event.target[0].value;
    const email = event.target[1].value;
    const mensagem = event.target[2].value;

    li.textContent = `Assunto: ${assunto} | E-mail: ${email} | Mensagem: ${mensagem}`;
    lista.appendChild(li);

    // limpa os campos após o envio
    event.target[0].value = "";
    event.target[1].value = "";
    event.target[2].value = "";
  });
}

export default {
  url: "#contato",
  label: "Contato",
  pagina: contato
};
```

Vamos destrinchar as ideias novas aqui, todas revisando o Capítulo 5:

- A função `contato` primeiro **desenha** o HTML (`innerHTML`) e **depois** chama
  `capturarFormulario()`. A ordem importa: o formulário precisa existir na tela
  antes de tentarmos "escutar" seus eventos.
- `capturarFormulario` registra um ouvinte de **`submit`** e chama
  **`event.preventDefault()`** — sem isso, o formulário recarregaria a página e
  quebraria a SPA.
- **`event.target`** é o próprio formulário que disparou o evento. `event.target[0]`,
  `[1]`, `[2]` são seus campos, na ordem em que aparecem — e `.value` lê o que
  foi digitado.
- Cada envio cria um `<li>` novo com **`createElement`** e o anexa à lista com
  **`appendChild`**.
- Por fim, esvaziamos os campos (`... .value = ""`) para o próximo envio.

> 💡 **Nos bastidores — duas formas de ler os campos**
> Usamos `event.target[0].value` (por posição). Há uma alternativa por id, mais
> explícita e legível: `document.getElementById("assunto").value`. As duas
> funcionam. A por id é menos frágil (não quebra se você reordenar os campos),
> mas a por índice é mais concisa. Você encontrará ambas em código real.

> 🧩 **Montando o quebra-cabeça**
> Esta página junta praticamente tudo o que vimos até aqui: **módulo** (este
> capítulo), **função** que desenha e outra que escuta (Cap. 3), **template
> string** com HTML (Cap. 1), **DOM e eventos** (Cap. 5). Se você entendeu o
> `contato.js`, você entendeu a essência de um "componente de página".

---

## 8.6 O `main.js` importando os módulos

Com as páginas viradas módulos, o `main.js` fica responsável por **juntá-las**.
Uma primeira versão (que vamos aprimorar nos próximos capítulos) seria:

```js
// src/js/main.js
import home from "./components/paginas/home.js";
import sobre from "./components/paginas/sobre.js";
import contato from "./components/paginas/contato.js";

const app = document.getElementById("app");

function renderizarRotaAtual() {
  const hash = window.location.hash || "#home";

  if (hash === home.url) {
    home.pagina(app);
  } else if (hash === sobre.url) {
    sobre.pagina(app);
  } else if (hash === contato.url) {
    contato.pagina(app);
  } else {
    app.innerHTML = "<h1>Página não encontrada (404)</h1>";
  }
}

renderizarRotaAtual();
window.addEventListener("hashchange", renderizarRotaAtual);
```

Repare que já é uma evolução do Capítulo 7: em vez de strings soltas,
comparamos com `home.url` e chamamos `home.pagina(app)` — usando as propriedades
do objeto exportado por cada módulo. O código ficou mais expressivo.

Mas... ainda temos aquele `if/else` que cresce a cada página, e ainda não temos
menu. Guarde essa incômoda sensação: ela é o combustível para os próximos dois
capítulos, onde eliminaremos a repetição de vez.

---

## Recapitulando

- **Módulos** são arquivos que **exportam** e **importam** funcionalidades,
  trazendo organização, reutilização, isolamento e clareza.
- Ative-os com `<script type="module">` — e lembre: **exige servidor**.
- **`export default`** (uma coisa principal) x **`export` nomeado** (várias
  coisas); no import, o default vai sem chaves e o nomeado com chaves.
- Cada **página** virou um módulo que exporta um objeto
  `{ url, label, pagina }`, onde `pagina` é a **função** que a desenha.
- Uma página pode ter **lógica** própria: desenha o HTML e depois registra
  eventos — como o formulário de contato.

---

> **Exercícios do Capítulo 8**
>
> 1. Converta a página "Serviços" do capítulo anterior num módulo
>    `servicos.js`, exportando `{ url: "#servicos", label: "Serviços", pagina }`.
> 2. Crie um módulo utilitário `saudacoes.js` com **duas exportações nomeadas**:
>    `bomDia()` e `boaNoite()`. Importe ambas no `main.js` e teste.
> 3. Reproduza a página de contato e teste: envie três mensagens e confirme que
>    elas aparecem na lista, sem a página recarregar.
> 4. No `contato.js`, troque a leitura por índice (`event.target[0].value`) pela
>    leitura por id (`document.getElementById("assunto").value`) e confirme que
>    continua funcionando.
> 5. **Reflexão:** por que a chamada `capturarFormulario()` precisa vir **depois**
>    de `app.innerHTML = ...`? O que aconteceria se invertêssemos a ordem?
