let cardServico = "";
const detalhes = [
    {
        titulo: 'Jogo das quartas de final da copa do mundo de 2002',
        descricao: 'xxxxxxxx xxxxxxxxx xxxxx',
        imagem: 'src/img/2002_1.webp'
    },
    {
        titulo: 'Jogo especial',
        descricao: 'xxxxxxxx xxxxxxxxx xxxxx',
        imagem: 'src/img/2002_2.jpg'
    },
    {
        titulo: 'Camisa azul',
        descricao: 'xxxxxxxx xxxxxxxxx xxxxx',
        imagem: 'src/img/2002_3.jpg'
    },
    {
        titulo: 'Ronaldos',
        descricao: 'xxxxxxxx xxxxxxxxx xxxxx',
        imagem: 'src/img/2002_4.webp'
    }
]

//
async function servicos(app){
    cardServico += `
    <section class="section">
        <div class="container">
            <div class="columns is-multiline">`
    for(let i=0; i < detalhes.length; i++){
        cardServico += `
                    <div class="column is-one-quarter-desktop is-half-tablet">
                        <div class="card h-100" style="height: 100%;">
                            <div class="card-image">
                                <figure class="image is-4by3">
                                    <img src="${detalhes[i].imagem}" alt="${detalhes[i].titulo}" style="object-fit: cover;">
                                </figure>
                            </div>
                            <div class="card-content">
                                <p class="title is-5" style="display:flex;align-items:center;gap:8px;"><i data-lucide="info" width="20" height="20"></i> ${detalhes[i].titulo}</p>
                                <p class="subtitle is-6 mt-2">${detalhes[i].descricao}</p>
                            </div>
                        </div>
                    </div>
            `
        }
    cardServico += `</div></div></section>`
    app.innerHTML = cardServico
}
export default {
    url: '#servicos',
    label: 'Serviços',
    pagina: servicos
};