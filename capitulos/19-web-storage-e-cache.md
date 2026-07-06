# Capítulo 19 — Guardando dados no navegador: Web Storage e cache

No Capítulo 18 fizemos um panorama dos próximos passos. Agora vamos **colocar a
mão na massa** no primeiro deles — e talvez o de melhor custo-benefício de todo o
projeto. Nosso App Livros sofre de uma "amnésia": toda vez que você entra na tela
de livros, ele vai **de novo** à internet buscar exatamente os mesmos dados. Feche
a aba, reabra, e todo o trabalho é refeito do zero.

Neste capítulo vamos curar essa amnésia com o **Web Storage** (`localStorage` e
`sessionStorage`) e construir um **cache** de verdade, economizando rede e
deixando a aplicação instantânea.

> 💡 **Nos bastidores — onde este capítulo se encaixa**
> Esta é a sequência natural depois do consumo de API (Caps. 15 a 17). A ordem
> completa da nossa jornada de dados é: **buscar da API → guardar/cachear
> localmente (este capítulo) → funcionar offline com Service Workers (próximo
> passo)**. Cada peça se apoia na anterior.

---

## 19.1 O problema, medido com os próprios olhos

Antes de resolver, vamos **enxergar** o desperdício. Abra o App Livros, entre na
tela de Livros e abra as DevTools (`F12`) na aba **Network** (Rede). Navegue
para a página 2, volte para a 1, vá para a 3, volte para a 1 de novo.

Cada ida e volta dispara uma **nova requisição** — inclusive para páginas que
você **já tinha visto**. A página 1 foi baixada da internet duas, três vezes,
sempre com o mesmo conteúdo. Isso é desperdício em três frentes:

- **Tempo** — o usuário espera o "Carregando..." de novo a cada visita.
- **Dados** — em uma rede móvel, cada requisição consome o pacote de internet do
  usuário.
- **Servidor** — cada chamada ocupa recursos de quem hospeda a API (que muitas
  vezes tem limites de uso).

A pergunta que guia este capítulo é: *por que buscar de novo algo que já temos?*

---

## 19.2 O Web Storage: a memória do navegador

O navegador oferece dois "cofrinhos" onde cada site pode guardar informações no
formato **chave → valor** — a mesma ideia de propriedade e valor dos objetos
(Cap. 2), só que persistida pelo navegador. A API é idêntica para os dois:

```js
// guardar um valor sob uma chave
localStorage.setItem("tema", "noite");

// ler pelo nome da chave
const tema = localStorage.getItem("tema"); // "noite"

// remover uma chave específica
localStorage.removeItem("tema");

// apagar absolutamente tudo
localStorage.clear();
```

Quatro métodos e você domina o essencial: `setItem`, `getItem`, `removeItem`,
`clear`.

### `localStorage` × `sessionStorage`: a diferença é o tempo de vida

Os dois têm exatamente os mesmos métodos. O que muda é **quanto tempo os dados
sobrevivem**:

| Recurso              | Vive enquanto...                                   | Ideal para                                   |
|----------------------|----------------------------------------------------|----------------------------------------------|
| **`localStorage`**   | ...você não apagar — **persiste para sempre**, mesmo fechando o navegador | tema escolhido, dados em **cache**, "lembrar de mim" |
| **`sessionStorage`** | ...a **aba** estiver aberta — some ao fechá-la      | rascunho de formulário, estado temporário da navegação |

Pense assim: `localStorage` é um armário em casa (fica lá até você esvaziar);
`sessionStorage` é o seu bolso durante um passeio (esvazia quando o passeio
acaba).

> 💡 **Nos bastidores — quanto cabe e onde vejo?**
> Cada site tem por volta de **5 MB** de espaço no Web Storage — muito para
> texto, pouco para imagens ou vídeos. Você pode inspecionar tudo o que está
> guardado nas DevTools: aba **Application** (ou *Armazenamento*) → *Local
> Storage* / *Session Storage*. É ótimo para depurar o cache que vamos construir.

---

## 19.3 O detalhe que pega todo mundo: só texto

Há uma regra de ouro no Web Storage:

> O Web Storage guarda **apenas strings (texto)**. Nada de objetos ou arrays
> diretamente.

Se você tentar guardar um objeto, ele vira o texto inútil `"[object Object]"`:

```js
const livro = { id: 1, titulo: "Dom Casmurro" };
localStorage.setItem("livro", livro);
localStorage.getItem("livro"); // "[object Object]"  ❌ perdeu tudo!
```

