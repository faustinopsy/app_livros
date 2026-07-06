# Capítulo 3 — Funções

Se as variáveis são caixas e os arrays/objetos são coleções, as **funções** são
as **máquinas** do seu programa. Uma função é um bloco de código reutilizável
que executa uma tarefa específica. Em vez de repetir o mesmo trecho dez vezes,
você o escreve uma vez dentro de uma função e a "chama" quando precisar.

Funções são o coração da **modularização** — a arte de quebrar um problema
grande em pedaços pequenos e organizados. E é justamente isso que faz uma SPA
funcionar: **cada página do App Livros será uma função**.

---

## 3.1 Anatomia de uma função

Declaramos uma função com a palavra-chave `function`, damos um nome a ela e
colocamos o código entre chaves:

```js
function saudar() {
  console.log("Olá! Bem-vindo ao curso.");
}
```

Isso apenas **define** a função — nada acontece ainda. Para executá-la, temos de
**chamá-la** (ou "invocá-la") pelo nome seguido de parênteses:

```js
saudar(); // agora sim: imprime "Olá! Bem-vindo ao curso."
```

Pense na função como uma receita de bolo: escrever a receita não faz o bolo;
você precisa **executá-la**.

---

## 3.2 Parâmetros e retorno

Funções ficam realmente úteis quando recebem **entradas** (parâmetros) e
devolvem **saídas** (retorno). Vamos ver os quatro cenários, do mais simples ao
mais completo.

### Sem parâmetros e sem retorno

```js
function somar() {
  console.log(5 + 3); // sempre soma os mesmos números
}
somar(); // 8
```

Limitada: só sabe somar 5 e 3.

### Com parâmetros, sem retorno

```js
function somar(num1, num2) {
  console.log(num1 + num2);
}
somar(10, 7); // 17
```

Agora é flexível — recebe os números de fora. `num1` e `num2` são os
**parâmetros** (os nomes na definição); `10` e `7` são os **argumentos** (os
valores reais na chamada).

### Com parâmetros e com retorno

O `console.log` só **mostra** um valor. Na maioria das vezes, queremos que a
função **devolva** um resultado para continuarmos usando. Para isso existe o
`return`:

```js
function somar(num1, num2) {
  return num1 + num2;
}

const resultado = somar(5, 4);
console.log(resultado); // 9
```

A diferença é enorme: com `return`, o valor "sai" da função e pode ser guardado
numa variável, usado em outra conta, passado adiante...

> ⚠️ **Cuidado**
> Assim que o JavaScript encontra um `return`, ele **encerra** a função na hora.
> Qualquer código depois do `return` (na mesma linha de execução) é ignorado.
> Se uma função não tem `return`, ela devolve `undefined`.

---

## 3.3 Funções de expressão (guardadas em variáveis)

Em JavaScript, funções são "valores de primeira classe": podem ser guardadas em
variáveis, passadas como argumento e retornadas por outras funções. Quando
atribuímos uma função a uma variável, temos uma **função de expressão**:

```js
const soma = function (num1, num2) {
  return num1 + num2;
};

soma(6, 4); // 10
```

Repare que a função, aqui, **não tem nome próprio** — chamamos isso de **função
anônima**. Quem tem nome é a variável `soma`.

---

## 3.4 Funções anônimas e callbacks

