import useQuiosco from "../hooks/useQuiosco"
import useSWR from "swr";
import clienteAxios from "../config/axios";
import { useState } from "react";
import { useEffect } from "react";
import PosResumen from "../components/PosResumen";
import { Puff } from "react-loader-spinner";
import ConfirmarModal from "../components/ConfirmarModal";

export default function Pos() {
    const [terminoBusqueda, setTerminoBusqueda] = useState("");
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    
    const { handleAgregarProductoPedidoPOS, productoEnOferta, setProductoEnOferta, modalOferta,
      setModalOferta } = useQuiosco();

    const token = localStorage.getItem('AUTH_TOKEN');

    // Consulta SWR
    const fetcher = ()=> clienteAxios('/api/productos?all=true', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((data) => data.data)
    
    const {data, error, isLoading} = useSWR('/api/productos', fetcher)

    useEffect(() => {
        if (data?.data) {
          // Actualiza los productos filtrados cuando no hay búsqueda activa
          setProductosFiltrados(data.data);
        }
      }, [data]);

    // Actualizar productos filtrados al cambiar el término de búsqueda
    const handleBusqueda = (e) => {
      const termino = e.target.value.toLowerCase();
      setTerminoBusqueda(termino);

      if (termino) {
        const resultado = data.data.filter((producto) =>
          producto.nombre.toLowerCase().includes(termino) ||
          (producto.codigo_barras &&
            producto.codigo_barras.toLowerCase().includes(termino))
        );
        setProductosFiltrados(resultado);
      } else {
        setProductosFiltrados(data.data); // Si no hay término, muestra todos
      }
    };

    // Detectar "Enter" para agregar producto directamente
    const handleKeyPress = async (e) => {
      if (e.key === "Enter") {
        const codigoIngresado = e.target.value.trim();
        
        try {
          const { data } = await clienteAxios.get(`/api/productos/buscar/${codigoIngresado}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (data) {
            handleAgregarProductoPedidoPOS(data);
            setTerminoBusqueda("");
          } else {
            alert("Producto no encontrado.");
          }
        } catch (error) {
          console.error("Error al buscar producto:", error);
          alert("Error al buscar el producto por código de barras.");
        }
      }
    };
    
    // const handleKeyPress = (e) => {
    //   if (e.key === "Enter") {
    //       const codigoIngresado = e.target.value.trim().toLowerCase(); // Tomar el valor actual del input

    //       const productoEncontrado = data.data.find(
    //           (producto) =>
    //               producto.codigo_barras &&
    //               producto.codigo_barras.toLowerCase() === codigoIngresado
    //       );
  
    //       if (productoEncontrado) {
    //           handleAgregarProductoPedidoPOS(productoEncontrado);
    //           setProductosFiltrados(data.data); // Restablecer los productos filtrados
    //           setTimeout(() => {
    //             setTerminoBusqueda("");
    //           }, 1000);
    //       } else {
    //           alert("Producto no encontrado.");
    //       }
    //   }
    // };
  

    const handleConfirmarOferta = (usarOferta) => {
        setModalOferta(false);
        if (productoEnOferta) {
            handleAgregarProductoPedidoPOS(productoEnOferta, usarOferta);
            setProductoEnOferta(null);
        }
    };
    

    if (error) return <p className="text-red-500">Error: {error.message}</p>;

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
                placeholder="Buscar productos..."
                className="w-2/4 p-2 border rounded"
                value={terminoBusqueda}
                onChange={handleBusqueda}
                onKeyDown={handleKeyPress}
                autoFocus
              />
            </div>

            {/* Spinner de carga */}
            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <Puff height="100" width="100" color="#ba5dd1" ariaLabel="cargando.." />
                </div>
            )}

            {!isLoading && data && (
              <>
                {/* Resultados de búsqueda */}
                {terminoBusqueda && (
                  <div className="bg-white shadow rounded p-4">
                    <h2 className="text-2xl font-bold mb-4">Resultados de búsqueda</h2>
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map((producto) => (
                        <div
                          key={producto.id}
                          className="flex justify-between items-center p-2 border-b"
                        >
                          <p className="font-bold">{producto.nombre}</p>
                          <button
                            className="bg-green-500 text-white px-4 py-2 rounded"
                            onClick={() => handleAgregarProductoPedidoPOS(producto)}
                          >
                            Agregar
                          </button>
                        </div>
                      ))
                    ) : (
                      <p>No se encontraron productos con ese nombre o codigo de barras.</p>
                    )}
                  </div>
                )}
              </>
            )}
            </div>
        </div>

        <aside className="w-full h-screen overflow-y-scroll p-5 rounded border">
          <PosResumen 
          />
        </aside>
      </div>
    </>
    
  )
}
