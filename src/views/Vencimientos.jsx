import { useState } from 'react';
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import { Puff } from "react-loader-spinner";

export default function Vencimientos() {
    const token = localStorage.getItem("AUTH_TOKEN");

    // Fetch de productos con vencimientos
    const fetcher = (url) => clienteAxios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    }).then((res) => res.data);

    const { data, error, isLoading } = useSWR('/api/productos?vencimientos=true', fetcher, { refreshInterval: 10000 });

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Número de productos por página

    if (error) return <p className="text-red-500">Error: {error.message}</p>;

    const productos = data?.data || [];
    const totalPages = Math.ceil(productos.length / itemsPerPage);

    // Obtener productos de la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = productos.slice(indexOfFirstItem, indexOfLastItem);

    // Función para determinar el color del vencimiento
    const obtenerColorVencimiento = (fecha) => {
        if (!fecha) return "text-gray-800"; // Si no hay fecha, mantener gris

        const hoy = new Date();
        const [año, mes] = fecha.split("-").map(Number); // Extraemos año y mes

        const añoActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1; // `getMonth()` devuelve 0-11, sumamos 1

        const diferenciaMeses = (año - añoActual) * 12 + (mes - mesActual);

        if (diferenciaMeses < 0) return "text-red-600 font-bold"; // Ya venció
        if (diferenciaMeses === 0) return "text-red-600 font-bold"; // Vence este mes
        if (diferenciaMeses < 3) return "text-orange-500 font-semibold"; // Vence en 1 o 2 meses
        return "text-gray-800"; // No está cerca de vencer
    };

    // Función para obtener el vencimiento más cercano y ordenarlo
    const ordenarPorVencimiento = (productos) => {
        return productos.sort((a, b) => {
            const vencimientoA = a.vencimientos.length > 0 ? a.vencimientos.sort((v1, v2) => {
                const [año1, mes1] = v1.fecha_vencimiento.split("-").map(Number);
                const [año2, mes2] = v2.fecha_vencimiento.split("-").map(Number);
                return año1 !== año2 ? año1 - año2 : mes1 - mes2;
            })[0] : null;

            const vencimientoB = b.vencimientos.length > 0 ? b.vencimientos.sort((v1, v2) => {
                const [año1, mes1] = v1.fecha_vencimiento.split("-").map(Number);
                const [año2, mes2] = v2.fecha_vencimiento.split("-").map(Number);
                return año1 !== año2 ? año1 - año2 : mes1 - mes2;
            })[0] : null;

            const fechaA = vencimientoA ? `${vencimientoA.fecha_vencimiento}` : '';
            const fechaB = vencimientoB ? `${vencimientoB.fecha_vencimiento}` : '';

            if (!fechaA && !fechaB) return 0; // Si no hay vencimientos, no se cambia el orden
            if (!fechaA) return 1; // Si A no tiene vencimiento, debe ir al final
            if (!fechaB) return -1; // Si B no tiene vencimiento, debe ir al final

            return new Date(fechaA) - new Date(fechaB);
        });
    };

    const productosOrdenados = ordenarPorVencimiento(productos);

    return (
        <div>
            <h1 className='text-4xl font-black'>Vencimientos</h1>
            <p className='text-2xl my-10'>Visualiza tus próximos vencimientos aquí</p>

            <div className="border shadow-md rounded-md bg-white p-5">
                {/* Spinner de carga */}
                {isLoading && (
                    <div className="flex justify-center items-center h-40">
                        <Puff height="100" width="100" color="#ba5dd1" ariaLabel="cargando.." />
                    </div>
                )}

                <h3 className='text-xl font-black text-center mb-4 border p-4 bg-red-400 font-serif rounded-lg'>
                    Productos con vencimientos cercanos
                </h3>

                {/* Tabla con scroll */}
                {!isLoading && productosOrdenados.length > 0 ? (
                    <div className="overflow-x-auto max-h-96 border rounded-lg">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200 sticky top-0">
                                    <th className="border border-gray-300 p-2">Producto</th>
                                    <th className="border border-gray-300 p-2">Vencimiento más cercano</th>
                                    <th className="border border-gray-300 p-2">Cantidad Disponible</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map((producto) => {
                                    const { vencimientos } = producto;
                                    const vencimientoMasCercano = vencimientos.length > 0
                                        ? vencimientos.sort((a, b) => {
                                            const [añoA, mesA] = a.fecha_vencimiento.split("-").map(Number);
                                            const [añoB, mesB] = b.fecha_vencimiento.split("-").map(Number);

                                            return añoA !== añoB ? añoA - añoB : mesA - mesB;
                                        })[0]
                                        : null;
                                    const cantidadTotal = vencimientos.length > 0
                                        ? vencimientos.reduce((total, v) => total + v.cantidad, 0)
                                        : 0;

                                    return (
                                        <tr key={producto.id} className="text-center border-b border-gray-300">
                                            <td className="border border-gray-300 p-2">{producto.nombre}</td>
                                            <td className={`border border-gray-300 p-2 ${vencimientoMasCercano ? obtenerColorVencimiento(vencimientoMasCercano.fecha_vencimiento) : "text-gray-800"}`}>
                                                {vencimientoMasCercano ? vencimientoMasCercano.fecha_vencimiento : "Sin vencimientos"}
                                            </td>
                                            <td className="border border-gray-300 p-2">
                                                {cantidadTotal > 0 ? cantidadTotal : "Sin stock"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">No hay productos con vencimientos cercanos.</p>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                        <button
                            className={`px-4 py-2 mx-1 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-700"}`}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>

                        <span className="px-4 py-2 mx-1 border rounded">
                            Página {currentPage} de {totalPages}
                        </span>

                        <button
                            className={`px-4 py-2 mx-1 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-700"}`}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
