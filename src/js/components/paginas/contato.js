// duas formas de exportar mais de uma função de um mesmo arquivo
//
async function contato(app) {
const paginadecontato = `
<section class="section">
    <div class="container">
        <h1 class="title is-3">Contato</h1>
        <form id="formulario-de-contato" class="box">
            <div class="field">
                <label for="assunto" class="label">Assunto</label>
                <div class="control">
                    <input type="text" name="assunto" id="assunto" class="input" placeholder="Assunto">
                </div>
            </div>
            <div class="field">
                <label for="email" class="label">Email</label>
                <div class="control">
                    <input type="email" name="email" id="email" class="input" placeholder="seu@email.com">
                </div>
            </div>
            <div class="field">
                <label for="mensagem" class="label">Mensagem</label>
                <div class="control">
                    <textarea class="textarea" name="mensagem" id="mensagem" cols="30" rows="5" placeholder="Sua mensagem"></textarea>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <button type="submit" class="button is-primary">
                        <span class="icon is-small"><i data-lucide="send"></i></span>
                        <span>Enviar</span>
                    </button>
                </div>
            </div>
        </form>
        <ul id="lista_de_contatos" class="content mt-5">
        </ul>
    </div>
</section>
`

app.innerHTML = paginadecontato;
await capturarFormulario()
} 

async function capturarFormulario(){
    console.log("capturarFormulario foi chamada")
    const formulario = document.getElementById('formulario-de-contato');
    formulario.addEventListener("submit", function(event){
        event.preventDefault();
        const lista = document.getElementById('lista_de_contatos');
        const li = document.createElement('li');
        // outra forma de acessar os dados do formulário, usando o ID dos inputs
        // const assunto = documento.getElementById('assunto').value;
        const assunto = event.target[0].value;
        const email = event.target[1].value;
        const mensagem = event.target[2].value;
        //template string
        li.textContent = `O Assunto é ${assunto}
         e o email é ${email} 
         e a mensagem é ${mensagem}`;
        lista.appendChild(li);
        event.target[0].value = '';
        event.target[1].value = '';
        event.target[2].value = '';
    })
}

export default {
    url:'#contato',
    label:'Contato',
    pagina: contato
};