import buscarServicos from "./api.js";
import { Memoria, LocalStorage } from "./storageStrategy.js";

const storage = LocalStorage; 

async function buscarComCache(url, dados = '', forma = '') {
    const formataURL = `${url}${dados}${forma}`;
    if (storage.has(formataURL)) {
        console.time(`[CACHE] Tempo para: ${dados || 'página inicial'}`);
        const resultadoEmCache = storage.get(formataURL);
        console.timeEnd(`[CACHE] Tempo para: ${dados || 'página inicial'}`);
        return resultadoEmCache;
    }
    console.time(`[SERVIDOR] Tempo para: ${dados || 'página inicial'}`);
    try {
        const resultadoServidor = await buscarServicos(url, dados, forma);
        storage.set(formataURL, resultadoServidor);
        console.timeEnd(`[SERVIDOR] Tempo para: ${dados || 'página inicial'}`);
        return resultadoServidor;
    } catch (error) {
        console.timeEnd(`[SERVIDOR] Tempo para: ${dados || 'página inicial'}`);
        console.error("Erro na busca:", error);
        throw error;
    }
}

export default buscarComCache;