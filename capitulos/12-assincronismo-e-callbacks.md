# Capítulo 12 — Programação assíncrona: callbacks e o "callback hell"

Chegamos à parte mais empolgante do curso: trazer **dados do mundo real** para
dentro do App Livros. Antes de pedir informações a um servidor pela internet,
precisamos entender um conceito que muda a forma como o JavaScript pensa: o
**assincronismo**.

Este capítulo é conceitual, mas fundamental. Sem entender o "por quê" do
assincronismo, o `fetch` e o `async/await` dos próximos capítulos parecerão
mágica incompreensível.

---

## 12.1 Síncrono x assíncrono

**Programação síncrona** é o modo "natural": uma tarefa por vez, em ordem. A
linha 2 só roda depois que a linha 1 termina completamente. É como uma fila de
banco: o próximo só é atendido quando o anterior termina.

```js
console.log("Primeiro");
console.log("Segundo");
console.log("Terceiro");
// saída, em ordem: Primeiro, Segundo, Terceiro
```

O problema aparece com tarefas **demoradas**. Imagine pedir dados a um servidor
que fica do outro lado do mundo — isso pode levar segundos. Se o JavaScript
fosse puramente síncrono, a **página inteira congelaria** durante a espera: nada
de clicar, rolar ou digitar. Péssima experiência.

**Programação assíncrona** resolve isso: operações demoradas são "disparadas" e o
programa **continua executando** o resto do código, sem esperar. Quando a
operação termina, um aviso nos permite tratar o resultado.

Veja a diferença na prática:

```js
console.log("Início");

setTimeout(() => {
  console.log("Pausa... (depois de 2 segundos)");
}, 2000);

console.log("Fim");
```

Qual a saída? Muita gente aposta em "Início, Pausa, Fim". Mas o correto é:

```
Início
Fim
Pausa... (depois de 2 segundos)
```

O `setTimeout` **agenda** a função para daqui a 2 segundos e **não bloqueia** o
código. Então "Fim" é impresso imediatamente, e só depois — quando os 2 segundos
passam — aparece "Pausa". O programa não ficou parado esperando.

> 💡 **Nos bastidores — o `setTimeout`**
> `setTimeout(funcao, milissegundos)` agenda uma função para rodar no futuro. É
> a forma mais simples de ver o assincronismo em ação. Repare que ele recebe uma
> **função (callback)** como primeiro argumento — voltamos ao Capítulo 3.

---

## 12.2 Por que a web precisa disso

O caso de uso número um do assincronismo é **buscar dados de um servidor**.
Quando o App Livros pede a lista de livros a uma API na internet, essa resposta
demora — pode ser 100 milissegundos numa boa conexão, ou vários segundos numa
ruim. Durante essa espera:

- **Modo síncrono (ruim):** a página trava. O usuário não consegue fazer nada até
  os dados chegarem.
- **Modo assíncrono (bom):** a página continua responsiva. Podemos até mostrar um
  "Carregando..." enquanto esperamos, e preencher a tela quando os dados chegam.

Por isso, **toda comunicação com servidores em JavaScript é assíncrona**. Não é
opcional — é assim que a linguagem funciona. Dominar isso é dominar o
desenvolvimento web moderno.

---

## 12.3 Callbacks: a primeira solução

Como o JavaScript nos avisa quando uma tarefa assíncrona termina? Historicamente,
a resposta foi: através de um **callback** (Cap. 3) — uma função que passamos
para ser executada **quando** a tarefa terminar.

Vejamos um exemplo simples e síncrono, só para firmar o padrão:

```js
function somar(a, b, callback) {
  const resultado = a + b;
  callback(resultado); // avisa "terminei, aqui está o resultado"
}

function mostrarResultado(resultado) {
  console.log(`O resultado é: ${resultado}`);
}

somar(1, 2, mostrarResultado); // "O resultado é: 3"
```

A função `somar` não sabe o que fazer com o resultado — ela apenas o entrega ao
`callback`. Quem chamou decide o que acontece depois. Esse padrão — "faça isto e,
quando terminar, chame aquilo" — é a essência do tratamento assíncrono.

Você já usa callbacks o tempo todo, aliás:

```js
botao.addEventListener("click", function () {
  console.log("Cliquei!"); // callback: roda QUANDO o clique acontecer
});
```

O `addEventListener` é assíncrono por natureza: ele não sabe *quando* o clique
virá, então você entrega um callback para rodar no momento certo.

---

## 12.4 O "callback hell"

