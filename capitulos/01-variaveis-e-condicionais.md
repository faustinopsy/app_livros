# Capítulo 1 — Variáveis, tipos e decisões

Todo programa faz basicamente três coisas: **guarda informações**, **toma
decisões** com base nelas e **repete tarefas**. Neste capítulo cobrimos as duas
primeiras. A repetição fica para o Capítulo 4.

Abra o Console do navegador (`F12` → aba *Console*). Vamos experimentar tudo ao
vivo.

---

## 1.1 Variáveis: caixas com etiqueta

Uma **variável** é um espaço na memória onde guardamos um valor e ao qual damos
um nome. Pense numa caixa com uma etiqueta: a etiqueta é o nome, o conteúdo é o
valor.

Em JavaScript moderno declaramos variáveis com `let` e `const`:

```js
let idade = 18;
const nome = "Maria";
```

- **`let`** cria uma variável cujo valor **pode mudar** depois.
- **`const`** cria uma **constante**: depois de definido, o valor **não pode
  ser reatribuído**.

```js
let pontos = 10;
pontos = 20;        // ✅ permitido, pontos agora é 20

const pi = 3.14;
pi = 3;             // ❌ erro: Assignment to constant variable
```

> 💡 **Nos bastidores**
> Existe também a palavra `var`, mais antiga. Ela ainda funciona, mas tem
> comportamentos confusos de escopo (veremos "hoisting" no Capítulo 3). A regra
> prática moderna é: **use `const` por padrão** e troque para `let` apenas
> quando precisar reatribuir o valor. Evite `var`.

### Regras e boas práticas para nomes

- Não pode começar com número: `1nome` é inválido, `nome1` é válido.
- Não use espaços nem acentos. Use **camelCase**: `nomeDoUsuario`,
  `totalDePaginas`.
- Escolha nomes que **descrevem** o conteúdo. `x` não diz nada; `precoTotal`
  diz tudo.

---

## 1.2 Tipos de dados

O valor guardado numa variável tem um **tipo**. Os que mais usaremos:

| Tipo        | O que representa            | Exemplo                       |
|-------------|-----------------------------|-------------------------------|
| `string`    | texto                       | `"Maria"`, `'Olá'`, `` `oi` `` |
| `number`    | números (inteiros ou não)   | `18`, `3.14`, `-7`            |
| `boolean`   | verdadeiro ou falso         | `true`, `false`              |
| `undefined` | "sem valor definido"        | `let x;`                     |
| `null`      | "vazio intencional"         | `let y = null;`              |
| `object`    | coleção estruturada         | `{ nome: "Ana" }` (Cap. 2)   |
| `array`     | lista ordenada              | `[1, 2, 3]` (Cap. 2)         |

Você pode descobrir o tipo de qualquer valor com o operador `typeof`:

```js
typeof "Maria";   // "string"
typeof 18;        // "number"
typeof true;      // "boolean"
typeof undefined; // "undefined"
```

### Strings e template strings

