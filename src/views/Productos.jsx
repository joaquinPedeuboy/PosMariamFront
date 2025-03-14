import useSWR from 'swr';
import Producto from '../components/Producto';
import clienteAxios from '../config/axios'
import { useState } from 'react';
import useQuiosco from '../hooks/useQuiosco';
import { Puff } from "react-loader-spinner";


export default function Productos() {
    const token = localStorage.getItem("AUTH_TOKEN");

    const [paginaActual, setPaginaActual] = useState(1);
    const [inputBusqueda, setInputBusqueda] = useState(""); // Lo que el usuario escribe
    const [busqueda, setBusqueda] = useState("");

    const { handleClickModalCrearProducto, handleClickModalCrearDepa } = useQuiosco();

    // Consulta swr
    const fetcher = (url) => clienteAxios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((res) => res.data);

    const {data, error, isLoading, mutate} = useSWR(`/api/productos?busqueda=${busqueda}&page=${paginaActual}&per_page=5`, fetcher, { refreshInterval: 10000 })

    const handleBuscar = () => {
        setPaginaActual(1);
        setBusqueda(inputBusqueda.trim());
    };

     // Detecta si se presiona la tecla "Enter" y ejecuta la búsqueda
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevenir la acción predeterminada (enviar formulario, por ejemplo)
            handleBuscar(); // Ejecuta la búsqueda
        }
    };
    

    // Funciones de paginación
    const handlePaginaAnterior = () => {
        setPaginaActual((prev) => Math.max(prev - 1, 1));
    };

    const handlePaginaSiguiente = () => {
        if (data?.meta?.current_page < data?.meta?.last_page) {
            setPaginaActual((prev) => prev + 1);
        }
    };


    if (error) return <p className="text-red-500">Error: {error.message}</p>;

    return (
    <>
        <div>
            <h1 className='text-4xl font-black'>Productos</h1>
            <p className='text-2xl my-10'>Maneja tus productos desde aquí</p>

            <div className='flex justify-end gap-3'>
                <button
                    className='flex items-center mb-5 p-2 gap-1 text-center text-lg bg-green-500 hover:bg-green-800 text-white rounded-lg'
                    onClick={()=> {
                        handleClickModalCrearDepa();
                    }}
                >   
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Crear Nuevo Departamento
                </button>

                <button
                    className='flex items-center mb-5 p-2 gap-1 text-center text-lg bg-green-500 hover:bg-green-800 text-white rounded-lg'
                    onClick={()=> {
                        handleClickModalCrearProducto();
                    }}
                >   
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Crear Nuevo Producto
                </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="mt-2 mb-4 flex justify-evenly items-center border rounded-xl bg-gray-200 p-4">
                {/* <h3 className='font-bold text-2xl'>Buscar Productos:</h3> */}
                <input
                type="text"
                placeholder="Buscar productos o escanear código de barras..."
                value={inputBusqueda}
                onChange={(e) => setInputBusqueda(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-2/5 shadow-md p-2 border rounded"
                />

                <button
                    onClick={handleBuscar}
                    className="text-lg px-4 py-2 bg-blue-500 hover:bg-blue-800 text-white rounded w-1/6"
                >
                    Buscar
                </button>
            </div>
            

            {/* Spinner de carga */}
            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <Puff height="100" width="100" color="#ba5dd1" ariaLabel="cargando.." />
                </div>
            )}

                {/* Lista de productos */}
                {!isLoading && data && (
                    <>
                        <div className="flex flex-col">
                            {data?.data.length === 0 ? (
                                <p>No se encontraron productos.</p>
                            ) : (
                                data?.data.map((producto) => <Producto key={producto.id} producto={producto} mutate={mutate} />)
                            )}
                        </div>

                        {/* Controles de paginación */}
                        {data.meta && (
                            <div className="flex justify-evenly mt-5 p-5">
                                <button
                                    onClick={handlePaginaAnterior}
                                    disabled={data.meta.current_page === 1}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <p className="text-lg font-bold">
                                    Página {data.meta.current_page} de {data.meta.last_page}
                                </p>
                                <button
                                    onClick={handlePaginaSiguiente}
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
        </>
    );
}
