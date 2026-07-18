# Capítulo 9: SPA e roteamento por hash

## O capítulo que junta tudo

Este é o capítulo em que todas as peças anteriores se encaixam: objetos e arrays (as rotas), funções como valores (as páginas), eventos (o hashchange), laços (o mapa de rotas) e condicionais (a rota 404). Ao final, você vai entender cada linha do `main.js`, o arquivo mais importante do projeto.

## O problema: navegar sem recarregar

Em um site tradicional, cada clique em um link pede uma página nova ao servidor, e o navegador recarrega tudo: HTML, CSS, scripts. Em uma SPA queremos trocar só o conteúdo, instantaneamente, mantendo o estado da aplicação. Mas então surge a pergunta: se a página nunca muda, como o usuário navega? Como o botão voltar funciona? Como se compartilha o link de uma seção?

A resposta clássica é o hash da URL.

## O que é o hash

O hash é tudo que vem depois do `#` em uma URL:

```
http://localhost:8000/#sobre
                      ^^^^^^ isto é o hash
```

O hash tem duas propriedades perfeitas para uma SPA:

1. Mudar o hash não recarrega a página. O navegador entende o `#` como uma âncora interna
2. Mudar o hash dispara o evento `hashchange` e entra no histórico do navegador, então os botões voltar e avançar funcionam de graça

O JavaScript lê o hash atual em `window.location.hash`. Se a URL é `#contato`, esse valor é a string `"#contato"`.

É por isso que todos os links do nosso menu apontam para hashes:

```html
<a href="#sobre" class="bem-navbar__link">Sobre</a>
```

Clicou, o hash muda, evento dispara, nós redesenhamos. Nenhuma requisição ao servidor.

## O main.js linha por linha

Este é o arquivo completo do roteador. Vamos dissecar:

```javascript
import navbar from "./components/navbar/navbar.js";
import roteador from "./components/rotas/rotas.js";
navbar(roteador);

const app = document.getElementById('app');

const mapaDeRotas = {}
for (const rota of roteador) {
    mapaDeRotas[rota.url] = rota
}

let hash = window.location.hash || '#inicio';
render();

window.addEventListener("hashchange", () => {
    hash = window.location.hash;
    render();
})

const rota404 = { pagina: () => `<div> Página não encontrada 404 </div>` }

async function render() {
    const rotaAtual = mapaDeRotas[hash] || rota404
    await rotaAtual.pagina(app)
}
```

### Passo 1: montar o menu

```javascript
navbar(roteador);
```

Entregamos o array de rotas para a navbar, que desenha um link para cada uma com `.map()`, como vimos no Capítulo 5. O menu nasce dos mesmos dados que o roteador usa; uma fonte única de verdade.

### Passo 2: capturar o palco

```javascript
const app = document.getElementById('app');
```

Guardamos a referência ao `<main id="app">`, o palco onde toda página se apresenta.

### Passo 3: indexar as rotas

```javascript
const mapaDeRotas = {}
for (const rota of roteador) {
    mapaDeRotas[rota.url] = rota
}
```

O array vira um objeto indexado pela url. Nas aulas usamos vários `console.log` para enxergar essa transformação, e vale repetir o exercício:

```javascript
console.log(mapaDeRotas)
console.log(mapaDeRotas["#home"])
console.log(mapaDeRotas["#home"].pagina)
```

O primeiro mostra o objeto completo, o segundo mostra uma rota, o terceiro mostra a função da página (sem executar). Encadear logs assim é uma técnica de estudo excelente para entender estruturas.

### Passo 4: descobrir onde estamos

```javascript
let hash = window.location.hash || '#inicio';
render();
```

Na primeira carga, lemos o hash da URL. Se estiver vazio (usuário abriu a raiz do site), o `||` entrega o padrão `'#inicio'`. Em seguida renderizamos pela primeira vez. Sem esse `render()` inicial, a página abriria em branco até o primeiro clique.

### Passo 5: escutar a navegação

```javascript
window.addEventListener("hashchange", () => {
    hash = window.location.hash;
    render();
})
```

O motor da SPA. Toda mudança de hash, seja por clique no menu, por edição manual da URL ou pelo botão voltar, atualiza a variável e redesenha.

### Passo 6: renderizar com plano B

```javascript
const rota404 = { pagina: () => `<div> Página não encontrada 404 </div>` }

async function render() {
    const rotaAtual = mapaDeRotas[hash] || rota404
    await rotaAtual.pagina(app)
}
```

A função `render` busca a rota do hash atual no mapa. Não achou? O `||` entrega a `rota404`, que segue o mesmo contrato (tem uma função `pagina`), então o resto do código nem percebe a diferença. Por fim, executamos a função da página passando o palco. Como algumas páginas são `async` (a de cadastro busca dados na API), o `render` é `async` e usa `await`, assunto do próximo capítulo.

## Por que um mapa e não um switch

No Capítulo 3 prometemos voltar a esta comparação. O roteamento poderia ser um `switch`:

```javascript
switch (hash) {
    case "#home": home(app); break;
    case "#sobre": sobre(app); break;
    case "#contato": contato(app); break;
    default: /* 404 */
}
```

Funciona, mas cada página nova exige editar o roteador. Com o `mapaDeRotas`, o roteador é genérico: dados novos (rotas) entram sem código novo. Essa é a diferença entre programar procedimentos e programar orientado a dados, e é uma das grandes lições do curso.

## Hash routing e o mundo real

Frameworks modernos usam também a History API (`pushState`), que permite URLs sem `#`, como `/sobre`. Ela exige configuração no servidor para devolver o `index.html` em qualquer caminho. O hash routing que implementamos é a técnica mais simples e robusta, funciona em qualquer servidor estático, e é inclusive o modo de compatibilidade dos roteadores do React e do Vue. Entendendo o nosso, você entende os deles.

## Resumo do capítulo

- O hash muda a URL sem recarregar a página e dispara o evento `hashchange`
- O roteador transforma o array de rotas em um objeto de consulta direta
- O fluxo: carga inicial lê o hash (com padrão via `||`), evento escuta as mudanças, `render` desenha
- A rota 404 segue o mesmo contrato das outras e entra pelo `||`
- Mapa de rotas vence o switch porque adicionar páginas não exige mexer no roteador
- Botões voltar e avançar funcionam automaticamente porque o hash entra no histórico

## Para praticar

1. Abra o site, navegue por todas as páginas e observe a URL e o console a cada clique.
2. Digite na URL um hash que não existe, como `#banana`, e confirme a página 404.
3. Use os botões voltar e avançar do navegador e explique por que funcionam.
4. Adicione um `console.log(hash)` dentro do listener de `hashchange` e observe os valores.
5. Desafio: faça a rota 404 mostrar também um link de volta para a Home.

## Referências

- MDN Web Docs, Window: hashchange event: https://developer.mozilla.org/pt-BR/docs/Web/API/Window/hashchange_event
- MDN Web Docs, Location.hash: https://developer.mozilla.org/pt-BR/docs/Web/API/Location/hash
- MDN Web Docs, History API: https://developer.mozilla.org/pt-BR/docs/Web/API/History_API
- W3Schools, Window Location: https://www.w3schools.com/js/js_window_location.asp
