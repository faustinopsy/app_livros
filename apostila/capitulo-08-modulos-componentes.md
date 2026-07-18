# Capítulo 8: ES Modules e componentização

## Do arquivo único ao projeto organizado

Nas primeiras aulas todo o código cabia em um arquivo. Mas o projeto cresceu: navbar, cinco páginas, rotas, roteador. Manter tudo junto vira um arquivo gigante onde ninguém acha nada e todo mundo esbarra em todo mundo. A solução do JavaScript moderno são os ES Modules: cada arquivo é um módulo que declara o que oferece (export) e o que precisa (import).

## Ativando os módulos

Basta um atributo no script do `index.html`:

```html
<script src="src/js/main.js" type="module"></script>
```

Com `type="module"`, o navegador entende os comandos `import` e `export` e carrega os arquivos em cadeia a partir do `main.js`. É por causa desse atributo que o projeto exige um servidor HTTP, como vimos no Capítulo 1.

## export default e import

Cada arquivo de página do projeto termina exportando seu objeto de rota:

```javascript
// sobre.js
function sobre(app){
    const sobre = `<h1> Esta é página Sobre </h1>
    <p>Este site é um exemplo de SPA usando JavaScript puro</p>
    `
    app.innerHTML = sobre
}

export default {
    url: '#sobre',
    label: 'Sobre',
    pagina: sobre
}
```

O `export default` diz: quando alguém importar este arquivo, entregue este valor. E quem importa escolhe o nome que quiser para recebê-lo:

```javascript
// rotas.js
import home from '../paginas/home.js'
import servicos from '../paginas/servicos.js'
import sobre from '../paginas/sobre.js'
import contato from '../paginas/contato.js'
import telaCadastro from '../paginas/formCad.js'

const roteador = [
    home,
    telaCadastro,
    sobre,
    servicos,
    contato,
]

export default roteador;
```

Repare no detalhe dos caminhos: `../paginas/home.js` significa "suba uma pasta e entre em paginas". Caminhos relativos com `./` e `../` são obrigatórios nos imports do navegador, e a extensão `.js` também.

Além do default, existe o export nomeado, útil quando um arquivo oferece várias coisas:

```javascript
// exportando
export function formatar() { ... }
export const VERSAO = "1.0";

// importando com chaves e o nome exato
import { formatar, VERSAO } from './utilitarios.js';
```

No projeto usamos `export default` porque cada arquivo de componente entrega uma coisa só.

## O que é um componente

Componente é um pedaço autocontido da interface: ele sabe se desenhar e sabe reagir aos seus próprios eventos. No App Livros, cada página é um componente que segue o mesmo contrato:

1. Uma função que recebe o elemento `app` e se desenha nele via `innerHTML`
2. Se a página tem interatividade, ela mesma registra seus ouvintes depois de se desenhar
3. Um `export default` de objeto com `url`, `label` e `pagina`

Veja o contrato completo na tela de cadastro:

```javascript
async function telaCadastro(app){
    const formulario = `
    <form id="cadastroCliente" >
        <label for="cep">CEP</label>
        <input type="text" id="cep">
        <label for="logradouro">logradouro</label>
        <input type="text" id="logradouro">
        <label for="bairro">bairro</label>
        <input type="text" id="bairro">
        <label for="localidade">localidade</label>
        <input type="text" id="localidade">
        <label for="estado">estado</label>
        <input type="text" id="estado">
    </form>
    `
    app.innerHTML = formulario;
    await capturacep()
}

export default {
    url: '#cep',
    label: 'Cadastro',
    pagina: telaCadastro
}
```

## A evolução para o componente auto montável

Vale registrar a história dessa arquitetura, porque ela evoluiu entre as aulas e o histórico do Git guarda os dois momentos.

Na primeira versão, as funções de página apenas devolviam a string de HTML, e o roteador fazia o `innerHTML` e depois executava uma `acao` separada para registrar os eventos:

```javascript
// versão antiga (registrada nos comentários do main.js)
app.innerHTML = rotaAtual.pagina()
if (typeof mapaDeRotas[hash].acao === 'function') {
    await mapaDeRotas[hash].acao()
}
```

Funcionava, mas o conhecimento sobre a página ficava espalhado: o roteador precisava saber que existia uma `acao` e lembrar de chamá-la. Na refatoração (commit "componente auto montavel"), invertemos: a função da página passou a receber o `app` e cuidar de tudo sozinha, desenho e eventos. O roteador encolheu para uma linha:

```javascript
// versão atual
await rotaAtual.pagina(app)
```

Essa é uma lição de arquitetura que vai muito além deste projeto: cada componente deve ser dono do seu próprio ciclo de vida. Quem usa o componente não precisa conhecer seus detalhes internos. É o mesmo princípio dos componentes do React e do Vue.

## A navbar orientada a dados

A navbar é o componente que amarra tudo. Ela não conhece nenhuma página; recebe o array de rotas e desenha um link para cada uma:

```javascript
// main.js
import navbar from "./components/navbar/navbar.js";
import roteador from "./components/rotas/rotas.js";
navbar(roteador);
```

O fluxo completo de dependências do projeto fica assim:

```
index.html
   carrega main.js
      importa rotas.js  (que importa todas as paginas)
      importa navbar.js (que desenha o menu a partir das rotas)
      monta o mapaDeRotas e escuta o hashchange
```

Quer criar uma página nova? O passo a passo é sempre o mesmo, e não toca em nenhum arquivo existente além do `rotas.js`:

1. Crie `src/js/components/paginas/minhapagina.js` seguindo o contrato
2. Importe e adicione no array do `rotas.js`
3. Pronto: o menu ganha o link e a rota funciona

## Organização de pastas e nomenclatura

A regra do projeto: uma pasta por componente, dentro de `components`. O CSS segue a metodologia BEM (Block, Element, Modifier), visível nas classes como `bem-navbar__item` e `bem-card__title`: o bloco é o componente, o elemento vem após dois underlines, e modificadores após dois hífens (`bem-btn--primary`). Essa disciplina de nomes evita que o estilo de um componente vaze para outro.

## Resumo do capítulo

- ES Modules dividem o projeto em arquivos com `import` e `export`, ativados pelo `type="module"`
- `export default` entrega o valor principal do arquivo; caminhos relativos e extensão `.js` são obrigatórios
- Componente é um pedaço autocontido: se desenha e escuta seus próprios eventos
- O contrato das páginas: função que recebe `app` mais objeto com `url`, `label` e `pagina`
- A refatoração para componentes auto montáveis simplificou o roteador para uma linha
- Adicionar página nova não exige tocar no roteador nem na navbar

## Para praticar

1. Crie um componente `footer` que desenha um rodapé e importe no `main.js`.
2. Crie uma página nova "Autores" seguindo o contrato completo e registre no `rotas.js`.
3. Desenhe no papel o diagrama de imports do projeto, seta por seta, começando do `index.html`.
4. Compare no Git as duas versões do roteador (antes e depois do commit "componente auto montavel") e escreva um parágrafo sobre o que melhorou.

## Referências

- MDN Web Docs, Módulos JavaScript: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Modules
- MDN Web Docs, import: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/import
- MDN Web Docs, export: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/export
- W3Schools, JavaScript Modules: https://www.w3schools.com/js/js_modules.asp
- Metodologia BEM: https://getbem.com/