A solução é converter para o formato **JSON** — o mesmo formato de troca de dados
que já vimos no `fetch` (Cap. 13). Duas funções fazem a ponte:

- **`JSON.stringify(objeto)`** — transforma um objeto/array em **texto** JSON
  (para **salvar**).
- **`JSON.parse(texto)`** — transforma o texto JSON de volta em **objeto** (para
  **ler**).

```js
const livro = { id: 1, titulo: "Dom Casmurro" };

localStorage.setItem("livro", JSON.stringify(livro));   // objeto → texto
const salvo = JSON.parse(localStorage.getItem("livro")); // texto → objeto
console.log(salvo.titulo); // "Dom Casmurro"  ✅
```

> ⚠️ **Cuidado — `JSON.parse` em valor inexistente**
> Se a chave não existir, `getItem` devolve `null`. E `JSON.parse(null)` devolve
> `null` sem erro — mas `JSON.parse` de um texto **quebrado** lança exceção.
> Ao ler o cache, é prudente checar antes: `if (texto) { ... }`. Vamos fazer
> exatamente isso na nossa função de cache.

> 🧩 **Montando o quebra-cabeça**
> Repare na simetria com o Capítulo 13: lá, `resposta.json()` convertia o **texto
> JSON vindo da internet** em objeto. Aqui, `JSON.parse`/`JSON.stringify` fazem a
> mesma conversão nas **duas direções**, agora para guardar localmente. É o mesmo
> formato JSON, o mesmo conceito — você já conhecia metade disso.

---

## 19.4 Primeira vitória: lembrar o tema escolhido

Vamos a um uso simples e direto antes do cache de rede. No Capítulo 11 criamos
temas (dia, tarde, noite) trocáveis via `data-theme`. O problema: ao recarregar a
página, o tema volta ao padrão. Com `localStorage`, fazemos a escolha
**persistir**.

```js
// aplicar e guardar o tema escolhido
function escolherTema(tema) {
  document.documentElement.setAttribute("data-theme", tema); // Cap. 5 e 11
  localStorage.setItem("tema", tema);                        // lembra a escolha
}

// ao iniciar a aplicação, restaura o tema salvo (se houver)
function restaurarTema() {
  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo) {
    document.documentElement.setAttribute("data-theme", temaSalvo);
  }
}
```

Bastaria chamar `restaurarTema()` dentro da função `iniciar()` do `main.js`
(Cap. 10), e o App Livros passaria a respeitar a preferência do usuário entre
visitas. Simples, e já uma melhora real de experiência.

---

## 19.5 O prêmio principal: um cache de requisições

Agora o coração do capítulo. Vamos construir uma camada de **cache** por cima da
nossa função genérica `buscarDados` (Cap. 14). A lógica é uma frase:

> Antes de ir à internet, **pergunte ao cache**. Se o dado já estiver lá, use-o e
> **evite a requisição**. Se não estiver, busque na API e **guarde no cache** para
> a próxima vez.

Crie um novo arquivo na camada de serviços, `src/js/services/cache.js`:

```js
// src/js/services/cache.js
import buscarDados from "./api.js";

async function buscarComCache(url) {
  const emCache = localStorage.getItem(url); // a própria URL é a chave!

  if (emCache) {
    console.log("Servido do cache (sem rede):", url);
    return JSON.parse(emCache); // devolve a cópia local, instantâneo
  }

  console.log("Buscando na internet:", url);
  const dados = await buscarDados(url);              // nossa função do Cap. 14
  localStorage.setItem(url, JSON.stringify(dados));  // guarda para a próxima
  return dados;
}

export default buscarComCache;
```

Vamos apreciar as decisões de projeto aqui:

- **A URL é a chave do cache.** Genial na sua simplicidade: `.../books/?page=2` e
  `.../books/?page=3` têm entradas separadas e independentes. Cada recurso único
  tem seu próprio cache, automaticamente.
- **Cai no cache primeiro** (`if (emCache)`). Se acharmos, retornamos na hora — o
  `"Carregando..."` mal aparece.
- **Só busca na rede se necessário**, e ao buscar, **guarda** o resultado.
- Reusa `buscarDados`, que já faz o `fetch` e a checagem de erro. **DRY** (Cap. 9)
  em ação: não reescrevemos nada do que já existia.

### Ligando o cache ao serviço de livros

Como toda a aplicação já passa por uma camada de serviços bem separada, adotar o
cache é quase trivial. No `services/livros.js` (Cap. 16), trocamos a importação:

