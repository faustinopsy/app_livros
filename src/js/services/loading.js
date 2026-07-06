function mostrarCarregando() {
    Swal.fire({
        didOpen: () => Swal.showLoading()
    });
}

function esconderCarregando() {
    Swal.close();
}

export { mostrarCarregando, esconderCarregando };
