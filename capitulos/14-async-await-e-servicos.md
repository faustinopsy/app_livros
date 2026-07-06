# Capítulo 14 — `async`/`await` e a camada de serviços

As Promises com `.then()` já são um enorme avanço sobre os callbacks. Mas o
JavaScript moderno oferece uma sintaxe ainda mais limpa: o **`async`/`await`**.
Com ela, código assíncrono passa a **parecer** código síncrono comum — fácil de
ler de cima para baixo. Neste capítulo dominamos essa sintaxe e a usamos para
construir a **camada de serviços** do App Livros: o arquivo `api.js`, que
centraliza toda a comunicação com a internet.

---

## 14.1 As palavras-chave `async` e `await`

Duas palavras trabalham juntas:

- **`async`** vai antes de uma função. Ela marca a função como assíncrona — e uma
  função `async` **sempre retorna uma Promise** automaticamente.
- **`await`** vai antes de uma Promise, **dentro** de uma função `async`. Ela
  **pausa** a função até a Promise resolver, e devolve o valor resolvido. É como
  dizer "espere aqui até isso ficar pronto, e me dê o resultado".

> ⚠️ **Cuidado**
> O `await` **só pode ser usado dentro de uma função `async`**. Usá-lo fora dá
> erro de sintaxe. Regra de ouro: viu `await`, a função ao redor precisa ser
> `async`.

---

## 14.2 O mesmo `fetch`, agora legível

Vamos reescrever a requisição do capítulo anterior — primeiro com `.then()`,
depois com `async/await` — para você ver a diferença lado a lado.

**Com `.then()` (Capítulo 13):**

```js
function buscarDados() {
  fetch("https://viacep.com.br/ws/01001000/json/")
    .then((resposta) => resposta.json())
    .then((dados) => console.log(dados))
    .catch((erro) => console.error(erro));
}
```

**Com `async/await` (agora):**

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

Compare. A versão `async/await`:

- Lê-se de **cima para baixo**, como código comum. `await fetch(...)` "espera" a
  resposta e a guarda em `resposta`; `await resposta.json()` espera a conversão e
  guarda em `dados`. Nada de encadear `.then()`.
- Usa **`try/catch`** para tratar erros. O `try` envolve o código que pode
  falhar; o `catch` pega qualquer erro que aconteça ali dentro. É o mesmo papel
  do `.catch()`, mas com uma cara mais familiar e única para todos os `await`.

> 💡 **Nos bastidores**
> Por baixo dos panos, `async/await` **é** Promises — é apenas uma forma mais
> agradável de escrevê-las (o que chamamos de "açúcar sintático"). O `await`
> continua fazendo o trabalho de esperar a Promise resolver; ele só esconde o
> `.then()` de você. Por isso foi importante entender Promises antes: o
> `async/await` não é mágica, é conveniência.

---

## 14.3 O padrão `try/catch/finally`

O tratamento de erros com `async/await` tem três blocos possíveis:

```js
try {
  // código que pode dar errado (as operações com await)
} catch (erro) {
  // roda SE algo no try falhar
} finally {
  // roda SEMPRE, dando certo ou errado
}
```

O **`finally`** é especialmente útil para "limpeza" — algo que deve acontecer
independentemente do resultado. O exemplo perfeito, que usaremos muito: esconder
o indicador de "Carregando...".

```js
async function carregarAlgo() {
  mostrarCarregando();          // liga o "Carregando..."
  try {
    const dados = await buscarDados(url);
    // usa os dados...
  } catch (erro) {
    console.error(erro);        // trata a falha
  } finally {
    esconderCarregando();       // desliga o "Carregando...", SEMPRE
  }
}
```

Se colocássemos `esconderCarregando()` só no `try`, ele não rodaria em caso de
erro, e o "Carregando..." ficaria eternamente girando na tela. O `finally`
garante que ele sempre suma. Esse padrão — **mostrar carregando → try → catch →
finally esconde carregando** — se repete em **todas** as telas de API do App
Livros. Guarde-o bem.

---

## 14.4 Construindo a camada de serviços: `api.js`

Chegou a hora de aplicar tudo isso ao projeto de forma profissional. Em vez de
espalhar `fetch` por todas as páginas, vamos **centralizar** a comunicação com a
internet numa "camada de serviços". O primeiro e mais importante arquivo é uma
função genérica de requisição.

Crie a pasta `src/js/services/` e, dentro, o arquivo `api.js`:

```js
// src/js/services/api.js
async function buscarDados(url) {
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao chamar ${url}`);
  }

  return resposta.json();
}

