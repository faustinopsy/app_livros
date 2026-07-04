// duas formas de exportar mais de uma função de um mesmo arquivo
//
async function contato(app) {
const paginadecontato = `<h1> Esta é página Contato </h1>
    <form class="bem-form" id="formulario-de-contato">
        <div class="bem-form__group">
            <label for="assunto" class="bem-form__label">Assunto</label>
            <input type="text" name="assunto" id="assunto" class="bem-form__input">
        </div>
        <div class="bem-form__group">
            <label for="email" class="bem-form__label">email</label>
            <input type="email" name="email" id="email" class="bem-form__input">
        </div>
        <div class="bem-form__group">
            <label for="mensagem" class="bem-form__label">Mensagem</label>
            <textarea class="bem-form__textarea" name="mensagem" id="mensagem" cols="30" rows="10"></textarea>
        </div>
        <button type="submit" class="bem-btn--primary">Enviar</button>
    </form>
    <ul id="lista_de_contatos">
    </ul>
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
    url: '#contato',
    label: 'Contato',
    pagina: contato
}