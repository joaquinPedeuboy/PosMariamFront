import { Link } from "react-router-dom"
import { createRef, useState } from 'react';
import Alerta from "../components/Alerta";
import { useAuth } from "../hooks/useAuth";
import { RotatingLines } from 'react-loader-spinner'

export default function Registro() {

    const nameRef = createRef();
    const surnameRef = createRef();
    const emailRef = createRef();
    const passwordRef = createRef();
    const passwordConfirmationRef = createRef();

    const [errores, setErrores] = useState([])
    const [loading, setLoading] = useState(false);
    const {registro} = useAuth({middleware: 'guest', url: '/', onRedirect: () => setLoading(false)})

    const handleSubmit = async e => {
      e.preventDefault();
      setLoading(true);

      const datos = {
        name: nameRef.current.value,
        surname: surnameRef.current.value,
        email: emailRef.current.value,
        password: passwordRef.current.value,
        password_confirmation: passwordConfirmationRef.current.value,
      }

      // Callback para manejar errores de autenticación
      await registro(datos, (errors) => {
        if (errors.length) {
            setErrores(errors);  // Muestra los errores
            setLoading(false);    // Desactiva el spinner solo si hay errores
        }
      });

    }
  return (
    <>
      <h1 className="text-4xl font-black">Crea tu Cuenta</h1>
      <p>Crea tu cuenta llenando el formulario</p>

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
              htmlFor="name"
            >Nombre:</label>
            <input 
              type="text"
              id="name"
              className="mt-2 w-full p-3 bg-gray-50"
              name="name"
              placeholder="Tu nombre"
              ref={nameRef}
            />
          </div>

          <div className="mb-4">
            <label
              className="text-slate-800"
              htmlFor="surname"
            >Apellido:</label>
            <input 
              type="text"
              id="surname"
              className="mt-2 w-full p-3 bg-gray-50"
              name="surname"
              placeholder="Tu apellido"
              ref={surnameRef}
            />
          </div>

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

          <div className="mb-4">
            <label
              className="text-slate-800"
              htmlFor="password_confirmation"
            >Repetir Password:</label>
            <input 
              type="password"
              id="password_confirmation"
              className="mt-2 w-full p-3 bg-gray-50"
              name="password_confirmation"
              placeholder="Repetir Password"
              ref={passwordConfirmationRef}
            />
          </div>

          <input 
            type="submit" 
            value="Crear Cuenta" 
            className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer" 
          />
        </form>

      </div>

      <nav className="mt-5">
        <Link to="/auth/login">
          ¿Ya tienes cuenta? Inicia Sesión
        </Link>
      </nav>
    </>
    
  )
}
