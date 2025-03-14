import { createContext, useState, useEffect } from "react"
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { formatearDinero } from "../helpers";


const QuioscoContext = createContext();

const QuioscoProvider = ({children}) => {

    const [modalCrear, setModalCrear] = useState(false);
    const [modalCrearDepa, setModalCrearDepa] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [producto, setProducto] = useState({});
    const [total, setTotal] = useState([]);
    const [pedido, setPedido] = useState([]);
    const [productoEnOferta, setProductoEnOferta] = useState(null);
    const [modalOferta, setModalOferta] = useState(false);
    const [disponible, setDisponible] = useState(producto.disponible);

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

    const handleSetProducto = producto => {
        setProducto(producto);
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
            console.error("Error al eliminar producto", error);
        }
    };

    const handleEditarCantidadPOS = (uniqueId, nuevaCantidad, usarOferta) => {
        setPedido((pedidoActual) =>
            pedidoActual.map((producto) => {
                if (producto.uniqueId === uniqueId) {
                    if (producto.usarOferta) {
                        return {
                            ...producto,
                            usarOferta,
                            ofertas: { ...producto.ofertas, cantidad: nuevaCantidad },
                        };
                    } else {
                        return {
                            ...producto,
                            vencimientos: producto.vencimientos.map((vencimiento) =>
                                vencimiento.id === producto.vencimientos[0]?.id
                                    ? { ...vencimiento, cantidad: nuevaCantidad }
                                    : vencimiento
                            ),
                        };
                    }
                }
                return producto;
            })
        );
    };
    


    const handleSubmitNuevaVenta = async () => {
        const token = localStorage.getItem('AUTH_TOKEN');
        console.log(pedido)
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
            
    
            console.log("Respuesta del servidor:", data);
    
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
    

    // Agregar productos al carrito POS
    const handleAgregarProductoPedidoPOS = async (producto, usarOferta = null) => {
        const token = localStorage.getItem('AUTH_TOKEN');
        try {
                // Obtener los vencimiento
                const { data: vencimientos } = await clienteAxios.get(`/api/productos/${producto.id}/vencimientos`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Obtener las ofertas
                const { data } = await clienteAxios.get(`/api/productos/${producto.id}/oferta`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const oferta = data.ofertas || null;

                console.log("Oferta recibida:", oferta);

                // Verificar si hay stock disponible
                if (!oferta && vencimientos.length === 0) {
                    toast.error("No hay stock disponible para este producto.");
                    return;
                }

                // Preguntar si se quiere usar la oferta (si existe)
                if (oferta && usarOferta === null) {
                    setProductoEnOferta(producto);
                    setModalOferta(true);
                    return;
                }        

                // Ordenar los vencimientos por fecha
                vencimientos.sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

                // Buscar si el producto ya está en el pedido
                const productoExistente = pedido.find((item) => item.id === producto.id && item.usarOferta === usarOferta);

                if (productoExistente) {
                    setPedido((prevPedido) =>
                        prevPedido.map((item) =>
                            item.id === producto.id && item.usarOferta === usarOferta
                                ? {
                                    ...item,
                                    usarOferta,
                                    ofertas: usarOferta ? { ...oferta, cantidad: item.cantidad + 1 } // Asegurar que la cantidad se incremente correctamente
                                    : null,
                                    precio: usarOferta ? oferta.precio_oferta : producto.precio,
                                    subtotal: usarOferta ? oferta.precio_oferta * item.cantidad : producto.precio * item.cantidad,
                                    vencimientos: usarOferta
                                        ? [] // Si es oferta, no se usan vencimientos
                                        : item.vencimientos.map((v, index) =>
                                            index === 0 ? { ...v, cantidad: v.cantidad + 1 } : v
                                        )
                                }
                                : item
                        )
                    );
                } else {
                    setPedido([
                        ...pedido,
                        {
                            ...producto,
                            uniqueId: `${producto.id}-${Date.now()}`,
                            usarOferta,
                            ofertas: usarOferta
                            ? { ...oferta, cantidad: 1 } // Asignar solo 1 unidad en oferta
                            : null,
                            precio: usarOferta ? oferta.precio_oferta : producto.precio,
                            subtotal: usarOferta ? oferta.precio_oferta * 1 : producto.precio * 1,
                            vencimientos: usarOferta ? [] : [{ ...vencimientos[0], cantidad: 1 }]
                        },
                    ]);
                }
            } catch (error) {
                console.error("Error al obtener los datos del producto", error);
            }
    }

    const imprimirTicket = (pedido, total) => {
        const ventana = window.open("", "PRINT", "height=600,width=400");
    
        ventana.document.write(`
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
                    table { width: 100%; border-collapse: collapse; text-align: left; }
                    td, th { padding: 6px; border-bottom: 1px solid #ddd; }
                    th { background-color: #f4f4f4; }
                    .total { font-weight: bold; text-align: right; margin-top: 10px; }
                </style>
            </head>
            <body>
                <h3>Resumen de Venta</h3>
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
                handleClickModalEditarProducto,
                handleClickModalCrearDepa,
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
                disponible
            }}
        >{children}</QuioscoContext.Provider>
    )
}

export {
    QuioscoProvider
}
export default QuioscoContext
