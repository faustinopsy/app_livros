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
    <section class="section">
        <div class="container">
            <h1 class="title is-3">Cadastro de Cliente</h1>
            <form id="cadastroCliente" class="box">
                <div class="field">
                    <label for="cep" class="label">CEP</label>
                    <div class="control">
                        <input type="text" id="cep" class="input">
                    </div>
                </div>
                <div class="field">
                    <label for="logradouro" class="label">Logradouro</label>
                    <div class="control">
                        <input type="text" id="logradouro" class="input">
                    </div>
                </div>
                <div class="field">
                    <label for="bairro" class="label">Bairro</label>
                    <div class="control">
                        <input type="text" id="bairro" class="input">
                    </div>
                </div>
                <div class="field">
                    <label for="localidade" class="label">Localidade</label>
                    <div class="control">
                        <input type="text" id="localidade" class="input">
                    </div>
                </div>
                <div class="field">
                    <label for="estado" class="label">Estado</label>
                    <div class="control">
                        <input type="text" id="estado" class="input">
                    </div>
                </div>
            </form>
        </div>
    </section>
    `
    app.innerHTML = formulario;
    await capturacep();
}


export default {
    url: '#cadastro',
    label: 'Cadastro',
    pagina: telaCadastro
};