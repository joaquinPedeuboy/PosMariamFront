import useQuiosco from "../hooks/useQuiosco"
import { formatearDinero } from "../helpers"
import { useState } from "react";
import { useEffect } from "react";

export default function PosResumenProducto({producto}) {

const { handleEliminarProductoPedido, handleEditarCantidadPOS } = useQuiosco();
const [cantidadActual, setCantidadActual] = useState(producto.vencimientos?.[0]?.cantidad || 0);

const { nombre,precio, id } = producto;

// Sincronizar cantidadActual con el estado global
useEffect(() => {
    setCantidadActual(producto.vencimientos?.[0]?.cantidad || 0); // Actualiza la cantidad local si el estado global cambia
}, [producto.vencimientos?.[0]?.cantidad || 0]);

// Función para incrementar cantidad
const incrementarCantidad = () => {
    const nuevaCantidad = cantidadActual + 1;
    setCantidadActual(nuevaCantidad);
    handleEditarCantidadPOS(id, nuevaCantidad); // Actualizar estado global
};

// Función para reducir cantidad
const reducirCantidad = () => {
    if (cantidadActual <= 1) return; // Límite inferior
    const nuevaCantidad = cantidadActual - 1;
    setCantidadActual(nuevaCantidad);
    handleEditarCantidadPOS(id, nuevaCantidad); // Actualizar estado global
};

return (
    <div className="flex justify-between shadow space-y-1 p-4 bg-white">
        <div className="space-y-2">
        <p className="text-xl font-bold">{nombre}</p>
        
        <div className="flex gap-4 mt-5">
            <button 
                type="button"
                onClick={reducirCantidad}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </button>
            <p className="text-3xl">{cantidadActual}</p>
            <button 
                type="button"
                onClick={incrementarCantidad}
                
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </button>

        </div>
        <p className="text-lg font-bold text-amber-500">
            Precio:{formatearDinero(precio)}
        </p>
        <p className="text-lg text-gray-700">
            Subtotal: {formatearDinero(precio * cantidadActual)}
        </p>
        </div>

        <div className="m-5">
        <button
            type="button"
            className="bg-red-700 p-2 text-white rounded-md font-bold uppercase shadow-md text-center"
            onClick={()=> handleEliminarProductoPedido(id)}
        >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
            </svg>
        </button>
        </div>
    </div>

    )
}
