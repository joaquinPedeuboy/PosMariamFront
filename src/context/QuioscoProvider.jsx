import { createContext, useState, useEffect } from "react"
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";
import { mutate } from "swr";


const QuioscoContext = createContext();

const QuioscoProvider = ({children}) => {

    const [modalCrear, setModalCrear] = useState(false);
    const [modalCrearDepa, setModalCrearDepa] = useState(false);
    const [modalEditarDepa, setModalEditarDepa] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [producto, setProducto] = useState({});
    const [total, setTotal] = useState([]);
    const [pedido, setPedido] = useState([]);
    const [productoEnOferta, setProductoEnOferta] = useState(null);
    const [modalOferta, setModalOferta] = useState(false);
    const [disponible, setDisponible] = useState(producto.disponible);
    const [departamento, setDepartamento] = useState([]);

    const token = localStorage.getItem('AUTH_TOKEN');

    // Calculo de total de producto
    useEffect(() => {
        const nuevoTotal = pedido.reduce((total, producto) => {
            const cantidad = producto.usarOferta 
                ? producto.ofertas?.cantidad 
                : producto.vencimientos?.[0]?.cantidad;
            return total + (producto.precio * cantidad);
        }, 0);
        
        setTotal(nuevoTotal);
    }, [pedido]);

    const handleClickModalEditarProducto = ()=> {
        setModalEditar(!modalEditar);
    }

    const handleClickModalCrearProducto = ()=> {
        setModalCrear(!modalCrear);
    }

    const handleClickModalCrearDepa = ()=> {
        setModalCrearDepa(!modalCrearDepa);
    }

    const handleClickModalEditarDepartamento = ()=> {
        setModalEditarDepa(!modalEditarDepa);
    }

    const handleSetProducto = producto => {
        setProducto(producto);
    }

    const handleSetDepartamento = departamento => {
        setDepartamento(departamento);
    }

    const cambiarDisponibilidad = async (id) => {
        try {
            const response = await clienteAxios.post(`/api/productos/${id}/toggle-disponibilidad`, null, {
            headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Disponibilidad Cambiada');
            return response.data;
        } catch (error) {
            toast.error('Error al cambiar la disponibilidad');
            console.error("Error al cambiar la disponibilidad", error);
        }
    };

    // Eliminar elementos de resumen
    const handleEliminarProductoPedido = uniqueId => {
        const pedidoActualizado = pedido.filter(producto => producto.uniqueId  !== uniqueId)
        setPedido(pedidoActualizado)
        toast.success('Eliminado del pedido')
    }

    const handleEliminarProducto = async (id) => {
        try {
            await clienteAxios.delete(`/api/productos/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Producto Eliminado');
            mutate();
        } catch (error) {
            toast.error('Error al eliminar el producto');
            
        }
    };

    // Handle elminar departamento
    const handleEliminarDepartamento = async (id) => {
        try {
            await clienteAxios.delete(`/api/departamentos/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Departamento Eliminado');
            mutate('/api/departamentos');
        } catch (error) {
            toast.error('Error al eliminar el Departamento');
            
        }
    };

    // const handleEditarCantidadPOS = (uniqueId, nuevaCantidad, usarOferta) => {
    //     setPedido((pedidoActual) =>
    //         pedidoActual.map((producto) => {
    //             if (producto.uniqueId === uniqueId) {
    //                 if (producto.usarOferta) {
    //                     return {
    //                         ...producto,
    //                         usarOferta,
    //                         ofertas: { ...producto.ofertas, cantidad: nuevaCantidad },
    //                     };
    //                 } else {
    //                     return {
    //                         ...producto,
    //                         vencimientos: producto.vencimientos.map((vencimiento) =>
    //                             vencimiento.id === producto.vencimientos[0]?.id
    //                                 ? { ...vencimiento, cantidad: nuevaCantidad }
    //                                 : vencimiento
    //                         ),
    //                     };
    //                 }
    //             }
    //             return producto;
    //         })
    //     );
    // };
    const handleEditarCantidadPOS = (uniqueId, nuevaCantidad, usarOferta) => {
        setPedido(pedidoActual =>
          pedidoActual
            .map(producto => {
              // Si no es el producto que estamos editando, lo devolvemos tal cual
              if (producto.uniqueId !== uniqueId) return producto;
      
              // 1) Si estamos editando la oferta…
              if (producto.usarOferta) {
                // Actualizamos sólo la cantidad de la oferta
                return {
                  ...producto,
                  usarOferta,
                  ofertas: { ...producto.ofertas, cantidad: nuevaCantidad },
                };
              }
      
              // 2) Si no es oferta, es vencimiento: actualizamos el primer vencimiento…
              const vencimientosActualizados = producto.vencimientos
                .map((vencimiento, idx) =>
                  idx === 0
                    ? { ...vencimiento, cantidad: nuevaCantidad }
                    : vencimiento
                )
                // …y descartamos los que quedaron a 0
                .filter(v => v.cantidad > 0);
      
              // 3) Reconstruimos el producto con los vencimientos limpios
              return {
                ...producto,
                vencimientos: vencimientosActualizados
              };
            })
            // 4) (Opcional) Si quieres borrar el producto por completo cuando se queda sin stock:
            .filter(producto => {
              // Si usaba oferta y la cantidad llegó a 0, lo quitamos:
              if (producto.usarOferta && producto.ofertas.cantidad <= 0) return false;
              // Si no usaba oferta y ya no tiene vencimientos, lo quitamos:
              if (!producto.usarOferta && producto.vencimientos.length === 0) return false;
              return true;
            })
        );
      };


    const handleSubmitNuevaVenta = async () => {
        const token = localStorage.getItem('AUTH_TOKEN');
        try {
            
            const {data} = await clienteAxios.post('/api/ventas', {
                total,
                productos: pedido.map(producto => ({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.usarOferta ? producto.precioOferta : producto.precio,
                    usar_oferta: producto.usarOferta !== null ? producto.usarOferta : false, // Asegurar que sea true o false
                    cantidad_oferta: producto.ofertas?.cantidad || 0,
                    cantidad_vencimientos: producto.vencimientos.reduce((sum, v) => sum + v.cantidad, 0),
                    cantidad: producto.usarOferta ? producto.ofertas?.cantidad || 0 : producto.vencimientos.reduce((sum, v) => sum + v.cantidad, 0), // 🔹 Ajustar según la oferta o vencimiento
                    vencimientos: producto.vencimientos.map(v => ({ 
                        id: v.id, 
                        fecha_vencimiento: v.fecha_vencimiento, 
                        cantidad: v.cantidad 
                    }))
                }))                            
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            toast.success('Venta realizada correctamente');
    
            // 💡 Verificar si respuesta.data.venta existe antes de intentar imprimir el ticket
            if (data.venta) {
                imprimirTicket(pedido, total);
            } else {
                console.warn("No se generó una venta en la respuesta del servidor");
            }
    
            // Asegurar que el carrito se limpia correctamente
            setTimeout(() => {
                setPedido([]);
            }, 1000);
    
        } catch (error) {
            console.error("Error al vender el producto", error);
            // Verifica si el error tiene detalles y los muestra
            if (error.response && error.response.data) {
                const errorMessage = error.response.data.error || 'Error desconocido';
                const productosConStock = error.response.data.productos || [];
                if (productosConStock.length > 0) {
                    toast.error(`${errorMessage}: ${productosConStock.join(", ")}`);
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Error al procesar la venta. Intenta nuevamente.');
            }
        }
    };
    
    const handleAgregarProductoPedidoPOS = async (producto, usarOferta = null) => {
        const token = localStorage.getItem('AUTH_TOKEN');
        try {
          let productoOptimizado = producto;
          // Si el producto no trae las relaciones (por ejemplo, viene de la búsqueda general)
          // realizamos una llamada al endpoint optimizado para obtener las relaciones.
        //   if (!producto.vencimientos || !producto.ofertas) {
        //     const { data: productoData } = await clienteAxios.get(`/api/productos/buscar/${producto.codigo_barras}`, {
        //       headers: { Authorization: `Bearer ${token}` }
        //     });
        //     productoOptimizado = productoData;
        //   }
      
          // Ordenamos los vencimientos por fecha
          const vencimientos = productoOptimizado.vencimientos || [];
      
          // Validamos stock: si no hay oferta y tampoco vencimientos, no hay stock
          if (!productoOptimizado.ofertas && vencimientos.length === 0) {
            toast.error("No hay stock disponible para este producto.");
            return;
          }
      
          // Si existe oferta y aún no se define si usarla, mostramos el modal para elegir
          if (productoOptimizado.ofertas && usarOferta === null) {
            setProductoEnOferta(productoOptimizado);
            setModalOferta(true);
            return;
          }
      
          // Verificamos si el producto ya está en el pedido
          const productoExistente = pedido.find(
            (item) => item.id === productoOptimizado.id && item.usarOferta === usarOferta
          );
      
          if (productoExistente) {
            // Actualizamos el producto existente, incrementando cantidad
            setPedido((prevPedido) =>
              prevPedido.map((item) =>
                item.id === productoOptimizado.id && item.usarOferta === usarOferta
                  ? {
                      ...item,
                      // Si se usa oferta, incrementamos la cantidad en la propiedad de oferta
                      // Si no, actualizamos la cantidad en el primer vencimiento
                      ...(usarOferta
                        ? {
                            ofertas: { ...productoOptimizado.ofertas, cantidad: item.ofertas.cantidad + 1 },
                            subtotal: productoOptimizado.ofertas.precio_oferta * (item.ofertas.cantidad + 1),
                          }
                        : {
                            vencimientos: item.vencimientos.map((v, index) =>
                              index === 0 ? { ...v, cantidad: v.cantidad + 1 } : v
                            ),
                            subtotal: productoOptimizado.precio * (item.vencimientos[0].cantidad + 1),
                          }),
                    }
                  : item
              )
            );
          } else {
            // Agregamos el producto nuevo al pedido
            setPedido([
              ...pedido,
              {
                ...productoOptimizado,
                uniqueId: `${productoOptimizado.id}-${Date.now()}`,
                usarOferta,
                // Si se usa oferta, configuramos la cantidad en 1 y el precio de oferta
                ofertas: usarOferta ? { ...productoOptimizado.ofertas, cantidad: 1 } : null,
                // Si no se usa oferta, asignamos el precio normal y el primer vencimiento con cantidad 1
                precio: usarOferta ? productoOptimizado.ofertas.precio_oferta : productoOptimizado.precio,
                subtotal: usarOferta ? productoOptimizado.ofertas.precio_oferta : productoOptimizado.precio,
                vencimientos: usarOferta ? [] : [{ ...vencimientos[0], cantidad: 1 }],
              },
            ]);
          }
        } catch (error) {
          console.error("Error al agregar producto al pedido", error);
          toast.error("Error al agregar producto. Revisa la consola para más detalles.");
        }
      };

    const imprimirTicket = (pedido, total) => {
        const ventana = window.open("", "PRINT", "height=1000,width=800");
    
        ventana.document.write(`
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0px;
                        padding: 0px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    td {
                        margin: 0px;
                        padding: 6px;
                        border-bottom: 1px solid #ddd; /* Para una mejor separación */

                    }
                    th {
                        margin: 0px;
                        padding: 6px;
                        background-color: #f4f4f4; /* Fondo para encabezados */
                    }
                    .total {
                        font-weight: bold;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <h3 style="text-aling: left;">Resumen de Venta</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cant</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedido.map(producto => {
                            let subtotal = 0;
                            let filas = "";
    
                            if (producto.usarOferta && producto.ofertas) { // Asegurar que ofertas no sea null o undefined
                                subtotal = producto.ofertas.cantidad * producto.ofertas.precio_oferta;
                                filas += `
                                    <tr>
                                        <td>${producto.nombre} (Oferta)</td>
                                        <td>${producto.ofertas.cantidad}</td>
                                        <td>$${parseFloat(producto.ofertas.precio_oferta).toFixed(2)}</td>
                                        <td>$${subtotal.toFixed(2)}</td>
                                    </tr>
                                `;
                            } else {
                                producto.vencimientos.forEach(vencimiento => {
                                    const subtotalVencimiento = vencimiento.cantidad * producto.precio;
                                    subtotal += subtotalVencimiento;
                                    filas += `
                                        <tr>
                                            <td>${producto.nombre}</td>
                                            <td>${vencimiento.cantidad}</td>
                                            <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                                            <td>$${subtotalVencimiento.toFixed(2)}</td>
                                        </tr>
                                    `;
                                });
                            }
    
                            return filas;
                        }).join("")}
                    </tbody>
                </table>
                <p class="total">Total: $${total.toFixed(2)}</p>
            </body>
            </html>
        `);
    
        ventana.document.close();
        ventana.focus();
        ventana.print();
        ventana.close();
    };    

    return (
        <QuioscoContext.Provider
            value={{
                modalCrear,
                modalEditar,
                modalCrearDepa,
                modalEditarDepa,
                handleClickModalEditarProducto,
                handleClickModalCrearDepa,
                handleClickModalEditarDepartamento,
                producto,
                total,
                pedido,
                handleSetProducto,
                handleEliminarProducto,
                handleClickModalCrearProducto,
                handleAgregarProductoPedidoPOS,
                handleSubmitNuevaVenta,
                handleEditarCantidadPOS,
                handleEliminarProductoPedido,
                setProductoEnOferta,
                productoEnOferta,
                modalOferta,
                setModalOferta,
                cambiarDisponibilidad,
                disponible,
                departamento,
                handleSetDepartamento,
                handleEliminarDepartamento,
            }}
        >{children}</QuioscoContext.Provider>
    )
}

export {
    QuioscoProvider
}
export default QuioscoContext
