import { useEffect } from "react";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import { useNavigate } from "react-router-dom";

export const useAuth = ({middleware, url}) => {

    const token = localStorage.getItem('AUTH_TOKEN');
    const navigate = useNavigate();

    const { data : user, error, mutate } = useSWR('/api/user', () => 
        clienteAxios('/api/user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.data)
        .catch(error => {
            throw Error(error?.response?.data?.errors)
        })
    )

    const login = async (datos, setErrores, callback) => {
        try {
            const {data} = await clienteAxios.post('/api/login', datos)
            localStorage.setItem('AUTH_TOKEN', data.token);
            setErrores([]);
            await mutate();
            if(callback) callback();
    
        } catch (error) {
            if (error.response) {
                // console.log(Object.values(data));
                setErrores(Object.values(error.response.data?.errors || [error.response.data?.message || 'Error desconocido']));
            } else {
                setErrores(['Error de red. Por favor, inténtalo de nuevo.']);
            }
        }
    }

    const registro = async(datos, setErrores) => {
        try {
            const {data} = await clienteAxios.post('/api/registro', datos)
            localStorage.setItem('AUTH_TOKEN', data.token);
            setErrores([]);
            await mutate();
    
        } catch (error) {
            if (error.response) {
                console.log(Object.values(data));
                setErrores(Object.values(error.response.data.errors));
            } else {
                setErrores(['Error de red. Por favor, inténtalo de nuevo.']);
            }
        }
    }

    const logout = async() => {
        try {
            await clienteAxios.post('/api/logout', null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            localStorage.removeItem('AUTH_TOKEN')
            await mutate(undefined)
        } catch (error) {
            throw Error(error?.response?.data?.errors)
        }
    }
    
    useEffect(() => {
        if(middleware === 'guest' && url && user) {
            navigate(url)
        }

        if(middleware === 'guest' && user && user.admin) {
            navigate('/admin')
        }

        if(middleware === 'admin' && user && !user.admin) {
            navigate('/')
        }

        if(middleware === 'auth' && error) {
            navigate('/auth/login')
        }

        // Evitar redirección en rutas públicas
        if (middleware === 'public') {
            return;
        }


    }, [user, error])

    return {
        login,
        registro,
        logout,
        user,
        error,
    }
}