import useQuiosco from "../hooks/useQuiosco";

export default function Departamento({ departamento }) {

  const { handleClickModalEditarDepartamento, handleSetDepartamento, handleEliminarDepartamento } = useQuiosco();

  const { id, nombre } = departamento;

    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4
                    flex flex-col justify-between h-full">
        <h3 className="text-xl font-bold text-center mb-2">{nombre}</h3>

        <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4">
          <button
            type="button"
            className="bg-yellow-500 hover:bg-yellow-800 text-white w-full lg:w-1/2 md:w-1/8 p-2 uppercase font-bold"
            onClick={() => {
              handleClickModalEditarDepartamento();
              handleSetDepartamento(departamento);
            }}
          >
            Editar
          </button>

          <button
            type="button"
            className="bg-red-600 hover:bg-red-800 text-white w-full lg:w-1/2 md:w-1/8 p-2 uppercase font-bold"
            onClick={()=> handleEliminarDepartamento(id)}
          >
            Eliminar
          </button>
        </div>
      </div>
    );
  }
  