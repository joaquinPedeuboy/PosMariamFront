import clienteAxios from "../config/axios";
import { useState } from "react";
import useQuiosco from "../hooks/useQuiosco";
import { toast } from "react-toastify";

export default function FormularioDepartamentos() {

    const { handleClickModalCrearDepa } = useQuiosco();
    const [nombre, setNombre] = useState("");
    const token = localStorage.getItem("AUTH_TOKEN");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const datos = { nombre };

        try {
            // Crear departamento
            await clienteAxios.post(`/api/departamentos/create`, datos , {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success("Departamento creado correctamente");
            handleClickModalCrearDepa();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                toast.error(error.response.data.errors.nombre[0]); // Muestra el primer error
            } else {
                toast.error("Error al crear el departamento");
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
            </div>

            <button type="submit" className="bg-blue-500 hover:bg-blue-800 px-5 py-2 mt-5 text-white font-bold uppercase rounded">
                Crear Departamento
            </button>
        </div>
        

    </form>
  )
}
