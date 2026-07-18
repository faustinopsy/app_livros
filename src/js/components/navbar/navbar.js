function navbar(itens) {
    const nav = document.getElementById('navbar');
    const links = itens.map(item => `
        <li class="bem-navbar__item">
            <a href="${item.url}" class="bem-navbar__link">${item.label}</a>
        </li>`).join('');

    nav.innerHTML = `<nav class="bem-navbar">
        <a href="#" class="bem-navbar__brand">Brand</a>
        <input type="checkbox" id="nav-toggle" class="bem-navbar__checkbox">
        <label for="nav-toggle" class="bem-navbar__toggle">☰</label>
        <ul class="bem-navbar__menu">${links}</ul>
    </nav>`;
}

export default navbar;
