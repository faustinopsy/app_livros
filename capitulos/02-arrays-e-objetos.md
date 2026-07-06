# Capítulo 2 — Arrays e Objetos

Uma variável guarda **um** valor. Mas o mundo real é feito de **coleções**: uma
lista de compras, os alunos de uma turma, os livros de uma estante. Para
representar isso, o JavaScript oferece duas estruturas fundamentais: os
**arrays** e os **objetos**. Domine essas duas e você terá a chave para
praticamente tudo o que faremos com dados no App Livros.

---

## 2.1 Arrays: coleções ordenadas

Um **array** é uma coleção **ordenada** de elementos. Imagine uma fila de
caixas, onde cada caixa guarda um item — que pode ser um número, um texto, outro
array ou até um objeto.

```js
const frutas = ["maçã", "pêra", "morango"];
```

Cada item ocupa uma **posição** (o "índice"), e a contagem **começa em zero**:

```
índice:     0        1         2
        ["maçã",  "pêra",  "morango"]
```

Para acessar um item, usamos colchetes com o índice:

```js
frutas[0]; // "maçã"
frutas[2]; // "morango"
frutas[3]; // undefined (essa posição não existe)
```

Duas propriedades úteis desde já:

```js
frutas.length;  // 3  → quantos elementos há
frutas[frutas.length - 1]; // "morango" → o último elemento
```

> ⚠️ **Cuidado**
> O índice do **último** elemento é sempre `length - 1`, nunca `length`. Como a
> contagem começa em 0, um array de 3 itens tem índices 0, 1 e 2. Esse é um dos
> erros mais comuns de quem começa.

---

## 2.2 Adicionando e removendo elementos

Arrays são dinâmicos: crescem e encolhem. Pense numa **fila de pessoas** — dá
para adicionar ou remover gente do início ou do fim.

### Adicionar

```js
const numeros = [1, 2, 3];

numeros.push(4);     // adiciona no FIM   → [1, 2, 3, 4]
numeros.unshift(0);  // adiciona no INÍCIO → [0, 1, 2, 3, 4]
```

### Remover

```js
const numeros = [0, 1, 2, 3, 4];

numeros.pop();    // remove do FIM e retorna 4    → [0, 1, 2, 3]
numeros.shift();  // remove do INÍCIO e retorna 0 → [1, 2, 3]
```

Um jeito de memorizar:

| Método       | Ponta que mexe | Efeito             |
|--------------|----------------|--------------------|
| `push()`     | fim            | adiciona           |
| `pop()`      | fim            | remove             |
| `unshift()`  | início         | adiciona           |
| `shift()`    | início         | remove             |

`pop()` e `shift()` **retornam** o elemento removido, então você pode guardá-lo:

```js
const atendido = fila.shift(); // remove o primeiro e guarda quem foi atendido
```

---

## 2.3 Copiando um pedaço: `slice()`

O método `slice(início, fim)` retorna uma **cópia** de um pedaço do array, do
índice `início` até **antes** do índice `fim` (o fim não é incluído). O array
original **não é alterado**.

```js
let numeros = [1, 2, 3, 4, 5];
let parte = numeros.slice(1, 3); // pega índices 1 e 2 → [2, 3]

console.log(parte);   // [2, 3]
console.log(numeros); // [1, 2, 3, 4, 5] (intacto)
```

> 🧩 **Montando o quebra-cabeça**
> O `slice` aparece de verdade no App Livros. No serviço de livros, a API
> devolve uma longa lista de assuntos de cada obra, e pegamos só os **cinco
> primeiros** para não poluir a tela:
> ```js
> dados.subjects.slice(0, 5).join(', ');
> ```
> Ou seja: "copie do índice 0 até antes do 5" e depois junte tudo num texto com
> vírgulas. Guarde essa linha — vamos reencontrá-la no Capítulo 16.

---

## 2.4 Objetos: coleções com etiquetas

Se o array é bom para uma **lista** de itens semelhantes, o **objeto** é ideal
para descrever **uma única coisa** com várias características.

Enquanto no array acessamos por posição numérica, no objeto acessamos por
**nome** (a "chave"). Objetos usam **chaves** `{ }`:

```js
const pessoa = {
  nome: "Maria",
  idade: 28,
  falar: function () {
    console.log("Olá, sou " + this.nome);
  }
};
```

Um objeto agrupa duas coisas:

- **Propriedades** (os dados): `nome` e `idade` — *"coisas que a pessoa tem"*.
- **Métodos** (comportamentos): `falar` — *"coisas que a pessoa faz"*. Um método
  nada mais é do que uma propriedade cujo valor é uma função.

> 💡 **Nos bastidores — o `this`**
> Dentro de `falar`, escrevemos `this.nome`. A palavra `this` se refere ao
> **próprio objeto** em que o método está. Então `this.nome` é o `"Maria"` do
> objeto atual. Por enquanto, basta saber que `this` é "eu mesmo, o objeto".

### Acessando propriedades

Há duas notações:

```js
pessoa.nome;      // notação de PONTO   → "Maria"
pessoa["idade"];  // notação de COLCHETE → 28
```

A notação de ponto é a mais comum e legível. A de colchetes é útil quando o nome
da propriedade está guardado numa variável (veremos isso com `for...in` no
Capítulo 4).

### Adicionando e modificando propriedades

Objetos também são dinâmicos:

```js
const pessoa = { nome: "Maria", idade: 28 };

pessoa.profissao = "Desenvolvedora"; // adiciona uma nova propriedade
pessoa.idade = 30;                   // modifica uma existente

console.log(pessoa);
// { nome: "Maria", idade: 30, profissao: "Desenvolvedora" }
```

---

## 2.5 O casamento perfeito: arrays de objetos

