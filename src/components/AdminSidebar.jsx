import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminSidebar() {

    const { logout } = useAuth({middleware: 'auth'});
  return (
    <aside className="md:w-72 h-screen">
        {/* Imagen logotipo de admin */}
        <div className="flex justify-center items-center w-full p-4">
            <svg viewBox="0 0 400 150" width="100%" height="150px" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" strokeWidth="5">
                    <line x1="20" y1="70" x2="80" y2="70" stroke="purple"/>
                    <line x1="20" y1="80" x2="80" y2="80" stroke="green"/>
                    <line x1="20" y1="90" x2="80" y2="90" stroke="purple"/>
                    
                    <line x1="320" y1="70" x2="380" y2="70" stroke="purple"/>
                    <line x1="320" y1="80" x2="380" y2="80" stroke="green"/>
                    <line x1="320" y1="90" x2="380" y2="90" stroke="purple"/>
                </g>
                <text x="135" y="75" fontFamily="Arial" fontSize="24" fontWeight="bold" fill="black">PERFUMERÍA</text>
                <text x="115" y="120" fontFamily="'Dancing Script', cursive" fontSize="40" fill="purple">Mariam</text>
            </svg>
        </div>

        {/* Navegacion del admin */}
        <nav className="flex flex-col">
            <Link to="/admin" className="font-bold border-b-2 text-lg cursor-pointer truncate p-3 hover:bg-violet-200">Pos</Link>
            <Link to="/admin/productos" className="font-bold border-b-2 text-lg cursor-pointer truncate p-3 hover:bg-violet-200">Productos</Link>
            <Link to="/admin/ventas" className="font-bold border-b-2 text-lg cursor-pointer truncate p-3 hover:bg-violet-200">Ventas</Link>
            <Link to="/admin/ventas/estadisticas" className="font-bold border-b-2 text-lg cursor-pointer truncate p-3 hover:bg-violet-200">Estadisticas Ventas</Link>
            <Link to="/admin/productos/estadisticas" className="font-bold border-b-2 text-lg cursor-pointer truncate p-3 hover:bg-violet-200">Estadisticas Productos</Link>
        </nav>

        {/* Boton cerrar sesion de admin */}
        <div className="my-5 px-5">
            <button
                type="button"
                className="text-center bg-red-500 w-full p-3 font-bold text-white truncate"
                onClick={logout}
            >
                Cerrar sesion
            </button>
        </div>
    </aside>
  )
}
