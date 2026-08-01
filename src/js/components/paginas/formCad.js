import buscarServicos from "../services/apiCache.js"
async function capturacep(){
    const campocep = document.getElementById("cep")
    campocep.addEventListener("blur",async (event)=>{
        const dados = await buscarServicos("https://viacep.com.br/ws/", event.target.value,"/json/")
        document.getElementById("logradouro").value = dados.logradouro
        document.getElementById("bairro").value = dados.bairro
        document.getElementById("localidade").value = dados.localidade
        document.getElementById("estado").value = dados.estado
    })
}
async function telaCadastro(app){
    const formulario = `
    <form id="cadastroCliente" class="bem-container" >
        <label for="cep" class="bem-form__label" >CEP</label>
        <input type="text" id="cep" class="bem-form__input" >
        <label for="logradouro" class="bem-form__label">logradouro</label>
        <input type="text" id="logradouro" class="bem-form__input">
        <label for="bairro" class="bem-form__label">bairro</label>
        <input type="text" id="bairro" class="bem-form__input">
        <label for="localidade" class="bem-form__label">localidade</label>
        <input type="text" id="localidade" class="bem-form__input">
        <label for="estado" class="bem-form__label">estado</label>
        <input type="text" id="estado" class="bem-form__input">
    </form>
    `
    app.innerHTML = formulario;
    await capturacep();
}


export default {
    url: '#cadastro',
    label: 'Cadastro',
    pagina: telaCadastro
};