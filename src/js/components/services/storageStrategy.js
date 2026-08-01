const memoriaTemporaria = {
    _cache: new Map(),
    // é para verificar se existe a informação armazenada
    existe(chave){
        return this._cache.has(chave);
    },
    //buscar dados salvos na memoria
    buscarDadosLocal(chave){
        return this._cache.get(chave);
    },
    //salvar dados na memoria
    salvarDadosLocal(chave, valor){
        this._cache.set(chave, valor)
    }
};

const memoriaPermanente = {
    // é para verificar se existe a informação armazenada
    existe(chave){
        return localStorage.getItem(chave) !== null;
    },
    buscarDadosLocal(chave){
        const dados = localStorage.getItem(chave);
        //  condição ternario
        //     existe retorne o conteudo apos ? senao o conteudo apos : 
        //    JSON.parse = trasforma texto em objeto          
        return dados ? JSON.parse(dados) : null;
    },
    salvarDadosLocal(chave, valor){
        //salvar dados na memoria
        // JSON.stringify = transforma o objeto em texto
        localStorage.setItem(chave, JSON.stringify(valor));
    }
};

export { memoriaTemporaria, memoriaPermanente}