export const formatearDinero = cantidad => {
    if (cantidad === undefined || cantidad === null) {
        return "$0.00"; // Retorna un valor predeterminado en caso de que la cantidad sea undefined o null
    }
    return cantidad.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    })
}