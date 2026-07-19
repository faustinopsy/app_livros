# Capítulo 14: Fechando o ciclo, o projeto completo e os próximos passos

## Olhando para trás

Na primeira aula, nossa aplicação era um `console.log` no navegador. Hoje ela é uma SPA com menu dinâmico, cinco páginas componentizadas, roteamento por hash com página 404 e um formulário que consulta uma API pública em tempo real. Nenhum framework, nenhuma mágica: cada linha passou pela sua mão e está explicada nesta apostila.

Vale reconstituir o mapa do que foi aprendido, porque ele é também o mapa de leitura para revisão:

| Fundamento | Onde vive no projeto | Capítulo |
|---|---|---|
| Variáveis, const e let, template strings | Todo o projeto, em especial as páginas | 2 |
| Condicionais, operador \|\| como padrão | Hash inicial e rota 404 no main.js | 3 |
| Laços for e for...of | Cards de serviços e mapa de rotas | 4 |
| Arrays e objetos, .map() | rotas.js, detalhes de serviços, navbar | 5 |
| Funções, callbacks, arrow functions | Contrato das páginas, rota 404, listeners | 6 |
| DOM e eventos (submit, blur, hashchange) | Contato, cadastro e roteador | 7 |
| ES Modules e componentes auto montáveis | Estrutura inteira do src/js | 8 |
| Roteamento hash em SPA | main.js linha por linha | 9 |
| Event loop, Promises, async/await | Testes comentados e render assíncrono | 10 |
| Fetch, JSON e tratamento de erros | Cadastro com ViaCEP e personagens | 11 |
| Cache, armazenamentos e padrões Strategy e Decorator | services/api.js, apiCache.js e storageStrategy.js | 12 |
| Engenharia de prompt e trabalho com IA | Seu próximo projeto | 13 |

## A prova de que você aprendeu

O teste definitivo não é recitar definições, é conseguir responder perguntas de arquitetura como estas, que foram as perguntas centrais do curso:

1. Por que a aplicação inteira funciona com um único arquivo HTML?
2. O que acontece, passo a passo, entre o clique em "Sobre" no menu e a página aparecer na tela?
3. Por que adicionar uma página nova não exige alterar o roteador nem a navbar?
4. Por que o `addEventListener` precisa vir depois do `innerHTML`?
5. Por que o `fetch` precisa de `await` duas vezes e de um `try/catch`?

Se alguma resposta hesitar, o capítulo correspondente está aí para revisita. A apostila foi escrita para ser relida com o projeto aberto do lado.

## Próximos passos do projeto

O roadmap do curso ainda reserva refinamentos, e eles são os desafios de conclusão:

1. Renderização dinâmica de dados de API: substituir o array `detalhes` da página de Serviços por dados reais vindos de uma API de livros, como a Open Library, aplicando o padrão completo do Capítulo 11
2. Persistência local: guardar os contatos capturados no `localStorage`, para a lista sobreviver ao fechamento do navegador
3. Validações de formulário: CEP com formato correto, email válido, campos obrigatórios
4. Estados de carregamento: mostrar um "carregando..." enquanto o fetch não responde
5. Acessibilidade e refinamento de CSS sobre a base BEM já construída

E o desafio maior, que usa o Capítulo 13: escolher uma funcionalidade dessa lista e construí-la conduzindo uma IA como seu programador funcionário, com você no papel de arquiteto e revisor.

## Depois do curso

O caminho natural a partir daqui:

- Aprofundar JavaScript: classes, closures, destructuring, spread, generators
- Aprender um framework (React ou Vue) reconhecendo neles tudo que você já fez na mão: componentes, rotas, renderização orientada a dados
- Conhecer testes automatizados, que são o próximo nível da confiança no próprio código
- Praticar Git além do básico: branches, pull requests, revisão de código

## Bibliografia e referências gerais

### Documentação de consulta permanente

- MDN Web Docs, a referência definitiva de JavaScript, HTML e CSS, mantida pela Mozilla: https://developer.mozilla.org/pt-BR/
- W3Schools, tutoriais diretos com editor de testes online, bom para consulta rápida: https://www.w3schools.com/js/
- Especificação viva do JavaScript (ECMAScript), para os curiosos: https://tc39.es/ecma262/

### Livros da Casa do Código

- SILVEIRA, Paulo; ALMEIDA, Adriano. Lógica de Programação: crie seus primeiros programas usando Javascript e HTML. Casa do Código. Ideal para revisar os fundamentos dos primeiros capítulos com outra abordagem
- ALMEIDA, Flávio. Cangaceiro JavaScript: uma aventura no sertão da programação. Casa do Código. Aprofunda JavaScript avançado, padrões de projeto e SPA sem framework, exatamente o espírito do nosso curso
- TEIXEIRA, Stefan. JavaScript Assertivo: testes e qualidade de código em JS de ponta a ponta. Casa do Código. O próximo passo natural: garantir com testes que o código continua funcionando

Catálogo completo da editora: https://www.casadocodigo.com.br/

### Outros livros recomendados

- HAVERBEKE, Marijn. Eloquent JavaScript. Disponível gratuitamente em https://eloquentjavascript.net/ (em inglês, com tradução parcial em português)
- SIMPSON, Kyle. Série You Don't Know JS Yet. Disponível gratuitamente em https://github.com/getify/You-Dont-Know-JS (em inglês), referência profunda sobre escopo, closures e assincronismo

### Ferramentas usadas no curso

- Visual Studio Code: https://code.visualstudio.com/
- Extensão Live Server para servir a SPA localmente
- Git e GitHub para versionamento, com o histórico do projeto servindo de linha do tempo das aulas
- DevTools do navegador (F12): Console para depuração e Network para inspecionar as requisições

## Palavra final

Este projeto foi construído para ser modelo: a estrutura de pastas, o contrato dos componentes, o roteador e os padrões de código estão prontos para você copiar, adaptar e expandir na sua própria aplicação. O código está no repositório, a explicação está nesta apostila e o método de trabalho com IA está no Capítulo 13.

A partir de agora, o professor vira consultor e o aluno vira autor. Bom código.
