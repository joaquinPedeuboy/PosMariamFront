import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import { Puff } from "react-loader-spinner";
import useQuiosco from '../hooks/useQuiosco';
import Swal from 'sweetalert2';

export default function StockProductos() {
    const token = localStorage.getItem("AUTH_TOKEN");
    const [paginaActual, setPaginaActual] = useState(1);
    const [inputBusqueda, setInputBusqueda] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [departamentoFiltrado, setDepartamentoFiltrado] = useState(""); // opcional
    const [sort, setSort] = useState("stock_asc"); // stock_asc | stock_desc | nombre | departamento
    const itemsPorPagina = 50;

    const fetcher = (url) =>
        clienteAxios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.data);

    // Construyo params para el endpoint /api/productos/stock
    const params = useMemo(() => {
        const p = new URLSearchParams({
            per_page: itemsPorPagina,
            page: paginaActual,
            sort,
            ...(busqueda && { busqueda }),
            ...(departamentoFiltrado && { departamento: departamentoFiltrado })
        });
        return p.toString();
    }, [paginaActual, itemsPorPagina, sort, busqueda, departamentoFiltrado]);

    // SWR: uso el endpoint nuevo que implementaste en el backend
    const { data, error, isLoading, mutate } = useSWR(`/api/productos/stock?${params}`, fetcher, { refreshInterval: 10000 });

    // Para poblar select de departamentos (opcional)
    const { data: depsData } = useSWR("/api/departamentos/all", fetcher);

    const departamentos = Array.isArray(depsData)
    ? depsData
    : Array.isArray(depsData?.data)
        ? depsData.data
        : Array.isArray(depsData?.departamentos)
        ? depsData.departamentos
        : [];


    const productos = data?.data || [];
    const meta = data?.meta ?? {
    current_page: data?.current_page,
    last_page: data?.last_page,
    per_page: data?.per_page,
    total: data?.total
    };

    const { handleClickModalEditarProducto, handleSetProducto, handleEliminarProducto } = useQuiosco();

    // búsqueda
    const handleBuscar = () => {
        setPaginaActual(1);
        setBusqueda(inputBusqueda.trim());
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleBuscar();
        }
    };

    // paginación
    const irAPagina = (n) => {
        const last = meta?.last_page ?? 1;
        if (n >= 1 && n <= last) setPaginaActual(n);
    };

    // color / alerta por stock
    const obtenerColorStock = (stock) => {
        if (stock <= 0) return "text-red-600 font-bold";
        if (stock < 4) return "text-orange-500 font-semibold";
        return "text-green-700";
    };

    // acciones CRUD
    const onEditarProducto = (producto) => {
        handleSetProducto(producto);
        handleClickModalEditarProducto();
    };

    const onConfirmarEliminar = (producto) => {
        Swal.fire({
            title: "¿Eliminar producto?",
            text: `Estás por eliminar "${producto.nombre}".`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Si, eliminar",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await handleEliminarProducto(producto.id);
                    await mutate(); // recargo la lista
                    Swal.fire("Eliminado", "El producto fue eliminado.", "success");
                } catch {
                    Swal.fire("Error", "No se pudo eliminar el producto.", "error");
                }
            }
        });
    };

    if (error) return <p className="text-red-500">Error: {error.message}</p>;

    return (
        <div>
            <h1 className='text-4xl font-black m-4'>Stock</h1>
            <p className='text-2xl m-4'>Visualiza el stock actual de productos</p>

            {/* Controles: búsqueda / departamento / orden */}
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                <input
                    type="text"
                    placeholder="Buscar productos o escanear código..."
                    value={inputBusqueda}
                    onChange={(e) => setInputBusqueda(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-2/3 md:w-1/3 p-2 border rounded"
                />
                <button onClick={handleBuscar} className="px-4 py-2 bg-blue-500 text-white rounded">Buscar</button>

                <select value={departamentoFiltrado} onChange={(e) => setDepartamentoFiltrado(e.target.value)} className="border p-2 rounded">
                    <option value="">Todos los departamentos</option>
                    {departamentos.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                </select>

                <select value={sort} onChange={(e) => setSort(e.target.value)} className="border p-2 rounded">
                    <option value="stock_asc">Stock: menor → mayor</option>
                    <option value="stock_desc">Stock: mayor → menor</option>
                    <option value="nombre">Nombre</option>
                    <option value="departamento">Departamento</option>
                </select>
            </div>

            <div className="border shadow-md rounded-md bg-white p-5">
                <h3 className='text-xl font-black text-center mb-4 border p-4 bg-red-400 font-serif rounded-lg'>
                    Productos (stock)
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
                                    <th className="border p-2">Departamento</th>
                                    <th className="border p-2">Stock total</th>
                                    <th className="border p-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map(producto => {
                                    // usamos stock_total que devuelve el backend; si no existe, fallback a sumatorio
                                    const stockTotal = producto.stock_total ?? ((producto.vencimientos || []).reduce((acc, v) => acc + (v?.cantidad || 0), 0));
                                    return (
                                        <tr key={producto.id} className="text-center border-b">
                                            <td className="border p-2 text-left">{producto.nombre}</td>
                                            <td className="border p-2">{producto.departamento || '—'}</td>
                                            <td className={`border p-2 ${obtenerColorStock(stockTotal)}`}>{stockTotal}</td>
                                            <td className="border p-2">
                                                <div className="flex gap-2 justify-center">
                                                    <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => onEditarProducto(producto)}>Editar</button>
                                                    <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => onConfirmarEliminar(producto)}>Eliminar</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* paginación */}
                        <div className="mt-4 flex justify-between items-center">
                            <button onClick={() => irAPagina((meta?.current_page ?? 1) - 1)} disabled={!meta?.current_page || (meta?.current_page ?? 1) <= 1} className="px-4 py-2 bg-gray-200 rounded">Anterior</button>
                            <div>Página {meta?.current_page ?? 1} de {meta?.last_page ?? 1}</div>
                            <button onClick={() => irAPagina((meta?.current_page ?? 1) + 1)} disabled={!meta?.last_page || (meta?.current_page ?? 1) >= (meta?.last_page ?? 1)} className="px-4 py-2 bg-gray-200 rounded">Siguiente</button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">No hay productos para mostrar.</p>
                )}
            </div>
        </div>
    );
}
