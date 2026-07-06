import buscarDados from "./api.js";

const BASE_URL = "https://gutendex.com/books";
const TERMO_PADRAO = "fiction";
const ITENS_POR_PAGINA = 32;

function extrairAutores(autores) {
    const nomes = [];
    for (const autor of autores) {
        nomes.push(autor.name);
    }
    return nomes.length ? nomes.join(', ') : 'Autor desconhecido';
}

function extrairImagem(formatos) {
    return formatos['image/jpeg'] || '';
}

async function buscarListaLivros(pagina) {
    const dados = await buscarDados(`${BASE_URL}/?search=${TERMO_PADRAO}&page=${pagina}`);

    const livros = [];
    for (const item of dados.results) {
        livros.push({
            id: item.id,
            titulo: item.title,
            autores: extrairAutores(item.authors),
            imagem: extrairImagem(item.formats)
        });
    }

    const totalPaginas = Math.ceil(dados.count / ITENS_POR_PAGINA);
    return { totalPaginas, livros };
}

async function buscarDetalheLivro(id) {
    const dados = await buscarDados(`${BASE_URL}/${id}/`);

    return {
        titulo: dados.title,
        autores: extrairAutores(dados.authors),
        imagem: extrairImagem(dados.formats),
        descricao: dados.summaries.length ? dados.summaries[0] : 'Sem descrição disponível.',
        assuntos: dados.subjects.length ? dados.subjects.slice(0, 5).join(', ') : 'Não informado'
    };
}

export { buscarListaLivros, buscarDetalheLivro };
