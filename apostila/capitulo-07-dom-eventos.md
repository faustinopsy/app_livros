# Capítulo 7: DOM e eventos de escuta

## O JavaScript conversa com a página

Até aqui aprendemos a linguagem. Agora vamos ao motivo de ela existir no navegador: manipular a página e reagir ao usuário. A ponte entre o JavaScript e o HTML se chama DOM, Document Object Model. O navegador lê o HTML e monta na memória uma árvore de objetos representando cada elemento. O JavaScript enxerga e altera essa árvore através do objeto global `document`.

## Encontrando elementos

O método que usamos o curso inteiro é o `getElementById`:

```javascript
const app = document.getElementById('app');
const formulario = document.getElementById('formulario-de-contato');
const campocep = document.getElementById("cep");
```

Ele devolve o objeto que representa o elemento com aquele id. Existem outros seletores que valem conhecer:

```javascript
document.querySelector('.bem-card');      // primeiro elemento que casa com o seletor CSS
document.querySelectorAll('.bem-card');   // todos os que casam
```

## Alterando a página: innerHTML e textContent

Encontrado o elemento, podemos trocar seu conteúdo. O `innerHTML` interpreta a string como HTML, e é assim que todas as nossas páginas se desenham:

```javascript
function sobre(app){
    const sobre = `<h1> Esta é página Sobre </h1>
    <p>Este site é um exemplo de SPA usando JavaScript puro</p>
    `
    app.innerHTML = sobre
}
```

Já o `textContent` insere texto puro, sem interpretar tags. Usamos ele na lista de contatos, e a escolha não é por acaso: como o texto vem do usuário, inserir como texto puro impede que alguém digite HTML ou script malicioso no formulário e ele seja executado na página. Isso previne um ataque conhecido como XSS. Regra prática: conteúdo que você controla pode ir de `innerHTML`; conteúdo digitado pelo usuário vai de `textContent`.

## Criando elementos

Além de escrever HTML em string, dá para criar elementos um a um:

```javascript
const lista = document.getElementById('lista_de_contatos');
const li = document.createElement('li');
li.textContent = "novo contato";
lista.appendChild(li);
```

É exatamente o que a página de Contato faz a cada envio do formulário: cria um `<li>`, preenche e anexa na lista.

## Eventos: a página avisa, o código escuta

O navegador dispara eventos o tempo todo: clique, tecla pressionada, formulário enviado, campo que perdeu o foco, hash da URL que mudou. Nós registramos funções para serem chamadas quando o evento acontecer. Essas funções são os ouvintes (listeners), e o registro é feito com `addEventListener`:

```javascript
elemento.addEventListener("nomeDoEvento", funcaoQueReage);
```

Repare: passamos a função sem parênteses. Não estamos executando agora; estamos entregando a função para o navegador executar quando o evento ocorrer. É o conceito de callback do capítulo anterior em ação.

## Os três eventos do projeto

### submit: o formulário de contato

```javascript
async function capturarFormulario(){
    const formulario = document.getElementById('formulario-de-contato');
    formulario.addEventListener("submit", function(event){
        event.preventDefault();
        const lista = document.getElementById('lista_de_contatos');
        const li = document.createElement('li');
        const assunto = event.target[0].value;
        const email = event.target[1].value;
        const mensagem = event.target[2].value;
        li.textContent = `O Assunto é ${assunto}
         e o email é ${email}
         e a mensagem é ${mensagem}`;
        lista.appendChild(li);
        event.target[0].value = '';
        event.target[1].value = '';
        event.target[2].value = '';
    })
}
```

Três pontos para destrinchar:

1. O parâmetro `event` é um objeto que o navegador entrega para o ouvinte com tudo sobre o evento ocorrido.
2. `event.preventDefault()` cancela o comportamento padrão. O padrão do submit é recarregar a página, e recarregar mataria a nossa SPA. Essa linha é obrigatória em formulários de SPA.
3. `event.target` é o elemento que disparou o evento, no caso o formulário. Os índices `[0]`, `[1]`, `[2]` acessam os campos na ordem. Também poderíamos usar `document.getElementById('assunto').value`, como está registrado nos comentários do arquivo.

### blur: o CEP que se completa sozinho

O evento `blur` dispara quando um campo perde o foco, ou seja, quando o usuário clica fora dele depois de digitar. Na tela de cadastro, é o gatilho perfeito para buscar o endereço assim que a pessoa termina de digitar o CEP:

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
```

Aqui `event.target.value` é o texto digitado no campo de CEP. Os detalhes do `async` e do `await` ficam para os Capítulos 10 e 11; por ora, registre o padrão: evento dispara, ouvinte lê o valor, busca os dados e preenche os outros campos.

### hashchange: a navegação da SPA

O terceiro evento não vem de um elemento, mas da própria janela. O `hashchange` dispara toda vez que a parte após o `#` da URL muda:

```javascript
window.addEventListener("hashchange", ()=>{
    hash = window.location.hash;
    render();
})
```

Este ouvinte é literalmente o motor da navegação do App Livros: usuário clica no menu, o hash muda, o evento dispara, o roteador redesenha a página. O Capítulo 9 é inteiro sobre ele.

## Uma armadilha clássica da SPA

Atenção a um detalhe de ordem que pegou a turma em aula: só dá para registrar um ouvinte em um elemento que já existe no DOM. Como nossas páginas são desenhadas dinamicamente, o `addEventListener` do formulário precisa rodar depois do `innerHTML` que cria o formulário:

```javascript
async function contato(app) {
    const paginadecontato = `... o formulário ...`
    app.innerHTML = paginadecontato;   // primeiro desenha
    await capturarFormulario()          // depois escuta
}
```

Se invertermos a ordem, `getElementById` devolve `null` e o código quebra. Guarde esse padrão: desenhar primeiro, escutar depois. Ele é o motivo de cada página chamar sua própria função de eventos no final.

## Resumo do capítulo

- O DOM é a representação da página que o JavaScript manipula via `document`
- `getElementById` encontra elementos; `innerHTML` desenha HTML; `textContent` insere texto seguro
- `addEventListener(evento, callback)` registra funções que reagem ao usuário
- `event.preventDefault()` impede o recarregamento no submit e mantém a SPA viva
- `event.target` dá acesso ao elemento que disparou o evento e seus valores
- O projeto usa `submit` (contato), `blur` (CEP) e `hashchange` (navegação)
- Ordem obrigatória em páginas dinâmicas: desenhar primeiro, escutar depois

## Para praticar

1. Adicione um botão na página Home e um ouvinte de `click` que imprime uma mensagem no console.
2. No formulário de contato, adicione uma validação: se o assunto estiver vazio, não adicione o item na lista.
3. Adicione um ouvinte de `input` no campo de mensagem que mostra em tempo real quantos caracteres foram digitados.
4. Experimente remover o `event.preventDefault()` do formulário e observe o que acontece com a página. Depois devolva a linha.
5. Explique com suas palavras por que o `capturarFormulario` precisa ser chamado depois do `innerHTML`.

## Referências

- MDN Web Docs, Introdução ao DOM: https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model/Introduction
- MDN Web Docs, addEventListener: https://developer.mozilla.org/pt-BR/docs/Web/API/EventTarget/addEventListener
- MDN Web Docs, Event.preventDefault: https://developer.mozilla.org/pt-BR/docs/Web/API/Event/preventDefault
- W3Schools, JavaScript HTML DOM: https://www.w3schools.com/js/js_htmldom.asp
- W3Schools, JavaScript Events: https://www.w3schools.com/js/js_events.asp
