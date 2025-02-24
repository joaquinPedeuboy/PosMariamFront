import{ Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {

  const { logout } = useAuth({middleware: 'auth'});

  return (
    <>
      {/* Boton cerrar sesion de admin */}
      <div className="flex justify-end my-5 px-5">
            <button
                type="button"
                className="text-center bg-gray-300 hover:bg-gray-500 p-2 font-bold text-white truncate"
                onClick={logout}
            >
                Cerrar sesion
            </button>
      </div>
      <div className='max-w-6xl m-auto mt-5 md:mt-4 flex flex-col items-center'>
            <svg viewBox="0 30 400 100" width="100%" height="150px" xmlns="http://www.w3.org/2000/svg">
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
        <main className='p-10 w-full'>
          <Outlet />
        </main>
        
      </div>
    </>
    
  )
}
