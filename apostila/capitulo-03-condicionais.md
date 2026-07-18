# Capítulo 3: Tomando decisões com if, else e switch

## Programas que decidem

Até agora nossas variáveis apenas guardam valores. Mas um programa de verdade precisa tomar decisões: se a rota existe, mostra a página; senão, mostra o erro 404. Se o formulário está preenchido, envia; senão, avisa o usuário. Essa capacidade de decidir é o que chamamos de estrutura condicional.

## Operadores de comparação

Antes de decidir, precisamos comparar. Os operadores de comparação sempre devolvem um boolean, ou seja, `true` ou `false`:

```javascript
5 > 3        // true
5 < 3        // false
5 >= 5       // true
5 <= 4       // false
5 == "5"     // true  (compara só o valor, converte o tipo)
5 === "5"    // false (compara valor E tipo)
5 != "5"     // false
5 !== "5"    // true
```

Regra da sala de aula: use sempre `===` e `!==`, os operadores estritos. O `==` faz conversões automáticas de tipo que geram surpresas desagradáveis. Por exemplo, `0 == ""` é `true`, o que raramente é o que você quer.

## Operadores lógicos

Para combinar condições usamos três operadores:

```javascript
// && (E): as duas condições precisam ser verdadeiras
idade >= 18 && possuiIngresso === true

// || (OU): basta uma condição ser verdadeira
diaSemana === "sabado" || diaSemana === "domingo"

// ! (NÃO): inverte o valor
!menuAberto   // se menuAberto é false, vira true
```

## O if e o else

A estrutura básica é: se a condição for verdadeira, executa o primeiro bloco; senão, executa o bloco do `else`:

```javascript
const hora = 14;

if (hora < 12) {
    console.log("Bom dia");
} else if (hora < 18) {
    console.log("Boa tarde");
} else {
    console.log("Boa noite");
}
```

O `else if` permite encadear quantos testes forem necessários, e o `else` final é o plano B quando nenhum teste passou.

## Onde o projeto usa condicionais sem você perceber

### O truque do || no roteador

Olhe esta linha do nosso `main.js`:

```javascript
let hash = window.location.hash || '#inicio';
```

O operador `||` aqui funciona como um valor padrão. Quando o usuário abre o site pela primeira vez, `window.location.hash` é uma string vazia, que o JavaScript considera um valor falso (falsy). Então o `||` entrega o valor da direita, `'#inicio'`. É o equivalente compacto de:

```javascript
let hash;
if (window.location.hash) {
    hash = window.location.hash;
} else {
    hash = '#inicio';
}
```

### A rota 404

O mesmo truque aparece na hora de renderizar:

```javascript
const rota404 = { pagina: () => `<div> Página não encontrada 404 </div>` }

async function render(){
    const rotaAtual = mapaDeRotas[hash] || rota404
    await rotaAtual.pagina(app)
}
```

Se o `hash` digitado não existe no `mapaDeRotas`, a busca devolve `undefined`, que também é falsy, e o `||` entrega a `rota404`. Uma linha só resolve toda a lógica de página não encontrada.

### Verificando se algo é uma função

Em uma das versões do roteador tínhamos este teste:

```javascript
if (typeof mapaDeRotas[hash].acao === 'function') {
    await mapaDeRotas[hash].acao()
}
```

Traduzindo: só execute a `acao` da rota se ela existir e for de fato uma função. Sem esse `if`, rotas sem `acao` quebrariam o programa.

## Valores truthy e falsy

O JavaScript considera falsos (falsy) estes valores quando aparecem em uma condição: `false`, `0`, `""` (string vazia), `null`, `undefined` e `NaN`. Todo o resto é verdadeiro (truthy), inclusive strings com conteúdo, números diferentes de zero, arrays e objetos, mesmo vazios.

É por isso que podemos escrever `if (window.location.hash)` sem comparar com nada: estamos perguntando se a string tem conteúdo.

## O switch case

Quando comparamos a mesma variável contra vários valores exatos, o `switch` fica mais legível que uma escada de `else if`:

```javascript
const rota = "#contato";

switch (rota) {
    case "#home":
        console.log("Mostrando a página inicial");
        break;
    case "#sobre":
        console.log("Mostrando a página sobre");
        break;
    case "#contato":
        console.log("Mostrando a página de contato");
        break;
    default:
        console.log("Página não encontrada 404");
}
```

Três pontos de atenção:

1. O `switch` compara com `===`, ou seja, valor e tipo
2. O `break` encerra o caso; sem ele a execução vaza para o caso seguinte
3. O `default` é o equivalente do `else`, executado quando nenhum caso combina

Curiosidade importante para o nosso projeto: nas primeiras aulas o roteamento poderia ter sido feito com um `switch` gigante testando cada hash. Nós escolhemos outro caminho, o objeto `mapaDeRotas`, porque adicionar uma rota nova vira só adicionar um item no array, sem mexer no roteador. Guarde essa comparação, ela volta no Capítulo 9.

## O operador ternário

Para decisões curtas que produzem um valor, existe a forma compacta:

```javascript
const mensagem = idade >= 18 ? "Pode entrar" : "Entrada não permitida";
```

Leia assim: condição, interrogação, valor se verdadeiro, dois pontos, valor se falso. Use apenas para casos simples; se a lógica cresce, volte para o `if` normal.

## Resumo do capítulo

- Condicionais permitem que o programa escolha caminhos diferentes
- Use sempre `===` e `!==` nas comparações
- O `||` serve como valor padrão e é usado duas vezes no coração do nosso roteador
- Valores falsy: `false`, `0`, `""`, `null`, `undefined`, `NaN`
- O `switch` é uma alternativa legível para comparar uma variável contra vários valores exatos
- O ternário resolve decisões curtas em uma linha

## Para praticar

1. Escreva uma função que recebe uma hora (0 a 23) e devolve a saudação correta usando if e else if.
2. Reescreva o exercício 1 usando switch (dica: use `switch (true)` ou faixas de valores com Math.floor).
3. Simule o comportamento da rota 404: crie um objeto com três rotas, busque uma rota que não existe e use `||` para devolver uma mensagem padrão.
4. Teste no console cada valor falsy dentro de um `if` e confirme que o bloco não executa.

## Referências

- MDN Web Docs, if...else: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/if...else
- MDN Web Docs, switch: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/switch
- MDN Web Docs, Operadores lógicos: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Logical_OR
- W3Schools, JavaScript if else: https://www.w3schools.com/js/js_if_else.asp
- W3Schools, JavaScript switch: https://www.w3schools.com/js/js_switch.asp
