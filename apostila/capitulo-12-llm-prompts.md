# Capítulo 12: Programando com IA, engenharia de prompt para desenvolvedores

## Uma conversa franca antes de começar

Chegamos à penúltima aula com uma pergunta que paira sobre todo estudante de programação hoje: se a inteligência artificial escreve código, por que passei meses aprendendo variáveis, laços, funções, DOM, assincronismo e fetch?

A resposta é o tema deste capítulo: a IA escreve código, mas quem projeta, avalia, corrige e responde pelo resultado é você. Um LLM nas mãos de quem não domina os fundamentos produz código que a pessoa não sabe ler, não sabe testar e não sabe consertar quando quebra. Nas mãos de quem fez este curso, produz velocidade: você vira o arquiteto e o revisor, e a IA vira um programador funcionário da sua equipe, rápido e incansável, mas que precisa de ordens claras e de supervisão.

Repare no que aconteceu nos capítulos anteriores: você sabe por que o `preventDefault` é obrigatório no submit, por que o listener vem depois do `innerHTML`, por que o fetch precisa de dois awaits, por que o mapa de rotas vence o switch. É exatamente esse conhecimento que transforma um prompt vago em uma especificação precisa, e uma resposta da IA em código auditado. A estrutura é sua; a digitação é dela.

## O que é um LLM

LLM significa Large Language Model, grande modelo de linguagem. São sistemas treinados sobre volumes gigantescos de texto e código (incluindo a documentação do MDN e milhões de repositórios) que aprendem a prever a continuação mais provável de um texto. Quando você escreve um pedido, o modelo gera a resposta token a token com base nesses padrões. Exemplos: ChatGPT, Claude, Gemini e Copilot.

Duas consequências práticas desse funcionamento:

1. O modelo não executa o código que escreve. Ele prevê texto plausível. Código plausível e código correto são coisas diferentes, e a diferença aparece quando você testa
2. O modelo pode alucinar: afirmar com confiança algo falso, como um método que não existe ou um parâmetro inventado. A defesa é a sua: testar no navegador e conferir no MDN

Por isso a regra de ouro do capítulo: a IA propõe, você dispõe. Nenhuma linha entra no projeto sem você entender o que ela faz.

## Anatomia de um bom prompt

Prompt é a instrução que você dá ao modelo. A diferença entre uma resposta genérica e uma resposta sob medida está quase toda na qualidade do prompt. Um bom prompt de programação tem estas partes:

1. Papel (persona): quem a IA deve ser. Define o tom, o nível e as prioridades da resposta
2. Contexto: o projeto, as tecnologias, as restrições e os padrões existentes
3. Tarefa: o que exatamente deve ser feito, com critérios de aceitação
4. Formato da saída: como você quer receber (arquivo completo, apenas o trecho, com ou sem explicação)
5. Restrições: o que não pode ser feito

Compare um prompt fraco com um forte, para a mesma necessidade real do nosso projeto:

Prompt fraco:

```
faz uma pagina de livros em javascript
```

O resultado será qualquer coisa: talvez React, talvez jQuery, talvez um HTML solto que não conversa com nossa arquitetura.

Prompt forte:

```
Você é um desenvolvedor front-end da minha equipe, especialista em JavaScript
puro (Vanilla JS), sem frameworks.

Contexto do projeto: uma SPA com roteamento por hash. Cada página é um
componente auto montável em um arquivo próprio, seguindo este contrato:
uma função async que recebe o elemento "app" e se desenha nele via
innerHTML, registrando os próprios eventos depois de desenhar; e um
export default de um objeto { url, label, pagina }. Exemplo real do projeto:

async function telaCadastro(app){
    const formulario = `...html...`
    app.innerHTML = formulario;
    await capturacep()
}
export default {
    url: '#cep',
    label: 'Cadastro',
    pagina: telaCadastro
}

O CSS usa metodologia BEM com classes como bem-card, bem-card__title e
bem-grid-auto.

Tarefa: crie o componente de uma página "Livros" que busca dados da API
https://openlibrary.org/search.json?q=javascript com fetch e async/await,
trata erros com try/catch e testa response.ok, e renderiza os 10 primeiros
resultados como cards (título e autor) usando as classes BEM citadas.

Formato: entregue apenas o arquivo livros.js completo, com comentários
curtos explicando os pontos principais.

Restrições: não use frameworks nem bibliotecas externas, não altere
nenhum outro arquivo, e não use var.
```

Percebeu o que aconteceu? Todo o conhecimento do curso virou especificação: o contrato dos componentes (Capítulo 8), o padrão de fetch com tratamento de erro (Capítulos 10 e 11), o BEM (Capítulo 8), a proibição do var (Capítulo 2). A IA que receber esse prompt vai produzir código que encaixa no projeto na primeira tentativa. Quem não fez o curso não tem como escrever esse prompt.

## Prompts de sistema: criando seu programador funcionário

Ferramentas de IA permitem definir uma instrução permanente (system prompt, instruções personalizadas ou arquivos de contexto do projeto, como um CLAUDE.md). É ali que você cria de vez a personalidade e as regras do seu assistente, sem repetir tudo a cada pergunta. Um modelo pronto para o nosso projeto, que você pode adaptar:

