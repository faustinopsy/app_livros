# JavaScript na Prática — Construindo uma SPA do Zero

### Apostila do curso de Front-End Avançado

> Uma jornada didática, aula a aula, em que partimos dos fundamentos da
> linguagem JavaScript e chegamos a uma **Single Page Application** completa,
> componentizada e alimentada por APIs reais — **sem usar nenhum framework**.

Este material acompanha o projeto **App Livros** e foi escrito para que um
aluno iniciante consiga **replicar o projeto do zero**, entendendo o *porquê*
de cada linha. Cada capítulo adiciona uma peça nova ao quebra-cabeça.

---

## Como usar esta apostila

- **Leia na ordem.** Cada capítulo assume o que foi construído no anterior.
- **Digite o código.** Não copie e cole — digitar fixa o aprendizado.
- **Faça os exercícios** ao final de cada capítulo antes de avançar.
- Os blocos marcados com 🧩 **Montando o quebra-cabeça** mostram exatamente
  qual arquivo do projeto estamos criando ou alterando naquele momento.
- Os blocos marcados com ⚠️ **Cuidado** apontam erros comuns.
- Os blocos marcados com 💡 **Nos bastidores** explicam o que acontece
  "por baixo dos panos".

---

## Sumário

### Parte I — Preparação
- **Capítulo 0** — Boas-vindas: o que vamos construir e como preparar o ambiente

### Parte II — Fundamentos da Linguagem
- **Capítulo 1** — Variáveis, tipos, condicionais e a tabela verdade
- **Capítulo 2** — Arrays e Objetos: as estruturas de dados
- **Capítulo 3** — Funções: o coração da modularização
- **Capítulo 4** — Loops: repetição com controle

### Parte III — A Web viva: o DOM
- **Capítulo 5** — Manipulando o DOM e reagindo a eventos
- **Capítulo 6** — O que é uma SPA, URL, URI e o `hash`

### Parte IV — Construindo a SPA, peça por peça
- **Capítulo 7** — Renderização dinâmica com `hash` (o primeiro roteador)
- **Capítulo 8** — Componentização com ES Modules
- **Capítulo 9** — Páginas como objetos e o menu dinâmico
- **Capítulo 10** — Centralizando o roteamento (o roteador definitivo)
- **Capítulo 11** — Estilo com um microframework CSS e temas

### Parte V — Assincronismo e APIs
- **Capítulo 12** — Programação assíncrona: callbacks e o "callback hell"
- **Capítulo 13** — Promises e o `fetch`
- **Capítulo 14** — `async`/`await` e a camada de serviços
- **Capítulo 15** — Formulário de cadastro com a API ViaCEP
- **Capítulo 16** — Consumindo a API de Livros (lista, paginação e modal)
- **Capítulo 17** — Reaproveitando o padrão: a API do Rick and Morty

### Parte VI — Além do consumo de API
- **Capítulo 18** — Boas práticas, organização e próximos passos
- **Capítulo 19** — Guardando dados no navegador: Web Storage e cache
- **Capítulo 20** — Service Workers e PWA: o app que funciona offline

### Parte VII — Apêndices
- **Apêndice A** — Referência rápida de métodos
- **Apêndice B** — Gabarito dos exercícios

---

## Gerando o PDF

Todos os capítulos ficam em [`capitulos/`](capitulos/) no formato Markdown.
Para gerar o livro completo em PDF, rode a partir da pasta `apostila/`:

```bash
node build/gerar-pdf.js
```

O script junta os capítulos em ordem, aplica o tema visual e produz
`build/apostila-completa.pdf`.
