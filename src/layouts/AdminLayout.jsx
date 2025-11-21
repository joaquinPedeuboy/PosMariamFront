import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "../components/AdminSidebar";
import useQuiosco from '../hooks/useQuiosco';
import ModalEditarProducto from "../components/ModalEditarProducto";
import ModalCrearProducto from "../components/ModalCrearProducto";
import ModalCrearDepa from "../components/ModalCrearDepa";
import { useAuth } from "../hooks/useAuth";
import { RotatingLines } from 'react-loader-spinner'
import ModalEditarDepa from "../components/ModalEditarDepa";
import OfflineBanner from "../components/OfflineBanner";
import { mutate } from "swr";
import RevalidateIndicator from "../components/RevalidateIndicator";
import OnlineSuccessBanner from "../components/OnlineSuccesBanner";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxHeight: "100vh", // Limita la altura de la modal
    overflowY: "auto", // Permite el scroll si el contenido es demasiado grande
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10050,
  },
};

Modal.setAppElement('#root');

export default function AdminLayout() {

  const { modalEditar, modalCrear, modalCrearDepa, modalEditarDepa } = useQuiosco();
  const { user, error, isLoading } = useAuth({middleware: 'admin'});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      // Revalidar user y otras rutas vitales
      softRevalidate('/api/user');
      softRevalidate('/api/productos'); // opcional
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  useEffect(() => {
    const loadProductos = async () => {
      if (!user && !error && !isLoading) {
        setLoading(true);
        // Agrega un retraso para mostrar el spinner
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
      } else if (user || error) {
        setLoading(false);
      }
    };
  
    loadProductos();
  }, [user, error, isLoading]);

  return (
    <>
      {loading ? (
          <div className="fixed inset-0 flex justify-center items-center bg-white">
          <RotatingLines
            height={150}
            width={150}
            strokeColor="#9700c0"
            ariaLabel="rotating-lines-loading"
            />
          </div>
        ) : (
    
      <>
        <OfflineBanner />
        <OnlineSuccessBanner />
        <RevalidateIndicator />
        <div className="md:flex min-h-screen">
          <AdminSidebar />
          
          <main className="flex-1 overflow-y-auto bg-gray-100 md:p-2 lg:p-6">
          <Outlet />
          </main>
        </div>

        <Modal isOpen={modalCrear} style={customStyles}>
          <ModalCrearProducto />
        </Modal>

        <Modal isOpen={modalEditar} style={customStyles}>
            <ModalEditarProducto />
        </Modal>

        <Modal isOpen={modalCrearDepa} style={customStyles}>
          <ModalCrearDepa />
        </Modal>

        <Modal isOpen={modalEditarDepa} style={customStyles}>
          <ModalEditarDepa />
        </Modal>

        <ToastContainer />
      </>
        )}
    </>
  )
}
