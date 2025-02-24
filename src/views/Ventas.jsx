import { useState } from "react";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import { formatearDinero } from "../helpers";
import { Puff } from "react-loader-spinner"; // Importa el spinner

export default function Ventas() {
    const [paginaActual, setPaginaActual] = useState(1);
    const [filtros, setFiltros] = useState({ fecha: "", total: "" });
    const [filtrosAplicados, setFiltrosAplicados] = useState({ fecha: "", total: "" });

    const token = localStorage.getItem('AUTH_TOKEN');
    const fetcher = (url) => clienteAxios(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((data) => data.data);

    const { data, error, isLoading } = useSWR(
        `/api/ventas?page=${paginaActual}&fecha=${filtrosAplicados.fecha}&total=${filtrosAplicados.total}`,
        fetcher,
        { refreshInterval: 1000 }
    );

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const buscarConFiltros = () => {
        setPaginaActual(1); // Reiniciar a la primera página
        setFiltrosAplicados(filtros);
    };

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <h1 className='text-4xl font-black'>Ventas</h1>
            <p className='text-2xl my-10'>Verifica las Ventas desde aquí</p>

            {/* Barra de búsqueda */}
            <div className="border shadow-sm rounded-md p-5 mb-5 bg-gray-300">
                <h3 className="font-bold text-md">Buscar tus ventas:</h3>
                <div className="flex justify-evenly mt-3">
                    <input
                        type="date"
                        name="fecha"
                        value={filtros.fecha}
                        onChange={handleFiltroChange}
                        className="border mt-1 w-2/12 p-3 bg-gray-50"
                    />
                    <input
                        type="number"
                        name="total"
                        value={filtros.total}
                        onChange={handleFiltroChange}
                        placeholder="Filtrar por total"
                        className="border mt-1 w-2/12 p-3 bg-gray-50"
                    />
                    <button
                        onClick={buscarConFiltros}
                        className="bg-amber-400 hover:bg-amber-600 text-white rounded w-2/12 text-xl"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            {/* Spinner de carga */}
            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <Puff height="80" width="80" color="#fbbf24" ariaLabel="cargando" />
                </div>
            )}

            {/* Resultados */}
            {!isLoading && data && (
                <>
                    <div className="grid grid-cols-3 gap-5">
                        {data.data.map((venta) => (
                            <div key={venta.id} className="p-5 bg-white shadow space-y-2 border-b mb-2">
                                <p className="text-xl font-bold text-slate-600">Contenido de la Venta:</p>
                                {venta.productos.map((producto, index) => (
                                    <div key={`${producto.id}-${index}`} className="border-b py-4">
                                        <p>{producto.nombre}</p>
                                        <p>
                                            Precio Producto:{" "}
                                            <span className="font-bold text-lg text-amber-500">
                                                {formatearDinero(parseFloat(producto.precio_unitario))}
                                            </span>
                                        </p>
                                        <p>
                                            Cantidad:{" "}
                                            <span className="font-bold">{producto.cantidad}</span>
                                        </p>
                                    </div>
                                ))}
                                <p>ID Venta: {venta.id}</p>
                                <p>Fecha de venta: {venta.created_at}</p>
                                <p className="text-lg font-bold text-amber-500">
                                    Total Vendido:{" "}
                                    <span className="text-2xl font-bold text-slate-950">
                                        {formatearDinero(parseFloat(venta.total))}
                                    </span>
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Controles de paginación */}
                    {data.meta && (
                        <div className="flex justify-evenly mt-5 p-5">
                            <button
                                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                                disabled={data.meta.current_page === 1}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <p className="text-lg font-bold">
                                Página {data.meta.current_page} de {data.meta.last_page}
                            </p>
                            <button
                                onClick={() => setPaginaActual((prev) => Math.min(prev + 1, data.meta.last_page))}
                                disabled={data.meta.current_page === data.meta.last_page}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
