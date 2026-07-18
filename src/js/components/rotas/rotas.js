import home from '../paginas/home.js'
import servicos from '../paginas/servicos.js'
import sobre from '../paginas/sobre.js'
import contato from '../paginas/contato.js'
import telaCadastro from '../paginas/formCad.js'
import criarPagina from '../paginas/personagens.js'
//    URL  cria a ancora ou link
//    LABEL  nome da ancora
//    PAGINA  é que chama a pagina
//    ACAO    é evento dentro da pagina
const roteador = [
    home,
    servicos,
    sobre,
    contato,
    telaCadastro,
    criarPagina
]

export default roteador;
