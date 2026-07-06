# Capítulo 6 — O que é uma SPA, URL, URI e o `hash`

Agora que dominamos a linguagem e sabemos manipular a página, é hora de entender
a **arquitetura** que vamos construir. Antes de escrever o roteador, precisamos
responder três perguntas: o que é uma SPA? Como uma URL é formada? E o que é
esse tal de `hash` que faz tudo funcionar?

Este capítulo é mais conceitual — mas é o mapa mental que dá sentido a todo o
resto do curso.

---

## 6.1 Três tipos de site

### Landing Page

Uma **Landing Page** é uma página única, focada em **converter** o visitante
(virar cliente, capturar um e-mail). É simples e direta, geralmente com um
formulário e uma chamada para ação. Muito usada em campanhas de marketing.

- ✅ Simples, ótima para SEO (aparecer no Google), rápida.
- ❌ Pouca interatividade, experiência estática.

### MPA — Multi Page Application (aplicação multipágina)

O modelo **clássico** da web: cada link leva a um **novo arquivo HTML**, e o
navegador **recarrega a página inteira** a cada navegação. Sites feitos em PHP
puro, ou o WordPress tradicional, funcionam assim.

- ✅ Simples, bom para SEO.
- ❌ Cada clique recarrega tudo do zero — a tela "pisca", é mais lento.

### SPA — Single Page Application (aplicação de página única)

A **SPA** carrega **uma única página HTML** e, a partir daí, **atualiza o
conteúdo dinamicamente** conforme o usuário interage. Ela troca só o miolo da
tela, sem nunca recarregar a página inteira. Para o usuário, "parece" que são
várias páginas — mas é sempre a mesma, sendo reescrita por JavaScript.

- ✅ Melhor experiência, navegação instantânea, mais interatividade.
- ❌ Maior complexidade de desenvolvimento e desafios com SEO.

> 🧩 **Montando o quebra-cabeça**
> É uma **SPA** que vamos construir. Lembra do `app.innerHTML = ...` do capítulo
> anterior? É exatamente essa a mágica: quando você clica em "Sobre", nós não
> buscamos um novo arquivo — apenas trocamos o `innerHTML` do `<main id="app">`
> pelo conteúdo da página Sobre. A URL muda, o conteúdo muda, mas a página nunca
> recarrega.

---

## 6.2 Anatomia de uma URL

Para navegar sem recarregar, precisamos entender profundamente a **URL** — o
endereço que aparece na barra do navegador. Vamos dissecar uma URL completa:

```
  https://www.exemplo.com:443/livros/detalhe?id=42&ordem=asc#secao1
  └─┬─┘   └───────┬───────┘└──────┬────────┘└──────┬────────┘└──┬──┘
 esquema      autoridade        caminho        query string    hash
```

### Esquema (protocolo)

`https://` — indica **como** o navegador deve buscar o recurso. Um protocolo é
um conjunto de regras para troca de dados em rede. Os mais comuns são `http` e
`https` (a versão segura, criptografada).

### Autoridade

`www.exemplo.com:443` — separada do esquema pelo `://`. Inclui:

- O **domínio** (`www.exemplo.com`): qual servidor está sendo solicitado.
- A **porta** (`:443`): a "porta técnica" de entrada do servidor. Costuma ser
  omitida porque os navegadores assumem as portas padrão: **80** para HTTP e
  **443** para HTTPS.

### Caminho (path)

`/livros/detalhe` — o caminho até o recurso no servidor. Antigamente
representava um arquivo físico em uma pasta; hoje é, na maioria das vezes, uma
abstração que o servidor interpreta como quiser.

### Query String

`?id=42&ordem=asc` — parâmetros extras enviados ao servidor. Começa com `?` e é
uma lista de pares **chave=valor** separados por `&`. Também chamada de
"parâmetros de consulta". O servidor pode usá-los para filtrar, ordenar,
paginar...

### Hash (fragmento)

`#secao1` — uma **âncora** que aponta para uma parte **dentro** da própria
página. É o herói da nossa história — merece uma seção só sua.

> 💡 **Nos bastidores — URL x URI**
> Você verá os dois termos. **URI** (Identificador) é o conceito geral de
> "identificar um recurso"; **URL** (Localizador) é uma URI que também diz
> **como chegar** nele (o protocolo). Na prática do dia a dia, tratamos os dois
> como sinônimos. Não perca o sono com essa distinção.

---

## 6.3 A Query String no JavaScript

Podemos ler os parâmetros da query string com o objeto `URLSearchParams`:

```js
// URL: https://exemplo.com/busca?termo=javascript&pagina=2
const params = new URLSearchParams(window.location.search);

params.get("termo");  // "javascript"
params.get("pagina"); // "2"
```

> 🧩 **Montando o quebra-cabeça**
> A query string é exatamente como conversamos com as APIs. Quando pedimos a
> lista de livros, montamos uma URL assim:
> ```
> https://gutendex.com/books/?search=fiction&page=2
> ```
> O `?search=fiction&page=2` é uma query string! Estamos dizendo ao servidor:
> "busque por 'fiction', página 2". Vamos construir URLs desse tipo no Capítulo
> 16.

---

## 6.4 O `hash`: o segredo da SPA

O **hash** é a parte da URL após o `#`. Ele tem uma característica **mágica**
para o nosso propósito:

> Mudar o hash **não recarrega a página** e **não faz nova requisição ao
> servidor**. O que vem depois do `#` **nunca é enviado ao servidor**.

