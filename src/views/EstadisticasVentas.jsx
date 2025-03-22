import useSWR from "swr";
import { useState, useEffect } from "react";
import { BarChart, Bar,Rectangle, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ResponsiveContainer } from "recharts";
import clienteAxios from "../config/axios";
import { formatearDinero } from "../helpers";
import { BiErrorAlt } from "react-icons/bi";
import { TailSpin } from "react-loader-spinner";

export default function EstadisticasVentas() {
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [fechaInicioMensual, setFechaInicioMensual] = useState("");
    const [fechaFinMensual, setFechaFinMensual] = useState("");
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [errorFecha, setErrorFecha] = useState("");
    const token = localStorage.getItem("AUTH_TOKEN");
    
    const fetcher = async (url) => await clienteAxios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
    }).then((res) => res.data);

    // Obtener ventas de los últimos 5 días o del rango seleccionado
    const { data: ventasDiarias, error: errorDiario, isValidating: cargandoDiario } =
        useSWR(
            fechaInicio && fechaFin
                ? `/api/ventas/totales-diarios?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
                : "/api/ventas/totales-diarios",
            fetcher, {
        revalidateOnFocus: false});

    // Obtener ventas mensuales, por defecto para el año actual
    const { data: ventasMensuales, error: errorMensual, isValidating: cargandoMensual } =
        useSWR(
            fechaInicioMensual && fechaFinMensual
                ? `/api/ventas/totales-mensuales?fecha_inicio=${fechaInicioMensual}&fecha_fin=${fechaFinMensual}`
                : `/api/ventas/totales-mensuales?anio=${anio}`,
            fetcher, {
            revalidateOnFocus: false});

    // Validación de fechas
    useEffect(() => {
        const validarFechas = () => {
            if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
                setErrorFecha("La fecha de inicio no puede ser posterior a la fecha de fin");
                return false;
            }
            if (fechaInicioMensual && fechaFinMensual && new Date(fechaInicioMensual) > new Date(fechaFinMensual)) {
                setErrorFecha("La fecha de inicio no puede ser posterior a la fecha de fin");
                return false;
            }
            setErrorFecha(""); // Limpiar error si las fechas son válidas
            return true;
        };

        validarFechas();
    }, [fechaInicio, fechaFin, fechaInicioMensual, fechaFinMensual]);

    // Si hay un error en las fechas, no renderizar los datos
    if (errorFecha) {
        return <div className="flex justify-center w-full gap-4 items-center text-4xl mt-10 text-red-800"><BiErrorAlt /> {errorFecha}</div>;
    }

    if (errorDiario || errorMensual) return <div>Error cargando datos</div>;

    // const noHayDatosMensuales = Array.isArray(ventasMensuales) && ventasMensuales.length === 0;
    const mensajeMensual = ventasMensuales?.message || '';

    const noHayDatosDiarios = Array.isArray(ventasDiarias) && ventasDiarias.length === 0;

    const mensajeDiario = ventasDiarias?.message || '';

    return (
        <div>
            <h1 className="text-4xl font-black">Estadísticas de Ventas</h1>
            <p className="text-2xl my-10">Revisa las ventas diarias y mensuales</p>

            <div className="mb-5">
                <div className="border shadow p-4 w-auto md:w-1/3 bg-gray-300">
                    <h2 className="font-bold text-xl mb-2">Ventas por dia</h2>

                    <div className="flex gap-4 mb-5 items-center">
                        <label>Desde:</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="border p-2"
                        />

                        <label>Hasta:</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="border p-2"
                        />
                    </div>

                </div>
                
                {/* Spinner de carga */}
                {cargandoDiario && (
                    <div className="flex justify-center items-center h-auto">
                        <TailSpin height="100" width="100" color="#ba5dd1" ariaLabel="cargando.." />
                    </div>
                )}

                {!cargandoDiario && ventasDiarias && (
                    <>
                        {mensajeDiario ? ( // Si el mensaje de error existe, mostrarlo
                            <div className="flex items-center justify-center py-4 px-8 bg-red-300 border border-red-500 rounded-lg my-5 gap-2">
                                <BiErrorAlt className="text-3xl text-red-800" />
                                <span className="text-xl text-red-800 font-semibold">{mensajeDiario}</span>
                            </div>
                        ) : noHayDatosDiarios ? (
                            <div className="flex items-center justify-center py-4 px-8 bg-red-300 border border-red-500 rounded-lg my-5 gap-2">
                                <BiErrorAlt className="text-3xl text-red-800" />
                                <span className="text-xl text-red-800 font-semibold">No hay datos de ventas diarias para este rango de fechas</span>
                            </div>
                        ) : (
                            ventasDiarias.length > 0 && (
                                <>
                                    <h2 className="text-xl font-bold mt-5">Ventas por Día</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={ventasDiarias} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="dia" tickFormatter={(tick, index) => `${ventasDiarias[index]?.dia} (${ventasDiarias[index]?.fecha.substring(5)})`} />
                                            <YAxis />
                                            <Tooltip formatter={(value) => formatearDinero(value)} />
                                            <Bar dataKey="total_vendido" fill="#82ca9d" activeBar={<Rectangle fill="#0b5345" stroke="#239b56" />} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </>
                            )
                        )}
                    </>
                )}
            </div>

            <div className="mt-32 mb-20">
                <div className="border shadow bg-gray-300 p-4 w-auto md:w-1/2 mb-5">
                    <h2 className="text-xl font-bold mb-4">Ventas por Mes</h2>

                    <div className="flex gap-4 mb-5 items-center">
                        <label>Desde:</label>
                        <input
                            type="month"
                            value={fechaInicioMensual}
                            onChange={(e) => setFechaInicioMensual(e.target.value)}
                            className="border p-2"
                        />
                        <label>Hasta:</label>
                        <input
                            type="month"
                            value={fechaFinMensual}
                            onChange={(e) => setFechaFinMensual(e.target.value)}
                            className="border p-2"
                        />
                    </div>
                </div>

                {/* Spinner de carga */}
                {cargandoMensual && (
                    <div className="flex justify-center items-center h-auto">
                        <TailSpin height="100" width="100" color="#ba5dd1" ariaLabel="cargando.." />
                    </div>
                )}

                {!cargandoMensual && ventasMensuales && (
                    <>
                        {/* Mostrar mensaje de no hay datos si el mensaje está presente */}
                        {mensajeMensual && (
                            <div className="flex items-center justify-center py-4 px-8 bg-red-300 border border-red-500 rounded-lg my-5 gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>

                                <span className="text-xl text-red-800 font-semibold">{mensajeMensual}</span>
                            </div>
                        )}

                        {/* Si no hay datos, mostrar el gráfico */}
                        {ventasMensuales && ventasMensuales.length > 0 && (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={ventasMensuales}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatearDinero(value)} />
                                    <Bar dataKey="total_vendido" fill="#f39c12" activeBar={<Rectangle fill="#9c640c" stroke="#d68910" />} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </>
                )}
            </div>
        </div>
    );

}