```js
// antes:
// import buscarDados from "./api.js";

// depois:
import buscarComCache from "./cache.js";

async function buscarListaLivros(pagina) {
  const dados = await buscarComCache(`${BASE_URL}/?search=${TERMO_PADRAO}&page=${pagina}`);
  // ...o resto continua idêntico
}
```

Só isso. Trocamos `buscarDados` por `buscarComCache` e a tela de livros passa a
cachear. **Faça o teste da seção 19.1 de novo**: entre na página 1, vá para a 2,
volte para a 1. Desta vez, ao voltar, a aba Network fica **quieta** — nenhuma
requisição nova — e o console mostra `"Servido do cache (sem rede)"`. Você **viu**
a economia de rede acontecer.

> 🧩 **Montando o quebra-cabeça**
> Este é o momento em que a arquitetura em camadas paga todos os seus dividendos.
> Porque **toda** requisição do projeto passa por um ponto único, adotar cache foi
> uma troca de uma linha por serviço. Se o código estivesse com `fetch`
> espalhado por todas as páginas (como quase fizemos lá no começo), teríamos que
> caçar e alterar dezenas de lugares. **Boas decisões de estrutura tornam
> melhorias futuras baratas** — guarde essa lição para a vida.

---

## 19.6 O problema do cache eterno: dados que envelhecem

Nosso cache tem uma falha: ele é **eterno**. Uma vez guardado, o dado nunca é
atualizado. Se a API mudar (um livro novo entra no catálogo, um preço muda),
continuaríamos mostrando a cópia antiga para sempre. Há uma frase famosa na área:

> "Existem apenas duas coisas difíceis na computação: invalidação de cache e dar
> nomes às coisas." — Phil Karlton

Vamos resolver a parte da invalidação com a técnica mais comum: dar ao cache uma
**validade** (chamada de **TTL**, *time to live* — "tempo de vida"). A ideia:
guardar, junto com os dados, o **momento** em que foram salvos. Na leitura,
verificar se o cache ainda é "fresco" o suficiente.

```js
// src/js/services/cache.js (versão com validade)
import buscarDados from "./api.js";

const VALIDADE_MS = 10 * 60 * 1000; // 10 minutos em milissegundos

async function buscarComCache(url) {
  const bruto = localStorage.getItem(url);

  if (bruto) {
    const { dados, salvoEm } = JSON.parse(bruto);
    const idade = Date.now() - salvoEm; // há quanto tempo foi salvo

    if (idade < VALIDADE_MS) {
      console.log("Cache válido, sem rede:", url);
      return dados;
    }
    console.log("Cache expirado, buscando de novo:", url);
  }

  const dados = await buscarDados(url);
  // guardamos os dados JUNTO com o carimbo de tempo
  localStorage.setItem(url, JSON.stringify({ dados, salvoEm: Date.now() }));
  return dados;
}

export default buscarComCache;
```

O que mudou:

- Guardamos um objeto **`{ dados, salvoEm }`** em vez dos dados crus. `salvoEm`
  recebe `Date.now()` — o número de milissegundos desde 1970, um "carimbo de
  tempo" universal.
- Na leitura, calculamos a **idade** (`Date.now() - salvoEm`) e só usamos o cache
  se ele tiver **menos de 10 minutos**. Passou disso, buscamos de novo e
  regravamos com um carimbo novo.

Agora temos o melhor dos dois mundos: **velocidade** (dados recentes vêm do
cache, instantâneos) e **frescor** (dados velhos são renovados). Ajustar
`VALIDADE_MS` é ajustar o equilíbrio entre economia e atualidade — dados que
mudam pouco (um catálogo de livros clássicos) podem ter validade longa; dados
voláteis (cotações, estoque) pedem validade curta.

> 💡 **Nos bastidores — estratégias de cache**
> O que construímos é a estratégia **"cache primeiro, com validade"**. Existem
> outras, cada uma com seu compromisso: *"rede primeiro"* (tenta a rede e cai no
> cache se falhar — ótimo para offline), *"stale-while-revalidate"* (mostra o
> cache velho **imediatamente** e atualiza em segundo plano — o melhor de
> percepção de velocidade). Você reencontrará esses mesmos nomes ao estudar
> Service Workers, onde eles brilham. A base conceitual é a que você acabou de
> construir.

---

## 19.7 `sessionStorage` na prática: rascunho de formulário