Originalmente, o hash servia para rolar até uma seção da página (uma âncora). Mas
os desenvolvedores perceberam algo genial: como mudar o hash **não recarrega
nada**, ele pode ser usado para indicar qual "página" da SPA está ativa.

```
www.exemplo.com#home     →  mostra a Home
www.exemplo.com#sobre    →  mostra o Sobre
www.exemplo.com#contato  →  mostra o Contato
```

O usuário clica num link `<a href="#sobre">`, a URL muda para `...#sobre`, mas
**a página não recarrega**. Nós, no JavaScript, apenas detectamos essa mudança e
trocamos o conteúdo da tela. Para o usuário, é como navegar entre páginas — mas
é tudo a mesma página.

---

## 6.5 As três palavras mágicas: `window.location.hash`

Como o JavaScript descobre qual é o hash atual? Através de um caminho de objetos
do navegador:

```js
window.location.hash;
```

Desmembrando:

- **`window`** é o objeto global que representa a janela/aba do navegador. Tudo
  que é global vive dentro dele.
- **`window.location`** é um objeto com informações sobre a URL atual (o
  endereço, o protocolo, o host...).
- **`window.location.hash`** é, especificamente, a parte após o `#` — por
  exemplo, `"#sobre"`.

Experimente agora mesmo. Abra qualquer site, vá ao Console e digite:

```js
window.location.hash;               // provavelmente "" (vazio)
window.location.hash = "#teste";    // mude o hash pela programação
window.location.hash;               // agora "#teste"
```

Repare que ao atribuir um valor ao `hash`, a URL na barra muda — **sem
recarregar**. Esse é o mecanismo inteiro.

> 💡 **Nos bastidores**
> "Saber o que tem por baixo dos panos nos dá mais poder." O `window.location`
> tem vários outros campos úteis: `window.location.search` (a query string),
> `window.location.pathname` (o caminho), `window.location.href` (a URL
> completa). Vale explorá-los no Console.

---

## 6.6 O evento que fecha o ciclo: `hashchange`

Falta uma peça: como saber, **no momento exato** em que o hash muda, para então
trocar a tela? O navegador nos avisa disparando um evento chamado
**`hashchange`**. Nós o escutamos como qualquer outro evento (Capítulo 5):

```js
window.addEventListener("hashchange", function () {
  const hash = window.location.hash;
  console.log("O usuário navegou para:", hash);
  // aqui vamos trocar o conteúdo da tela!
});
```

Junte as peças e você já enxerga a SPA inteira:

1. Os links do menu apontam para `#home`, `#sobre`, etc.
2. Clicar num link muda o `window.location.hash` (sem recarregar).
3. A mudança dispara o evento `hashchange`.
4. Nosso "ouvinte" lê o novo hash e troca o `innerHTML` do `#app`.

Isso é, em essência, o roteamento no lado do cliente (*client-side routing*). É
o que faremos no próximo capítulo, na prática.

---

## 6.7 O plano de construção da SPA

Reunindo tudo, o roteiro para montar nossa SPA (que os capítulos seguintes vão
executar passo a passo) é:

1. Ter **um único `index.html`** com um ponto de montagem: `<main id="app">`.
2. Definir o **conteúdo de cada "página"** (a princípio como strings, depois
   como funções em módulos separados).
3. Criar as **funções de manipulação** que colocam cada conteúdo na tela.
4. **Escutar o `hashchange`** para trocar de página conforme o hash.
5. Gerar o **menu de navegação** dinamicamente.
6. **Centralizar** tudo num roteador organizado.

> 🧩 **Montando o quebra-cabeça**
> Este é literalmente o índice da Parte IV da apostila. Cada item acima é um
> capítulo. No fim, teremos exatamente a arquitetura do `main.js` do projeto:
> um mapa de rotas, um `addEventListener("hashchange", ...)` e uma função que
> renderiza a rota atual. Agora que você entende o *porquê*, vamos ao *como*.

---

## Recapitulando

- Uma **SPA** carrega uma página só e troca o conteúdo dinamicamente, sem
  recarregar — diferente da **MPA** (recarrega tudo) e da **Landing Page**
  (página estática de conversão).
- Uma **URL** tem esquema, autoridade (domínio + porta), caminho, **query
  string** (`?chave=valor`) e **hash** (`#fragmento`).
- A **query string** é como conversamos com APIs; leia-a com `URLSearchParams`.
- O **`hash`** muda a URL **sem recarregar** a página — a base da SPA.
- Lemos o hash atual com **`window.location.hash`** e detectamos mudanças com o
  evento **`hashchange`**.

---

> **Exercícios do Capítulo 6**
>
> 1. Explique, com suas palavras, a diferença entre uma **SPA** e uma **MPA**.
> 2. Dada a URL `https://loja.com/produtos?categoria=livros&pag=3#topo`,
>    identifique: o esquema, o domínio, o caminho, a query string e o hash.
> 3. No Console de qualquer site, mude o hash para `#capitulo6` via JavaScript e
>    confirme que a URL mudou sem recarregar.
> 4. Escreva um `addEventListener("hashchange", ...)` que imprime no console o
>    novo valor de `window.location.hash` sempre que ele mudar. Teste digitando
>    diferentes hashes na barra de endereço.
> 5. Usando `URLSearchParams`, extraia o valor de `pag` da URL do exercício 2.
