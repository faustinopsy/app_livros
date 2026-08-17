import buscarServicos from "../services/apiCache.js"

let termoBusca = 'batman'; // termo inicial

async function criarPaginaFilmes(app){
    const url = "https://api.tvmaze.com/search/shows?q=";
    
    let cardServico = "";
    
    try {
        const detalhes = await buscarServicos(url, termoBusca);
        // console.log(detalhes);
        
        cardServico += `
        <section class="section">
            <div class="container">
                <div class="field has-addons mb-5">
                    <div class="control is-expanded">
                        <input type="text" id="input-busca-filme" class="input" placeholder="Buscar filmes ou séries..." value="${termoBusca}">
                    </div>
                    <div class="control">
                        <button class="button is-primary" id="btn-busca-filme">
                            <span class="icon is-small"><i data-lucide="search"></i></span>
                            <span>Buscar</span>
                        </button>
                    </div>
                </div>
                <div class="columns is-multiline">
        `;
        
        if(detalhes && detalhes.length > 0) {
            for(let i = 0; i < detalhes.length; i++){
                const show = detalhes[i].show;
                const imagem = show.image ? show.image.medium : 'https://via.placeholder.com/210x295?text=Sem+Imagem';
                const genero = show.genres && show.genres.length > 0 ? show.genres.join(', ') : 'Sem gênero';
                
                cardServico += `
                    <div class="column is-one-quarter-desktop is-half-tablet">
                        <div class="card h-100" style="height: 100%;">
                            <div class="card-image">
                                <figure class="image">
                                    <img src="${imagem}" alt="${show.name}" style="object-fit: cover;">
                                </figure>
                            </div>
                            <div class="card-content">
                                <p class="title is-5" style="display:flex;align-items:center;gap:8px;"><i data-lucide="film" width="20" height="20"></i> ${show.name}</p>
                                <p class="subtitle is-6 mt-2">${genero}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            cardServico += `<p>Nenhum resultado encontrado.</p>`;
        }
        
        cardServico += `
            </div>
            </div>
        </section>
        `;
    } catch (error) {
        cardServico += `
        <section class="section">
            <div class="container">
                <div class="field has-addons mb-5">
                    <div class="control is-expanded">
                        <input type="text" id="input-busca-filme" class="input" placeholder="Buscar filmes ou séries..." value="${termoBusca}">
                    </div>
                    <div class="control">
                        <button class="button is-primary" id="btn-busca-filme">
                            <span class="icon is-small"><i data-lucide="search"></i></span>
                            <span>Buscar</span>
                        </button>
                    </div>
                </div>
                <div class="notification is-danger">Erro ao carregar os dados. Tente novamente.</div>
            </div>
        </section>
        `;
    }
    
    app.innerHTML = cardServico;
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    await capturaBotoes(app);
}

async function capturaBotoes(app) {
    const btnBusca = document.getElementById("btn-busca-filme");
    const inputBusca = document.getElementById("input-busca-filme");

    btnBusca.addEventListener("click", ()=>{
        if(inputBusca.value.trim() !== "") {
            termoBusca = inputBusca.value.trim();
            criarPaginaFilmes(app);
        }
    });
    
    inputBusca.addEventListener("keypress", (e)=>{
        if(e.key === "Enter" && inputBusca.value.trim() !== "") {
            termoBusca = inputBusca.value.trim();
            criarPaginaFilmes(app);
        }
    });
}

export default {
    url: "#filmes",
    label: "Filmes",
    pagina: criarPaginaFilmes
};
