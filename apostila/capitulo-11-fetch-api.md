# Capítulo 11: Consumindo APIs com fetch

## Saindo da ilha

Até agora nossa aplicação vivia isolada: todos os dados estavam escritos no próprio código, como o array `detalhes` dos serviços. Aplicações reais buscam dados do mundo: previsão do tempo, catálogo de produtos, endereço a partir do CEP. A porta de entrada para esse mundo é a API.

## O que é uma API

API significa Application Programming Interface, interface de programação de aplicações. No contexto da web, é um serviço que responde a requisições HTTP devolvendo dados, geralmente no formato JSON, em vez de páginas HTML. Pense na API como um garçom: você faz o pedido (requisição), ele leva à cozinha (servidor) e traz o prato (resposta em JSON).

A API que usamos no projeto é a ViaCEP, gratuita e sem cadastro, que devolve o endereço de qualquer CEP brasileiro. Experimente abrir no navegador:

```
https://viacep.com.br/ws/01001000/json/
```

A resposta é um texto no formato JSON:

```json
{
  "cep": "01001-000",
  "logradouro": "Praça da Sé",
  "bairro": "Sé",
  "localidade": "São Paulo",
  "uf": "SP",
  "estado": "São Paulo"
}
```

## JSON: o idioma das APIs

JSON, JavaScript Object Notation, é um formato de texto para troca de dados que nasceu da sintaxe de objetos do JavaScript. As diferenças para um objeto: as chaves vêm sempre entre aspas duplas e não pode haver funções nem comentários. Como é texto, ele viaja pela rede; do nosso lado, convertemos texto em objeto de verdade para trabalhar:

```javascript
const objeto = JSON.parse(textoJson);       // texto vira objeto
const texto = JSON.stringify(objeto);       // objeto vira texto
```

## O fetch

O `fetch` é a função do navegador para fazer requisições HTTP. Ele devolve uma Promise, por isso todo o Capítulo 10 foi pré-requisito deste. O padrão completo, direto do nosso `formCad.js`:

```javascript
async function cadastroCliente(cep){
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const result = await response.json();
        return result
    } catch (error) {
        console.error(error);
    }
}
```

Repare que são dois `await`, e isso confunde no início:

1. `await fetch(...)` espera a resposta HTTP chegar. O que chega é um objeto `Response` com metadados (status, cabeçalhos) e o corpo ainda não lido
2. `await response.json()` lê o corpo e converte o texto JSON em objeto JavaScript. Também é assíncrono porque o corpo pode ser grande e chegar em pedaços

E repare na template string montando a URL: `https://viacep.com.br/ws/${cep}/json/`. O CEP digitado pelo usuário entra na URL por interpolação. Capítulo 2 trabalhando junto com o Capítulo 10.

## A tela de cadastro completa

Agora temos repertório para ler o componente inteiro:

```javascript
async function capturacep(){
    const campocep = document.getElementById("cep")
    campocep.addEventListener("blur", async (event)=>{
        const dados = await cadastroCliente(event.target.value)
        document.getElementById("logradouro").value = dados.logradouro
        document.getElementById("bairro").value = dados.bairro
        document.getElementById("localidade").value = dados.localidade
        document.getElementById("estado").value = dados.estado
    })
}

async function telaCadastro(app){
    const formulario = `
    <form id="cadastroCliente" >
        <label for="cep">CEP</label>
        <input type="text" id="cep">
        <label for="logradouro">logradouro</label>
        <input type="text" id="logradouro">
        <label for="bairro">bairro</label>
        <input type="text" id="bairro">
        <label for="localidade">localidade</label>
        <input type="text" id="localidade">
        <label for="estado">estado</label>
        <input type="text" id="estado">
    </form>
    `
    app.innerHTML = formulario;
    await capturacep()
}

export default {
    url: '#cep',
    label: 'Cadastro',
    pagina: telaCadastro
}
```

O fluxo completo, do clique ao endereço preenchido:

