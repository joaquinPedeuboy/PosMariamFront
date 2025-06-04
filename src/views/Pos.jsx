import useQuiosco from "../hooks/useQuiosco"
import clienteAxios from "../config/axios";
import { useState } from "react";
import PosResumen from "../components/PosResumen";
import ConfirmarModal from "../components/ConfirmarModal";
import { toast } from "react-toastify";

export default function Pos() {
    const [term, setTerm] = useState("");
    const token = localStorage.getItem('AUTH_TOKEN');
    
    const { handleAgregarProductoPedidoPOS, productoEnOferta, setProductoEnOferta,
      setModalOferta } = useQuiosco();

    const handleKeyDown = async (e) => {
      if (e.key !== "Enter") return; 

      const barcode = term.trim();
      const esCodigo = /^\d{6,13}$/.test(barcode);

      if (!esCodigo) {
        toast.error("El código de barras no tiene un formato válido.");
        return;
      }

      try {
        const {data: productoDetallado } = await clienteAxios.get(
          `/api/pos/productos/${barcode}`,
          { headers: {Authorization: `Bearer ${token}` } }
        );
        handleAgregarProductoPedidoPOS(productoDetallado);
        setTerm('');
      } catch (error) {
        toast.error(
          error.response?.data?.mensaje || "Producto no encontrado"
        );
      }
    };

    const handleConfirmarOferta = (usarOferta) => {
        setModalOferta(false);
        if (productoEnOferta) {
            handleAgregarProductoPedidoPOS(productoEnOferta, usarOferta);
            setProductoEnOferta(null);
        }
    };

  return (
    <>
      <ConfirmarModal
        producto={productoEnOferta}
        onConfirm={handleConfirmarOferta}
        onClose={() => setModalOferta(false)}
      />
      <div className="lg:grid lg:grid-flow-col md:gap-5 flex flex-col">
        <div className="border rounded-lg shadow p-4">
            
          <div className="p-8 shadow border bg-gray-300 rounded-lg">
            <p className="text-bold text-lg text-center font-black">Buscar Productos por nombre o codigo de barras</p>
            {/* Barra de búsqueda */}
            <div className="my-5 flex justify-center">
              <input
                type="text"
                value={term}
                placeholder="Buscar productos..."
                className="w-2/4 p-2 border rounded"
                onChange={e => setTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </div>
        </div>

        <aside className="w-full h-screen overflow-y-scroll p-5 rounded border">
          <PosResumen />
        </aside>

      </div>
    </>
    
  )
}
