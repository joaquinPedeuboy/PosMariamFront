

export default function Inicio() {
  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-5">Consulta el precio del producto por codigo o por nombre</h1>
      
      <div className="flex justify-center">
        <input 
          type="text" 
          placeholder="Buscar productos..."
          className="mt-5 w-2/3 p-6 border rounded shadow"
        />
      </div>
    </>
  )
}