Aqui está a estrutura mais importante de todo o desenvolvimento web. Na prática,
quase sempre lidamos com **listas de coisas**, e cada "coisa" tem vários
atributos. A solução é um **array de objetos**:

```js
const livros = [
  { titulo: "PHP",        autor: "ABCD", ano: 1995 },
  { titulo: "JavaScript", autor: "A1B2", ano: 1995 },
  { titulo: "Python",     autor: "XYZ",  ano: 1991 }
];
```

Para acessar um dado específico, combinamos as duas notações: primeiro o índice
do array, depois a propriedade do objeto.

```js
livros[1].titulo; // "JavaScript"
livros[0].ano;    // 1995
livros[2].autor;  // "XYZ"
```

Leia com calma: `livros[1]` seleciona o **segundo objeto** da lista; o `.titulo`
pega a propriedade `titulo` **daquele** objeto.

> 🧩 **Montando o quebra-cabeça**
> Esta é, literalmente, a forma de todos os dados do App Livros. Alguns exemplos
> reais que vamos construir:
>
> **A lista de rotas** (o mapa de navegação da SPA) é um array de objetos:
> ```js
> const roteador = [
>   { url: "#home",  label: "Home",  pagina: home  },
>   { url: "#sobre", label: "Sobre", pagina: sobre },
>   // ...
> ];
> ```
>
> **Os cards de serviços** também:
> ```js
> const detalhes = [
>   { titulo: "Jogo das quartas", descricao: "...", imagem: "src/img/2002_1.webp" },
>   { titulo: "Jogo especial",    descricao: "...", imagem: "src/img/2002_2.jpg"  }
> ];
> ```
>
> **E os dados que vêm da API**: quando pedirmos a lista de livros à internet,
> vamos transformá-la exatamente neste formato:
> ```js
> livros.push({
>   id: item.id,
>   titulo: item.title,
>   autores: extrairAutores(item.authors),
>   imagem: extrairImagem(item.formats)
> });
> ```
>
> Ou seja: **tudo o que você vê na tela do App Livros nasce de um array de
> objetos.** Dominar esta seção é dominar metade do curso.

---

## 2.6 Objetos aninhados

Uma propriedade de um objeto pode ser... outro objeto. Isso forma estruturas
"aninhadas", muito comuns em dados vindos de APIs:

```js
const personagem = {
  nome: "Rick",
  origem: { name: "Earth (C-137)" },
  localizacao: { name: "Citadel of Ricks" }
};

personagem.origem.name;      // "Earth (C-137)"
personagem.localizacao.name; // "Citadel of Ricks"
```

> 🧩 **Montando o quebra-cabeça**
> Isso não é invenção: é exatamente o formato que a API do Rick and Morty
> devolve. No Capítulo 17 vamos escrever `dados.origin.name` e
> `dados.location.name` para "cavar" dentro desses objetos aninhados. Se você
> entendeu o exemplo acima, já entendeu aquele código.

---

## 2.7 Uma prévia dos métodos que percorrem coleções

Ainda não vamos nos aprofundar (isso é assunto dos capítulos de loops e
funções), mas vale plantar a semente. Arrays têm métodos poderosos que
**percorrem** todos os elementos para você. O mais emblemático é o `.map()`,
que **transforma** cada item e devolve um novo array:

```js
const numeros = [1, 2, 3];
const dobrados = numeros.map(n => n * 2); // [2, 4, 6]
```

E o `.join()`, que transforma um array num texto:

```js
["Ana", "Bruno", "Carla"].join(", "); // "Ana, Bruno, Carla"
```

> 🧩 **Montando o quebra-cabeça**
> O `.map()` é o motor do nosso **menu dinâmico** (Capítulo 9): pegamos o array
> de rotas e transformamos cada rota num pedacinho de HTML `<li>`. O `.join("")`
> depois cola tudo num só texto. Sem esses dois métodos, teríamos que escrever o
> menu à mão, item por item. Com eles, o menu se atualiza sozinho quando
> adicionamos uma rota nova.

---

## Recapitulando

- **Arrays** (`[ ]`) são listas ordenadas, acessadas por **índice** (começando
  em 0).
- Manipule-os com `push`/`pop` (fim) e `unshift`/`shift` (início); copie pedaços
  com `slice`.
- **Objetos** (`{ }`) agrupam **propriedades** (dados) e **métodos**
  (comportamentos), acessados por **nome**.
- A estrutura rainha do front-end é o **array de objetos** — a forma de
  praticamente todos os dados do nosso projeto.
- Objetos podem ser **aninhados**, como nos dados que virão das APIs.

---

> **Exercícios do Capítulo 2**
>
> 1. **Painel de fila (prioridade):** crie um array `fila`. Escreva um código
>    que recebe um número (a idade de uma pessoa): se for **maior que 65**, a
>    pessoa vai para o **início** da fila (`unshift`); senão, vai para o **fim**
>    (`push`). Crie também um "atender", que remove a pessoa do início
>    (`shift`).
> 2. **Cadastro de alunos:** monte um array de objetos, cada aluno com `nome`,
>    `curso` e `ano`. Depois: (a) adicione um novo aluno; (b) imprima o nome do
>    segundo aluno; (c) mostre o `curso` do último aluno da lista.
> 3. **Lista de tarefas:** crie um array de objetos onde cada tarefa tem
>    `descricao` e `concluida` (booleano). Marque a primeira tarefa como
>    concluída alterando sua propriedade.
> 4. Dado `const livros = [{titulo:"PHP", ano:1995}, {titulo:"Python", ano:1991}]`,
>    escreva a expressão que acessa o **ano** do livro "Python".
> 5. Crie um objeto `endereco` aninhado com uma propriedade `cidade` que é
>    outro objeto contendo `nome` e `estado`. Acesse `endereco.cidade.estado`.