1. Usuário navega para `#cep`, o roteador chama `telaCadastro(app)`
2. O formulário é desenhado via `innerHTML` e `capturacep` registra o ouvinte de `blur` no campo de CEP (desenhar primeiro, escutar depois, Capítulo 7)
3. Usuário digita o CEP e clica fora; o `blur` dispara
4. O ouvinte chama `cadastroCliente` com o valor digitado e espera a resposta
5. Com o objeto em mãos, preenche cada campo do formulário pela propriedade correspondente

Cada linha desse componente usa um capítulo desta apostila. É o momento do curso em que os fundamentos viram aplicação de verdade.

## Investigando pelo DevTools

Abra a aba Network (Rede) do F12, digite um CEP no formulário e observe a requisição aparecer. Clique nela e explore: a URL chamada, o status (200 significa sucesso, 404 não encontrado), os cabeçalhos e a resposta crua. Essa aba é a ferramenta número um para depurar consumo de API.

## Tratando o mundo real

Nosso código atual confia demais no sucesso. Dois problemas para amadurecer:

Primeiro: o `fetch` só rejeita a Promise em erro de rede. Se o servidor responder um erro HTTP (como 400 para CEP mal formatado), a Promise resolve normalmente. O teste correto usa `response.ok`:

```javascript
const response = await fetch(url);
if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
}
```

Segundo: a ViaCEP responde `{ "erro": true }` para CEP com formato válido mas inexistente. Nesse caso `dados.logradouro` é `undefined` e o formulário fica preenchido com "undefined". O tratamento:

```javascript
const dados = await cadastroCliente(event.target.value)
if (!dados || dados.erro) {
    alert("CEP não encontrado");
    return;
}
```

Melhorar esses dois pontos é um dos exercícios do capítulo.

## Métodos HTTP: um vislumbre do próximo passo

Tudo que fizemos foi leitura, o método GET, que é o padrão do `fetch`. APIs completas também aceitam escrita, e o `fetch` recebe um segundo parâmetro de configuração:

```javascript
await fetch("https://api.exemplo.com/livros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo: "Novo livro", autor: "Autora" })
});
```

GET busca, POST cria, PUT atualiza, DELETE remove. Esse vocabulário, chamado de padrão REST, é assunto para os refinamentos do fim do curso, quando vamos popular a aplicação de livros com dados de uma API de verdade.

## Resumo do capítulo

- API é um serviço que responde requisições HTTP com dados, geralmente em JSON
- JSON é texto no formato de objeto; `response.json()` o converte em objeto utilizável
- O padrão do projeto: `async`, `try/catch`, `await fetch`, `await response.json()`, `return`
- São dois awaits porque resposta e corpo chegam em momentos distintos
- A aba Network do DevTools mostra cada requisição em detalhe
- Erros HTTP não caem no catch; teste `response.ok` e trate respostas de negócio como o `erro: true` da ViaCEP

## Para praticar

1. Abra a URL da ViaCEP no navegador com seu próprio CEP e leia o JSON retornado.
2. Adicione o teste de `response.ok` e o tratamento de `dados.erro` na tela de cadastro.
3. Adicione um campo "complemento" ao formulário e preencha com o dado da API.
4. Explore outra API pública, como a PokeAPI (https://pokeapi.co), e imprima no console o nome de um Pokémon buscado por id.
5. Desafio: crie uma página nova que busca e lista dados de uma API pública usando o padrão acumulador do Capítulo 4 para montar os cards.

## Referências

- MDN Web Docs, Usando Fetch: https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch
- MDN Web Docs, Trabalhando com JSON: https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/Objects/JSON
- MDN Web Docs, Métodos de requisição HTTP: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Methods
- W3Schools, JavaScript Fetch API: https://www.w3schools.com/js/js_api_fetch.asp
- W3Schools, JSON Introduction: https://www.w3schools.com/js/js_json_intro.asp
- Documentação da ViaCEP: https://viacep.com.br/
