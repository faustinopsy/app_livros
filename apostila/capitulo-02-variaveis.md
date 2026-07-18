# Capítulo 2: Variáveis e tipos de dados

## Guardando informações

Todo programa precisa guardar informações para trabalhar com elas depois: o nome de um usuário, o endereço da rota atual, a lista de serviços. Em JavaScript, guardamos informações em variáveis.

Pense na variável como uma caixa etiquetada. A etiqueta é o nome da variável e o conteúdo é o valor. Quando escrevemos:

```javascript
let hash = window.location.hash;
```

estamos criando uma caixa chamada `hash` e guardando dentro dela o endereço atual da página. Essa linha existe de verdade no nosso `main.js` e é uma das mais importantes do projeto, como veremos no capítulo de roteamento.

## As três formas de declarar: var, let e const

O JavaScript tem três palavras reservadas para criar variáveis. Na prática do nosso curso usamos duas delas.

### const

Use `const` quando o valor não vai ser reatribuído. É a nossa escolha padrão no projeto:

```javascript
const app = document.getElementById('app');
const mapaDeRotas = {};
const rota404 = { pagina: () => `<div> Página não encontrada 404 </div>` };
```

O elemento `app` é capturado uma vez e nunca trocamos a referência, então `const` comunica essa intenção para quem lê o código.

Atenção a um detalhe importante: `const` impede a reatribuição, mas não congela o conteúdo de objetos e arrays. Repare que declaramos `const mapaDeRotas = {}` e depois adicionamos rotas dentro dele sem problema nenhum. O que não pode é fazer `mapaDeRotas = outraCoisa`.

### let

Use `let` quando o valor precisa mudar ao longo do programa:

```javascript
let hash = window.location.hash || '#inicio';
// mais tarde, quando o usuário navega:
hash = window.location.hash;
```

O `hash` muda toda vez que o usuário clica em um link do menu, por isso ele é `let` no nosso roteador.

### var

O `var` é a forma antiga, de antes de 2015. Ele ainda funciona, mas tem comportamentos confusos de escopo que causam bugs difíceis de achar. Regra da nossa sala de aula: não usamos `var` em código novo. Se aparecer em algum material antigo na internet, você sabe que é código legado.

## Tipos de dados primitivos

O JavaScript é uma linguagem de tipagem dinâmica: a variável assume o tipo do valor que recebe. Os tipos que mais usamos no projeto:

```javascript
// string: textos, sempre entre aspas
const titulo = "Jogo das quartas de final da copa do mundo de 2002";

// number: números inteiros ou decimais, sem aspas
let contador = 0;
const preco = 49.90;

// boolean: verdadeiro ou falso
const menuAberto = false;

// undefined: a caixa existe mas ninguém colocou nada dentro
let mensagem;
console.log(mensagem); // undefined

// null: ausência intencional de valor
let usuarioLogado = null;
```

Você pode descobrir o tipo de qualquer valor com o operador `typeof`:

```javascript
console.log(typeof titulo);      // "string"
console.log(typeof contador);    // "number"
console.log(typeof menuAberto);  // "boolean"
```

## Template strings: a ferramenta que usamos o curso inteiro

Existem três formas de escrever strings: aspas simples, aspas duplas e crase (acento grave). A crase cria uma template string, e ela é tão importante que praticamente toda página do nosso projeto é construída com ela.

A template string tem dois superpoderes:

1. Aceita quebras de linha, o que permite escrever HTML de vários parágrafos dentro do JavaScript
2. Aceita interpolação de valores com a sintaxe `${expressao}`

Veja como a página Sobre do projeto usa os dois recursos:

```javascript
function sobre(app){
    const sobre = `<h1> Esta é página Sobre </h1>
    <p>Este site é um exemplo de SPA usando JavaScript puro</p>
    `
    app.innerHTML = sobre
}
```

E veja a interpolação em ação na lista de contatos:

```javascript
li.textContent = `O Assunto é ${assunto}
 e o email é ${email}
 e a mensagem é ${mensagem}`;
```

Tudo o que estiver dentro de `${}` é avaliado como JavaScript e o resultado entra no texto. É assim que misturamos dados com HTML durante todo o curso.

## Nomeando bem as variáveis

Regras técnicas: o nome pode conter letras, números, `_` e `$`, mas não pode começar com número nem conter espaços ou acentos.

Regras de qualidade, que valem mais que as técnicas:

- Use nomes que descrevem o conteúdo: `mapaDeRotas` e não `m`
- Use o padrão camelCase, como em `telaCadastro` e `capturarFormulario`
- Prefira nomes em um idioma só no projeto inteiro

Um código bem nomeado quase dispensa comentários. Compare `const x = document.getElementById('app')` com `const app = document.getElementById('app')` e perceba como o segundo se explica sozinho.

## Resumo do capítulo

- Variáveis são caixas etiquetadas que guardam valores
- `const` para valores que não serão reatribuídos (nossa escolha padrão), `let` para os que mudam, `var` não usamos
- Os tipos principais são string, number, boolean, undefined e null
- Template strings com crase permitem quebras de linha e interpolação com `${}`, e são a base da renderização das nossas páginas
- Nomes descritivos em camelCase tornam o código legível

## Para praticar

1. Crie variáveis para descrever um livro: título, autor, ano, preço e disponível (boolean). Escolha entre `const` e `let` justificando cada escolha.
2. Use uma template string para montar uma frase de apresentação do livro interpolando as variáveis.
3. Imprima o `typeof` de cada variável no console e confira se bate com o esperado.
4. Tente reatribuir uma `const` e leia com calma a mensagem de erro que o console mostra.

## Referências

- MDN Web Docs, Declarações e variáveis: https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/First_steps/Variables
- MDN Web Docs, Template strings: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Template_literals
- W3Schools, JavaScript Variables: https://www.w3schools.com/js/js_variables.asp
- W3Schools, JavaScript Data Types: https://www.w3schools.com/js/js_datatypes.asp
