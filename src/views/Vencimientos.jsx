import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import { Puff } from "react-loader-spinner";
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import useQuiosco from '../hooks/useQuiosco';
import Swal from 'sweetalert2';

export default function Vencimientos() {
    const token = localStorage.getItem("AUTH_TOKEN");
    const [filtroYear, setFiltroYear] = useState("");
    const [filtroMonth, setFiltroMonth] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 100;

    const fetcher = (url) =>
        clienteAxios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.data);

    const params = useMemo(() => {
        const p = new URLSearchParams({
            vencimientos: 'true',
            per_page: itemsPorPagina,
            page: paginaActual,
        });

        if (filtroYear && filtroMonth) {
            p.set('mes', `${filtroYear}-${String(filtroMonth).padStart(2, '0')}`);
        } else if (filtroYear) {
            p.set('anio', filtroYear);
        }

        return p.toString();
    }, [filtroYear, filtroMonth, paginaActual]);

    // extraigo mutate para forzar revalidación tras acciones
    const { data, error, isLoading, mutate } = useSWR(`/api/productos?${params}`, fetcher, { refreshInterval: 10000 });

    if (error) return <p className="text-red-500">Error: {error.message}</p>;

    const productos = data?.data || [];
    const meta = data?.meta || {};

    const { handleClickModalEditarProducto, handleSetProducto, handleEliminarProducto, cambiarDisponibilidad } = useQuiosco();

    // cuando cambia filtro reinicio pagina
    useEffect(() => {
        setPaginaActual(1);
    }, [filtroYear, filtroMonth]);

    const irAPagina = (n) => {
        if (!meta.last_page) return;
        if (n < 1 || n > meta.last_page) return;
        setPaginaActual(n);
    };

    // Helpers de UI (colores e iconos)
    const obtenerColorVencimiento = (fecha) => {
        if (!fecha) return "text-gray-800";
        const hoy = new Date();
        const [año, mes] = fecha.split("-").map(Number);
        const diferenciaMeses = (año - hoy.getFullYear()) * 12 + (mes - (hoy.getMonth() + 1));
        if (diferenciaMeses <= 0) return "text-red-600";
        if (diferenciaMeses < 3) return "text-orange-500";
        return "text-green-700";
    };

    const obtenerIcono = (fecha) => {
        if (!fecha) return null;
        const hoy = new Date();
        const [año, mes] = fecha.split("-").map(Number);
        const diferenciaMeses = (año - hoy.getFullYear()) * 12 + (mes - (hoy.getMonth() + 1));
        if (diferenciaMeses <= 0) return <XCircle className="inline w-4 h-4 text-red-600 ml-1" />;
        if (diferenciaMeses < 3) return <AlertTriangle className="inline w-4 h-4 text-orange-500 ml-1" />;
        return <CheckCircle className="inline w-4 h-4 text-green-700 ml-1" />;
    };

    const obtenerVencimientosOrdenados = (producto) => {
        return [...(producto.vencimientos || [])].sort((a, b) => {
            const fechaA = new Date(`${a.fecha_vencimiento}-01`);
            const fechaB = new Date(`${b.fecha_vencimiento}-01`);
            return fechaA - fechaB;
        });
    };

    // acciones: editar, eliminar, toggle disponibilidad
    const onEditarProducto = (producto) => {
        handleSetProducto(producto);
        handleClickModalEditarProducto();
    };

    const onConfirmarEliminar = (producto) => {
        Swal.fire({
            title: "¿Eliminar producto?",
            text: `Estás por eliminar "${producto.nombre}". Esta acción no se puede deshacer.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Si, Eliminar",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // asumimos que handleEliminarProducto devuelve una promesa / realiza la eliminación
                    await handleEliminarProducto(producto.id);
                    // forzamos recarga de SWR para actualizar la lista
                    await mutate();
                    Swal.fire('Eliminado', 'El producto fue eliminado correctamente.', 'success');
                } catch (err) {
                    Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
                }
            }
        });
    };

    const onToggleDisponibilidad = async (producto) => {
        try {
            await cambiarDisponibilidad(producto.id);
            await mutate();
        } catch (err) {
            Swal.fire('Error', 'No se pudo cambiar la disponibilidad.', 'error');
        }
    };

    // Lista estática de meses y años dinámicos (idéntico a antes)
    const meses = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            const num = String(i + 1).padStart(2, '0');
            const nombre = new Date(2000, i).toLocaleString('es-AR', { month: 'long' });
            return { value: num, label: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}` };
        });
    }, []);

    const añosDisponibles = useMemo(() => {
        const añosSet = new Set();
        productos.forEach(p => {
            const vencs = p.vencimientos || [];
            vencs.forEach(v => {
                if (!v?.fecha_vencimiento) return;
                const [añoStr] = v.fecha_vencimiento.split("-");
                const a = Number(añoStr);
                if (!Number.isNaN(a)) añosSet.add(a);
            });
        });
        const currentYear = new Date().getFullYear();
        const rangoMin = currentYear - 3;
        const rangoMax = currentYear + 3;
        for (let y = rangoMin; y <= rangoMax; y++) añosSet.add(y);
        return Array.from(añosSet).sort((a, b) => b - a);
    }, [productos]);

    return (
        <div>
            <h1 className='text-4xl font-black'>Vencimientos</h1>
            <p className='text-2xl my-10'>Visualiza tus próximos vencimientos aquí</p>

            {/* FILTROS */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center md:justify-center">
                <div>
                    <label className="block font-semibold mb-2">Año:</label>
                    <select
                        value={filtroYear}
                        onChange={(e) => { setFiltroYear(e.target.value); setFiltroMonth(""); }}
                        className="border p-2 rounded"
                    >
                        <option value="">Todos</option>
                        {añosDisponibles.map((y) => (
                            <option key={y} value={String(y)}>{y}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-semibold mb-2">Mes:</label>
                    <select
                        value={filtroMonth}
                        onChange={(e) => setFiltroMonth(e.target.value)}
                        className="border p-2 rounded"
                        disabled={!filtroYear}
                    >
                        <option value="">Todos</option>
                        {meses.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-center mb-4">
                <button
                    onClick={() => { setFiltroYear(""); setFiltroMonth(""); }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-400"
                >
                    Limpiar filtros
                </button>
            </div>

            <div className="border shadow-md rounded-md bg-white p-5">
                <h3 className='text-xl font-black text-center mb-4 border p-4 bg-red-400 font-serif rounded-lg'>
                    Productos con vencimientos
                </h3>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Puff height="100" width="100" ariaLabel="cargando.." />
                    </div>
                ) : productos.length > 0 ? (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="sticky top-0 bg-gray-200 z-10">
                                <tr>
                                    <th className="border p-2">Producto</th>
                                    <th className="border p-2">Vencimientos</th>
                                    <th className="border p-2">Cantidad</th>
                                    <th className="border p-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((producto) => {
                                    const vencimientosOrdenados = obtenerVencimientosOrdenados(producto);
                                    const stockTotal = (producto.vencimientos || []).reduce((acc, v) => acc + (v?.cantidad || 0), 0);

                                    return (
                                        <tr key={producto.id} className="text-center border-b">
                                            <td className="border p-2 align-center">{producto.nombre}</td>

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

                                            {/* ACCIONES: Editar y Eliminar */}
                                            <td className="border p-2 align-middle">
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        type="button"
                                                        className="bg-yellow-500 hover:bg-yellow-800 text-white p-1 rounded font-bold text-sm"
                                                        onClick={() => onEditarProducto(producto)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="bg-red-600 hover:bg-red-800 text-white p-1 rounded font-bold text-sm"
                                                        onClick={() => onConfirmarEliminar(producto)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* CONTROLES DE PAGINACIÓN */}
                        <div className="mt-4 mb-4 flex justify-evenly">
                            <button
                                disabled={!meta.current_page || meta.current_page <= 1}
                                onClick={() => irAPagina(meta.current_page - 1)}
                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Anterior
                            </button>

                            <span>
                                Página {meta.current_page ?? 1} {meta.last_page ? `de ${meta.last_page}` : ""}
                            </span>

                            <button
                                disabled={!meta.last_page || meta.current_page >= meta.last_page}
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
