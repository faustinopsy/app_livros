function abrirModalGenerico(conteudoHTML) {
    const modalAntigo = document.getElementById("modal-generico")
    if(modalAntigo) modalAntigo.remove()
    const modalHTML = `
        <div id="modal-generico" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 9999;">
            <div style="background: #fff; color: #333; padding: 30px 20px 20px; border-radius: 10px; max-width: 400px; width: 90%; text-align: center; position: relative;">
                <button id="btn-fechar-modal" style="position: absolute; top: 10px; right: 10px; background: transparent; color: #ff4757; border: none; font-size: 18px; cursor: pointer; font-weight: bold;">
                    X
                </button>
                <div id="modal-conteudo">
                    ${conteudoHTML}
                </div>
                
            </div>
        </div>
    `
    document.body.insertAdjacentHTML("beforeend", modalHTML)
    document.getElementById("btn-fechar-modal").addEventListener("click", () => {
        document.getElementById("modal-generico").remove()
    })
}
export default abrirModalGenerico