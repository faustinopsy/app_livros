# Capítulo 13 — Promises e o `fetch`

No capítulo anterior vimos o problema do "callback hell". A solução que a
linguagem criou é a **Promise** — um objeto que representa um resultado que
**ainda vai chegar**. Neste capítulo entendemos as Promises e, com elas,
fazemos nossa **primeira requisição de verdade a um servidor** usando o `fetch`.

É aqui que dados da internet começam a entrar na aplicação.

---

## 13.1 O que é uma Promise

Uma **Promise** ("promessa") é um objeto que representa a eventual conclusão (ou
falha) de uma operação assíncrona e seu valor resultante.

A analogia perfeita é a de um restaurante: quando você faz o pedido, o garçom te
dá uma **comanda**. A comanda **não é a comida** — é uma *promessa* de que a
comida vai chegar. Com ela na mão, você pode continuar sua conversa (o programa
segue). Quando a comida fica pronta, a promessa é **cumprida**. Se acabou o
ingrediente, a promessa é **rejeitada**.

Uma Promise está sempre em um de **três estados**:

- **Pendente** (*pending*): estado inicial; a operação ainda não terminou.
- **Resolvida** (*fulfilled*): a operação foi concluída **com sucesso**, e há um
  valor.
- **Rejeitada** (*rejected*): a operação **falhou**, e há um motivo (o erro).

Uma Promise começa pendente e, em algum momento, vira resolvida **ou** rejeitada
— e aí não muda mais.

---

## 13.2 Consumindo uma Promise: `.then()` e `.catch()`

Para reagir ao resultado de uma Promise, usamos dois métodos:

- **`.then(callback)`** — roda quando a Promise **resolve** (sucesso). Recebe o
  valor resultante.
- **`.catch(callback)`** — roda quando a Promise **rejeita** (erro). Recebe o
  motivo.

```js
minhaPromise
  .then((valor) => {
    console.log("Deu certo! Valor:", valor);
  })
  .catch((erro) => {
    console.error("Deu errado:", erro);
  });
```

Repare que os callbacks continuam aqui — mas em vez de aninhados, eles ficam
**encadeados** de cima para baixo. Já é mais legível que a pirâmide do callback
hell.

---

## 13.3 O `fetch`: buscando dados da web

Agora o momento que você esperava. O **`fetch`** é a função embutida no
navegador para fazer requisições HTTP — ou seja, **pedir dados a um servidor**.
E ele **retorna uma Promise** (afinal, a resposta demora a chegar).

Vamos fazer uma requisição real a uma API pública brasileira, a **ViaCEP**, que
devolve um endereço a partir de um CEP:

```js
const fetchPromise = fetch("https://viacep.com.br/ws/01001000/json/");

console.log(fetchPromise); // Promise { <pending> } — ainda pendente!

fetchPromise
  .then((resposta) => {
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    return resposta.json(); // converte a resposta em objeto JS
  })
  .then((dados) => {
    console.log(dados.localidade); // "São Paulo"
  })
  .catch((erro) => {
    console.error(`Não foi possível obter os dados: ${erro}`);
  });

console.log("Requisição iniciada…");
```

Observe a saída no Console:

```
Promise { <pending> }
Requisição iniciada…
São Paulo          ← chega por último, quando o servidor responde
```

"Requisição iniciada…" aparece **antes** de "São Paulo", confirmando que o
`fetch` não bloqueou o código — puro assincronismo do Capítulo 12.

### Por que dois `.then()`?

Uma sutileza importante do `fetch`:

1. O **primeiro `.then()`** recebe a **resposta** (`resposta`) — os cabeçalhos
   HTTP, o status, mas **ainda não o conteúdo**. Chamamos `resposta.json()` para
   extrair e converter o corpo (que também é assíncrono e devolve outra Promise).
2. O **segundo `.then()`** recebe finalmente os **dados** já convertidos em
   objeto JavaScript, prontos para usar.

> ⚠️ **Cuidado — `fetch` não rejeita em erro 404/500**
> Contraintuitivo: se o servidor responde com erro (404 "não encontrado", 500
> "erro interno"), o `fetch` **não** rejeita a Promise — ele considera que
> "recebeu uma resposta", ainda que de erro. Por isso checamos manualmente
> `if (!resposta.ok)` e lançamos um erro com `throw`. O `.catch()` só pega
> falhas de **rede** (sem internet, servidor fora do ar) — a menos que você jogue
> o erro você mesmo, como fizemos. Guarde essa checagem: ela vai reaparecer no
> nosso serviço de API.