Callbacks funcionam, mas têm um problema sério quando as tarefas **dependem umas
das outras** em sequência. Imagine: buscar um usuário, depois buscar os pedidos
dele, depois os detalhes de cada pedido, depois... Cada passo depende do
anterior, e cada um é assíncrono. Com callbacks, isso vira uma pirâmide
aninhada:

```js
buscarUsuario(id, function (usuario) {
  buscarPedidos(usuario, function (pedidos) {
    buscarDetalhes(pedidos, function (detalhes) {
      calcularTotal(detalhes, function (total) {
        console.log(total);
        // ...e assim vai, cada vez mais fundo →
      });
    });
  });
});
```

Repare no formato de "escada" que desliza para a direita. Esse antipadrão é
carinhosamente chamado de **"callback hell"** (o inferno dos callbacks) ou
"pirâmide da perdição". Os problemas:

1. **Difícil de ler** — a lógica se aninha em vez de fluir de cima para baixo.
2. **Difícil de tratar erros** — cada nível precisaria da sua própria checagem de
   erro, multiplicando a bagunça.
3. **Difícil de manter** — reordenar ou inserir um passo no meio é um pesadelo.

> 💡 **Nos bastidores**
> Os callbacks foram, por muitos anos, a única forma de lidar com a sequência em
> que as coisas assíncronas aconteciam. Eram uma boa solução para o seu tempo,
> mas o "callback hell" incomodava tanto que a comunidade criou algo melhor. Essa
> "coisa melhor" são as **Promises**, o assunto do próximo capítulo — e a razão
> pela qual você raramente escreverá pirâmides como essa hoje em dia.

---

## 12.5 O caminho que vamos percorrer

Para consumir APIs de forma elegante, a linguagem evoluiu em três estágios.
Vamos aprender os três, em ordem, porque cada um esclarece o próximo:

| Estágio        | Ideia                                          | Capítulo |
|----------------|------------------------------------------------|----------|
| **Callbacks**  | "quando terminar, chame esta função"           | 12 (aqui) |
| **Promises**   | um objeto que representa um resultado futuro    | 13       |
| **async/await**| escrever código assíncrono com cara de síncrono | 14       |

Todos os três coexistem no JavaScript moderno, e você vai encontrá-los em código
alheio. Mas, no App Livros, o nosso destino é o **async/await** — a forma mais
limpa e legível. Os callbacks e as Promises são a fundação que torna o
async/await compreensível.

> 🧩 **Montando o quebra-cabeça**
> No projeto, o assincronismo aparece em quatro momentos: buscar o endereço pelo
> CEP (Cap. 15), listar livros (Cap. 16), listar personagens do Rick and Morty
> (Cap. 17) e, em todos eles, mostrar um indicador de "Carregando...". Cada uma
> dessas telas espera dados da internet **sem travar** a interface. É o
> assincronismo trabalhando por nós.

---

## Recapitulando

- **Síncrono** = uma tarefa por vez, em ordem, esperando cada uma terminar.
- **Assíncrono** = tarefas demoradas são disparadas sem bloquear o resto do
  código.
- Toda comunicação com servidores em JavaScript é **assíncrona**, para não
  travar a página.
- **Callbacks** são a forma clássica de tratar o "quando terminar": passamos uma
  função para ser executada ao fim da tarefa.
- Sequências de callbacks aninhados geram o **"callback hell"** — difícil de ler,
  tratar erros e manter.
- A evolução callbacks → **Promises** → **async/await** resolve isso; vamos
  percorrê-la nos próximos capítulos.

---

> **Exercícios do Capítulo 12**
>
> 1. Preveja a saída deste código **antes** de rodar, depois confirme no
>    Console:
>    ```js
>    console.log("A");
>    setTimeout(() => console.log("B"), 0);
>    console.log("C");
>    ```
>    (Sim, mesmo com `0` de tempo o "B" sai por último. Pesquise "event loop"
>    para descobrir por quê.)
> 2. Escreva uma função `dobrar(numero, callback)` que calcula o dobro e entrega
>    o resultado ao callback. Chame-a passando uma função que imprime o
>    resultado.
> 3. Explique, com suas palavras, por que uma requisição a um servidor **precisa**
>    ser assíncrona.
> 4. Descreva um cenário do dia a dia (fora da programação) que seja
>    "assíncrono" — algo que você inicia e continua sua vida sem esperar
>    terminar.
> 5. **Reflexão:** liste os três problemas do "callback hell" e explique por que
>    cada um dificulta a manutenção do código.
