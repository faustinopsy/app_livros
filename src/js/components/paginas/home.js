async function home(app) {
    const paginainicial =  `<h1> Esta é página Inicial </h1>

    `
    app.innerHTML = paginainicial;
}

export default {
    url: '#home',
    label: 'Home',
    pagina: home
}