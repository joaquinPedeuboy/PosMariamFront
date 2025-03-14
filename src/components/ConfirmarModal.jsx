import Modal from "react-modal";
import { useState, useEffect } from "react";

export default function ConfirmarModal({ producto, onConfirm, onClose }) {
  const [isOpen, setIsOpen] = useState(false);

  // Cuando 'producto' cambia, actualizar el estado 'isOpen'
  useEffect(() => {
    setIsOpen(!!producto);
  }, [producto]);

  if (!producto) {
    return null; // Si no hay producto, no renderiza el modal
  }

  const modalStyles = {
    content: {
      padding: '30px',
      borderRadius: '8px',
      maxWidth: '700px',
      margin: 'auto',
      backgroundColor: '#fff',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      maxHeight: '200px', // Limité la altura del modal
      overflow: 'auto', // Si el contenido es más largo, se agregará scroll
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    },
  };

  const buttonStyles = {
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    cursor: 'pointer',
    marginRight: '10px',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease', 
  };

  const buttonOutlineStyles = {
    backgroundColor: 'transparent',
    color: '#333',
    border: '1px solid #ccc',
    padding: '10px 20px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease',
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <h2 className="text-2xl font-bold">Confirmar Venta</h2>
      <p className="mt-4">
        El producto <strong>{producto?.nombre}</strong> está en oferta. ¿Deseas
        venderlo en oferta?
      </p>
      <div className="mt-4">
        <button
          style={buttonStyles}
          onClick={() => {
            onConfirm(true);
            onClose();
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'} // Hover effect
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'} // Reset hover
        >
          Sí, vender en oferta
        </button>
        <button
          style={buttonOutlineStyles}
          onClick={() => {
            onConfirm(false);
            onClose();
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'} // Hover effect
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} // Reset hover
        >
          No, vender precio normal
        </button>
      </div>
    </Modal>
  );
}
