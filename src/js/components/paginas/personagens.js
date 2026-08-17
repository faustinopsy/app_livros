import buscarServicos from "../services/apiCache.js"

let numero = 1
async function criarPagina(app){
    const nPagina = `?page=${numero}`;
    const detalhes = await buscarServicos("https://rickandmortyapi.com/api/character/",nPagina);
    console.log(detalhes.results)
    let cardServico = ""
    cardServico += `
    <section class="section">
        <div class="container">
            <div class="buttons mb-5">
                <button class="button is-primary" id="btn-esquerda">
                    <span class="icon is-small"> ◄ </span>
                    <span>Anterior</span>
                </button>
                <button class="button is-primary" id="btn-direita">
                    <span>Próximo</span>
                    <span class="icon is-small"> ► </span>
                </button>
            </div>
            <div class="columns is-multiline">
    `
    for(let i=0; i < detalhes.results.length; i++){
        cardServico += `
                    <div class="column is-one-quarter-desktop is-half-tablet">
                        <div class="card h-100" style="height: 100%;">
                            <div class="card-image">
                                <figure class="image">
                                    <img src="${detalhes.results[i].image}" alt="${detalhes.results[i].name}">
                                </figure>
                            </div>
                            <div class="card-content">
                                <p class="title is-5">${detalhes.results[i].name}</p>
                                <p class="subtitle is-6 mt-2">${detalhes.results[i].species}</p>
                            </div>
                        </div>
                    </div>
            `
        }
    cardServico += `</div></div></section>`
    app.innerHTML = cardServico
    await capturaBotoes(app, detalhes.results)
}

async function capturaBotoes(app, personagens) {
    const botao_esquerdo = document.getElementById("btn-esquerda")
    const botao_direito = document.getElementById("btn-direita")

    botao_esquerdo.addEventListener("click", ()=>{
        if(numero > 1){
            numero=numero-1
            criarPagina(app)
        }
    } )

    botao_direito.addEventListener("click", ()=>{
        if(numero < 20){
            numero=numero+1
            criarPagina(app)
        }
    } )
}

export default {
    url: "#rick",
    label: "Buscar API",
    pagina: criarPagina
};