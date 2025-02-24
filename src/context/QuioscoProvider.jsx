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

    const token = localStorage.getItem('AUTH_TOKEN');

    // Calculo de total de producto
    useEffect(()=>{
        const nuevoTotal = pedido.reduce( (total, producto)=> {
            if (!producto.vencimientos || producto.vencimientos.length === 0) return total;
            return (producto.precio * producto.vencimientos[0].cantidad) + total;
        }, 0);
        setTotal(nuevoTotal)
    }, [pedido])

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

    // Eliminar elementos de resumen
    const handleEliminarProductoPedido = id => {
        const pedidoActualizado = pedido.filter(producto => producto.id !== id)
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

    //Editar pedido POS
    const handleEditarCantidadPOS = (id, nuevaCantidad) => {
        const productoActualizado = pedido.map(producto => 
            producto.id === id ? {...producto, 
                vencimientos: producto.vencimientos?.map(vencimiento =>
                    ({ ...vencimiento, cantidad: nuevaCantidad })
                ),
            }
            : producto
        );
        setPedido(productoActualizado);
    }


    const handleSubmitNuevaVenta = async () => {
        const token = localStorage.getItem('AUTH_TOKEN');
    
        try {
            const {data} = await clienteAxios.post('/api/ventas', {
                total,
                productos: pedido.map(producto => ({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
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
        }
    };
    

    // Agregar productos al carrito POS
    const handleAgregarProductoPedidoPOS = async (producto) => {
        const token = localStorage.getItem('AUTH_TOKEN');
    
        try {
            // Obtener las fechas de vencimiento del producto desde la API
            const { data: vencimientos } = await clienteAxios.get(`/api/productos/${producto.id}/vencimientos`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (vencimientos.length === 0) {
                toast.error("No hay stock disponible para este producto.");
                return;
            }
    
            // Ordenar los vencimientos por fecha
            vencimientos.sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));
    
            const productoExistente = pedido.find((item) => item.id === producto.id);
            if (productoExistente) {
                setPedido((prevPedido) =>
                    prevPedido.map((item) =>
                        item.id === producto.id
                            ? {
                                ...item,
                                vencimientos: item.vencimientos.map((v, index) =>
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
                        vencimientos:[{ ...vencimientos[0], cantidad: 1 }]
                    },
                ]);
            }
        } catch (error) {
            console.error("Error al obtener los datos del producto", error);
        }
    };    
    

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
                            const cantidad = producto.vencimientos.reduce((sum, v) => sum + v.cantidad, 0);
                            const subtotal = cantidad * producto.precio;
                            return `
                                <tr>
                                    <td>${producto.nombre}</td>
                                    <td>${cantidad}</td>
                                    <td>$${producto.precio.toFixed(2)}</td>
                                    <td>$${subtotal.toFixed(2)}</td>
                                </tr>
                            `;
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
                handleEliminarProductoPedido


            }}
        >{children}</QuioscoContext.Provider>
    )
}

export {
    QuioscoProvider
}
export default QuioscoContext
