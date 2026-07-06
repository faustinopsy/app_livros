import { buscarListaLivros, buscarDetalheLivro } from "../../services/livros.js";
import { mostrarCarregando, esconderCarregando } from "../../services/loading.js";

let paginaAtual = 1;

async function telaLivros(app) {
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
        <h1 class="bem-mb-md">Livros</h1>
        <div id="listaLivros" class="bem-grid-auto"></div>
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
        const { totalPaginas, livros } = await buscarListaLivros(paginaAtual);

        let html = '';
        for (const livro of livros) {
            html += `
            <div class="bem-card" data-id="${livro.id}">
                <img src="${livro.imagem}" alt="${livro.titulo}" class="bem-card__image">
                <div class="bem-card__body">
                    <h3 class="bem-card__title">${livro.titulo}</h3>
                    <p class="bem-card__subtitle">${livro.autores}</p>
                </div>
            </div>
            `;
        }
        document.getElementById("listaLivros").innerHTML = html;

        document.getElementById("indicadorPagina").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        document.getElementById("paginaAnterior").disabled = paginaAtual <= 1;
        document.getElementById("proximaPagina").disabled = paginaAtual >= totalPaginas;

        for (const card of document.querySelectorAll("#listaLivros .bem-card")) {
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
        const livro = await buscarDetalheLivro(id);

        document.getElementById("detalheTitulo").textContent = livro.titulo;
        document.getElementById("detalheCorpo").innerHTML = `
            <img src="${livro.imagem}" alt="${livro.titulo}" class="bem-card__image bem-max-w-xs bem-mx-auto">
            <p><strong>Assuntos:</strong> ${livro.assuntos}</p>
            <p>${livro.descricao}</p>
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
    url: '#livros',
    label: 'Livros',
    pagina: telaLivros
};
