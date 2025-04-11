export default function Departamento({ departamento }) {
    const { id, nombre } = departamento;
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
        <h3 className="text-xl font-bold text-center mb-2">{nombre}</h3>
        {/* Agregá más detalles o botones según sea necesario */}
      </div>
    );
  }
  