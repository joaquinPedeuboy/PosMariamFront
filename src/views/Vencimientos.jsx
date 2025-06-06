import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import { Puff } from "react-loader-spinner";
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function Vencimientos() {
    const token = localStorage.getItem("AUTH_TOKEN");
    const [filtroMes, setFiltroMes] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 100;

    const fetcher = (url) => clienteAxios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    }).then((res) => res.data);

    const params = new URLSearchParams({
        vencimientos: 'true',
        per_page: itemsPorPagina,
        page: paginaActual,
        ...(filtroMes && { mes: filtroMes })
    }).toString();

    const { data, error, isLoading } = useSWR(
        `/api/productos?${params}`, 
        fetcher,
        { refreshInterval: 10000 });

    if (error) return <p className="text-red-500">Error: {error.message}</p>;

    const productos = data?.data || [];
    const meta = data?.meta  || {};

    useEffect(() => {
    setPaginaActual(1);
    }, [filtroMes]);

    const irAPagina = n => {
        if (n < 1 || n > meta.last_page) return;
        setPaginaActual(n);
    };


    /** Retorna la clase de texto según la cercanía del vencimiento */
    const obtenerColorVencimiento = (fecha) => {
        if (!fecha) return "text-gray-800";
        const hoy = new Date();
        const [año, mes] = fecha.split("-").map(Number);
        const diferenciaMeses = (año - hoy.getFullYear()) * 12 + (mes - (hoy.getMonth() + 1));

        if (diferenciaMeses <= 0) return "text-red-600";
        if (diferenciaMeses < 3) return "text-orange-500";
        return "text-green-700";
    };

    /** Retorna el ícono según la cercanía del vencimiento */
    const obtenerIcono = (fecha) => {
        if (!fecha) return null;
        const hoy = new Date();
        const [año, mes] = fecha.split("-").map(Number);
        const diferenciaMeses = (año - hoy.getFullYear()) * 12 + (mes - (hoy.getMonth() + 1));

        if (diferenciaMeses <= 0) return <XCircle className="inline w-4 h-4 text-red-600 ml-1" />;
        if (diferenciaMeses < 3) return <AlertTriangle className="inline w-4 h-4 text-orange-500 ml-1" />;
        return <CheckCircle className="inline w-4 h-4 text-green-700 ml-1" />;
    };

    /** Devuelve el vencimiento más cercano (se sigue usando para ordenar y filtrar) */
    const obtenerVencimientoMasCercano = (vencimientos) => {
        if (!vencimientos.length) return null;
        return [...vencimientos].sort((a, b) => {
            const fechaA = new Date(`${a.fecha_vencimiento}-01`);
            const fechaB = new Date(`${b.fecha_vencimiento}-01`);
            return fechaA - fechaB;
        })[0];
    };

    // /** Ordena y filtra los productos según el mes seleccionado */
    // const productosFiltrados = useMemo(() => {
    //     let ordenados = [...productos].sort((a, b) => {
    //         const vencA = obtenerVencimientoMasCercano(a.vencimientos);
    //         const vencB = obtenerVencimientoMasCercano(b.vencimientos);
    //         const fechaA = vencA ? new Date(`${vencA.fecha_vencimiento}-01`) : null;
    //         const fechaB = vencB ? new Date(`${vencB.fecha_vencimiento}-01`) : null;
    //         if (!fechaA && !fechaB) return 0;
    //         if (!fechaA) return 1;
    //         if (!fechaB) return -1;
    //         return fechaA - fechaB;
    //     });

    //     if (filtroMes) {
    //         ordenados = ordenados.filter((p) => {
    //             const venc = obtenerVencimientoMasCercano(p.vencimientos);
    //             return venc?.fecha_vencimiento === filtroMes;
    //         });
    //     }

    //     return ordenados;
    // }, [productos, filtroMes]);

    /** Genera las opciones de meses que aparecen en el <select> */
    const obtenerOpcionesMeses = () => {
        const fechas = new Set();
        productos.forEach(p => {
            const venc = obtenerVencimientoMasCercano(p.vencimientos);
            if (venc?.fecha_vencimiento) fechas.add(venc.fecha_vencimiento);
        });
        return Array.from(fechas).sort();
    };

    return (
        <div>
            <h1 className='text-4xl font-black'>Vencimientos</h1>
            <p className='text-2xl my-10'>Visualiza tus próximos vencimientos aquí</p>

            {/* FILTRO POR MES */}
            <div className="mb-4">
                <label className="block font-semibold mb-2">Filtrar por mes:</label>
                <select
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Todos</option>
                    {obtenerOpcionesMeses().map((mes) => (
                        <option key={mes} value={mes}>{mes}</option>
                    ))}
                </select>
            </div>

            <div className="border shadow-md rounded-md bg-white p-5">
                <h3 className='text-xl font-black text-center mb-4 border p-4 bg-red-400 font-serif rounded-lg'>
                    Productos con vencimientos
                </h3>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Puff height="100" width="100" color="#ba5dd1" ariaLabel="cargando.." />
                    </div>
                ) : productos.length > 0 ? (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="sticky top-0 bg-gray-200 z-10">
                                <tr>
                                    <th className="border p-2">Producto</th>
                                    <th className="border p-2">Vencimientos</th>
                                    <th className="border p-2">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((producto) => {
                                    // Ordenamos los vencimientos para mostrarlos de menor a mayor
                                    const vencimientosOrdenados = [...producto.vencimientos].sort((a, b) => {
                                        const fechaA = new Date(`${a.fecha_vencimiento}-01`);
                                        const fechaB = new Date(`${b.fecha_vencimiento}-01`);
                                        return fechaA - fechaB;
                                    });

                                    // Sumamos todas las cantidades
                                    // const totalGeneral = vencimientosOrdenados.reduce((acc, v) => acc + v.cantidad, 0);

                                    return (
                                        <tr key={producto.id} className="text-center border-b">
                                            {/* COLUMNA PRODUCTO */}
                                            <td className="border p-2 align-center">{producto.nombre}</td>

                                            {/* COLUMNA VENCIMIENTOS: un <span> por cada fecha, con color e ícono */}
                                            <td className="border p-2 align-top">
                                                {vencimientosOrdenados.length > 0 ? (
                                                    vencimientosOrdenados.map((v) => (
                                                        <span
                                                            key={`${producto.id}-${v.fecha_vencimiento}`}
                                                            className={`block ${obtenerColorVencimiento(v.fecha_vencimiento)}`}
                                                        >
                                                            {v.fecha_vencimiento} {obtenerIcono(v.fecha_vencimiento)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-600">Sin vencimientos</span>
                                                )}
                                            </td>

                                            {/* COLUMNA CANTIDAD: la cantidad de cada vencimiento */}
                                            <td className="border p-2 align-top">
                                                {vencimientosOrdenados.length > 0 ? (
                                                    vencimientosOrdenados.map((v) => (
                                                        <span
                                                            key={`cantidad-${producto.id}-${v.fecha_vencimiento}`}
                                                            className={`block ${v.cantidad > 0 ? "" : "text-gray-600"}`}
                                                        >
                                                            {v.cantidad > 0 ? v.cantidad : "Sin stock"}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
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
                    <p className="text-center text-gray-600">No hay productos para mostrar.</p>
                )}
            </div>
        </div>
    );
}