> 💡 **Nos bastidores — o que é JSON?**
> **JSON** (JavaScript Object Notation) é o formato de texto universal para
> troca de dados na web. Ele se parece muito com um objeto JavaScript:
> `{ "cep": "01001-000", "localidade": "São Paulo" }`. As APIs devolvem texto
> em JSON, e o `resposta.json()` converte esse texto num objeto JS de verdade,
> que podemos acessar com `dados.localidade` — exatamente como qualquer objeto do
> Capítulo 2.

---

## 13.4 Criando a própria Promise (para entender por dentro)

Você raramente vai criar Promises do zero — o `fetch` já entrega uma pronta. Mas
criar uma manualmente ajuda a entender a mecânica. Uma Promise recebe uma função
com dois "gatilhos": `resolve` (para sucesso) e `reject` (para falha):

```js
const promessa = new Promise((resolve, reject) => {
  setTimeout(() => {
    const deuCerto = true;
    if (deuCerto) {
      resolve("Operação concluída com sucesso!"); // → dispara o .then()
    } else {
      reject("Falha na operação.");                // → dispara o .catch()
    }
  }, 1000);
});

promessa
  .then((mensagem) => console.log("Sucesso: " + mensagem))
  .catch((erro) => console.error("Erro: " + erro));
```

Aqui simulamos uma operação que demora 1 segundo (o `setTimeout`) e depois
"resolve" com sucesso. Trocando `deuCerto` para `false`, você veria o `.catch()`
disparar. É exatamente esse mecanismo que o `fetch` usa internamente.

---

## 13.5 O encadeamento resolve o callback hell

Lembra da pirâmide do capítulo anterior? Com Promises, aquelas operações
dependentes viram uma **corrente vertical**, muito mais legível:

```js
// em vez da pirâmide aninhada do callback hell...
buscarUsuario(id)
  .then((usuario) => buscarPedidos(usuario))
  .then((pedidos) => buscarDetalhes(pedidos))
  .then((detalhes) => calcularTotal(detalhes))
  .then((total) => console.log(total))
  .catch((erro) => console.error(erro)); // UM catch trata qualquer falha
```

Duas grandes vitórias sobre os callbacks:

1. A lógica flui **de cima para baixo**, não para a direita.
2. **Um único `.catch()`** no fim trata erros de **qualquer** etapa da corrente.
   Chega de tratar erro em cada nível.

Já é ótimo. Mas a linguagem foi além e criou uma forma de escrever isso que
parece código síncrono comum, sem nem os `.then()`. É o **async/await**, nosso
próximo (e definitivo) passo.

> 🧩 **Montando o quebra-cabeça**
> A checagem `if (!resposta.ok) throw new Error(...)` que vimos aqui será o
> coração da função genérica de requisição do App Livros — o arquivo
> `services/api.js`. Toda chamada de API do projeto passará por ela. E o
> `.then()`/`.catch()` deste capítulo será reescrito com `async/await` no
> próximo. Você está a um capítulo de buscar dados como um profissional.

---

## Recapitulando

- Uma **Promise** representa um resultado futuro; vive em três estados:
  **pendente**, **resolvida** ou **rejeitada**.
- Consumimos Promises com **`.then()`** (sucesso) e **`.catch()`** (erro).
- O **`fetch(url)`** faz requisições HTTP e **retorna uma Promise**.
- Com `fetch`, o primeiro `.then()` recebe a **resposta** e chama
  `resposta.json()`; o segundo recebe os **dados**.
- **`fetch` não rejeita** em erros HTTP (404/500) — cheque `resposta.ok`
  manualmente.
- O encadeamento de `.then()` resolve o callback hell: fluxo vertical e um só
  `.catch()`.

---

> **Exercícios do Capítulo 13**
>
> 1. No Console, faça um `fetch` para `https://viacep.com.br/ws/01001000/json/`,
>    encadeie os `.then()` e imprima a `localidade` e o `logradouro`.
> 2. Troque o CEP por um inválido (ex.: `00000000`) e observe o que a API
>    devolve. Depois force um erro de rede (desligue a internet) e veja o
>    `.catch()` disparar.
> 3. Crie uma Promise manual que resolve com `"Pronto!"` após 2 segundos usando
>    `setTimeout`, e imprima a mensagem no `.then()`.
> 4. Modifique a Promise do exercício 3 para **rejeitar** metade das vezes
>    (dica: `Math.random() > 0.5`) e trate o erro no `.catch()`.
> 5. Explique, com suas palavras, por que o `fetch` precisa de **dois**
>    `.then()` para chegar aos dados.
