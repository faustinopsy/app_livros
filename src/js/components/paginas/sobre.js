function sobre(app){
    const sobre = `
    <section class="section">
        <div class="container">
            <h1 class="title is-3">Esta é página Sobre</h1>
            <p class="subtitle is-5 mt-2">Este site é um exemplo de SPA usando JavaScript puro</p>
        </div>
    </section>
    `
    app.innerHTML = sobre
}
export default {
    url: '#sobre',
    label: 'Sobre',
    pagina: sobre
};