# Capítulo 4: Repetindo tarefas com for e while

## Por que repetir

Imagine montar o menu do site escrevendo um `<li>` de cada vez para Home, Cadastro, Sobre, Serviços e Contato. Agora imagine que o cliente pede uma sexta página. E uma sétima. Copiar e colar código é o caminho mais curto para o bug, porque toda alteração precisa ser repetida em vários lugares.

Os laços de repetição (loops) resolvem isso: escrevemos a instrução uma vez e mandamos o JavaScript repetir quantas vezes for preciso.

## O laço for clássico

A estrutura tem três partes separadas por ponto e vírgula: inicialização, condição de continuação e incremento.

```javascript
for (let i = 0; i < 5; i++) {
    console.log("Volta número " + i);
}
```

Lendo em voz alta: crie um contador `i` começando em zero; enquanto `i` for menor que 5, execute o bloco; ao final de cada volta, some 1 ao contador. O resultado imprime as voltas 0, 1, 2, 3 e 4.

Detalhe que sempre gera pergunta em aula: por que começar do zero? Porque as posições de um array começam do zero, como vimos ao estudar arrays. O primeiro item é `lista[0]`. Então o par `let i = 0` com `i < lista.length` percorre o array inteiro sem estourar o limite.

## O for no projeto: a página de Serviços

A página de Serviços do App Livros é o exemplo perfeito. Temos um array de objetos com os detalhes de cada card:

```javascript
const detalhes = [
    {
        titulo: 'Jogo das quartas de final da copa do mundo de 2002',
        descricao: 'xxxxxxxx xxxxxxxxx xxxxx',
        imagem: 'src/img/2002_1.webp'
    },
    {
        titulo: 'Jogo especial',
        descricao: 'xxxxxxxx xxxxxxxxx xxxxx',
        imagem: 'src/img/2002_2.jpg'
    },
    // ... outros itens
]
```

E um `for` que transforma cada objeto em um card de HTML:

```javascript
function servicos(app){
    cardServico += `<div class="bem-grid-auto">`
    for(let i = 0; i < detalhes.length; i++){
        cardServico += `
                    <div class="bem-card">
                        <img class="bem-card__image" src="${detalhes[i].imagem}" alt="Image description">
                        <div class="bem-card__body">
                            <h3 class="bem-card__title">${detalhes[i].titulo}</h3>
                            <p>${detalhes[i].descricao}</p>
                        </div>
                    </div>
            `
    }
    cardServico += `</div>`
    app.innerHTML = cardServico
}
```

Repare no padrão: uma variável acumuladora (`cardServico`) começa com a abertura do grid, o laço concatena um card por volta usando `detalhes[i]` para acessar o item da vez, e no final fechamos o grid e jogamos tudo no `innerHTML`. Quatro cards ou quarenta, o código é o mesmo. Para adicionar um serviço novo, basta adicionar um objeto no array.

## O for...of

Quando não precisamos do índice numérico, o `for...of` percorre diretamente os valores e deixa o código mais limpo. É ele que usamos no `main.js` para montar o mapa de rotas:

```javascript
const mapaDeRotas = {}
for (const rota of roteador) {
    mapaDeRotas[rota.url] = rota
}
```

Leia assim: para cada `rota` dentro do array `roteador`, crie no objeto `mapaDeRotas` uma chave com a url dessa rota apontando para a rota inteira. Em três linhas transformamos um array em um objeto de consulta rápida. Esse trecho é o coração do roteador e será destrinchado no Capítulo 9.

## O laço while

O `while` repete enquanto a condição for verdadeira, sem prometer quantas voltas serão. Use quando o número de repetições não é conhecido de antemão:

```javascript
let tentativas = 0;
let senhaCorreta = false;

while (!senhaCorreta && tentativas < 3) {
    tentativas++;
    // aqui pediríamos a senha ao usuário
    console.log("Tentativa número " + tentativas);
    // senhaCorreta receberia o resultado da verificação
}
```

Cuidado clássico: se a condição nunca ficar falsa, o laço roda para sempre e trava a página. Todo `while` precisa de algo dentro do bloco que caminhe para o fim, como o `tentativas++` acima.

Existe também o `do...while`, que executa o bloco pelo menos uma vez antes de testar a condição:

```javascript
let resposta;
do {
    resposta = "s"; // simulando uma entrada do usuário
} while (resposta !== "s" && resposta !== "n");
```

## break e continue

Duas palavras controlam o laço por dentro:

```javascript
for (let i = 0; i < 10; i++) {
    if (i === 3) continue; // pula esta volta e vai para a próxima
    if (i === 7) break;    // encerra o laço de vez
    console.log(i);        // imprime 0 1 2 4 5 6
}
```

## for tradicional ou métodos de array?

No Capítulo 5 vamos conhecer o método `.map()`, que a navbar usa para gerar os itens do menu. Nos comentários do arquivo `navbar.js` deixamos registrada a versão com `for` para comparação:

```javascript
/*
for(let i = 0; i < item_menu.length; i++){
    `<li class="bem-navbar__item">
        <a href="${item_menu[i].url}" class="bem-navbar__link">${item_menu[i].label}</a>
    </li>`
}
*/
```

Os dois resolvem o mesmo problema. O `for` dá controle total (índice, break, continue), enquanto o `.map()` é mais declarativo: diz o que fazer com cada item e devolve um array novo pronto. Saber os dois é obrigatório; escolher qual usar é questão de contexto e legibilidade.

## Resumo do capítulo

- Laços eliminam código repetido: escreva uma vez, execute muitas
- O `for` clássico tem inicialização, condição e incremento, e casa perfeitamente com arrays indexados do zero
- O padrão acumulador (string que cresce a cada volta) é como a página de Serviços monta seus cards
- O `for...of` percorre valores diretamente e é usado para montar o `mapaDeRotas`
- O `while` repete enquanto a condição valer, e exige cuidado para não virar laço infinito
- `break` encerra o laço, `continue` pula para a próxima volta

## Para praticar

1. Crie um array com cinco títulos de livros e use um `for` clássico para imprimir cada um numerado no console.
2. Refaça o exercício 1 com `for...of`.
3. Adicione um quinto objeto ao array `detalhes` da página de Serviços e confirme que o card novo aparece sem mudar o laço.
4. Escreva um `while` que soma os números de 1 a 100 e imprime o total.
5. Desafio: usando o padrão acumulador, gere uma tabela HTML (string) a partir de um array de objetos com nome e preço de livros.

## Referências

- MDN Web Docs, Laços e iterações: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Loops_and_iteration
- MDN Web Docs, for...of: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/for...of
- W3Schools, JavaScript For Loop: https://www.w3schools.com/js/js_loop_for.asp
- W3Schools, JavaScript While Loop: https://www.w3schools.com/js/js_loop_while.asp
