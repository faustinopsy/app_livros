# Capítulo 6: Funções, com retorno e sem retorno

## Empacotando comportamento

Se variáveis guardam valores, funções guardam comportamento. Uma função é um bloco de código com nome que pode ser executado quantas vezes quisermos, de onde quisermos. No App Livros, cada página é uma função, o roteador é uma função, a captura do formulário é uma função. Dominar funções é dominar o projeto.

## Declarando e chamando

```javascript
// declaração
function saudacao() {
    console.log("Bem-vindo ao App Livros");
}

// chamada (execução)
saudacao();
saudacao(); // pode chamar quantas vezes quiser
```

Atenção para a diferença entre a função e a chamada dela. `saudacao` (sem parênteses) é a função em si, um valor que pode ser guardado e passado adiante. `saudacao()` (com parênteses) executa a função agora. Essa diferença é vital no projeto: quando escrevemos `pagina: sobre` no objeto de rota, passamos a função sem executar, para o roteador executar depois, na hora certa.

## Parâmetros: dando entrada para a função

Parâmetros tornam a função reutilizável para dados diferentes:

```javascript
function saudacao(nome) {
    console.log(`Bem-vindo, ${nome}`);
}

saudacao("Ana");    // Bem-vindo, Ana
saudacao("Bruno");  // Bem-vindo, Bruno
```

No projeto, as funções de página recebem o elemento onde devem se montar:

```javascript
function sobre(app){
    const sobre = `<h1> Esta é página Sobre </h1>
    <p>Este site é um exemplo de SPA usando JavaScript puro</p>
    `
    app.innerHTML = sobre
}
```

Quem fornece o `app` é o roteador, na linha `rotaAtual.pagina(app)`. A página não precisa saber onde vai ser montada; ela recebe o destino de fora. Esse desacoplamento é o que torna cada página um componente independente.

## Funções com retorno

Uma função pode devolver um valor para quem a chamou, usando `return`:

```javascript
function somar(a, b) {
    return a + b;
}

const total = somar(2, 3);   // total vale 5
```

O `return` também encerra a função na hora: nada depois dele executa.

No projeto, a função `cadastroCliente` do formulário de CEP é uma função com retorno. Ela busca os dados na API e devolve o resultado para quem chamou:

```javascript
async function cadastroCliente(cep){
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const result = await response.json();
        return result
    } catch (error) {
        console.error(error);
    }
}

// quem chama recebe o retorno:
const dados = await cadastroCliente(event.target.value)
```

## Funções sem retorno

Nem toda função devolve algo. Muitas existem pelo efeito que causam: desenhar na tela, registrar um evento, imprimir no console. Chamamos isso de efeito colateral. Quando não há `return`, a função devolve `undefined` automaticamente.

A função `sobre` acima é um exemplo: ela não devolve nada, seu trabalho é alterar o `innerHTML` do elemento. A `navbar` também: recebe as rotas e desenha o menu. Compare:

- Com retorno: `cadastroCliente(cep)` calcula e entrega um valor, quem chamou decide o que fazer
- Sem retorno: `sobre(app)` age diretamente sobre a página, não entrega nada

Saber classificar suas funções nessas duas famílias ajuda muito na hora de montar o quebra-cabeça de um sistema.

## Arrow functions

Desde 2015 existe uma sintaxe curta, a arrow function, muito usada em callbacks:

```javascript
// função tradicional
function dobrar(n) {
    return n * 2;
}

// arrow equivalente
const dobrar = (n) => {
    return n * 2;
}

// arrow compacta: sem chaves, o retorno é implícito
const dobrar = (n) => n * 2;
```

No projeto elas aparecem em vários pontos:

```javascript
// no map da navbar
item_menu.map((item)=>{
    return `<li class="bem-navbar__item">
        <a href="${item.url}" class="bem-navbar__link">${item.label}</a>
    </li>`
})

// na rota 404, com retorno implícito
const rota404 = { pagina: () => `<div> Página não encontrada 404 </div>` }

// no listener de mudança de hash
window.addEventListener("hashchange", ()=>{
    hash = window.location.hash;
    render();
})
```

## Funções como valores: o coração da arquitetura

Aqui está o conceito mais importante do capítulo. Em JavaScript, função é um valor como outro qualquer: pode ser guardada em variável, colocada dentro de objeto e passada como argumento para outra função (quando passada assim, chamamos de callback).

Olhe de novo o objeto que cada página exporta:

```javascript
export default {
    url: '#sobre',
    label: 'Sobre',
    pagina: sobre
}
```

A chave `pagina` guarda a função `sobre` sem executar. O roteador guarda todos esses objetos no `mapaDeRotas` e, só quando o usuário navega, executa a função da rota atual:

```javascript
async function render(){
    const rotaAtual = mapaDeRotas[hash] || rota404
    await rotaAtual.pagina(app)
}
```

Pare e aprecie: o roteador não conhece nenhuma página especificamente. Ele só sabe que toda rota tem uma função `pagina` que recebe o `app`. Esse contrato entre as partes é o que permite adicionar páginas novas sem tocar no roteador. Em engenharia de software isso se chama inversão de controle, e você acabou de implementar uma.

## Escopo: onde cada variável enxerga

Variáveis declaradas dentro de uma função só existem dentro dela:

```javascript
function contato(app) {
    const paginadecontato = `...`;  // só existe aqui dentro
    app.innerHTML = paginadecontato;
}
console.log(paginadecontato); // erro: não existe aqui fora
```

Já variáveis declaradas fora, no escopo do módulo, são visíveis pelas funções de dentro, como o array `detalhes` que a função `servicos` usa. A regra prática: declare cada variável no menor escopo possível.

## Resumo do capítulo

- Funções empacotam comportamento reutilizável; parâmetros são suas entradas, `return` é sua saída
- Função sem parênteses é valor, com parênteses é execução; o roteador depende dessa diferença
- Funções com retorno entregam valores (`cadastroCliente`), funções sem retorno causam efeitos (`sobre`, `navbar`)
- Arrow functions são a forma curta, dominante em callbacks
- Guardar funções em objetos (`pagina: sobre`) e executá-las depois é a base da arquitetura de rotas do projeto
- Cada variável deve viver no menor escopo possível

## Para praticar

1. Escreva uma função com retorno que recebe um preço e devolve o valor com 10 por cento de desconto.
2. Escreva uma função sem retorno que recebe um texto e o insere em um elemento da página via `innerHTML`.
3. Converta as duas para arrow functions.
4. Crie um objeto `botao` com as chaves `label` e `aoClicar`, onde `aoClicar` é uma função. Depois execute `botao.aoClicar()`.
5. Crie uma nova página para o projeto seguindo o padrão: função que recebe `app` e objeto exportado com `url`, `label` e `pagina`.

## Referências

- MDN Web Docs, Funções: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Functions
- MDN Web Docs, Arrow functions: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Functions/Arrow_functions
- MDN Web Docs, Callbacks: https://developer.mozilla.org/pt-BR/docs/Glossary/Callback_function
- W3Schools, JavaScript Functions: https://www.w3schools.com/js/js_functions.asp
- W3Schools, JavaScript Function Parameters: https://www.w3schools.com/js/js_function_parameters.asp
