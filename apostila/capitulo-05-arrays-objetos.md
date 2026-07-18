# Capítulo 5: Arrays e objetos, organizando os dados da aplicação

## Dados que andam juntos

Uma variável guarda um valor. Mas o mundo real raramente é um valor só: um serviço tem título, descrição e imagem; uma rota tem url, label e a função da página. Precisamos de estruturas que agrupem dados relacionados. São elas o objeto e o array, e a combinação das duas sustenta o App Livros inteiro.

## Objetos: dados com nome

O objeto agrupa pares de chave e valor entre chaves:

```javascript
const rota = {
    url: '#sobre',
    label: 'Sobre',
    pagina: sobre
}
```

Este objeto existe de verdade no arquivo `sobre.js` do projeto. Ele descreve tudo que o roteador precisa saber sobre a página Sobre: o endereço (`url`), o texto do menu (`label`) e a função que desenha a página (`pagina`). Repare que um valor pode ser até uma função, e isso é fundamental para a nossa arquitetura.

Acessamos os valores de duas formas:

```javascript
// notação de ponto, quando sabemos o nome da chave
console.log(rota.url);      // "#sobre"
console.log(rota.label);    // "Sobre"

// notação de colchetes, quando o nome da chave está em uma variável
const chave = "url";
console.log(rota[chave]);   // "#sobre"
```

A notação de colchetes parece exótica até você ver o roteador usando ela:

```javascript
mapaDeRotas[rota.url] = rota;   // cria a chave dinamicamente
const rotaAtual = mapaDeRotas[hash];  // busca pela variável hash
```

Sem a notação de colchetes não haveria roteamento dinâmico.

## Arrays: dados em fila

O array guarda uma lista ordenada de valores entre colchetes, acessados pela posição, que começa em zero:

```javascript
const frutas = ["maçã", "banana", "uva"];
console.log(frutas[0]);       // "maçã"
console.log(frutas.length);   // 3
```

## A combinação poderosa: array de objetos

O padrão que mais aparece em aplicações reais é a lista de coisas estruturadas, ou seja, um array de objetos. É assim que a página de Serviços descreve seus cards:

```javascript
const detalhes = [
    {
        titulo: 'Jogo das quartas de final da copa do mundo de 2002',
        descricao: 'xxxxxxxx xxxxxxxxx xxxxx',
        imagem: 'src/img/2002_1.webp'
    },
    {
        titulo: 'Camisa azul',
        descricao: 'xxxxxxxx xxxxxxxxx xxxxx',
        imagem: 'src/img/2002_3.jpg'
    }
]
```

E é exatamente assim que o arquivo `rotas.js` descreve a aplicação inteira: um array em que cada item é o objeto de uma página:

```javascript
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

Para acessar dados aninhados, encadeamos as notações:

```javascript
console.log(detalhes[1].titulo);   // "Camisa azul"
console.log(roteador[0].url);      // "#home"
```

Leia de dentro para fora: pegue o item da posição 1 do array, depois a chave `titulo` desse objeto.

## Métodos de array: o .map() da navbar

Arrays vêm com métodos prontos que recebem uma função e aplicam a cada item. O mais importante do nosso projeto é o `.map()`, que transforma cada item em outra coisa e devolve um array novo do mesmo tamanho.

A navbar usa o `.map()` para transformar cada rota em um item de menu:

```javascript
function navbar(item_menu){
    const navbar = document.getElementById('navbar');
    navbar.innerHTML = `<nav class="bem-navbar">
            <a href="#" class="bem-navbar__brand">Brand</a>
            <ul class="bem-navbar__menu">
                ${
                    item_menu.map((item)=>{
                        return `<li class="bem-navbar__item">
                            <a href="${item.url}" class="bem-navbar__link">${item.label}</a>
                        </li>`
                    })
                }
            </ul>
        </nav>`.replaceAll(',','');
}
```

O raciocínio: o array `roteador` entra, o `.map()` transforma cada objeto de rota na string de um `<li>`, e a template string interpola o resultado dentro do `<ul>`. Adicionou uma rota nova no `rotas.js`? O menu ganha o item automaticamente, sem tocar na navbar. Isso é programar orientado a dados.

Detalhe de aula que rendeu boa discussão: quando um array é interpolado numa template string, o JavaScript junta os itens separando por vírgula. Por isso o `.replaceAll(',','')` no final, que remove as vírgulas indesejadas entre os `<li>`. Uma alternativa mais elegante é usar `.join('')` no resultado do map, que junta sem separador:

```javascript
item_menu.map((item) => `<li>...</li>`).join('')
```

Outros métodos que valem conhecer:

```javascript
const numeros = [1, 2, 3, 4, 5];

// filter: devolve só os itens que passam no teste
const pares = numeros.filter((n) => n % 2 === 0);   // [2, 4]

// find: devolve o primeiro item que passa no teste
const maiorQueTres = numeros.find((n) => n > 3);    // 4

// forEach: executa algo para cada item, sem devolver nada
numeros.forEach((n) => console.log(n));

// push: adiciona no final
numeros.push(6);
```

## O objeto como mapa de consulta

Fechamos o capítulo com a jogada mais inteligente do roteador. Buscar uma rota dentro de um array exigiria percorrer item por item. Em vez disso, convertemos o array em um objeto onde a chave é a própria url:

```javascript
const mapaDeRotas = {}
for (const rota of roteador) {
    mapaDeRotas[rota.url] = rota
}
```

O resultado é um objeto assim:

```javascript
{
    "#home": { url: "#home", label: "Home", pagina: home },
    "#sobre": { url: "#sobre", label: "Sobre", pagina: sobre },
    // ...
}
```

Agora encontrar a rota do hash atual é acesso direto, `mapaDeRotas[hash]`, sem laço nenhum. Essa técnica de indexar dados por uma chave é usada em sistemas do mundo inteiro.

## Resumo do capítulo

- Objetos agrupam dados com nome (chave e valor); arrays guardam listas ordenadas
- A notação de colchetes permite chaves dinâmicas, e é ela que viabiliza o roteador
- O array de objetos é o padrão central do projeto: `detalhes` nos serviços e `roteador` nas rotas
- O `.map()` transforma dados em HTML e faz o menu se montar sozinho a partir das rotas
- Converter um array em objeto de consulta (`mapaDeRotas`) troca busca por acesso direto

## Para praticar

1. Crie um array de objetos com quatro livros (titulo, autor, preco) e imprima o título do terceiro livro.
2. Use `.map()` para gerar um array de strings no formato "Titulo custa R$ preco".
3. Use `.filter()` para obter só os livros com preço abaixo de 50.
4. Transforme o array de livros em um objeto indexado pelo título, seguindo o padrão do `mapaDeRotas`.
5. Adicione uma nova rota fictícia ao array `roteador` do projeto e observe o menu ganhar o item sozinho.

## Referências

- MDN Web Docs, Trabalhando com objetos: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Working_with_objects
- MDN Web Docs, Array: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array
- MDN Web Docs, Array.prototype.map(): https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/map
- W3Schools, JavaScript Objects: https://www.w3schools.com/js/js_objects.asp
- W3Schools, JavaScript Arrays: https://www.w3schools.com/js/js_arrays.asp
