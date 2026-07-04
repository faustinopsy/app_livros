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
function servicos(app){
    cardServico += `<div class="bem-grid-auto">`
    for(let i=0; i < detalhes.length; i++){
        cardServico += `
                    <div class="bem-card">
                        <img class="bem-card__image" src="${detalhes[i].imagem}" alt="Image description">
                        <div class="bem-card__body">
                            <h3 class="bem-card__title">${detalhes[i].titulo}</h3>
                            <p>${detalhes[i].descricao}</p>
                        </div>
                    </div>
                
            `
        }
    cardServico += `</div>`
    app.innerHTML = cardServico
}


export default {
    url: '#servicos',
    label: 'Serviços',
    pagina: servicos
}