Uma **função anônima** é uma função sem nome, usada "na hora". O caso mais comum
é passá-la como **argumento** de outra função. Uma função que é passada como
argumento para ser executada depois chama-se **callback** ("função de retorno de
chamada").

```js
function primeira(callback) {
  const nome = "Gabriel";
  callback(nome); // executa a função que recebeu
}

primeira(function (nome) {
  console.log("Olá, " + nome);
});
// imprime: Olá, Gabriel
```

O conceito parece abstrato agora, mas é **absolutamente central**. Veja um
exemplo que você vai usar o tempo todo:

```js
botao.addEventListener("click", function () {
  console.log("Você clicou!");
});
```

Aqui, `addEventListener` é uma função que recebe **dois argumentos**: o nome do
evento (`"click"`) e um **callback** — a função anônima que deve rodar *quando*
o clique acontecer. Você não chama essa função; você a **entrega** ao navegador,
que a chamará no momento certo.

> 🧩 **Montando o quebra-cabeça**
> Callbacks estão em todo o App Livros. Cada botão, cada formulário, cada card
> clicável usa `addEventListener` com um callback. Exemplo real da tela de
> livros:
> ```js
> document.getElementById("proximaPagina")
>         .addEventListener("click", () => mudarPagina(1));
> ```
> E, no Capítulo 12, veremos que os callbacks também são a **base histórica do
> assincronismo** — a forma como o JavaScript lidava com tarefas demoradas antes
> das Promises.

---

## 3.5 Arrow functions (funções de seta)

O JavaScript moderno (a partir do ES6, 2015) trouxe uma sintaxe mais curta para
funções: as **arrow functions**, batizadas assim pela seta `=>`.

Compare:

```js
// função de expressão tradicional
const somar = function (a, b) {
  return a + b;
};

// a mesma coisa, como arrow function
const somar = (a, b) => {
  return a + b;
};
```

E há atalhos poderosos quando a função só tem uma expressão:

- Se o corpo é um **único `return`**, podemos remover as chaves e a palavra
  `return` (o retorno passa a ser implícito):

  ```js
  const somar = (a, b) => a + b;
  const ehPar = (x) => x % 2 === 0;
  ```

- Se há **um único parâmetro**, os parênteses são opcionais:

  ```js
  const dobro = x => x * 2;
  ```

Resumindo as regras da arrow function:

- Não precisa da palavra `function`.
- Com corpo de uma linha, não precisa de `{ }` nem de `return`.
- Com um só parâmetro, não precisa de `( )`.

> ⚠️ **Cuidado**
> Se você abrir as chaves `{ }`, o `return` volta a ser **obrigatório**:
> ```js
> const somar = (a, b) => { a + b; };      // ❌ retorna undefined!
> const somar = (a, b) => { return a + b; }; // ✅
> const somar = (a, b) => a + b;             // ✅ (sem chaves)
> ```

> 🧩 **Montando o quebra-cabeça**
> Arrow functions curtas aparecem por todo o projeto, principalmente como
> callbacks enxutos:
> ```js
> botao.addEventListener("click", () => mudarPagina(-1));
> const links = itens.map(item => `<li>...${item.label}...</li>`);
> ```
> Aquele `() =>` significa "uma função sem parâmetros que faz o seguinte". É a
> forma mais concisa de escrever um callback.

---

## 3.6 Escopo e hoisting

O **escopo** é a região do código onde uma variável ou função "existe" e pode
ser usada. Variáveis declaradas dentro de uma função só valem dentro dela — isso
evita que os nomes de uma parte do programa colidam com os de outra.

```js
function calcular() {
  const interno = 42; // só existe aqui dentro
  console.log(interno);
}
calcular();
console.log(interno); // ❌ erro: interno is not defined
```

O **hoisting** ("içamento") é um comportamento do JavaScript que "eleva" as
declarações de funções para o topo do escopo antes de rodar o código. Por isso é
possível **chamar uma função declarada com `function` antes** de sua definição:

```js
soma(6, 4); // funciona! → 10

function soma(a, b) {
  return a + b;
}
```

> ⚠️ **Cuidado**
> O hoisting **completo** só vale para funções declaradas com `function`. Com
> funções de expressão (`const soma = function...` ou arrow), a variável ainda
> não recebeu a função no momento da chamada antecipada, e você recebe um erro.
> Regra prática: **declare antes de usar** e você nunca terá surpresas.

---

## 3.7 Funções recursivas

Uma função que **chama a si mesma** é chamada de recursiva. A recursão é uma
alternativa aos loops: ambas repetem código, e ambas precisam de uma **condição
de parada** para não rodar para sempre.

```js
function contar(x) {
  console.log(x);
  if (x >= 10) {
    return; // condição de parada
  }
  contar(x + 1); // chama a si mesma com o próximo valor
}
contar(0); // imprime 0, 1, 2, ..., 10
```

Sem o `if (x >= 10) return`, teríamos uma **recursão infinita** e o programa
travaria. Guarde a ideia: *toda recursão precisa de uma saída*.

---

## 3.8 Closures

Este é um conceito mais avançado, mas vale conhecer. O JavaScript permite
**aninhar** funções (uma dentro da outra), e a função interna tem acesso às
variáveis da função externa — **mesmo depois** de a externa já ter terminado.
Esse "acesso preservado" chama-se **closure** (fechamento).

```js
const pessoa = function (nome) {
  const getNome = function () {
    return nome; // a interna "lembra" do nome da externa
  };
  return getNome; // devolve a função interna
};

const aluno = pessoa("Gabriel");
console.log(aluno()); // "Gabriel"
```

Mesmo depois de `pessoa("Gabriel")` terminar, a função `getNome` continua
"lembrando" que `nome` era `"Gabriel"`. Isso é uma closure.

> 💡 **Nos bastidores**
> Closures são a base de muitos padrões avançados (fábricas de funções, dados
> "privados", memoização). Você não precisa dominá-las agora, mas vai reencontrar
> o conceito ao longo da sua carreira. Por ora, basta entender: *funções internas
> enxergam as variáveis das externas.*

---

## 3.9 Por que isso tudo importa para a SPA?

Tudo o que vimos aqui converge para uma ideia simples e poderosa que
sustentará o projeto inteiro:

> **Cada página do App Livros será uma função que devolve (ou monta) o HTML
> daquela página.**

Veja uma prévia — não precisa entender cada detalhe, apenas reconhecer os
conceitos deste capítulo:

```js
function home(app) {
  const paginaInicial = `<h1>Esta é a página Inicial</h1>`;
  app.innerHTML = paginaInicial;
}

export default {
  url: "#home",
  label: "Home",
  pagina: home  // a função guardada como valor de uma propriedade!
}
```

Repare: `home` é uma função com um parâmetro (`app`); ela monta um HTML com
template string; e é **guardada como valor** dentro de um objeto (`pagina:
home`). Cada conceito deste capítulo — parâmetros, funções como valores,
template strings — está ali. É por isso que estudamos funções antes de tocar na
interface.

---

## Recapitulando

- Uma **função** empacota um trecho de código reutilizável; você a **define** e
  depois a **chama** com `( )`.
- **Parâmetros** são entradas; **`return`** é a saída.
- Funções são **valores**: podem ser guardadas em variáveis (função de
  expressão) e passadas como argumento (**callback**).
- **Arrow functions** (`=>`) são a forma curta e moderna, ótimas para callbacks.
- **Escopo** limita onde os nomes existem; **hoisting** eleva declarações de
  `function`.
- **Recursão** é uma função que se chama (com condição de parada); **closures**
  preservam o acesso às variáveis externas.

---

> **Exercícios do Capítulo 3**
>
> 1. **A calculadora:** crie quatro funções — `somar`, `subtrair`, `multiplicar`
>    e `dividir` — cada uma recebendo dois números e **retornando** o resultado.
>    Teste todas.
> 2. Reescreva as quatro funções do exercício 1 como **arrow functions** de uma
>    linha só.
> 3. Crie uma função `saudacao(nome)` que **retorna** (não imprime) a string
>    `` `Olá, ${nome}!` ``. Guarde o retorno numa variável e só então imprima.
> 4. **Callback na prática:** crie uma função `processar(valor, callback)` que
>    executa `callback(valor)`. Chame-a passando uma função anônima que imprime
>    o valor em maiúsculas (dica: `texto.toUpperCase()`).
> 5. **Recursão:** escreva uma função recursiva `contagemRegressiva(n)` que
>    imprime de `n` até 0.
> 6. Explique, com suas palavras, a diferença entre **parâmetro** e
>    **argumento**.
