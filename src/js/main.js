import navbar from "./components/navbar/navbar.js";
import roteador from "./components/rotas/rotas.js";
navbar(roteador);
const app = document.getElementById('app');
//console.log(roteador)
const mapaDeRotas= {}
//console.log(mapaDeRotas)
for(const rota of roteador){
    mapaDeRotas[rota.url] = rota
}
// console.log(mapaDeRotas)
// console.log(mapaDeRotas["#inicio"])
// console.log(mapaDeRotas["#inicio"].pagina)
// console.log(mapaDeRotas["#inicio"].pagina())
let hash = window.location.hash || '#inicio';
render();
window.addEventListener("hashchange", ()=>{
hash = window.location.hash;
render();


})
const rota404 = { pagina: () => `<div> Página não encontrada 404 </div>`}
async function render(){
    const rotaAtual = mapaDeRotas[hash] || rota404
    await rotaAtual.pagina(app)
    // if(typeof mapaDeRotas[hash].acao === 'function'){
    //    await mapaDeRotas[hash].acao()
    // }
}
// testes de assincronismo
// console.log("A Primeira chamada")
// setTimeout(()=>{
//     console.log("A Segunda Execução ou não?")
// })
// console.log("A Terceira execução ou não?")

// //teste sincrono

// console.log("B Primeira chamada")
// // const sincrono = ()=>{ console.log("Segunda Execução ou não?") }
// function sincrono(){
//     console.log("B Segunda Execução ou não?")
// }
// sincrono()
// console.log("B Terceira execução ou não?")