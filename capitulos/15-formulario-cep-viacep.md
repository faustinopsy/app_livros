# Capítulo 15 — Formulário de cadastro com a API ViaCEP

Hora de colher os frutos. Com a camada de serviços pronta, vamos construir a
primeira tela que **conversa com a internet**: um formulário de cadastro que,
ao digitar o CEP, **busca e preenche o endereço automaticamente**. É um recurso
que você vê em lojas online o tempo todo — e vai implementá-lo do zero.

Esta tela junta praticamente tudo: DOM, eventos, `async/await`, a camada de
serviços e o indicador de carregamento.

---

## 15.1 O que vamos construir

A ideia é simples e encantadora: o usuário digita o CEP e **sai do campo**.
Nesse instante, disparamos uma consulta à API **ViaCEP** e preenchemos sozinhos
os campos de logradouro, bairro, cidade e estado.

O evento que detecta "o usuário saiu do campo" é o **`blur`** (Cap. 5). É o
gatilho perfeito: não precisamos de um botão "buscar" — a busca acontece
naturalmente quando o usuário termina de digitar o CEP e vai para o próximo
campo.

> 💡 **Nos bastidores — a API ViaCEP**
> A [ViaCEP](https://viacep.com.br) é uma API pública e gratuita que devolve
> endereços brasileiros a partir do CEP. A URL segue o padrão:
> ```
> https://viacep.com.br/ws/01001000/json/
> ```
> E a resposta é um JSON assim:
> ```json
> {
>   "cep": "01001-000",
>   "logradouro": "Praça da Sé",
>   "bairro": "Sé",
>   "localidade": "São Paulo",
>   "estado": "São Paulo"
> }
> ```
> Repare: é um **objeto** (Cap. 2), e vamos acessar `dados.logradouro`,
> `dados.bairro`, etc. Nada de novo — apenas dados vindos de longe.

---

## 15.2 Montando o HTML do formulário

Como toda página do App Livros, começamos com um módulo (Cap. 8) cuja função
monta o HTML. Crie `src/js/components/paginas/formCad.js` e comece pela
estrutura visual:

```js
// src/js/components/paginas/formCad.js
async function telaCadastro(app) {
  const formulario = `
    <form id="cadastroCliente" class="bem-form bem-grid-auto">
      <div class="bem-form__group">
        <label for="cep" class="bem-form__label">CEP</label>
        <input type="text" id="cep" class="bem-form__input">
      </div>
      <div class="bem-form__group">
        <label for="logradouro" class="bem-form__label">Logradouro</label>
        <input type="text" id="logradouro" class="bem-form__input">
      </div>
      <div class="bem-form__group">
        <label for="bairro" class="bem-form__label">Bairro</label>
        <input type="text" id="bairro" class="bem-form__input">
      </div>
      <div class="bem-form__group">
        <label for="localidade" class="bem-form__label">Localidade</label>
        <input type="text" id="localidade" class="bem-form__input">
      </div>
      <div class="bem-form__group">
        <label for="estado" class="bem-form__label">Estado</label>
        <input type="text" id="estado" class="bem-form__input">
      </div>
    </form>
  `;

  app.innerHTML = formulario;
  await capturarCep();
}
```

Nada de novo na estrutura: uma template string com o formulário, injetada no
`app`, seguida da chamada a `capturarCep()` — que vai registrar o evento. Note
que cada `<input>` tem um **`id`** claro (`cep`, `logradouro`, `bairro`...) —
vamos usar esses ids para preencher os campos com os dados que chegarem.

Assim como no formulário de contato (Cap. 8), primeiro **desenhamos** o HTML e só
**depois** registramos os eventos. O campo precisa existir na tela antes de
podermos escutá-lo.

---

## 15.3 O coração: capturando o CEP no `blur`

Agora a função que faz a mágica. No topo do arquivo, importamos os serviços que
construímos no capítulo anterior:

```js
import buscarDados from "../../services/api.js";
import { mostrarCarregando, esconderCarregando } from "../../services/loading.js";
```

Repare nos caminhos: `../../services/` significa "suba duas pastas e entre em
services" — de `components/paginas/` chegamos à raiz de `js/` e daí em
`services/`. E note as duas formas de import (Cap. 8): `buscarDados` é **default**
(sem chaves); as funções de loading são **nomeadas** (com chaves).

Agora a função `capturarCep`:

```js
async function capturarCep() {
  const campoCep = document.getElementById("cep");

  campoCep.addEventListener("blur", async (event) => {
    mostrarCarregando();
    try {
      const dados = await buscarDados(
        `https://viacep.com.br/ws/${event.target.value}/json/`
      );
      document.getElementById("logradouro").value = dados.logradouro;
      document.getElementById("bairro").value = dados.bairro;
      document.getElementById("localidade").value = dados.localidade;
      document.getElementById("estado").value = dados.estado;
    } catch (erro) {
      console.error(erro);
    } finally {
      esconderCarregando();
    }
  });
}
```

Vamos ler com atenção, porque este trecho é a síntese de todo o curso:

1. **`getElementById("cep")`** (Cap. 5) — pega o campo de CEP.
2. **`addEventListener("blur", ...)`** (Cap. 5) — escuta o momento em que o
   usuário **sai** do campo. O callback é uma **arrow function `async`** (Caps. 3
   e 14) — precisa ser `async` porque usa `await` lá dentro.
3. **`mostrarCarregando()`** (Cap. 14) — liga o indicador de carregamento antes
   da busca.
4. **`event.target.value`** (Cap. 5) — `event.target` é o campo de CEP, e
   `.value` é o que o usuário digitou. Interpolamos isso na URL com uma
   **template string** (Cap. 1).
5. **`await buscarDados(...)`** (Cap. 14) — chama nosso serviço genérico, que faz
   o `fetch`, checa erros e devolve os dados já como objeto.
6. **Preenchimento dos campos** — para cada campo do endereço, escrevemos no
   `.value` o valor correspondente do objeto `dados` (`dados.logradouro`,
   `dados.bairro`...). Escrever em `.value` **preenche** o campo na tela.
7. **`catch`** (Cap. 14) — se algo falhar (CEP inválido, sem internet),
   registramos o erro no console.
8. **`finally`** (Cap. 14) — o carregamento é escondido **sempre**, dando certo
   ou errado.

Por fim, exportamos o módulo no formato padrão de página:

```js
export default {
  url: "#cep",
  label: "Cadastro",
  pagina: telaCadastro
};
```

E, claro, adicionamos essa página ao array em `rotas.js` (Cap. 9):

```js
import telaCadastro from "../paginas/formCad.js";

