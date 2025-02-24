import useQuiosco from "../hooks/useQuiosco"
import { formatearDinero } from "../helpers";
import PosResumenProducto from "./PosResumenProducto";

export default function PosResumen() {

const { pedido, total, handleSubmitNuevaVenta } = useQuiosco();
    
const handleSubmit = e => {
    e.preventDefault();

    handleSubmitNuevaVenta();
}

//Comprobar si el pedido tiene algo
const comprobarPedido = () => pedido.length === 0;

    return (
    <>
        <h1 className="text-4xl font-black">
        Mi Venta
        </h1>
        <p className="text-lg my-5">
        Aqui podras ver el resumen y totales de tu venta
        </p>
        <div className="py-10">
        {pedido.length === 0 ? (
            <p className="text-center text-2xl">
            No hay elementos en tu venta aun
            </p>
        ) : (
            pedido.map(producto => (
            <PosResumenProducto
                key={producto.id}
                producto={producto}
            />
            ))
        )}
        </div>
        <p className="text-xl mt-6">
        Total a vender: {''}
        {formatearDinero(total)}
        </p>

        <form 
        className="w-full"
        onSubmit={handleSubmit}
        
        >
        <div className="mt-5 flex justify-center">
            <input 
            type="submit"
            className={`${comprobarPedido() ? 'bg-indigo-100' : 'bg-indigo-600 hover:bg-indigo-800'} px-5 py-2 rounded uppercase font-bold text-white text-center w-2/4 cursor-pointer`}
            value="Confirmar Venta"
            disabled={comprobarPedido()}
            />
        </div>
        </form>
    </>

    )
}