Textos podem ser escritos com aspas simples (`'...'`) ou duplas (`"..."`). Mas
há uma terceira forma **muito importante** para nós: as *template strings*, com
crase (`` ` ``). Elas permitem **interpolar** valores dentro do texto usando
`${...}`:

```js
const nome = "Maria";
const idade = 28;

// jeito antigo, com concatenação (+):
console.log("Olá, " + nome + "! Você tem " + idade + " anos.");

// jeito moderno, com template string:
console.log(`Olá, ${nome}! Você tem ${idade} anos.`);
```

As duas linhas produzem o mesmo resultado, mas a segunda é bem mais legível. E
tem outra vantagem: a template string pode ocupar **várias linhas**.

> 🧩 **Montando o quebra-cabeça**
> Guarde bem as template strings. Mais para a frente, **toda a interface do App
> Livros** será construída com elas. Cada página vai retornar um texto gigante
> com HTML dentro, misturando marcação e valores dinâmicos com `${...}`. É o
> alicerce de tudo o que faremos no DOM.

---

## 1.3 Operadores de comparação

Para tomar decisões, precisamos **comparar** valores. As comparações resultam
sempre em um booleano (`true` ou `false`):

| Operador | Significado                       | Exemplo (`let a=5`)  | Resultado |
|----------|-----------------------------------|----------------------|-----------|
| `==`     | igual a (sem checar o tipo)       | `a == "5"`           | `true`    |
| `===`    | **igual a e do mesmo tipo**       | `a === "5"`          | `false`   |
| `!=`     | diferente de                      | `a != 3`             | `true`    |
| `!==`    | diferente estrito (valor ou tipo) | `a !== "5"`          | `true`    |
| `<`      | menor que                         | `a < 10`             | `true`    |
| `>`      | maior que                         | `a > 10`             | `false`   |
| `<=`     | menor ou igual                    | `a <= 5`             | `true`    |
| `>=`     | maior ou igual                    | `a >= 6`             | `false`   |

> ⚠️ **Cuidado — a diferença entre `==` e `===`**
> O `==` faz "conversão de tipo" antes de comparar, o que gera surpresas:
> `0 == ""` é `true`, `1 == true` é `true`. Isso confunde e esconde bugs.
> **Use sempre `===` e `!==`.** No projeto inteiro só usamos comparação
> estrita. Grave essa regra.

---

## 1.4 Condicionais: `if` / `else`

Condicionais são estruturas que testam se uma expressão é verdadeira e, com
base nisso, decidem qual bloco de código executar.

```js
let idade = 18;

if (idade >= 18) {
  console.log("Maior de idade.");
} else {
  console.log("Menor de idade.");
}
```

Lê-se: *"SE a idade for maior ou igual a 18, mostre 'Maior de idade';
SENÃO, mostre 'Menor de idade'."*

Quando há mais de duas possibilidades, encadeamos com `else if`:

```js
let nota = 7;

if (nota >= 9) {
  console.log("Excelente");
} else if (nota >= 7) {
  console.log("Aprovado");
} else if (nota >= 5) {
  console.log("Recuperação");
} else {
  console.log("Reprovado");
}
```

O JavaScript testa as condições **de cima para baixo** e para na primeira que
for verdadeira.

---

## 1.5 Operadores lógicos e a tabela verdade

Muitas vezes uma decisão depende de **mais de uma condição** ao mesmo tempo.
Para combiná-las usamos os operadores lógicos:

- **`&&` (E / AND):** verdadeiro apenas se **ambos** os lados forem verdadeiros.
- **`||` (OU / OR):** verdadeiro se **pelo menos um** lado for verdadeiro.
- **`!` (NÃO / NOT):** inverte o valor.

A **tabela verdade** resume todas as combinações possíveis:

| A       | B       | `A && B` | `A \|\| B` | `!A`    |
|---------|---------|----------|------------|---------|
| `true`  | `true`  | `true`   | `true`     | `false` |
| `true`  | `false` | `false`  | `true`     | `false` |
| `false` | `true`  | `false`  | `true`     | `true`  |
| `false` | `false` | `false`  | `false`    | `true`  |

Um exemplo clássico: uma pessoa só pode entrar no bar se tiver 18 anos **e**
possuir documento.

```js
let idade = 20;
let possuiDocumento = true;

if (idade >= 18 && possuiDocumento) {
  console.log("Pode entrar no bar.");
} else {
  console.log("Não pode entrar no bar.");
}
```

A tabela verdade nos ajuda a **prever** o comportamento antes mesmo de rodar o
código. Se a idade fosse 20 (`true`) mas `possuiDocumento` fosse `false`, a
linha do `&&` teria `true && false`, que é `false` — logo, não entra.

---

## 1.6 O operador ternário

Quando a decisão é simples ("se sim, um valor; se não, outro valor"), existe um
atalho: o **operador ternário**. Sua forma é:

```
condição ? valorSeVerdadeiro : valorSeFalso
```

```js
let idade = 20;
const podeEntrar = idade >= 18 ? "Pode entrar" : "Não pode entrar";
console.log(podeEntrar); // "Pode entrar"
```

Lê-se: *"idade é maior ou igual a 18? Se sim, 'Pode entrar'; senão, 'Não pode
entrar'."* O `?` é a pergunta, o `:` separa as duas respostas.

> 🧩 **Montando o quebra-cabeça**
> O ternário vai aparecer bastante no projeto para pequenas escolhas dentro do
> HTML. Por exemplo, na tela de livros decidimos se um botão de paginação fica
> desabilitado assim: `botao.disabled = paginaAtual <= 1;`. É a mesma ideia de
> decidir um valor a partir de uma condição.

---

## 1.7 `switch` / `case`

Quando comparamos **uma mesma variável** contra vários valores possíveis, uma
cadeia de `else if` fica cansativa. O `switch` organiza isso:

```js
let diaDaSemana = 3;
let mensagem;

switch (diaDaSemana) {
  case 1:
    mensagem = "Segunda-feira";
    break;
  case 2:
    mensagem = "Terça-feira";
    break;
  case 3:
    mensagem = "Quarta-feira";
    break;
  default:
    mensagem = "Outro dia";
}

console.log(mensagem); // "Quarta-feira"
```

Pontos de atenção:

- Cada `case` compara a expressão com um valor (usando comparação estrita).
- O **`break`** é essencial: sem ele, a execução "vaza" para o próximo caso.
- O **`default`** é opcional e roda quando nenhum caso corresponde.

> 💡 **Nos bastidores — `switch(true)`**
> Existe um truque elegante: usar `switch (true)` e colocar expressões
> booleanas completas em cada `case`. Isso permite condições combinadas, quase
> como um `if/else if`, mas mais organizado:
> ```js
> switch (true) {
>   case temperatura === "quente" && sol:
>     mensagem = "Dia de praia!";
>     break;
>   case temperatura === "frio":
>     mensagem = "Leve um casaco.";
>     break;
> }
> ```

---

## 1.8 Ligando os pontos com o projeto

Você deve estar se perguntando: *"o que decisões têm a ver com trocar de página
numa SPA?"* Tudo. Adiante, o **primeiro roteador** que vamos escrever será
literalmente uma cadeia de `if/else` decidindo qual conteúdo mostrar com base na
URL:

```js
const hash = window.location.hash;

if (hash === "#home") {
  app.innerHTML = home;
} else if (hash === "#sobre") {
  app.innerHTML = sobre;
} else if (hash === "#contato") {
  app.innerHTML = contato;
}
```

Não entenda tudo agora — repare apenas que é **exatamente** o `if/else` deste
capítulo, usando comparação estrita (`===`). Quando chegarmos lá, esse código
vai parecer familiar. Depois, no Capítulo 10, vamos aposentar esses `if` em
favor de uma solução mais elegante. Mas o começo é aqui.

---

## Recapitulando

- Declare variáveis com **`const`** (padrão) e **`let`** (quando mudar).
- Os tipos essenciais são `string`, `number`, `boolean`, além de `null` e
  `undefined`.
- **Template strings** (`` `...${valor}...` ``) serão a base de toda a nossa
  interface.
- Compare sempre com **`===`** e **`!==`**.
- Combine condições com **`&&`**, **`||`** e **`!`**, guiando-se pela **tabela
  verdade**.
- Decida com **`if/else`**, o **ternário** e o **`switch`**.

---

> **Exercícios do Capítulo 1**
>
> 1. Declare `const nome` com o seu nome e `let idade` com sua idade. Use uma
>    template string para imprimir: *"Olá, sou &lt;nome&gt; e tenho &lt;idade&gt;
>    anos."*
> 2. Escreva um `if/else if/else` que classifica uma nota (0 a 10) em
>    "Aprovado" (≥ 7), "Recuperação" (≥ 5) ou "Reprovado".
> 3. **Aluno aprovado (baseado na tabela verdade):** um aluno é aprovado se tem
>    nota mínima 7.0 **E** no máximo 20 faltas. Escreva o `if` e teste as quatro
>    combinações possíveis de (nota alta/baixa) × (faltas ok/altas).
> 4. **Segurança do banco:** o acesso só é liberado se o nome for válido **E** a
>    senha estiver correta. Simule com duas variáveis booleanas e imprima
>    "Acesso permitido" ou "Acesso negado".
> 5. Reescreva o exercício 2 usando `switch(true)`.
> 6. Transforme a decisão do exercício 4 em uma única linha com o operador
>    ternário.