const roteador = [
  home,
  telaCadastro,   // ← nova página
  sobre,
  servicos,
  contato,
];
```

Pronto! Como aprendemos no Capítulo 9, isso é **tudo** o que precisamos: a página
aparece no menu e funciona na navegação automaticamente. Teste: navegue até
"Cadastro", digite um CEP válido (ex.: `01001000`) e clique fora do campo. O
endereço se preenche sozinho, com um "Carregando..." no meio do caminho.

---

## 15.4 O fluxo completo, passo a passo

Vamos rastrear o que acontece quando o usuário digita `01001000` e sai do campo:

```
1. Usuário sai do campo CEP  →  dispara o evento "blur"
        │
2. O callback async roda; mostrarCarregando() abre o popup
        │
3. await buscarDados("https://viacep.com.br/ws/01001000/json/")
        │      (buscarDados faz fetch, checa resposta.ok, converte JSON)
        │
4. O código PAUSA no await, sem travar a página, até o servidor responder
        │
5. Chega o objeto: { logradouro: "Praça da Sé", bairro: "Sé", ... }
        │
6. Preenchemos cada input com dados.logradouro, dados.bairro, etc.
        │
7. finally: esconderCarregando() fecha o popup
        │
8. A tela mostra o endereço preenchido. 
```

Cada passo é um conceito que você já domina. Não há mágica — há engenharia bem
organizada em camadas.

> ⚠️ **Cuidado — validação fica de lição de casa**
> Nossa versão é didática e não valida a entrada. Se o usuário digitar um CEP
> mal formatado ou inexistente, a ViaCEP devolve `{ "erro": true }`, e os campos
> seriam preenchidos com `undefined`. Numa aplicação real, você checaria
> `if (dados.erro) { ... }` e avisaria o usuário. Fica como um ótimo exercício de
> aprimoramento (veja os exercícios).

---

## 15.5 Por que este capítulo é um marco

Pare e reconheça o tamanho do que você acabou de fazer. Sua aplicação agora:

- **Conversa com um servidor real** na internet;
- Faz isso **sem travar** a interface (assincronismo);
- **Reage a uma ação natural** do usuário (sair do campo);
- Dá **feedback visual** durante a espera (carregando);
- **Trata erros** com elegância (try/catch/finally);
- Reutiliza a **camada de serviços** (api.js) e se encaixa no **roteador** sem
  esforço.

Isso é uma funcionalidade de nível profissional, construída inteiramente com os
fundamentos que acumulamos capítulo a capítulo. Nos próximos dois capítulos,
vamos escalar essa mesma técnica para telas com **listas paginadas** e
**detalhes em modal**.

---

## Recapitulando

- O evento **`blur`** (sair de um campo) é o gatilho ideal para a busca de CEP —
  dispensa botão.
- A função de busca é uma **arrow function `async`**, porque usa `await` lá
  dentro.
- Lemos o valor digitado com **`event.target.value`** e o interpolamos na URL.
- Reutilizamos **`buscarDados`** (api.js) e o par
  **`mostrarCarregando`/`esconderCarregando`** (loading.js).
- Preenchemos os campos escrevendo no **`.value`** de cada input.
- O padrão **carregando → try → catch → finally esconde** aparece de novo — e vai
  se repetir.

---

> **Exercícios do Capítulo 15**
>
> 1. Construa a tela de cadastro completa e teste com pelo menos três CEPs
>    reais. Confirme o preenchimento automático e o "Carregando...".
> 2. **Validação:** adicione uma checagem `if (dados.erro) { ... }` que, em caso
>    de CEP inexistente, limpa os campos e mostra um alerta (`alert` ou
>    `Swal.fire`) avisando "CEP não encontrado".
> 3. Adicione um campo `número` e um `complemento` ao formulário (esses a ViaCEP
>    não preenche — ficam para o usuário digitar).
> 4. Troque o evento `blur` por `change` e observe se há diferença de
>    comportamento. Depois volte para `blur`.
> 5. **Reflexão:** por que o callback do `blur` precisa ser `async`? O que
>    aconteceria se removêssemos o `async` mas mantivéssemos o `await`?
