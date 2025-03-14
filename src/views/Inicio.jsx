import clienteAxios from '../config/axios';
import useSWR from 'swr';
import { Puff } from "react-loader-spinner";
import { useState } from 'react';

export default function Inicio() {
const token = localStorage.getItem("AUTH_TOKEN");

const [inputBusqueda, setInputBusqueda] = useState(""); // Lo que el usuario escribe
const [busqueda, setBusqueda] = useState("");

// Consulta swr
const fetcher = (url) => clienteAxios.get(url, {
    headers: {
        Authorization: `Bearer ${token}`
    }
}).then((res) => res.data);

const {data, error, isLoading} = useSWR(busqueda ? `/api/productos?busqueda=${busqueda}` : null, fetcher, { refreshInterval: 10000 })

 // Ejecutar búsqueda cuando el usuario presiona "Enter"
const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (inputBusqueda.trim() !== "") {
      setBusqueda(inputBusqueda.trim());
      setInputBusqueda(""); // Limpia el input después de buscar
    }
  }
};


if (error) return <p className="text-red-500">Error: {error.message}</p>;
  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-5">Consulta el precio del producto por codigo de barras</h1>
      
      {/* Barra de búsqueda */}
      <div className="mt-4 mb-4 flex justify-center items-center border rounded-xl bg-gray-200 p-4">
        <input
          type="text"
          autoFocus
          placeholder="Escanear código de barras..."
          value={inputBusqueda}
          onChange={(e) => setInputBusqueda(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-2/5 shadow-md p-2 border rounded text-lg"
        />
      </div>

      {/* Spinner de carga */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Puff height="100" width="100" color="#ba5dd1" ariaLabel="cargando.." />
        </div>
      )}

       {/* Lista de productos */}
       {!isLoading && data && (
        <div className="flex flex-col items-center">
          {data?.data?.length > 0 ? (
            data.data.map((producto) => (
              <div key={producto.id} className="border rounded p-4 shadow-md mb-4 w-full text-left">
                <h2 className="text-3xl font-bold font-serif">{producto.nombre}</h2>
                <p>Código: {producto.codigo_barras}</p>

                {/* Precio original y precio de oferta (si existe) */}
                <div className="flex items-center mt-2">
                  <p className={producto.ofertas ? "text-lg font-bold text-red-500 line-through mr-4" : "text-2xl font-bold underline"}>
                    Precio: ${producto.precio}
                  </p>
                  {/* Mostrar precio de oferta si existe */}
                  {producto.ofertas && (
                    <p className="text-2xl font-black text-green-600">
                      ${producto.ofertas.precio_oferta} <span className="text-sm font-medium">En oferta</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No se encontraron productos.</p>
          )}
        </div>
      )}
    </>
  )
}
