import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnlineSuccessBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handler = () => {
            setShow(true);
            setTimeout(() => setShow(false), 2500);
        };

        window.addEventListener("online", handler);
        return () => window.removeEventListener("online", handler);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-0 left-0 right-0 bg-green-600 text-white text-center py-2 z-40 shadow"
                >
                    🔌 Conectado — Vuelves a tener conexión ✔
                </motion.div>
            )}
        </AnimatePresence>
    );
}