```
# Papel
Você é um desenvolvedor front-end júnior da minha equipe. Eu sou o
desenvolvedor responsável pelo projeto e reviso todo o seu código.

# Projeto
SPA de uma livraria em JavaScript puro (ES2015+), sem frameworks.
Roteamento por hash: um array de rotas vira um mapa (objeto) indexado
pela url; o evento hashchange dispara a função render, que executa a
função "pagina" da rota atual passando o elemento #app. Rotas
desconhecidas caem em uma rota 404.

# Padrões obrigatórios
- Cada página é um componente auto montável: função async que recebe o
  app, desenha via innerHTML e depois registra os próprios listeners
- Export default de objeto { url, label, pagina }
- const por padrão, let quando necessário, var proibido
- Template strings para todo HTML gerado
- Eventos com addEventListener, nunca atributos onclick no HTML
- Fetch sempre com async/await, try/catch e teste de response.ok
- Conteúdo digitado por usuário entra no DOM via textContent, nunca innerHTML
- CSS com metodologia BEM

# Como responder
- Antes de codificar, liste em uma frase o que entendeu da tarefa
- Entregue arquivos completos, indicando o caminho de cada um
- Explique decisões não óbvias em no máximo três linhas
- Se a tarefa estiver ambígua, faça perguntas antes de codificar
- Se algo que pedi violar os padrões acima, avise antes de fazer

# Limites
- Não altere arquivos que não fazem parte da tarefa
- Não adicione bibliotecas nem frameworks
- Não invente APIs: se não tiver certeza de um método, diga que é
  preciso confirmar no MDN
```

Esse texto é um documento de arquitetura disfarçado de prompt. Escrevê-lo exige dominar o projeto; mantê-lo atualizado é parte do trabalho de quem lidera.

## Técnicas que elevam a qualidade das respostas

Além da estrutura, algumas técnicas comprovadas:

Dê exemplos (few-shot). Mostrar um componente pronto, como fizemos no prompt forte, vale mais que três parágrafos de descrição. O modelo imita padrões com muita eficiência.

Peça o raciocínio antes do código. Instruções como "explique sua abordagem em três passos antes de codificar" reduzem erros de lógica, porque forçam o modelo a planejar.

Divida tarefas grandes. Não peça "faça o sistema de livros completo". Peça o componente da lista, depois a busca, depois a página de detalhe. Igual dividimos o curso em aulas, divida o trabalho em prompts.

Itere sobre a resposta. A primeira resposta é um rascunho. Continue a conversa: "o listener está sendo registrado antes do innerHTML, corrija", "extraia a montagem do card para uma função separada". Saber apontar o erro exato é o seu diferencial.

Use a IA para aprender, não só para produzir. Alguns dos melhores prompts de estudante:

```
Explique linha por linha o que este código faz, como se eu fosse um
aluno que acabou de aprender eventos: [cole o código]
```

```
Este código quebra com o erro [cole o erro do console]. Explique a causa
provável antes de propor a correção.
```

```
Revise este meu componente apontando problemas de segurança, de
legibilidade e violações do contrato do projeto: [cole o código]
```

```
Me faça cinco perguntas de prova sobre assincronismo em JavaScript e
corrija minhas respostas uma a uma.
```

## O fluxo de trabalho profissional com IA

Na prática de mercado, o ciclo com um assistente de IA é este, e repare quem faz cada parte:

1. Você especifica: papel, contexto, tarefa, formato, restrições
2. A IA produz um rascunho
3. Você lê e entende cada linha. O que não entender, pergunta antes de usar
4. Você testa no navegador, com o console e a aba Network abertos
5. Você refina em novas rodadas de conversa
6. Você faz o commit, porque a responsabilidade pelo código é de quem assina

A IA participa apenas do passo 2. Todos os outros dependem dos fundamentos que você construiu nesta apostila. É por isso que os melhores usuários de IA são justamente os que menos precisariam dela: conhecimento técnico não foi substituído, foi promovido a cargo de chefia.

## Cuidados éticos e de segurança

- Nunca cole em ferramentas de IA senhas, chaves de API, tokens ou dados pessoais de clientes
- Código gerado pode reproduzir padrões inseguros; a revisão de segurança (como o cuidado com innerHTML e XSS do Capítulo 7) continua sendo sua
- Em processos seletivos, provas e trabalhos, respeite as regras sobre uso de IA; e lembre que entrevistas técnicas testam você sem assistente
- Cite e confira as fontes: quando a IA afirmar algo sobre a linguagem, valide no MDN

## Resumo do capítulo

- LLMs preveem texto plausível; correção é responsabilidade de quem revisa e testa
- Um bom prompt tem papel, contexto, tarefa, formato e restrições
- O prompt de sistema transforma a IA em um programador funcionário com a personalidade e os padrões que você definir
- Exemplos, raciocínio antes do código, divisão de tarefas e iteração elevam a qualidade
- O fluxo profissional: você especifica, a IA rascunha, você entende, testa, refina e assina
- Os fundamentos do curso são o que permitem escrever boas especificações e auditar os resultados

## Para praticar

1. Escreva um prompt fraco e um forte para criar a página "Autores" do projeto, e compare as respostas de uma IA para os dois.
2. Adapte o prompt de sistema deste capítulo para o seu projeto pessoal e salve como documento do projeto.
3. Peça a uma IA que gere um componente novo e depois encontre você mesmo, sem ajuda, três pontos a melhorar na resposta.
4. Cole um trecho da apostila que ainda gere dúvida e peça uma explicação com analogias diferentes.
5. Desafio final: usando seu prompt de sistema, conduza uma IA na criação de uma funcionalidade completa para o App Livros em pelo menos três rodadas de refinamento, e apresente na aula o histórico da conversa comentando suas intervenções.

## Referências

- MDN Web Docs (fonte para validar qualquer afirmação técnica): https://developer.mozilla.org/pt-BR/
- Anthropic, guia de engenharia de prompt: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- OpenAI, boas práticas de prompt: https://platform.openai.com/docs/guides/prompt-engineering
- Google, introdução aos LLMs: https://developers.google.com/machine-learning/resources/intro-llms
- W3Schools, seção de IA generativa: https://www.w3schools.com/gen_ai/
