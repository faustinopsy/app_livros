import buscarNoMundo from "./api.js";
import { memoriaTemporaria, memoriaPermanente } from "./storageStrategy.js";

const storage = memoriaPermanente;

async function buscarServicos(url, dados='', forma=''){
    const formataURL = `${url}${dados}${forma}`
    if(storage.existe(formataURL)){
        console.time(`[CACHE] TEMPO PARA: ${dados || 'página inicial' }`)
        const resultadoEmCache = storage.buscarDadosLocal(formataURL)
        console.timeEnd(`[CACHE] TEMPO PARA: ${dados || 'página inicial' }`)
        return resultadoEmCache
    }
    console.time(`[Mundo exterior] tempo para ${dados || 'página inicial' }`)
    try{
        const resultadoDoServidor = await buscarNoMundo(url, dados, forma);
        storage.salvarDadosLocal(formataURL, resultadoDoServidor);
        console.timeEnd(`[Mundo exterior] tempo para ${dados || 'página inicial' }`)
        return resultadoDoServidor;
    }catch(error){
        console.timeEnd(`[Mundo exterior] tempo para ${dados || 'página inicial' }`)
        console.error("erro na busca:", error)
        throw error;
    }
}

export default buscarServicos;