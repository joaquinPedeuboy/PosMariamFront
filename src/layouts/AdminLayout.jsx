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

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

Modal.setAppElement('#root');

export default function AdminLayout() {

  const { modalEditar, modalCrear, modalCrearDepa } = useQuiosco();
  const { user, error, isLoading } = useAuth({middleware: 'admin'});
  const [loading, setLoading] = useState(true);

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
          <div className="flex justify-center items-center max-h-screen">
          <RotatingLines
            height={200}
            width={200}
            strokeColor="#9700c0"
            ariaLabel="rotating-lines-loading"
            />
          </div>
        ) : (
    
      <>
        <div className="md:flex">
          <AdminSidebar />
          
          <main className="flex-1 h-screen overflow-y-scroll bg-gray-100 p-10">
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

        <ToastContainer />
      </>
        )}
    </>
  )
}
