import buscarServicos from "../services/api.js"
let cardServico = ""
let numero = 1
async function criarPagina(app){
    const nPagina = `?page=${numero}`;
    const detalhes = await buscarServicos("https://rickandmortyapi.com/api/character/",nPagina);
    console.log(detalhes.results)
    cardServico += `
    <div class="bem-container">
        <button class="bem-btn bem-btn--primary" id="btn-esquerda">
            <span class="bem-btn__icon"> ◄ </span>
            <span class="bem-btn__text"> ◄ </span>
        </button>
        <button class="bem-btn bem-btn--primary" id="btn-direita">
            <span class="bem-btn__icon"> ► </span>
            <span class="bem-btn__text"> ► </span>
        </button>
    </div>
    <div class="bem-grid-auto">

    `
    for(let i=0; i < detalhes.results.length; i++){
        cardServico += `
                    <div class="bem-card">
                        <img class="bem-card__image" src="${detalhes.results[i].image}" alt="Image description">
                        <div class="bem-card__body">
                            <h3 class="bem-card__title">${detalhes.results[i].name}</h3>
                            <p>${detalhes.results[i].species}</p>
                        </div>
                    </div>
                
            `
        }
    cardServico += `</div>`
    app.innerHTML = cardServico
    await capturaBotoes()
}

async function capturaBotoes() {
    const botao_esquerdo = document.getElementById("btn-esquerda")
    const botao_direito = document.getElementById("btn-direita")

    botao_esquerdo.addEventListener("click", ()=>{
        if(numero > 1){
            numero=numero-1
            console.log(numero)
        }
    } )

    botao_direito.addEventListener("click", ()=>{
        if(numero < 20){
            numero=numero+1
            console.log(numero)
        }
    } )
}

export default {
    url: "#rick",
    label: "Buscar API",
    pagina: criarPagina
};