import clienteAxios from '../config/axios';
import useSWR from 'swr';
import { Puff } from "react-loader-spinner";

export default function Ofertas() {
const token = localStorage.getItem("AUTH_TOKEN");

// Consulta swr
const fetcher = (url) => clienteAxios.get(url, {
    headers: {
        Authorization: `Bearer ${token}`
    }
}).then((res) => res.data);

const {data, error, isLoading} = useSWR('/api/productos?oferta=true', fetcher, { refreshInterval: 10000 })

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
                <ul className="flex flex-col items-center list-disc p-5">
                    {data.data.map((producto) => (
                        <li key={producto.id}>
                            <p className='text-xl'><strong>{producto.nombre}</strong> - Precio Oferta: ${producto.ofertas?.precio_oferta} - Cantidad Disponible: {producto.ofertas?.cantidad}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay productos en oferta.</p>
            )}
        </div>
    </div>
  );
}
