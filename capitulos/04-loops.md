# Capítulo 4 — Loops: repetição com controle

Computadores são incansáveis: eles fazem a mesma coisa milhões de vezes sem
reclamar. Os **loops** (laços de repetição) são a estrutura que nos permite
aproveitar isso — executar um bloco de código repetidas vezes sem escrevê-lo
repetidas vezes.

No App Livros, os loops são o que transforma **dados em tela**: percorremos um
array de livros e, para cada livro, montamos um card. Percorremos a lista de
rotas e, para cada rota, montamos um item de menu. Sem loops, teríamos que
escrever cada card na mão. Vamos dominá-los.

---

## 4.1 O loop `for`

O `for` é o loop mais conhecido. Ele é ideal quando você **sabe quantas vezes**
quer repetir. Sua estrutura tem três partes, separadas por ponto e vírgula:

```js
for (inicialização; condição; incremento) {
  // código executado a cada repetição
}
```

- **Inicialização:** roda uma vez, no começo. Normalmente cria um contador.
- **Condição:** testada **antes** de cada volta. Enquanto for `true`, o loop
  continua.
- **Incremento:** roda ao **fim** de cada volta. Normalmente aumenta o contador.

```js
for (let i = 1; i <= 10; i++) {
  console.log(i); // imprime 1, 2, 3, ..., 10
}
```

Leia assim: *"comece com `i` valendo 1; enquanto `i` for menor ou igual a 10,
execute o bloco; ao final de cada volta, some 1 em `i`."*

> 💡 **Nos bastidores — o `i++`**
> `i++` é um atalho para `i = i + 1`. Existe também `i--` (diminui 1),
> `i += 2` (soma 2), `soma += i` (soma o valor de `i` à variável `soma`). Você
> verá todos eles.

### Acumulando um valor

Um uso clássico é somar tudo:

```js
let soma = 0;
for (let i = 1; i <= 10; i++) {
  soma += i; // vai acumulando: 1, depois 3, depois 6...
}
console.log(soma); // 55
```

---

## 4.2 Percorrendo um array com `for`

Como o índice de um array vai de `0` até `length - 1`, o `for` casa
perfeitamente com arrays:

```js
let lista = [1, 2, 3, 4, 5, 6];

for (let i = 0; i < lista.length; i++) {
  console.log(lista[i]);
}
```

Repare em dois detalhes cruciais:

- Começamos em `i = 0` (o primeiro índice).
- A condição é `i < lista.length` (com `<`, **não** `<=`), porque o último
  índice válido é `length - 1`.

> ⚠️ **Cuidado**
> Se você usar `i <= lista.length`, na última volta `lista[i]` será `undefined`,
> porque essa posição não existe. Esse é o famoso erro *"off by one"* (erro de
> um a mais). Para percorrer arrays, a fórmula é sempre
> `i = 0; i < lista.length; i++`.

---

## 4.3 Interrompendo e pulando: `break` e `continue`

Às vezes queremos parar o loop no meio ou pular uma volta específica.

### `break` — para o loop imediatamente

```js
let lista = [1, 2, 3, 4, 5, 6];

for (let i = 0; i < lista.length; i++) {
  if (lista[i] === 4) {
    break; // encontrou o 4? para tudo.
  }
  console.log(lista[i]); // imprime 1, 2, 3 e para
}
```

### `continue` — pula para a próxima volta

```js
let lista = [1, 2, 3, 4, 5, 6];

for (let i = 0; i < lista.length; i++) {
  if (lista[i] % 2 === 0) {
    continue; // é par? pula esta volta.
  }
  console.log(lista[i]); // imprime só os ímpares: 1, 3, 5
}
```

A diferença: `break` **encerra** o loop; `continue` apenas **abandona a volta
atual** e segue para a próxima.

---

## 4.4 O `for...of` — percorrendo valores (ES6)

O `for` clássico exige controlar o índice manualmente. Na maioria das vezes, só
queremos os **valores** do array, não os índices. Para isso existe o `for...of`,
introduzido no ES6:

```js
let frutas = ["maçã", "pêra", "morango"];

for (const fruta of frutas) {
  console.log(fruta); // maçã, pêra, morango
}
```

Muito mais limpo! A cada volta, `fruta` já é o **próprio valor** — sem colchetes,
sem índice, sem `.length`. O `for...of` funciona com qualquer coisa "iterável":
arrays, strings, e outras estruturas.

O `break` e o `continue` funcionam normalmente aqui:

```js
for (const fruta of frutas) {
  if (fruta === "pêra") break;
  console.log(fruta); // imprime só "maçã"
}
```

> 🧩 **Montando o quebra-cabeça**
> O `for...of` é o loop preferido do App Livros. Quase toda renderização usa
> este padrão — percorrer os dados e ir montando o HTML numa string:
> ```js
> let html = "";
> for (const livro of livros) {
>   html += `<div class="bem-card">
>              <h3>${livro.titulo}</h3>
>              <p>${livro.autores}</p>
>            </div>`;
> }
> listaLivros.innerHTML = html;
> ```
> Guarde esse padrão: **`let html = ""` → laço que faz `html += ...` → joga no
> `innerHTML`**. Ele se repete em várias telas do projeto.

