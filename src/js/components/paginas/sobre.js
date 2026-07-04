function sobre(app){
    const sobre = `<h1> Esta é página Sobre </h1>
    <p>Este site é um exemplo de SPA usando JavaScript puro</p>
    `
    app.innerHTML = sobre
}


export default {
    url: '#sobre',
    label: 'Sobre',
    pagina: sobre
}