function navbar(item_menu){
const navbar = document.getElementById('navbar');
navbar.innerHTML = `<nav class="navbar is-info" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="#">
      <strong>Brand</strong>
    </a>
    <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>

  <div id="navbarBasicExample" class="navbar-menu">
    <div class="navbar-start">
        ${
            item_menu.map((item)=>{
                return `<a href="${item.url}" class="navbar-item">${item.label}</a>`
            }).join('')
        }
    </div>
  </div>
</nav>`;

// Script simple para o menu mobile (Bulma)
setTimeout(() => {
    const burger = document.querySelector('.navbar-burger');
    const menu = document.querySelector('.navbar-menu');
    if(burger && menu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
    }
}, 100);
}

export default navbar;