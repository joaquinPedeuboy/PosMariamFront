import clienteAxios from "../config/axios";
import { useState } from "react";
import useQuiosco from "../hooks/useQuiosco";
import { toast } from "react-toastify";

export default function FormularioDepartamentos({departamento}) {

    const { handleClickModalCrearDepa, handleClickModalEditarDepartamento } = useQuiosco();
    const [nombre, setNombre] = useState(departamento?.nombre || "");
    const [errores, setErrores] = useState({});
    const token = localStorage.getItem("AUTH_TOKEN");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const datos = { nombre };

        try {
            // Actualizar o crear
            if(departamento?.id){
                // Actualizar depa
                const response = await clienteAxios.put(`/api/departamentos/${departamento.id}`, datos, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                
                console.log("Respuesta del servidor:", response.data);
                toast.success("Departamento actualizado correctamente");
                handleClickModalEditarDepartamento();
            } else {
                // Crear departamento
                await clienteAxios.post(`/api/departamentos/create`, datos , {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                toast.success("Departamento creado correctamente");
                handleClickModalCrearDepa();
            }
            
        } catch (error) {
            console.error("Error al guardar depto:", error.response || error);
            if (error.response?.status === 422 && error.response.data.errors) {
                setErrores(error.response.data.errors);
                Object.values(error.response.data.errors)
                .flat()
                .forEach(msg => toast.error(msg));
            } else {
                toast.error("Error al guardar el departamento");
            }
        }
    }

  return (
    <form
        onSubmit={handleSubmit}
        noValidate
        className="p-5 bg-white shadow rounded flex gap-3"
    >
        <div>
            <div className="mb-1">
                <label className="text-slate-800">Nombre Departamento:</label>
                    <input 
                        type="text"
                        name="name"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="border mt-1 w-full p-3 bg-gray-50"
                    />
                    {errores.nombre && (
                        <p className="text-red-600 text-sm mt-1">
                        {errores.nombre.join(", ")}
                        </p>
                    )}
            </div>

            <button type="submit" className="bg-blue-500 hover:bg-blue-800 px-5 py-2 mt-5 text-white font-bold uppercase rounded">
                {departamento?.id ? "Actualizar Departamento" : "Crear Departamento"}
            </button>
        </div>
        

    </form>
  )
}
