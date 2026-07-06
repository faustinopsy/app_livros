import { buscarListaPersonagens, buscarDetalhePersonagem } from "../../services/rickandmorty.js";
import { mostrarCarregando, esconderCarregando } from "../../services/loading.js";

let paginaAtual = 1;

async function telaRickAndMorty(app) {
    paginaAtual = 1;
    app.innerHTML = `
    <div id="modalDetalhes" class="bem-modal bem-modal--hidden">
        <div class="bem-modal__dialog">
            <div class="bem-modal__header">
                <h2 class="bem-modal__title" id="detalheTitulo"></h2>
                <button id="fecharDetalhes" class="bem-modal__close">&times;</button>
            </div>
            <div class="bem-modal__body" id="detalheCorpo"></div>
        </div>
    </div>

    <div class="bem-container">
        <h1 class="bem-mb-md">Rick and Morty</h1>
        <div id="listaPersonagens" class="bem-grid-auto"></div>
        <div class="bem-flex bem-justify-center bem-items-center bem-gap-md bem-mt-lg">
            <button id="paginaAnterior" class="bem-btn bem-btn--outline">Anterior</button>
            <span id="indicadorPagina"></span>
            <button id="proximaPagina" class="bem-btn bem-btn--outline">Próxima</button>
        </div>
    </div>
    `;

    document.getElementById("fecharDetalhes").addEventListener("click", fecharDetalhes);
    document.getElementById("paginaAnterior").addEventListener("click", () => mudarPagina(-1));
    document.getElementById("proximaPagina").addEventListener("click", () => mudarPagina(1));

    await renderizarPagina();
}

async function mudarPagina(direcao) {
    paginaAtual += direcao;
    if (paginaAtual < 1) paginaAtual = 1;
    await renderizarPagina();
}

async function renderizarPagina() {
    mostrarCarregando();
    try {
        const { totalPaginas, personagens } = await buscarListaPersonagens(paginaAtual);

        let html = '';
        for (const personagem of personagens) {
            html += `
            <div class="bem-card" data-id="${personagem.id}">
                <img src="${personagem.imagem}" alt="${personagem.nome}" class="bem-card__image">
                <div class="bem-card__body">
                    <h3 class="bem-card__title">${personagem.nome}</h3>
                    <p class="bem-card__subtitle">${personagem.status} - ${personagem.especie}</p>
                </div>
            </div>
            `;
        }
        document.getElementById("listaPersonagens").innerHTML = html;

        document.getElementById("indicadorPagina").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        document.getElementById("paginaAnterior").disabled = paginaAtual <= 1;
        document.getElementById("proximaPagina").disabled = paginaAtual >= totalPaginas;

        for (const card of document.querySelectorAll("#listaPersonagens .bem-card")) {
            card.addEventListener("click", () => abrirDetalhes(card.dataset.id));
        }
    } catch (erro) {
        console.error(erro);
    } finally {
        esconderCarregando();
    }
}

async function abrirDetalhes(id) {
    mostrarCarregando();
    try {
        const personagem = await buscarDetalhePersonagem(id);

        document.getElementById("detalheTitulo").textContent = personagem.nome;
        document.getElementById("detalheCorpo").innerHTML = `
            <img src="${personagem.imagem}" alt="${personagem.nome}" class="bem-card__image bem-max-w-xs bem-mx-auto">
            <p><strong>Status:</strong> ${personagem.status}</p>
            <p><strong>Espécie:</strong> ${personagem.especie}</p>
            <p><strong>Gênero:</strong> ${personagem.genero}</p>
            <p><strong>Origem:</strong> ${personagem.origem}</p>
            <p><strong>Localização atual:</strong> ${personagem.localizacaoAtual}</p>
        `;

        document.getElementById("modalDetalhes").classList.remove("bem-modal--hidden");
    } catch (erro) {
        console.error(erro);
    } finally {
        esconderCarregando();
    }
}

function fecharDetalhes() {
    document.getElementById("modalDetalhes").classList.add("bem-modal--hidden");
}

export default {
    url: '#rickandmorty',
    label: 'Rick and Morty',
    pagina: telaRickAndMorty
};
