# Capítulo 0 — Boas-vindas

## O que vamos construir juntos

Se você está começando agora no mundo do desenvolvimento web, provavelmente já
ouviu falar de nomes como React, Vue ou Angular. São ferramentas poderosas —
mas elas escondem, atrás de muita "mágica", conceitos que **todo bom
desenvolvedor precisa dominar**. A proposta deste curso é justamente o
contrário: vamos abrir o capô do carro e entender o motor.

Ao longo desta apostila vamos construir, do zero e **sem nenhum framework**,
uma aplicação chamada **App Livros**. Ela é uma *SPA* (Single Page Application,
ou "aplicação de página única"). Na prática, isso significa uma aplicação que
carrega **uma única página HTML** e, a partir daí, troca o conteúdo na tela
dinamicamente conforme o usuário navega — sem nunca recarregar a página inteira.

O App Livros terá:

- Um **menu de navegação** gerado automaticamente por JavaScript;
- Várias **páginas** (Home, Sobre, Serviços, Contato, Cadastro, Livros,
  Rick and Morty), cada uma sendo um pequeno módulo independente;
- Um **roteador** próprio, que decide qual página mostrar com base na URL;
- **Formulários** que reagem ao usuário — inclusive um que busca um endereço
  a partir do CEP consultando uma API pública;
- **Telas alimentadas por APIs reais**, com listagem, paginação e uma janela
  de detalhes (modal);
- Um **microframework de CSS** próprio, com suporte a temas (dia, tarde, noite).

Tudo isso usando apenas **HTML, CSS e JavaScript puro** (também chamado de
"vanilla JavaScript"). Quando você terminar, entenderá o que um framework faz
por você — e será capaz de aprender qualquer framework muito mais rápido,
porque os fundamentos estarão sólidos.

---

## A filosofia do curso: montar um quebra-cabeça

Ninguém aprende a construir uma casa começando pelo telhado. Por isso, este
livro é **incremental**. Cada capítulo entrega uma peça, e essa peça se encaixa
nas anteriores. Veja o mapa da jornada:

```
Fundamentos da linguagem
   variáveis → condicionais → arrays/objetos → funções → loops
                                   │
                                   ▼
Interagindo com a página
        DOM → eventos → formulários
                                   │
                                   ▼
Estruturando a aplicação
   SPA → hash → roteador → módulos → componentes
                                   │
                                   ▼
Trazendo dados do mundo real
   assíncrono → callbacks → promises → fetch → async/await → APIs
```

Repare que **só chegamos às APIs no final**. Isso é proposital: consumir uma
API exige entender funções, objetos, loops, o DOM e o assincronismo. Se
tentássemos começar pelo "legal" (dados vindos da internet), você ficaria
perdido. Vamos construir a fundação primeiro.

> 💡 **Nos bastidores**
> O projeto real foi desenvolvido *aula a aula, aos sábados*. O histórico de
> commits do repositório conta essa evolução: primeiro vieram exercícios de
> fundamentos, depois as funções que geram páginas, depois o menu dinâmico, a
> centralização do roteamento e, por fim, o consumo de APIs. Esta apostila
> segue exatamente essa mesma ordem.

---

## Preparando o ambiente

Você precisa de pouca coisa para começar. Nada de instalar frameworks ou
gerenciadores de pacote complicados.

### 1. Um editor de código

Recomendamos o **Visual Studio Code** (gratuito). Baixe em
<https://code.visualstudio.com>. Instale também a extensão **Live Server** —
ela sobe um servidor local com um clique, e vamos precisar disso.

### 2. Um navegador com boas ferramentas

Use **Google Chrome**, **Microsoft Edge** ou **Firefox**. Vamos usar bastante
o **Console do navegador** (as *DevTools*). Você abre pressionando `F12` ou
clicando com o botão direito na página → *Inspecionar* → aba *Console*.

O Console é o seu laboratório. É onde você vê mensagens de `console.log()`,
testa trechos de código e descobre erros. Abra-o agora e digite:

```js
console.log("Olá, mundo!");
2 + 2;
```

Pressione `Enter` depois de cada linha. Viu a resposta aparecer? Esse será o
seu companheiro durante todo o curso.

### 3. Por que preciso de um servidor local?

Mais adiante, o projeto usará **ES Modules** (arquivos JavaScript que importam
uns aos outros com `import`/`export`). Por segurança, os navegadores **não
permitem** que módulos sejam carregados quando você abre o arquivo direto pelo
sistema (endereços que começam com `file://`). É preciso servir os arquivos por
HTTP.

