import { formatearDinero } from "../helpers"
import useQuiosco from '../hooks/useQuiosco';

export default function Productos({producto, mutate}) {
  
  const { handleClickModalEditarProducto, handleSetProducto, handleEliminarProducto, cambiarDisponibilidad } = useQuiosco();

  const {id, nombre, precio, vencimientos, disponible} = producto

  const handleToggleDisponibilidad = async () => {
    await cambiarDisponibilidad(id); 
    mutate();
  };

  return (
    <div className="flex justify-between border p-2 shadow bg-white gap-4">
      <ul className="w-full">
        <p className="font-bold text-white p-2 border bg-violet-600 text-center rounded-md">Producto</p>
        <li className="flex flex-col">
        <h3 className="text-xl font-bold text-left mt-1">{nombre}</h3>
        </li>
      </ul>

      <ul className="w-full">
        <p className="font-bold text-white p-2 border bg-violet-600 text-center rounded-md">Stock</p>
        <li className="flex flex-col">
          <h3 className="text-xl font-bold text-center mt-1">
            {vencimientos.length > 0 
              ? vencimientos.reduce((total, v) => total + v.cantidad, 0) 
              : "Sin stock"}
          </h3>
        </li>
      </ul>

      <ul className="w-full">
        <p className="font-bold text-white p-2 border bg-violet-600 text-center rounded-md">Precio</p>
        <li className="flex flex-col">
        <h3 className="text-xl font-bold text-center mt-1">{formatearDinero(precio)}</h3>
        </li>
      </ul>

      <ul className="w-full">
        <p className="font-bold text-white p-2 border bg-violet-600 text-center rounded-md">Fecha Vencimiento</p>
        <li className="flex flex-col">
        <h3 className="text-xl font-bold text-center mt-1">
          {vencimientos.length > 0
            ? vencimientos
                .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))[0]
                .fecha_vencimiento
            : "Sin vencimientos"}
        </h3>
        </li>
      </ul>

      <ul className="w-full">
        <p className="font-bold text-white p-2 border bg-violet-600 text-center rounded-md">Acciones</p>
        <li className="flex gap-4">
          <button 
            type="button"
            className="bg-yellow-500 hover:bg-yellow-800 text-white w-full mt-1 p-1 uppercase font-bold"
            onClick={()=> {
              handleClickModalEditarProducto();
              handleSetProducto(producto);
            }}
          >Editar</button>
          <button 
            type="button"
            className="bg-red-600 hover:bg-red-800 text-white w-full mt-1 p-1 uppercase font-bold"
            onClick={()=> handleEliminarProducto(id)}
          >Eliminar</button>
        </li>
      </ul>
      <ul className="w-1/2">
        <p className="font-bold text-white p-2 border bg-violet-600 text-center rounded-md">En Muestrario</p>
        <li className="flex">
          <button
            onClick={handleToggleDisponibilidad}
            className={`text-white w-full mt-1 p-1 uppercase font-bold ${disponible ? "bg-green-500 hover:bg-green-800" : "bg-red-600 hover:bg-red-800"}`}
          >
            {disponible ? "Disponible" : "No Disponible"}
          </button>
        </li>
        </ul>
    </div>
  )
}