Nem todo dado deve viver para sempre. Às vezes queremos lembrar algo **só
enquanto o usuário está por ali**. É o caso de um formulário em preenchimento: se
a pessoa troca de página por engano e volta, seria ótimo não ter perdido o que
digitou — mas não faz sentido guardar isso para sempre. Cenário perfeito para o
**`sessionStorage`**.

Vamos aplicar ao formulário de contato (Cap. 8). Salvamos cada tecla digitada e,
ao montar a página, restauramos o rascunho:

```js
// salvar o rascunho enquanto digita
const campoMensagem = document.getElementById("mensagem");
campoMensagem.addEventListener("input", (event) => {
  sessionStorage.setItem("rascunho-mensagem", event.target.value);
});

// ao montar a página, restaurar o rascunho (se houver)
const rascunho = sessionStorage.getItem("rascunho-mensagem");
if (rascunho) {
  campoMensagem.value = rascunho;
}

// ao enviar com sucesso, limpar o rascunho
sessionStorage.removeItem("rascunho-mensagem");
```

Usamos o evento **`input`** (Cap. 5), que dispara a cada alteração do campo.
Troque de página, volte, e o texto continua lá. Feche a aba e reabra: o rascunho
sumiu — exatamente o comportamento que queremos. A escolha entre `localStorage` e
`sessionStorage` é, no fundo, uma pergunta de design: *"esse dado deve sobreviver
ao fechamento da aba?"*.

---

## 19.8 Resumo das ferramentas

| Preciso...                                             | Uso              |
|-------------------------------------------------------|------------------|
| Lembrar uma preferência para sempre (tema, idioma)    | `localStorage`   |
| Cachear respostas de API para economizar rede         | `localStorage` + validade |
| Guardar um rascunho temporário (só nesta aba)         | `sessionStorage` |
| Guardar um objeto ou array                            | `JSON.stringify` ao salvar, `JSON.parse` ao ler |
| Ver/limpar o que está guardado                        | DevTools → Application → Storage |

> ⚠️ **Cuidado — o que NÃO guardar**
> Nunca guarde dados **sensíveis** (senhas, tokens de acesso, dados de cartão) no
> Web Storage: qualquer script na página consegue lê-los. Ele é ótimo para
> preferências e cache de dados públicos — não para segredos.

---

## Recapitulando

- O **Web Storage** (`localStorage`/`sessionStorage`) guarda dados **chave →
  valor** no navegador, com os métodos `setItem`, `getItem`, `removeItem`,
  `clear`.
- **`localStorage`** persiste para sempre; **`sessionStorage`** dura só enquanto
  a aba estiver aberta.
- Ele só guarda **texto** — use **`JSON.stringify`** para salvar objetos e
  **`JSON.parse`** para lê-los.
- Um **cache** por cima de `buscarDados` (usando a **URL como chave**) evita
  requisições repetidas, economizando **tempo, dados e servidor**.
- Um **TTL** (validade via `Date.now()`) mantém o cache rápido **e** fresco.
- Como a aplicação tem uma **camada de serviços** única, adotar cache custou uma
  linha por serviço — a recompensa de uma boa arquitetura.
- `sessionStorage` é ideal para dados temporários, como o rascunho de um
  formulário.

---

> **Exercícios do Capítulo 19**
>
> 1. Implemente o **tema persistente** (seção 19.4): um botão que troca o tema e
>    o salva no `localStorage`, e a restauração ao carregar a página.
> 2. Crie o `services/cache.js` (versão simples da seção 19.5) e ligue-o ao
>    serviço de livros. Com a aba **Network** aberta, confirme que revisitar uma
>    página **não** dispara nova requisição.
> 3. Evolua o cache para a versão **com validade** (seção 19.6). Teste reduzindo
>    `VALIDADE_MS` para 10 segundos e observe o cache expirar.
> 4. Aplique o cache **também** ao serviço do Rick and Morty (Cap. 17). Repare
>    como é a mesma troca de uma linha.
> 5. Implemente o **rascunho de formulário** com `sessionStorage` (seção 19.7) na
>    página de contato.
> 6. **Desafio:** crie uma função `limparCache()` que remove do `localStorage`
>    apenas as chaves que começam com `http` (as do cache de API), preservando
>    outras como o `tema`. Dica: percorra `Object.keys(localStorage)`.
> 7. **Reflexão:** explique, com suas palavras, por que a estratégia de "cache
>    com validade" é superior tanto ao "sem cache" quanto ao "cache eterno".