Há duas formas simples:

**Opção A — Live Server (a mais fácil):**
No VS Code, clique com o botão direito no arquivo `index.html` e escolha
*Open with Live Server*. O navegador abre sozinho, geralmente em
`http://127.0.0.1:5500`.

**Opção B — Terminal:**

```bash
# Se você tem Python instalado:
python -m http.server 8000

# Ou, se tem Node.js:
npx serve
```

Depois é só acessar `http://localhost:8000` (ou a porta indicada).

> ⚠️ **Cuidado**
> Se em algum momento os `import` pararem de funcionar com um erro parecido com
> *"CORS policy"* ou *"Cross origin requests are only supported for
> HTTP"*, é quase certo que você abriu o arquivo com `file://` em vez de usar um
> servidor. Volte para o Live Server.

---

## A estrutura final do projeto

Só para você ter uma visão do destino (não se assuste, vamos criar cada arquivo
com calma), este é o formato que o projeto terá ao final:

```
app_livros/
├── index.html                      # a única página HTML da SPA
├── src/
│   ├── css/
│   │   └── microframework.css      # nosso "mini Bootstrap" com temas
│   ├── img/                        # imagens usadas nas páginas
│   └── js/
│       ├── main.js                 # ponto de entrada: inicia tudo
│       ├── components/
│       │   ├── navbar/navbar.js    # o menu de navegação
│       │   ├── footer/footer.js
│       │   ├── rotas/rotas.js      # a lista de rotas da aplicação
│       │   └── paginas/            # cada página é um arquivo
│       │       ├── home.js
│       │       ├── sobre.js
│       │       ├── servicos.js
│       │       ├── contato.js
│       │       ├── formCad.js      # cadastro com busca de CEP
│       │       ├── livros.js       # tela alimentada por API
│       │       └── rickandmorty.js # outra tela alimentada por API
│       └── services/               # a camada que conversa com as APIs
│           ├── api.js              # função genérica de requisição
│           ├── livros.js
│           ├── rickandmorty.js
│           └── loading.js          # indicador de "carregando..."
└── readme.md
```

Não decore isso. A cada capítulo você vai entender por que cada pasta existe.
Por enquanto, guarde só uma ideia: **cada arquivo tem uma responsabilidade
única**. É esse princípio que mantém projetos grandes sob controle.

---

## O que você precisa saber antes de começar

Este curso é de **Front-End Avançado**, mas "avançado" aqui significa que vamos
aprofundar JavaScript — não que você precisa ser um expert. O ideal é que você
já tenha tido contato com:

- **HTML básico**: tags como `<div>`, `<h1>`, `<p>`, `<form>`, `<input>`;
- **CSS básico**: seletores, cores, um pouco de layout;
- Nenhuma experiência prévia com JavaScript é obrigatória — começamos do começo
  no Capítulo 1.

Se você travar em algum ponto de HTML ou CSS, a
[documentação da MDN](https://developer.mozilla.org/pt-BR/) é a melhor
referência gratuita em português.

---

## Recapitulando

- Vamos construir uma **SPA** completa, do zero, sem frameworks.
- O aprendizado é **incremental**: cada capítulo encaixa uma peça nova.
- Você precisa de um **editor** (VS Code), um **navegador** e um **servidor
  local** (Live Server resolve).
- O **Console do navegador** é o seu laboratório — mantenha-o aberto.

No próximo capítulo, começamos pelos tijolos mais básicos da linguagem:
variáveis, tipos de dados e as decisões (condicionais). Vamos lá! 🚀

---

> **Exercícios do Capítulo 0**
>
> 1. Instale o VS Code e a extensão Live Server.
> 2. Crie uma pasta `app_livros`, coloque dentro um arquivo `index.html` com o
>    conteúdo mínimo abaixo e abra-o com o Live Server. Confirme que aparece o
>    texto na tela.
>    ```html
>    <!DOCTYPE html>
>    <html lang="pt-BR">
>    <head><meta charset="UTF-8"><title>App Livros</title></head>
>    <body>
>      <h1>Meu primeiro passo!</h1>
>      <script>console.log("O JavaScript está rodando.");</script>
>    </body>
>    </html>
>    ```
> 3. Abra o Console (`F12`) e confirme que a mensagem
>    *"O JavaScript está rodando."* apareceu.
> 4. Ainda no Console, calcule quantos segundos há em um dia digitando
>    `24 * 60 * 60`.
