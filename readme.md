#  App Livros — Front-End 2

Projeto-roteiro construído **aula a aula, aos sábados**, como material prático do curso de **Front-End 2** com foco em **JavaScript**.

A ideia não é entregar um produto final pronto, e sim registrar a **evolução do código a cada encontro**: partimos de fundamentos da linguagem e avançamos até a construção de uma **SPA (Single Page Application)** completa, dinâmica e alimentada por API.

---

##  Apostila do curso

O material didático completo, capítulo a capítulo, está na pasta [apostila/](apostila/README.md). Cada capítulo explica um fundamento da linguagem usando o código real deste projeto, com exercícios e referências (MDN, W3Schools e livros da Casa do Código).

---

##  Objetivo do curso

Aprofundar JavaScript além do básico, praticando os tópicos avançados que sustentam aplicações web modernas:

- Construção de uma **SPA** sem frameworks, entendendo o que acontece "por baixo dos panos"
- **Roteamento no lado do cliente** (client-side routing) baseado em `hash`
- **Componentização** com JavaScript modular (ES Modules)
- **Renderização dinâmica** da interface via `innerHTML` e template strings
- Manipulação do **DOM** e tratamento de **eventos**
- **Consumo de API** (fetch, async/await) para popular a aplicação com dados reais
- Boas práticas de organização de arquivos e nomenclatura (ex.: CSS com metodologia **BEM**)

---

##  Como a SPA funciona

A aplicação tem **uma única página** ([index.html](index.html)) com dois pontos de montagem:

```html
<header id="navbar"></header>
<main id="app"></main>
```

Todo o resto é montado por JavaScript:

1. **Rotas** ([src/js/components/rotas/rotas.js](src/js/components/rotas/rotas.js)) — um array de objetos descreve cada rota (`url`, `label`, `pagina` e uma `acao` opcional).
2. **Navbar** ([src/js/components/navbar/navbar.js](src/js/components/navbar/navbar.js)) — gera o menu dinamicamente a partir das rotas com `.map()`.
3. **Roteador** ([src/js/main.js](src/js/main.js)) — transforma o array em um "mapa de rotas", escuta o evento `hashchange` e renderiza a página correspondente. Rotas inexistentes caem em uma **404**.
4. **Páginas** ([src/js/components/paginas/](src/js/components/paginas/)) — cada página é uma função que retorna o HTML como string. Algumas têm uma `acao` que é executada após a renderização (ex.: capturar o envio de um formulário na página de Contato).

---

##  Estrutura do projeto

```
app_livros/
├── index.html                     # página única (SPA)
├── src/
│   ├── css/
│   │   └── microframework.css     # estilos (metodologia BEM)
│   ├── img/                        # imagens
│   └── js/
│       ├── main.js                 # ponto de entrada: roteador + render
│       └── components/
│           ├── navbar/             # menu dinâmico
│           ├── footer/
│           ├── rotas/              # definição das rotas
│           └── paginas/            # home, sobre, serviços, contato

```

Os arquivos `app.js`, `testeArray.js` e `testeObjetos.js` são **exercícios das primeiras aulas** (fundamentos: operadores, condicionais, arrays e objetos), mantidos como registro histórico do roteiro.

---

##  Como executar

Por usar **ES Modules** (`<script type="module">`), o projeto precisa ser servido por um servidor HTTP — abrir o `index.html` direto pelo navegador (`file://`) não funciona.

**Opção 1 — Extensão Live Server (VS Code):**
- Clique com o botão direito em `index.html` → *Open with Live Server*.

**Opção 2 — Servidor via terminal:**

```bash
# Com Python
python -m http.server 8000

# Ou com Node
npx serve
```

Depois acesse `http://localhost:8000` (ou a porta indicada).

---

##  Roadmap das aulas

- [x] Fundamentos: operadores, condicionais, arrays e objetos
- [x] Funções que geram páginas
- [x] Formulário de captura de contato
- [x] Menu dinâmico a partir de objetos
- [x] Padronização das páginas
- [x] Centralização do roteamento (SPA)
- [X] Consumo de API com `fetch` e `async/await`
- [ ] Renderização dinâmica de dados vindos da API
- [ ] Refinamentos e tópicos avançados

> Este README acompanha a evolução do curso e será atualizado a cada novo sábado. 
