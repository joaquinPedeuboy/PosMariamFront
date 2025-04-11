import clienteAxios from "../config/axios";
import useSWR from 'swr';
import { useState } from 'react';
import { Puff } from "react-loader-spinner";
import Departamento from '../components/Departamento';

export default function Departamentos() {
  const [paginaActual, setPaginaActual] = useState(1);
  const [inputBusqueda, setInputBusqueda] = useState(""); // Lo que el usuario escribe
  const [busqueda, setBusqueda] = useState("");

  const token = localStorage.getItem("AUTH_TOKEN");
  // Consulta SWR
  const fetcher = (url) =>
    clienteAxios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    `/api/departamentos?busqueda=${busqueda}&page=${paginaActual}&per_page=12`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const handleBuscar = () => {
    setPaginaActual(1);
    setBusqueda(inputBusqueda.trim());
  };

  // Detecta si se presiona la tecla "Enter" y ejecuta la búsqueda
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBuscar();
    }
  };

  // Funciones de paginación
  const handlePaginaAnterior = () => {
    setPaginaActual((prev) => Math.max(prev - 1, 1));
  };

  const handlePaginaSiguiente = () => {
    if (data?.current_page < data?.last_page) {
      setPaginaActual((prev) => prev + 1);
    }
  };

  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Departamentos</h1>
      <p className="text-xl mb-8 text-center">Maneja tus departamentos desde aquí</p>

      {/* Barra de búsqueda */}
      <div className="flex flex-col md:flex-row md:justify-center items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar departamentos..."
          value={inputBusqueda}
          onChange={(e) => setInputBusqueda(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full md:w-1/3 p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleBuscar}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
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

      {/* Lista de departamentos en grid */}
      {!isLoading && data && (
        <>
          {data.data.length === 0 ? (
            <p className="text-center text-gray-600">No se encontraron departamentos.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.data.map((departamento) => (
                <Departamento key={departamento.id} departamento={departamento} />
              ))}
            </div>
          )}

          {/* Controles de paginación */}
          <div className="flex justify-center mt-8 items-center gap-4">
            <button
              onClick={handlePaginaAnterior}
              disabled={data.current_page === 1}
              className={`px-4 py-2 rounded ${data.current_page === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
              Anterior
            </button>
            <p className="text-lg font-semibold">
              Página {data.current_page} de {data.last_page}
            </p>
            <button
              onClick={handlePaginaSiguiente}
              disabled={data.current_page === data.last_page}
              className={`px-4 py-2 rounded ${data.current_page === data.last_page
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
