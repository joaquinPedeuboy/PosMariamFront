import useQuiosco from "../hooks/useQuiosco";
import FormularioDepartamentos from "../views/FormularioDepartamentos";

export default function ModalCrearProducto() {

    const { handleClickModalCrearDepa, } = useQuiosco();

  return (
    <div className="md:flex gap-10">
        <div className="w-full">
            <div className="flex justify-end">
                <button onClick={handleClickModalCrearDepa}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </button>
            </div>

            <h3 className="font-bold text-2xl m-5">Crear nuevo Departamento</h3>

            <div className="mt-5">
                <FormularioDepartamentos />
            </div>
        </div>
    
        </div>
  )
}