---

## 4.5 O `for...in` — percorrendo as chaves de um objeto

Enquanto o `for...of` percorre **valores** de arrays, o `for...in` percorre as
**chaves** (propriedades) de um objeto:

```js
let carro = {
  marca: "Toyota",
  modelo: "Corolla",
  ano: 2021
};

for (const prop in carro) {
  console.log(`${prop}: ${carro[prop]}`);
}
// marca: Toyota
// modelo: Corolla
// ano: 2021
```

Note o uso da **notação de colchetes** aqui: `carro[prop]`. Como `prop` é uma
variável que guarda o nome da propriedade (um texto que muda a cada volta), não
podemos usar `carro.prop` (isso procuraria uma propriedade literalmente chamada
"prop"). Por isso os colchetes são obrigatórios. Lembra do Capítulo 2? Este é o
caso em que a notação de colchetes brilha.

> ⚠️ **Cuidado — não confunda!**
> - `for...**of**` → **valores** → use com **arrays**.
> - `for...**in**` → **chaves** → use com **objetos**.
>
> Usar `for...in` num array até funciona, mas devolve os índices como texto
> ("0", "1", "2") e pode trazer surpresas. Para arrays, prefira `for...of` ou o
> `for` clássico.

---

## 4.6 `while` e `do...while`

O `for` é ótimo quando sabemos o número de repetições. Mas e quando **não
sabemos**? Aí entram o `while` e o `do...while`.

### `while` — repita **enquanto** a condição for verdadeira

A condição é testada **antes** de cada volta:

```js
let contador = 1;
let limite = 10;

while (contador <= limite) {
  console.log(contador);
  contador++; // ESSENCIAL: sem isso, loop infinito!
}
```

> ⚠️ **Cuidado — o loop infinito**
> Num `while`, é você quem deve garantir que a condição um dia se torne `false`.
> Se esquecer de atualizar a variável (`contador++`), o loop nunca termina e a
> aba do navegador congela. Sempre pergunte: *"o que faz essa condição virar
> falsa?"*

### `do...while` — execute **pelo menos uma vez**

O `do...while` é irmão do `while`, mas com uma diferença crucial: ele executa o
bloco **primeiro** e só então testa a condição. Ou seja, roda **no mínimo uma
vez**, mesmo que a condição já comece falsa.

```js
let entrada;
do {
  entrada = prompt("Digite 'ok' para continuar:");
} while (entrada !== "ok");
```

Perfeito para situações do tipo "peça algo ao usuário e repita até ele acertar"
— você precisa perguntar pelo menos uma vez.

---

## 4.7 Escolhendo o loop certo

| Situação                                            | Loop recomendado |
|-----------------------------------------------------|------------------|
| Sei o número de repetições / preciso do índice      | `for`            |
| Quero os **valores** de um array                    | `for...of`       |
| Quero as **chaves** de um objeto                    | `for...in`       |
| Repito até uma condição, sem saber quantas vezes    | `while`          |
| Preciso executar pelo menos uma vez                 | `do...while`     |

No dia a dia do App Livros, o campeão é o **`for...of`** para percorrer dados, e
o **`for`** clássico quando precisamos do índice.

---

## Recapitulando

- O **`for`** repete um número conhecido de vezes, com contador.
- Para arrays, use `i = 0; i < lista.length; i++`.
- **`break`** encerra o loop; **`continue`** pula uma volta.
- **`for...of`** percorre **valores** (arrays); **`for...in`** percorre
  **chaves** (objetos).
- **`while`** repete enquanto uma condição vale; **`do...while`** garante ao
  menos uma execução.
- O padrão `let html = ""` + laço + `innerHTML` é o motor de renderização do
  nosso projeto.

---

> **Exercícios do Capítulo 4**
>
> 1. **Inverter um array:** dado `[1, 2, 3, 4, 5]`, use um `for` (começando do
>    fim) para criar um novo array `[5, 4, 3, 2, 1]`.
> 2. **Maior número:** dado `[5, 3, 9, 1, 6]`, use um `for` para encontrar e
>    imprimir o maior valor.
> 3. **Contar caracteres:** dada a string `"banana"`, use um `for...of` para
>    contar quantas vezes a letra `'a'` aparece.
> 4. **Números pares:** dado `N = 5`, use um `for` para gerar um array com os
>    primeiros N números pares: `[2, 4, 6, 8, 10]`.
> 5. **Percorrendo objeto:** dado um objeto `pessoa` com `nome`, `idade` e
>    `cidade`, use `for...in` para imprimir cada propriedade no formato
>    `"chave: valor"`.
> 6. **Simulando o projeto:** dado um array de objetos
>    `[{titulo:"A"}, {titulo:"B"}]`, use `for...of` para montar uma string HTML
>    `"<li>A</li><li>B</li>"` e imprima-a.
