# Capítulo 10: Assincronismo, o tempo no JavaScript

## Um teste que muda a intuição

Começamos este assunto em aula com um experimento que deixamos registrado nos comentários do `main.js`. Antes de rodar, tente prever a ordem das mensagens:

```javascript
console.log("A Primeira chamada")
setTimeout(() => {
    console.log("A Segunda Execução ou não?")
})
console.log("A Terceira execução ou não?")
```

A intuição diz: primeira, segunda, terceira. O que aparece no console:

```
A Primeira chamada
A Terceira execução ou não?
A Segunda Execução ou não?
```

A segunda mensagem foi por último, mesmo com o `setTimeout` sem tempo definido (zero milissegundos). Compare com a versão síncrona, também dos nossos testes:

```javascript
console.log("B Primeira chamada")
function sincrono() {
    console.log("B Segunda Execução ou não?")
}
sincrono()
console.log("B Terceira execução ou não?")
```

Aqui a ordem é a esperada: primeira, segunda, terceira. Entender por que os dois exemplos se comportam diferente é entender o assincronismo.

## O event loop em uma explicação de sala

O JavaScript executa uma coisa de cada vez, em uma única fila principal. Só que o navegador tem ajudantes: temporizadores, requisições de rede, leitura de arquivos. Quando pedimos algo a um ajudante (como o `setTimeout` ou o `fetch`), o JavaScript não fica parado esperando; ele entrega a tarefa, segue executando o código atual até o fim e deixa anotado o que fazer quando o ajudante terminar (o callback).

Quando o ajudante termina, o callback entra em uma fila de espera. O event loop é o porteiro que só deixa a fila de espera entrar quando a fila principal esvaziou. Por isso o `setTimeout` de zero milissegundos ainda executa por último: o código principal precisa terminar primeiro.

Por que a linguagem é assim? Porque o JavaScript nasceu para o navegador, e o navegador não pode congelar. Se uma busca na rede travasse tudo por três segundos, a página ficaria três segundos sem responder a cliques. Assíncrono significa: peça, continue trabalhando, reaja quando a resposta chegar.

## Você já usava assincronismo sem saber

Olhe de novo o padrão dos eventos do Capítulo 7:

```javascript
formulario.addEventListener("submit", function(event) { ... })
```

Isso é assincronismo puro: entregamos um callback que executa em algum momento futuro, quando o usuário decidir enviar. A diferença do `setTimeout` é só quem decide o momento: lá, o relógio; aqui, o usuário.

## Promises: um valor que ainda vai chegar

Callbacks funcionam, mas encadear vários (busque isso, depois aquilo, depois aquilo outro) gera um aninhamento infernal apelidado de callback hell. A solução moderna é a Promise, um objeto que representa um valor futuro. Ela está em um de três estados:

- pending: ainda esperando
- fulfilled: deu certo, o valor chegou
- rejected: deu errado, temos um erro

Consumimos uma Promise com `.then()` para o sucesso e `.catch()` para o erro:

```javascript
fetch("https://viacep.com.br/ws/01001000/json/")
    .then((response) => response.json())
    .then((dados) => console.log(dados))
    .catch((erro) => console.error(erro));
```

## async e await: assíncrono com cara de síncrono

O `async/await` é uma sintaxe por cima das Promises que deixa o código com a leitura natural de cima para baixo. É o estilo que adotamos no projeto inteiro:

- `async` antes de uma função declara que ela trabalha com Promises (e faz ela sempre devolver uma Promise)
- `await` pausa a função (só ela, não a página) até a Promise resolver, e entrega o valor

O mesmo exemplo acima, no estilo do projeto:

```javascript
async function buscarCep(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const result = await response.json();
        return result
    } catch (error) {
        console.error(error);
    }
}
```

Você reconhece: é a estrutura exata da função `cadastroCliente` do `formCad.js`.

## try e catch: o plano para quando dá errado

Rede falha. API sai do ar. Usuário digita CEP inexistente. Código assíncrono que fala com o mundo externo precisa de tratamento de erro, e com `async/await` usamos o bloco `try/catch`:

```javascript
try {
    // caminho feliz: tente executar isto
} catch (error) {
    // plano B: se qualquer linha do try falhar, caia aqui
}
```

Sem o `try/catch`, um erro na rede quebraria a função e possivelmente deixaria a tela travada em um estado estranho. Com ele, capturamos o problema e decidimos o que fazer: registrar no console, mostrar mensagem ao usuário, tentar de novo.

## O assincronismo espalhado pelo projeto

Repare que várias funções do projeto são `async`:

```javascript
async function telaCadastro(app) { ... }
async function render() {
    const rotaAtual = mapaDeRotas[hash] || rota404
    await rotaAtual.pagina(app)
}
```

O `render` usa `await` ao chamar a página porque algumas páginas fazem trabalho assíncrono (a tela de cadastro registra a busca de CEP). Como o roteador não sabe qual página é qual, ele trata todas como potencialmente assíncronas. Mais uma vez o contrato uniforme entre componentes simplificando o sistema.

Uma observação honesta de sala de aula: páginas como a Home são `async` sem precisar, por padronização. Não há erro nisso, mas saiba diferenciar: o `async` só é necessário quando existe `await` dentro.

## Resumo do capítulo

- O JavaScript executa uma coisa por vez; tarefas demoradas vão para ajudantes do navegador e voltam por callbacks
- O event loop só processa a fila de callbacks quando o código principal termina, por isso o `setTimeout(0)` roda por último
- Eventos de usuário já são assincronismo: callbacks para momentos futuros
- Promise é um valor futuro com três estados: pending, fulfilled e rejected
- `async/await` dá leitura natural ao código assíncrono e é o estilo do projeto
- `try/catch` é o plano B obrigatório quando se fala com o mundo externo

## Para praticar

1. Rode os dois testes do início do capítulo e explique a ordem das mensagens com suas palavras.
2. Crie dois `setTimeout`, um com 2000 e outro com 1000 milissegundos, e preveja a ordem antes de rodar.
3. Escreva uma função `esperar(ms)` que devolve uma Promise que resolve depois de `ms` milissegundos (pesquise `new Promise` no MDN). Use com `await`.
4. Modifique a função de CEP para imprimir "buscando..." antes do `await` e "chegou!" depois, e observe o intervalo no console.
5. Force um erro passando uma URL inválida ao `fetch` e confirme que o `catch` captura.

## Referências

- MDN Web Docs, JavaScript Assíncrono: https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/Asynchronous
- MDN Web Docs, Event loop: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Event_loop
- MDN Web Docs, Promise: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise
- MDN Web Docs, async function: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/async_function
- W3Schools, JavaScript Async: https://www.w3schools.com/js/js_async.asp
- W3Schools, JavaScript Promises: https://www.w3schools.com/js/js_promise.asp
