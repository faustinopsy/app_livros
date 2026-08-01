async function buscarNoMundo(url, dados='', forma=''){
    try {
        const formataURL = `${url}${dados}${forma}`
        const response = await fetch(formataURL);
        const result = await response.json();
        return result
    } catch (error) {
        console.error(error);
    };
}
export default buscarNoMundo;