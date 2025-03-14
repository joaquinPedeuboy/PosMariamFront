import { Outlet } from "react-router-dom"

export default function AuthLayout() {
  return (
    <main className="max-w-4xl m-auto mt-10 md:mt-28 flex flex-col md:flex-row items-center">
      <div>
        <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" strokeWidth="5">
                <line x1="20" y1="70" x2="80" y2="70" stroke="purple"/>
                <line x1="20" y1="80" x2="80" y2="80" stroke="green"/>
                <line x1="20" y1="90" x2="80" y2="90" stroke="purple"/>
                
                <line x1="320" y1="70" x2="380" y2="70" stroke="purple"/>
                <line x1="320" y1="80" x2="380" y2="80" stroke="green"/>
                <line x1="320" y1="90" x2="380" y2="90" stroke="purple"/>
            </g>
            <text x="190" y="75" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="black">PERFUMERÍA</text>
            <text x="110" y="105" fontFamily="'Sacramento', cursive" fontSize="55" fill="purple">Mariam</text>
        </svg>
      </div>
        
        <div className="p-6 w-full">
          <Outlet />
        </div>
        
    </main>
  )
}
