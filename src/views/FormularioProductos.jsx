import clienteAxios from "../config/axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useQuiosco from "../hooks/useQuiosco";
import { X } from "lucide-react"; 

export default function FormularioProductos({producto}) {

    const { handleClickModalEditarProducto, handleClickModalCrearProducto } = useQuiosco();


    const token = localStorage.getItem("AUTH_TOKEN");

    const [nombre, setNombre] = useState(producto?.nombre || "");
    const [codigo_barras, setCodigo_barras] = useState(producto?.codigo_barras || "");
    const [precio, setPrecio] = useState(producto?.precio || "");
    const [departamentoId, setDepartamentoId] = useState(producto?.departamento_id || "");
    const [fechaVencimiento, setFechaVencimiento] = useState(producto?.vencimientos  || [{ fecha_vencimiento: "", cantidad: 0 }]);
    const [departamentos, setDepartamentos] = useState([]);
    const [errores, setErrores] = useState({});
    const [tieneOferta, setTieneOferta] = useState(false);
    const [precioOferta, setPrecioOferta] = useState("");
    const [cantidadOferta, setCantidadOferta] = useState("");

    // Cargar departamentos
    useEffect(() => {
        const fetchDepartamentos = async () => {
            const token = localStorage.getItem("AUTH_TOKEN");
            try {
                const { data } = await clienteAxios.get("/api/departamentos", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDepartamentos(data);
            } catch (error) {
                console.error("Error al cargar los departamentos", error);
            }
        };

        fetchDepartamentos();
    }, []);

    // Cargar stock si estamos editando un producto
    useEffect(() => {
        const fetchProductoData = async () => {
            if (producto?.id) {
                console.log("Solicitando producto con ID:", producto.id);
                try {
                    // Obtener los detalles del producto
                    const { data } = await clienteAxios.get(`/api/productos/${producto.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log("Respuesta de la API:", data.producto.vencimientos);
    
                    // Cargar los vencimientos
                    setFechaVencimiento(data.producto.vencimientos || [{ fecha_vencimiento: "", cantidad: 0 }]);
                    console.log("producto cargado:", data.producto.vencimientos);
                     // Verificar y cargar la oferta
                     if (data.producto.ofertas) {
                        setTieneOferta(true);
                        setPrecioOferta(data.producto.ofertas.precio_oferta);  // Usar el campo correcto
                        setCantidadOferta(data.producto.ofertas.cantidad);
                    } else {
                        setTieneOferta(false);
                        setPrecioOferta("");  // Limpiar el estado de oferta
                        setCantidadOferta("");  // Limpiar el estado de cantidad
                    }
                } catch (error) {
                    console.error("Error al cargar el producto, sus vencimientos y sus ofertas correspondientes", error);
                }
            }
        };
    
        fetchProductoData();
    }, [producto?.id]);

    // Función para agregar un vencimiento
    const handleAddVencimiento = () => {
        setFechaVencimiento([...fechaVencimiento, { fecha_vencimiento: "", cantidad: 0 }]);
    };

    // Función para eliminar un vencimiento
    const handleRemoveVencimiento = (index) => {
        setFechaVencimiento(fechaVencimiento.filter((_, i) => i !== index));
    };

    // Función para actualizar vencimientos
    const handleVencimientoChange = (index, field, value) => {
        const updatedVencimientos = fechaVencimiento.map((vencimiento, i) => {
            if (i === index) {
                return { ...vencimiento, [field]: value };
            }
            return vencimiento;
        });
        setFechaVencimiento(updatedVencimientos);
    };

    // Submit del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        const datos = { 
            nombre, 
            precio: parseFloat(precio), 
            codigo_barras, 
            departamento_id: parseInt(departamentoId, 10),  
            vencimientos: fechaVencimiento, 
            oferta: tieneOferta ? { 
                precioOferta: parseFloat(precioOferta), 
                cantidadOferta: parseInt(cantidadOferta, 10)
            } : null,  
        };
        
        console.log("FormData antes de enviar:", datos);

        try {

            // Actualizar o crear producto
            if (producto?.id) {
                    // Actualizar producto
                    const response = await clienteAxios.put(`/api/productos/${producto.id}`, datos, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            // 'Content-Type': 'multipart/form-data',
                        }
                    })
                    
                    console.log("Respuesta del servidor:", response.data);
                    toast.success("Producto actualizado correctamente");
                    handleClickModalEditarProducto(); // Cerrar modal después de la operación
            } else {
                    // Crear producto
                    await clienteAxios.post(`/api/productos`, datos, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    toast.success("Producto creado correctamente");
                    
                    // Cerrar modal de creación
                    handleClickModalCrearProducto();
            }

        } catch (error) {
            if (error.response?.status === 422 && error.response.data.errors) {
                setErrores(error.response.data.errors);
            } else {
                toast.error("Error al guardar el producto");
            }
        }

    }
    return (
        <form
            onSubmit={handleSubmit}
            className="p-5 bg-white shadow rounded flex gap-3"
        >
            <div className="flex flex-col">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div>
                        <label className="text-slate-800">Nombre:</label>
                            <input 
                                type="text"
                                name="name"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="border mt-1 w-full p-3 bg-gray-50"
                            />
                            {errores.nombre && <p className="text-red-500 text-sm">{errores.nombre[0]}</p>}
                    </div>

                    <div>
                        <label className="text-slate-800">Precio:</label>
                            <input 
                                type="number"
                                name="precio"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)} 
                                className="border mt-1 w-full p-3 bg-gray-50"
                            />
                            {errores.precio && <p className="text-red-500 text-sm">{errores.precio[0]}</p>}
                    </div>

                    <div>
                        <label className="text-slate-800">Codigo de barras:</label>
                            <input 
                                type="text"
                                value={codigo_barras}
                                onChange={(e) => setCodigo_barras(e.target.value)}
                                className="border mt-1 w-full p-3 bg-gray-50"
                            />
                            {errores.codigo_barras && <p className="text-red-500 text-sm">{errores.codigo_barras[0]}</p>}
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    
                    <div>
                        <label className="text-slate-800">Departamento:</label>
                        <select
                        value={departamentoId}
                        onChange={(e) => setDepartamentoId(e.target.value)}
                        className="border mt-1 w-full p-3 bg-gray-50"
                        >
                        <option value="">Seleccione un departamento</option>
                        {departamentos.map((departamento) => (
                            <option key={departamento.id} value={departamento.id}>
                                {departamento.nombre}
                            </option>
                        ))}
                        </select>
                        {errores.departamento_id && <p className="text-red-500 text-sm">{errores.departamento_id[0]}</p>}
                    </div>
                </div>
                {/* Sección de vencimientos */}
                <div className="mb-4">
                    <label className="text-slate-800 mb-2">Vencimientos:</label>
                    {fechaVencimiento.map((vencimiento, index) => (
                        <div key={index}>
                            <div className="flex gap-3 mb-3">
                                <input 
                                    type="month"
                                    value={vencimiento.fecha_vencimiento}
                                    onChange={(e) => handleVencimientoChange(index, 'fecha_vencimiento', e.target.value)}
                                    className="border mt-1 p-3 bg-gray-50"
                                />
                                <input 
                                    type="number"
                                    value={vencimiento.cantidad}
                                    onChange={(e) => handleVencimientoChange(index, 'cantidad', e.target.value)}
                                    className="border mt-1 p-3 bg-gray-50"
                                />
                    
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveVencimiento(index)}
                                    className="text-red-600 hover:text-red-800 text-xl font-bold"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="flex justify-start mb-2">
                                {errores[`vencimientos.${index}.fecha_vencimiento`] && (
                                    <p className="text-red-500 text-sm">{errores[`vencimientos.${index}.fecha_vencimiento`][0]}</p>
                                )}
                                {errores[`vencimientos.${index}.cantidad`] && (
                                    <p className="text-red-500 text-sm">{errores[`vencimientos.${index}.cantidad`][0]}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddVencimiento} className="text-md px-1 py-2 bg-green-600 hover:bg-green-800 text-white rounded w-1/2">
                        Agregar vencimiento
                    </button>
                </div>
                
                <div className="mb-4">
                    <label>
                    <input
                        type="checkbox"
                        checked={tieneOferta}
                        onChange={() => setTieneOferta(prev => !prev)}
                        className="m-2"
                    />
                        ¿Este producto tiene oferta?
                    </label>
                    {tieneOferta && (
                        <div className="flex p-2 gap-3 items-center">
                        <label>Precio de oferta:</label>
                        <input
                            type="number"
                            value={precioOferta}
                            onChange={(e) => setPrecioOferta(e.target.value)}
                            required={tieneOferta}
                            className="border p-2 w-1/6"
                        />
                        <label>Cantidad en oferta:</label>
                        <input
                            type="number"
                            value={cantidadOferta}
                            onChange={(e) => setCantidadOferta(e.target.value)}
                            required={tieneOferta}
                            className="border p-2 w-1/6"
                        />
                        </div>
                    )}
                </div>

                {producto?.id ? (
                <div className="">
                    <p className="border p-1 mt-2 bg-white shadow rounded text-center">Fecha de creacion: <span className="font-bold">{producto.created_at}</span></p>
                    <p className="border p-1 mt-1 bg-white shadow rounded text-center">Fecha de actualizacion: <span className="font-bold">{producto.updated_at}</span></p>
                </div>) : (<p className="border p-1 mt-1 bg-white shadow rounded text-center font-bold">Se asignara fecha de creacion</p>)
                }
                <div className="flex justify-center">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-800 px-5 py-2 mt-5 text-white font-bold uppercase rounded w-1/2">
                    {producto?.id ? "Actualizar Producto" : "Crear Producto"}
                    </button>
                </div>
                
            </div>
            
        </form>
    )
}
