import useQuiosco from "../hooks/useQuiosco"
import useSWR from "swr";
import clienteAxios from "../config/axios";
import { useState } from "react";
import { useEffect } from "react";
import PosResumen from "../components/PosResumen";
import { Puff } from "react-loader-spinner";
import ConfirmarModal from "../components/ConfirmarModal";
import { useDebounce } from 'use-debounce';

export default function Pos() {
    // const [terminoBusqueda, setTerminoBusqueda] = useState("");
    // const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [term, setTerm] = useState("");
    const [debouncedTerm] = useDebounce(term, 300);
    const fetcher = url => clienteAxios.get(url, {
        headers:{ Authorization:`Bearer ${token}` }
    }).then(r => r.data);
    
    const { handleAgregarProductoPedidoPOS, productoEnOferta, setProductoEnOferta, modalOferta,
      setModalOferta } = useQuiosco();

    const token = localStorage.getItem('AUTH_TOKEN');

      const { data: productos, error, isLoading } = useSWR(
    debouncedTerm
      ? `/api/pos/productos?busqueda=${encodeURIComponent(debouncedTerm)}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,   // no refetch al volver al foco
      dedupingInterval: 30_000    // 30s antes de volver a fetch si es misma key
    }
  );

    const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && productos?.length) {
      handleAgregarProductoPedidoPOS(productos[0]);
      setTerm('');
    }
  };

    // Consulta SWR
    // const fetcher = ()=> clienteAxios('/api/productos?all=true', {
    //   headers: {
    //     Authorization: `Bearer ${token}`
    //   }
    // }).then((data) => data.data)
    
    // const {data, error, isLoading} = useSWR('/api/productos', fetcher)

    // useEffect(() => {
    //     if (data?.data) {
    //       // Actualiza los productos filtrados cuando no hay búsqueda activa
    //       setProductosFiltrados(data.data);
    //     }
    //   }, [data]);

    // Actualizar productos filtrados al cambiar el término de búsqueda
    // const handleBusqueda = (e) => {
    //   const termino = e.target.value.toLowerCase();
    //   setTerminoBusqueda(termino);

    //   if (termino) {
    //     const resultado = data.data.filter((producto) =>
    //       producto.nombre.toLowerCase().includes(termino) ||
    //       (producto.codigo_barras &&
    //         producto.codigo_barras.toLowerCase().includes(termino))
    //     );
    //     setProductosFiltrados(resultado);
    //   } else {
    //     setProductosFiltrados(data.data); // Si no hay término, muestra todos
    //   }
    // };

    // Detectar "Enter" para agregar producto directamente
    // const handleKeyPress = async (e) => {
    //   if (e.key === "Enter") {
    //     const codigoIngresado = e.target.value.trim();
        
    //     try {
    //       const { data } = await clienteAxios.get(`/api/productos/buscar/${codigoIngresado}`, {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       });
    
    //       if (data) {
    //         handleAgregarProductoPedidoPOS(data);
    //         setTerminoBusqueda("");
    //       } else {
    //         alert("Producto no encontrado.");
    //       }
    //     } catch (error) {
    //       console.error("Error al buscar producto:", error);
    //       alert("Error al buscar el producto por código de barras.");
    //     }
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
                value={term}
                placeholder="Buscar productos..."
                className="w-2/4 p-2 border rounded"
                onChange={e => setTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                // onChange={handleKeyPress}
                // onKeyDown={handleKeyPress}
                autoFocus
              />
            </div>

            {/* Spinner de carga */}
            <div className="mt-4">
              {isLoading 
              ? (
                <div className="flex justify-center">
                  <Puff height="80" width="80" ariaLabel="Cargando…" />
                </div>
              ) : (
                <aside className="w-full h-screen overflow-y-scroll p-5 rounded border">
                  <PosResumen productos={productos || []} />
                </aside>
              )
            }
            </div>
          </div>
        </div>

        {/* <aside className="w-full h-screen overflow-y-scroll p-5 rounded border">
          <PosResumen 
          />
        </aside> */}
      </div>
    </>
    
  )
}
