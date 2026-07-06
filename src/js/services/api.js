async function buscarDados(url) {
    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status} ao chamar ${url}`);
    }

    return resposta.json();
}

export default buscarDados;
