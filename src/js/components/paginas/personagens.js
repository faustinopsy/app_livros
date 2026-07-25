import buscarServicos from "../services/apiCache.js"
import abrirModalGenerico from "../services/modal.js"
let numero = 1
async function criarPagina(app){
    const nPagina = `?page=${numero}`;
    const detalhes = await buscarServicos("https://rickandmortyapi.com/api/character/",nPagina);
    let cardServico = ""
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
            <div class="bem-card card-clicavel" data-index="${i}" style="cursor: pointer;">
                <img class="bem-card__image" src="${detalhes.results[i].image}" alt="Imagem de ${detalhes.results[i].name}">
                <div class="bem-card__body">
                    <h3 class="bem-card__title">${detalhes.results[i].name}</h3>
                    <p>${detalhes.results[i].species}</p>
                </div>
            </div>
        `
        }
    cardServico += `</div>`
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
    const cards = document.querySelectorAll(".card-clicavel")
    
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const index = card.dataset.index
            const personagem = personagens[index]
            const conteudoPersonagem = `
                <img src="${personagem.image}" style="border-radius: 50%; width: 150px; border: 4px solid #88e23b;">
                <h2>${personagem.name}</h2>
                <hr style="margin: 10px 0;">
                <p><strong>Status:</strong> ${personagem.status}</p>
                <p><strong>Espécie:</strong> ${personagem.species}</p>
                <p><strong>Gênero:</strong> ${personagem.gender}</p>
                <p><strong>Origem:</strong> ${personagem.origin.name}</p>
            `
            abrirModalGenerico(conteudoPersonagem)
        })
    })
}

export default {
    url: "#rick",
    label: "Buscar API",
    pagina: criarPagina
};