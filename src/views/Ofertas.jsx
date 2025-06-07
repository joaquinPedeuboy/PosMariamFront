import clienteAxios from '../config/axios';
import useSWR from 'swr';
import { Puff } from "react-loader-spinner";
import { useState } from 'react';

export default function Ofertas() {
    const token = localStorage.getItem("AUTH_TOKEN");
    const [paginaActual, setPaginaActual] = useState(1);

    // Consulta swr
    const fetcher = (url) => clienteAxios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((res) => res.data);

    const params = new URLSearchParams({
        oferta: 'true',
        page: paginaActual
    }).toString();

    const {data, error, isLoading} = useSWR(`/api/productos?${params}`, fetcher, { refreshInterval: 10000 })

    const meta = data?.meta  || {};

    const irAPagina = n => {
        if (n < 1 || n > meta.last_page) return;
        setPaginaActual(n);
    };

    if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div>
        <h1 className='text-4xl font-black'>Productos en Oferta</h1>
        <p className='text-2xl my-10'>Visualiza tus ofertas aquí</p>
        <div className="border shadow-sm rounded-sm bg-white p-5">
            <h3 className='text-xl font-black text-center mb-4 border p-4 bg-blue-300 font-mono'>Ofertas Disponibles</h3>   
            {/* Spinner de carga */}
            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <Puff height="100" width="100" color="#ba5dd1" ariaLabel="cargando.." />
                </div>
            )}
            {/* Lista de productos en oferta */}
            {!isLoading && data?.data.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                    {/** Tabla de ofertas */}
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="sticky top-0 bg-gray-200 z-10">
                            <tr>
                                <th className="border p-2">Producto</th>
                                <th className="border p-2">Precio de Oferta</th>
                                <th className="border p-2">Cantidad Disponible</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.data.map((producto) =>(
                                <tr className="text-center border-b" key={producto.id}>
                                    {/* Columna de nombre producto */}
                                    <td className="border p-2 align-center">{producto.nombre}</td>
                                    {/* Columna de precio de oferta */}
                                    <td className="border p-2 align-center">${producto.ofertas?.precio_oferta}</td>
                                    {/* Columna de cantidad en oferta */}
                                    <td className="border p-2 align-center">{producto.ofertas?.cantidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* CONTROLES DE PAGINACIÓN */}
                        <div className="mt-4 mb-4 flex justify-evenly">
                            <button
                            disabled={meta.current_page <= 1}
                            onClick={() => irAPagina(meta.current_page - 1)}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                            >
                            Anterior
                            </button>

                            <span>Página {meta.current_page} de {meta.last_page}</span>

                            <button
                            disabled={meta.current_page >= meta.last_page}
                            onClick={() => irAPagina(meta.current_page + 1)}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                            >
                            Siguiente
                            </button>
                        </div>
                </div>
            ) : (
                <p>No hay productos en oferta.</p>
            )}
        </div>
    </div>
  );
}
