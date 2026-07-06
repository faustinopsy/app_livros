import buscarDados from "../../services/api.js";
import { mostrarCarregando, esconderCarregando } from "../../services/loading.js";

async function capturarCep() {
    const campoCep = document.getElementById("cep");

    campoCep.addEventListener("blur", async (event) => {
        mostrarCarregando();
        try {
            const dados = await buscarDados(`https://viacep.com.br/ws/${event.target.value}/json/`);
            document.getElementById("logradouro").value = dados.logradouro;
            document.getElementById("bairro").value = dados.bairro;
            document.getElementById("localidade").value = dados.localidade;
            document.getElementById("estado").value = dados.estado;
        } catch (erro) {
            console.error(erro);
        } finally {
            esconderCarregando();
        }
    });
}

async function telaCadastro(app) {
    const formulario = `
    <form id="cadastroCliente" class="bem-form bem-grid-auto">
        <div class="bem-form__group">
            <label for="cep" class="bem-form__label">CEP</label>
            <input type="text" id="cep" class="bem-form__input">
        </div>
        <div class="bem-form__group">
            <label for="logradouro" class="bem-form__label">logradouro</label>
            <input type="text" id="logradouro" class="bem-form__input">
        </div>
        <div class="bem-form__group">
            <label for="bairro" class="bem-form__label">bairro</label>
            <input type="text" id="bairro" class="bem-form__input">
        </div>
        <div class="bem-form__group">
            <label for="localidade" class="bem-form__label">localidade</label>
            <input type="text" id="localidade" class="bem-form__input">
        </div>
        <div class="bem-form__group">
            <label for="estado" class="bem-form__label">estado</label>
            <input type="text" id="estado" class="bem-form__input">
        </div>
    </form>
    `;
    app.innerHTML = formulario;
    await capturarCep();
}

export default {
    url: '#cep',
    label: 'Cadastro',
    pagina: telaCadastro
};
