import { Link } from "react-router-dom";
import { createRef, useState } from 'react';
import { useAuth } from "../hooks/useAuth";
import Alerta from "../components/Alerta";
import { RotatingLines } from 'react-loader-spinner'

export default function Login() {
  
    const emailRef = createRef();
    const passwordRef = createRef();

    const [errores, setErrores] = useState([])
    const [loading, setLoading] = useState(false);
    const { login } = useAuth({
      middleware: 'guest',
      url: '/',
      onRedirect: () => setLoading(false)
    });

    const handleSubmit = async e => {
      e.preventDefault();
      setLoading(true);

      const datos = {
        email: emailRef.current.value,
        password: passwordRef.current.value,
      }

      // Callback para manejar errores de autenticación
      await login(datos, (errors) => {
        if (errors.length) {
            setErrores(errors);  // Muestra los errores
            setLoading(false);    // Desactiva el spinner solo si hay errores
        }
      });
    }

  return (
    <>
      <h1 className="text-4xl font-black">Iniciar Sesión</h1>

      <div className="bg-white shadow-md rounded-md mt-10 px-5 py-10">
        {/* Spinner overlay */}
        {loading && (
                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 rounded-md">
                    <RotatingLines
                      height={200}
                      width={200}
                      strokeColor="#9700c0"
                      ariaLabel="rotating-lines-loading"
                      />
                </div>
            )}

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          { errores ? errores.map(error => <Alerta key={error}>{error}</Alerta>) : null }

          <div className="mb-4">
            <label
              className="text-slate-800"
              htmlFor="email"
            >Email:</label>
            <input 
              type="email"
              id="email"
              className="mt-2 w-full p-3 bg-gray-50"
              name="email"
              placeholder="Tu email"
              ref={emailRef}
            />
          </div>

          <div className="mb-4">
            <label
              className="text-slate-800"
              htmlFor="password"
            >Password:</label>
            <input 
              type="password"
              id="password"
              className="mt-2 w-full p-3 bg-gray-50"
              name="password"
              placeholder="Tu password"
              ref={passwordRef}
            />
          </div>

          <input 
            type="submit" 
            value="Iniciar Sesión" 
            className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer" 
          />
        </form>
      </div>

      <nav className="mt-5">
        <Link to="/auth/registro">
          ¿No tienes cuenta? Crea una
        </Link>
      </nav>
    </>
  )
}