export default buscarDados;
```

Pequena, mas poderosa. Vamos entendê-la:

- É uma função **`async`** que recebe uma **`url`** qualquer como parâmetro
  (Cap. 3). Genérica: serve para **qualquer** API.
- **`await fetch(url)`** dispara a requisição e espera a resposta.
- A checagem **`if (!resposta.ok)`** (do Capítulo 13!) lança um erro se o
  servidor respondeu com falha (404, 500...). Assim, quem chamar essa função
  receberá o erro no seu próprio `catch`.
- **`return resposta.json()`** devolve os dados já convertidos em objeto. Como a
  função é `async`, esse retorno vira uma Promise que o chamador vai `await`.

> 🧩 **Montando o quebra-cabeça**
> Este arquivinho é a **espinha dorsal** de todo o consumo de dados do App
> Livros. **Toda** requisição — CEP, livros, personagens — passa por ele. Isso é
> o princípio DRY (Cap. 9) aplicado ao acesso a dados: a lógica de "fazer a
> requisição e checar erro" existe em **um único lugar**. Se um dia precisarmos
> mudar como as requisições funcionam (adicionar um cabeçalho, um log, um token),
> mudamos aqui e todo o projeto se beneficia.

---

## 14.5 O indicador de carregamento: `loading.js`

Já que toda tela de API vai mostrar um "Carregando...", vale criar um pequeno
serviço para isso também. O App Livros usa a biblioteca **SweetAlert2** (um
popup bonito). Crie `src/js/services/loading.js`:

```js
// src/js/services/loading.js
function mostrarCarregando() {
  Swal.fire({
    didOpen: () => Swal.showLoading()
  });
}

function esconderCarregando() {
  Swal.close();
}

export { mostrarCarregando, esconderCarregando };
```

- `mostrarCarregando()` abre o popup com uma animação de carregamento.
- `esconderCarregando()` fecha o popup.
- Exportamos as **duas** funções com **exportação nomeada** (Cap. 8), pois o
  arquivo oferece mais de uma coisa.

Para o `Swal` existir, incluímos a biblioteca no `index.html` (via CDN), no
`<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
```

> 💡 **Nos bastidores — por que uma camada de serviços?**
> Repare no padrão de arquitetura que está nascendo. Vamos ter duas famílias de
> arquivos:
> - **`components/paginas/`** — cuidam da **interface** (o que o usuário vê).
> - **`services/`** — cuidam dos **dados** (conversa com a internet, formatação).
>
> Essa separação — "quem desenha" versus "quem busca dados" — é uma das ideias
> mais valiosas do curso. Ela mantém cada arquivo focado, testável e fácil de
> mudar. É o mesmo princípio que sustenta aplicações profissionais gigantes.

---

## 14.6 Antevendo o uso

Nos próximos três capítulos, vamos escrever serviços específicos (para CEP, para
livros, para personagens) que **usam** o `buscarDados` genérico, e páginas que
**usam** esses serviços. A cadeia de dependências ficará assim:

```
página (livros.js)
   usa →  serviço específico (services/livros.js)
             usa →  função genérica (services/api.js)
                       usa →  fetch (navegador)
                                usa →  a API na internet
```

Cada camada tem uma responsabilidade única e conversa apenas com a vizinha. É
organização em estado puro. E tudo é sustentado pelo `async/await` que você
acabou de dominar.

> 🧩 **Montando o quebra-cabeça**
> Um exemplo concreto do que vem por aí (Cap. 16). Repare como o `await` e o
> `buscarDados` se combinam naturalmente:
> ```js
> async function buscarListaLivros(pagina) {
>   const dados = await buscarDados(`${BASE_URL}/?search=fiction&page=${pagina}`);
>   // ...transforma 'dados' no formato que a tela precisa...
> }
> ```
> Você já entende cada pedaço dessa linha. Falta só juntá-los numa tela
> completa.

---

## Recapitulando

- **`async`** marca uma função assíncrona (que sempre retorna uma Promise);
  **`await`** pausa até uma Promise resolver e devolve o valor.
- `await` só funciona **dentro** de funções `async`.
- `async/await` deixa o código assíncrono com cara de síncrono, lido de cima
  para baixo — é "açúcar sintático" sobre Promises.
- Trate erros com **`try/catch`**; use **`finally`** para limpeza que deve rodar
  sempre (como esconder o "Carregando...").
- A função genérica **`api.js`** (`buscarDados`) centraliza toda requisição do
  projeto, com a checagem `if (!resposta.ok)`.
- A **camada de serviços** separa "quem busca dados" de "quem desenha a tela" —
  uma arquitetura limpa e escalável.

---

> **Exercícios do Capítulo 14**
>
> 1. Reescreva a função `buscarDados` do Capítulo 13 (versão com `.then()`)
>    usando `async/await` e `try/catch`.
> 2. Crie o arquivo `services/api.js` com a função genérica `buscarDados` e teste
>    no Console importando-a e chamando com a URL da ViaCEP.
> 3. Adicione um `finally` a uma função `async` que imprime "Requisição
>    finalizada" — e confirme que ele roda tanto no sucesso quanto no erro.
> 4. Explique por que centralizar as requisições em `api.js` é uma aplicação do
>    princípio **DRY** (Cap. 9).
> 5. **Reflexão:** descreva, com suas palavras, a diferença de papéis entre a
>    pasta `components/paginas/` e a pasta `services/`.
