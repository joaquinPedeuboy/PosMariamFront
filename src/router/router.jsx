import { createBrowserRouter } from "react-router-dom";
import Layout from "../layouts/Layout";
import AuthLayout from "../layouts/AuthLayout";
import Inicio from "../views/Inicio";
import Login from "../views/Login";
import Registro from "../views/Registro";
import AdminLayout from "../layouts/AdminLayout";
import Productos from "../views/Productos";
import Pos from "../views/Pos";
import Ventas from "../views/Ventas";
import EstadisticasVentas from "../views/EstadisticasVentas";
import EstadisticasProductos from "../views/EstadisticasProductos";
import Ofertas from "../views/Ofertas";
import Vencimientos from "../views/Vencimientos";
import Departamentos from "../views/Departamentos";
import Stock from "../views/Stock";


const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Inicio />
            }
        ]
    },
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            {
                path: '/auth/login',
                element: <Login />
            },
            {
                path: '/auth/registro',
                element: <Registro />
            },
        ]
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                index:true,
                element: <Pos />
            },
            {
                path: '/admin/productos',
                element: <Productos />
            },
            {
                path: '/admin/ventas',
                element: <Ventas />
            },
            {
                path: '/admin/ventas/estadisticas',
                element: <EstadisticasVentas />
            },
            {
                path: '/admin/productos/estadisticas',
                element: <EstadisticasProductos />
            },
            {
                path: '/admin/productos/ofertas',
                element: <Ofertas />
            },
            {
                path: '/admin/productos/vencimientos',
                element: <Vencimientos />
            },
            {
                path: '/admin/productos/departamentos',
                element: <Departamentos />
            },
            {
                path: '/admin/productos/stock',
                element: <Stock />
            }
        ]
    }
])

export default router