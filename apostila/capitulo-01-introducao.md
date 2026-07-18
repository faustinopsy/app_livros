# Capítulo 1: Introdução ao projeto e preparação do ambiente

## O que vamos construir neste curso

Antes de escrever a primeira linha de código, precisamos combinar o destino da viagem. Ao longo das aulas de sábado nós vamos construir, passo a passo, uma aplicação web completa chamada App Livros. Ela é uma SPA, sigla em inglês para Single Page Application, ou seja, uma aplicação de página única.

O que isso significa na prática? Significa que o navegador carrega um único arquivo HTML e, a partir dele, todo o conteúdo das páginas (Home, Sobre, Serviços, Contato, Cadastro) é montado e trocado pelo JavaScript, sem recarregar a página inteira. É exatamente assim que funcionam aplicações modernas como Gmail e Twitter, e é assim que frameworks como React, Vue e Angular trabalham por baixo dos panos.

A diferença é que nós vamos fazer tudo sem framework nenhum, usando apenas JavaScript puro (o famoso Vanilla JS). Quando você entender como uma SPA funciona por dentro, aprender qualquer framework depois vira uma questão de sintaxe, porque os conceitos você já domina.

## Por que começar pelos fundamentos

Cada aula adiciona uma peça no projeto, e cada peça depende de um fundamento da linguagem:

1. Variáveis e tipos: guardar informações (Capítulo 2)
2. Condicionais if, else e switch: tomar decisões (Capítulo 3)
3. Laços for e while: repetir tarefas (Capítulo 4)
4. Arrays e objetos: organizar dados, como a lista de rotas do menu (Capítulo 5)
5. Funções: empacotar comportamentos, como as funções que geram páginas (Capítulo 6)
6. DOM e eventos de escuta: reagir ao usuário, como o envio do formulário (Capítulo 7)
7. Módulos e componentes: organizar o projeto em arquivos (Capítulo 8)
8. Roteamento por hash: navegar entre páginas sem recarregar (Capítulo 9)
9. Assincronismo: entender o tempo no JavaScript (Capítulo 10)
10. Fetch e APIs: buscar dados externos, como o CEP no ViaCEP (Capítulo 11)

Repare que a ordem não é aleatória. É a ordem em que o próprio projeto foi crescendo nos commits do repositório. Se você olhar o histórico do Git vai ver essa evolução registrada aula a aula.

## A estrutura do projeto

Esta é a organização de pastas que vamos construir e manter até o final:

```
app_livros/
|-- index.html                     página única da SPA
|-- src/
|   |-- css/
|   |   |-- microframework.css     estilos com metodologia BEM
|   |-- img/                       imagens usadas nos cards
|   |-- js/
|       |-- main.js                ponto de entrada: roteador e render
|       |-- components/
|           |-- navbar/            menu dinâmico
|           |-- footer/
|           |-- rotas/             definição central das rotas
|           |-- paginas/           home, sobre, servicos, contato, formCad
```

## O ponto de partida: index.html

Todo o HTML da aplicação se resume a isto:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APP livros</title>
    <link rel="stylesheet" href="src/css/microframework.css">
</head>
<body>
    <header id="navbar"></header>
    <main id="app"></main>
    <script src="src/js/main.js" type="module"></script>
</body>
</html>
```

Guarde bem esses dois elementos com id, porque eles são os pontos de montagem da aplicação:

- `<header id="navbar">` é onde o JavaScript vai desenhar o menu
- `<main id="app">` é onde o JavaScript vai desenhar o conteúdo de cada página

Repare também no atributo `type="module"` do script. Ele avisa o navegador que vamos usar ES Modules, o sistema de importação e exportação de arquivos do JavaScript moderno, que estudaremos no Capítulo 8.

## Como executar o projeto

Por causa do `type="module"`, o navegador exige que o projeto seja servido por um servidor HTTP. Abrir o arquivo direto com dois cliques (protocolo `file://`) não funciona.

Opção 1, a mais usada em aula: extensão Live Server no VS Code. Clique com o botão direito no `index.html` e escolha Open with Live Server.

Opção 2, pelo terminal:

```bash
# com Python instalado
python -m http.server 8000

# ou com Node instalado
npx serve
```

Depois acesse `http://localhost:8000` (ou a porta indicada) no navegador.

## Ferramenta essencial: o console do navegador

Aperte F12 no navegador e abra a aba Console. Esse vai ser nosso melhor amigo durante o curso inteiro. É nele que:

- aparecem os erros do nosso código, com o arquivo e a linha do problema
- imprimimos valores com `console.log()` para investigar o que está acontecendo
- testamos pequenos trechos de código antes de colocar no projeto

Acostume-se a programar com o console sempre aberto. Grande parte de aprender a programar é aprender a ler mensagens de erro sem medo.

## Resumo do capítulo

- Vamos construir uma SPA em JavaScript puro, sem frameworks
- O HTML tem uma única página com dois pontos de montagem: `#navbar` e `#app`
- Todo o resto da interface é gerado por JavaScript
- O projeto precisa rodar em um servidor HTTP por usar ES Modules
- O console do navegador (F12) é a principal ferramenta de estudo e depuração

## Para praticar

1. Crie a estrutura de pastas do projeto na sua máquina.
2. Crie o `index.html` com os dois pontos de montagem.
3. Rode o projeto com o Live Server e confirme que a página abre sem erros no console.
4. Escreva `console.log("Olá, curso de Front-End 2")` em um arquivo `main.js` e confirme que a mensagem aparece no console.

## Referências

- MDN Web Docs, Introdução ao JavaScript: https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/First_steps
- MDN Web Docs, SPA (Single Page Application): https://developer.mozilla.org/pt-BR/docs/Glossary/SPA
- W3Schools, JavaScript Tutorial: https://www.w3schools.com/js/
