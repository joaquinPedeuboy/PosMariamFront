import { useState } from "react"
import useSWR from "swr";
import clienteAxios from "../config/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatearDinero } from "../helpers";
import FiltroFecha from "../components/FiltroFecha";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { Puff } from "react-loader-spinner";

registerLocale("es", es);

export default function EstadisticasProductos() {

  const currentYear = new Date().getFullYear();
  const [año, setAño] = useState(currentYear);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const token = localStorage.getItem("AUTH_TOKEN");

  const fetcher = async (url) => await clienteAxios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then((res) => res.data);

  // Obtener los productos más y menos vendidos por mes
  const { data: ventasProductos, error, isValidating } = useSWR(
    [`/api/ventas/productos-mes`, año, mes], 
    ([url, año, mes]) => fetcher(`${url}?año=${año}&mes=${mes}`),
  { 
      revalidateOnFocus: false,
      refreshInterval: 0, // Desactiva la actualización automática
      revalidateIfStale: true, // Siempre vuelve a pedir datos nuevos
      revalidateOnReconnect: true // Se actualiza si se pierde y recupera la conexión
  }
  );

  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  const productosMasVendidos = ventasProductos?.productos_mas_vendidos?.slice(0, 10) || [];
  const productosMenosVendidos = ventasProductos?.productos_menos_vendidos?.slice(0, 10) || [];

  const mensajeNoHayVentas = ventasProductos?.message || '';

  return (
    <>
        <div>
          <h1 className="text-4xl font-black">Estadísticas de Productos</h1>
          <p className="text-2xl mt-4 mb-10">Revisa las ventas de los productos</p>
          
          <div className="flex justify-center">
            <h3 className="text-3xl font-bold mb-10 border shadow rounded-xl bg-gray-300 p-4 inline-block">Productos Más y Menos Vendidos por Mes</h3>
          </div>

          <div className="flex flex-col md:flex md:flex-row mb-10 gap-4 items-center justify-center">
            <h3 className="text-xl font-semibold mb-2">Filtrar por fecha:</h3>
            <FiltroFecha año={año} setAño={setAño} mes={mes} setMes={setMes} />
          </div>
          <div className="flex justify-evenly">
            <div className="grid grid-cols-2 gap-24 bg-blue-300 bg-opacity-50 rounded-md p-6">
                {/* Lista de productos más vendidos */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-center">Top 10 Productos Más Vendidos</h3>
                  <table className="shadow-md rounded-sm">
                    <thead className="bg-gray-200 z-10">
                      <tr>
                        <th className="border p-2">Producto</th>
                        <th className="border p-2">Cantidad Vendida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosMasVendidos.map((producto, index) => (
                        <tr className="text-center border-b bg-neutral-300" key={index}>
                          {/* Columna nombre producto */}
                          <td className="border p-2 align-center">{producto.nombre}</td>
                          {/* Columna cantidad vendida */}
                          <td className="border p-2 align-center">{producto.cantidad_vendida} vendidos</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Lista de productos menos vendidos */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-center">Top 10 Productos Menos Vendidos</h3>
                  <table className="shadow-md rounded-sm">
                    <thead className="bg-gray-200 z-10">
                      <tr>
                        <th className="border p-2">Producto</th>
                        <th className="border p-2">Cantidad Vendida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosMenosVendidos.map((producto, index) => (
                        <tr className="text-center border-b bg-neutral-300" key={index}>
                          {/* Columna nombre producto */}
                          <td className="border p-2 align-center">{producto.nombre}</td>
                          {/* Columna cantidad vendida */}
                          <td className="border p-2 align-center">{producto.cantidad_vendida} vendidos</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          </div>

            {/* Spinner de carga */}
            {isValidating && (
                <div className="flex justify-center items-center h-auto mt-10">
                    <Puff height="150" width="150" color="#ba5dd1" ariaLabel="cargando.." />
                </div>
            )}
          {!isValidating && ventasProductos && (
            <>
            {mensajeNoHayVentas && (
                <div className="flex items-center justify-center py-4 px-8 bg-red-300 border border-red-500 rounded-lg my-5 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>

                    <span className="text-xl text-red-800 font-semibold">{mensajeNoHayVentas}</span>
                </div>
              )}
                  

            {/* Gráfico de productos más vendidos */}
            {productosMasVendidos.length > 0 && (
                <div className="my-10">
                    <h3 className="text-xl font-bold">Gráfico de Productos Más Vendidos</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={productosMasVendidos} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="nombre"
                              angle={0}
                              textAnchor="middle"
                              interval={0}
                              height={60}
                              tick={{ fontSize: 12, wordBreak: 'break-all' }}
                            />
                            <YAxis domain={[0, dataMax => Math.ceil(dataMax * 1.1)]} allowDecimals={false}/>
                            <Tooltip formatter={(value) => formatearDinero(value)} />
                            <Bar dataKey="cantidad_vendida" fill="#4CAF50" barSize={100} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Gráfico de productos menos vendidos */}
            {productosMenosVendidos.length > 0 && (
                <div className="my-10">
                    <h3 className="text-xl font-bold">Gráfico de Productos Menos Vendidos</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={productosMenosVendidos} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <YAxis domain={[0, dataMax => Math.ceil(dataMax * 1.1)]} allowDecimals={false}/>
                            <XAxis
                              dataKey="nombre"
                              angle={0}
                              textAnchor="middle"
                              interval={0}
                              height={60}
                              tick={{ fontSize: 12, wordBreak: 'break-all' }}
                            />
                            <Tooltip formatter={(value) => formatearDinero(value)} />
                            <Bar dataKey="cantidad_vendida" fill="#FF5733" barSize={100} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            </>
          )}
        </div>
  </>
  )
}
