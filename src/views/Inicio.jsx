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
      setTimeout(() => setInputBusqueda(""), 50); // Limpia el input después de buscar
    }
  }
};


if (error) return <p className="text-red-500">Error: {error.message}</p>;
  return (
    <>
      <h1 className="text-2xl md:text-4xl font-serif text-center mt-5">Consultar el precio del producto escaneando el código de barras</h1>
      
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
        <div className="flex justify-center mt-10">
          <Puff height="80" width="80" color="#ba5dd1" />
        </div>
      )}

       {/* Lista de productos */}
       {!isLoading && data && (
        <div className="flex flex-col items-center">
          {data?.data?.length > 0 ? (
            data.data.map((producto) => (
              <div key={producto.id} className="border rounded-full p-4 shadow-md shadow-violet-900 mb-4 w-full text-center">
                <h2 className="text-3xl font-bold font-serif">{producto.nombre}</h2>
                <p className="text-gray-700 mt-1">Código: {producto.codigo_barras}</p>

                {/* Precio original y precio de oferta (si existe) */}
                <div className="flex justify-center mt-2 items-center">
                  <p className={producto.ofertas ? "text-lg font-bold text-red-500 line-through mr-4 shadow-xl p-4 border rounded-full" : "text-2xl font-black shadow-xl p-4 border rounded-full"}>
                    Precio: <span className={producto.ofertas ? "text-lg font-bold text-red-500 line-through mr-4" : "text-green-700"}>${producto.precio}</span>
                  </p>
                  {/* Mostrar precio de oferta si existe */}
                  {producto.ofertas && (
                    <p className="text-2xl font-black text-green-600 shadow-xl p-4 border rounded-full">
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
