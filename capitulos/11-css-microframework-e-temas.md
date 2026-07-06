# Capítulo 11 — Estilo com um microframework CSS e temas

Nossa SPA funciona, mas está feia — texto preto num fundo branco. Neste capítulo
damos a ela uma cara profissional criando um **microframework CSS** próprio:
um pequeno conjunto de classes reutilizáveis, no espírito de um "mini Bootstrap".
De quebra, vamos implementar **temas** (dia, tarde, noite) com uma técnica
elegante de CSS moderno.

Este é um respiro no meio da jornada JavaScript — mas um respiro importante,
porque as classes que criarmos aqui são as mesmas que já vínhamos usando no HTML
das páginas (`bem-card`, `bem-navbar`, etc.).

---

## 11.1 Por que um "microframework"?

Você poderia estilizar cada elemento individualmente, mas isso gera repetição e
inconsistência. Frameworks como Bootstrap e Tailwind resolvem isso com
**classes utilitárias** e **componentes prontos**. Vamos criar uma versão
enxuta e caseira para entender o princípio:

- **Componentes**: classes que estilizam blocos inteiros (`bem-card`,
  `bem-navbar`, `bem-btn`, `bem-modal`).
- **Utilitários**: classes de propósito único (`bem-mt-md` para margem,
  `bem-flex` para display flex, `bem-text-center` para centralizar).

Todas com o prefixo **`bem-`**, para não colidirem com nada.

---

## 11.2 A metodologia BEM

**BEM** significa **Bloco, Elemento, Modificador**. É uma convenção de
**nomenclatura de classes** que torna o CSS previsível e legível. A estrutura:

```
.bloco               →  um componente independente     (.bem-card)
.bloco__elemento     →  uma parte do bloco             (.bem-card__title)
.bloco--modificador  →  uma variação do bloco          (.bem-btn--primary)
```

- **Bloco**: a entidade autônoma. Ex.: `bem-card` (um cartão).
- **Elemento** (`__`): uma peça que só faz sentido dentro do bloco. Ex.:
  `bem-card__title` (o título *do cartão*), `bem-card__image` (a imagem *do
  cartão*).
- **Modificador** (`--`): uma variação de aparência ou estado. Ex.:
  `bem-btn--primary` (botão na cor primária), `bem-modal--hidden` (modal
  escondido).

Você já vinha usando esses nomes! Lembre do menu (`bem-navbar__link`) e dos
cards de serviço (`bem-card__title`). Agora você entende a lógica por trás deles.

> 💡 **Nos bastidores**
> A grande vantagem do BEM é que, só de ler uma classe, você sabe o que ela é e
> onde vive. `bem-modal__close` é, sem dúvida, "o botão de fechar do modal".
> Isso evita o caos de nomes genéricos como `.titulo` ou `.botao`, que colidem e
> confundem em projetos grandes.

---

## 11.3 Variáveis CSS: a base dos temas

O CSS moderno tem **variáveis** (oficialmente, "custom properties"). Definimos
valores num lugar e os reutilizamos em todo o estilo. Elas se declaram dentro de
`:root` (a raiz do documento) com o prefixo `--`:

```css
:root {
  --bem-primary: #3b82f6;
  --bem-bg: #ffffff;
  --bem-text: #1f2937;
  --bem-spacing-md: 1rem;
  --bem-radius-md: .5rem;
}
```

E as usamos com a função `var()`:

```css
body {
  background: var(--bem-bg);
  color: var(--bem-text);
}
.bem-btn--primary {
  background-color: var(--bem-primary);
}
```

A vantagem é enorme: para mudar a cor primária do site inteiro, você altera **uma
linha**. E, como veremos já a seguir, isso é o que torna os temas triviais.

---

## 11.4 Implementando temas com `data-theme`

A sacada dos temas: se as cores são variáveis, basta **redefinir essas
variáveis** para trocar a aparência inteira. Fazemos isso condicionando os
valores a um atributo `data-theme` no elemento raiz (`<html>`):

```css
/* tema padrão (claro) */
:root {
  --bem-primary: #3b82f6;
  --bem-bg: #ffffff;
  --bem-text: #1f2937;
}

/* tema noite */
[data-theme="noite"] {
  --bem-primary: #2dd4bf;
  --bem-bg: #0f172a;
  --bem-surface: #1e293b;
  --bem-text: #f1f5f9;
  --bem-border: #334155;
}

/* tema tarde */
[data-theme="tarde"] {
  --bem-primary: #f97316;
  --bem-bg: #fdf5ee;
  --bem-text-muted: #78716c;
}
```

Quando o `<html>` tem `data-theme="noite"`, o navegador aplica o novo conjunto de
variáveis, e **todo** o site que usa `var(--bem-bg)`, `var(--bem-text)` etc. muda
de cor instantaneamente. Nada de reescrever estilos por componente.

Para alternar o tema via JavaScript (aplicando o que aprendemos sobre DOM no
Cap. 5), basta escrever no atributo do `<html>`:

```js
document.documentElement.setAttribute("data-theme", "noite"); // ativa a noite
document.documentElement.removeAttribute("data-theme");        // volta ao padrão
```

> 💡 **Nos bastidores — a transição suave**
> No `body` colocamos `transition: background .25s, color .25s;`. Isso faz a
> troca de tema acontecer com uma **animação suave** de um quarto de segundo, em
> vez de um "pisca" abrupto. Um detalhe pequeno que transmite polimento.

---

## 11.5 Anatomia de um componente: o card

Vamos ver como um componente BEM completo é montado. O card, que usamos nas
listagens, é assim:

```css
.bem-card {
  background-color: var(--bem-surface);
  border-radius: var(--bem-radius-lg);
  box-shadow: var(--bem-shadow-md);
  overflow: hidden;
  transition: all .3s ease;
}
.bem-card:hover {
  box-shadow: var(--bem-shadow-lg);
  transform: translateY(-2px); /* "levanta" um pouco ao passar o mouse */
}
.bem-card__image { width: 100%; height: auto; display: block; }
.bem-card__body  { padding: var(--bem-spacing-lg); }
.bem-card__title { font-size: 1.25rem; font-weight: 600; }
.bem-card__subtitle { font-size: .875rem; color: var(--bem-text-muted); }
```

Observe como cada peça (`__image`, `__body`, `__title`) é estilizada
separadamente, e como tudo usa **variáveis** (`var(--bem-...)`). Trocar o tema
recolore o card sem tocar nessas regras. Esse mesmo padrão se repete para
`bem-navbar`, `bem-btn`, `bem-form`, `bem-modal` e `bem-alert`.

---

## 11.6 Classes utilitárias

Além dos componentes, o microframework traz dezenas de **utilitários** — classes
minúsculas de uma responsabilidade só, para ajustes rápidos direto no HTML:

```css
.bem-flex          { display: flex; }
.bem-justify-center{ justify-content: center; }
.bem-items-center  { align-items: center; }
.bem-gap-md        { gap: var(--bem-spacing-md); }
.bem-mt-lg         { margin-top: var(--bem-spacing-lg); }
.bem-mb-md         { margin-bottom: var(--bem-spacing-md); }
.bem-text-center   { text-align: center; }
```

E uma classe especialmente útil para as nossas listagens, que cria uma grade
responsiva automática:

```css
.bem-grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--bem-spacing-md);
}
```

O `repeat(auto-fit, minmax(280px, 1fr))` significa: "crie quantas colunas
couberem, cada uma com no mínimo 280px". Numa tela larga, cabem várias colunas;
numa estreita (celular), elas se reorganizam em uma só — **sem media query**.

> 🧩 **Montando o quebra-cabeça**
> É `bem-grid-auto` que organiza os cards de livros, personagens e serviços numa
> grade bonita e responsiva. Lembra do `<div id="listaLivros" class="bem-grid-auto">`?
> Agora você sabe o que aquela classe faz.

---

## 11.7 Responsividade e o menu mobile

Por fim, o microframework cuida do celular. Com **media queries**, ajustamos o
layout em telas pequenas. O caso mais interessante é o menu, que vira um "menu
hambúrguer" (☰):

```css
@media (max-width: 768px) {
  .bem-navbar__menu { display: none; } /* esconde o menu por padrão */
  .bem-navbar__toggle { display: block; } /* mostra o botão ☰ */

  /* quando o checkbox invisível está marcado, mostra o menu */
  .bem-navbar__checkbox:checked ~ .bem-navbar__menu {
    display: flex;
    flex-direction: column;
    /* ...posicionamento... */
  }
}
```

> 💡 **Nos bastidores — o "checkbox hack"**
> Repare que o menu mobile abre e fecha **sem uma linha de JavaScript**! O truque
> usa um `<input type="checkbox">` escondido e um `<label>` (o ☰). Clicar no
> label marca/desmarca o checkbox, e o seletor CSS `:checked ~ .bem-navbar__menu`
> mostra o menu conforme o estado. É um exemplo lindo de como CSS bem pensado
> reduz a necessidade de JavaScript.

---

## 11.8 Ligando o CSS ao projeto

Para tudo isso valer, basta ligar a folha de estilo no `index.html`, no
`<head>`:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Livros</title>
  <link rel="stylesheet" href="src/css/microframework.css">
</head>
```

Salve o `microframework.css` em `src/css/` e recarregue. De repente, todas
aquelas classes que vínhamos escrevendo (`bem-card`, `bem-navbar__link`,
`bem-btn--primary`) ganham vida. **O projeto fica bonito sem alterarmos uma linha
de JavaScript** — prova de que separamos bem estrutura (HTML), comportamento
(JS) e apresentação (CSS).

---

## Recapitulando

- Um **microframework CSS** reúne **componentes** (`bem-card`) e **utilitários**
  (`bem-mt-md`) reutilizáveis, com prefixo `bem-`.
- **BEM** organiza os nomes: **Bloco** (`bem-card`), **Elemento** (`__title`),
  **Modificador** (`--primary`).
- **Variáveis CSS** (`--bem-primary`, usadas com `var()`) centralizam os valores
  de design.
- **Temas** trocam a aparência inteira só redefinindo variáveis via
  `[data-theme="..."]` — e alternamos via JS com `setAttribute`.
- Utilitários como **`bem-grid-auto`** dão grades responsivas sem esforço.
- A **responsividade** e até o menu hambúrguer podem ser resolvidos com CSS puro.

---

> **Exercícios do Capítulo 11**
>
> 1. Crie um `microframework.css` com pelo menos as variáveis de `:root`, o
>    componente `bem-card` e os utilitários `bem-flex`, `bem-text-center` e
>    `bem-mt-md`. Ligue-o no `index.html`.
> 2. Crie um tema `[data-theme="noite"]` redefinindo `--bem-bg` e `--bem-text`.
>    No Console, ative-o com
>    `document.documentElement.setAttribute("data-theme", "noite")`.
> 3. Crie um botão na página inicial que, ao ser clicado, alterna entre o tema
>    padrão e o "noite" (dica: `classList.toggle` não serve aqui; use uma
>    variável para lembrar o estado e `setAttribute`/`removeAttribute`).
> 4. Envolva os cards de serviços numa `<div class="bem-grid-auto">` e observe a
>    grade responsiva redimensionando a janela.
> 5. Explique, com suas palavras, por que usar variáveis CSS torna a
>    implementação de temas tão simples.
