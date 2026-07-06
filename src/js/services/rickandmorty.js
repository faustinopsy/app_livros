import buscarDados from "./api.js";

const BASE_URL = "https://rickandmortyapi.com/api/character";

async function buscarListaPersonagens(pagina) {
    const dados = await buscarDados(`${BASE_URL}?page=${pagina}`);

    const personagens = [];
    for (const item of dados.results) {
        personagens.push({
            id: item.id,
            nome: item.name,
            imagem: item.image,
            status: item.status,
            especie: item.species
        });
    }

    return { totalPaginas: dados.info.pages, personagens };
}

async function buscarDetalhePersonagem(id) {
    const dados = await buscarDados(`${BASE_URL}/${id}`);

    return {
        id: dados.id,
        nome: dados.name,
        imagem: dados.image,
        status: dados.status,
        especie: dados.species,
        genero: dados.gender,
        origem: dados.origin.name,
        localizacaoAtual: dados.location.name
    };
}

export { buscarListaPersonagens, buscarDetalhePersonagem };
