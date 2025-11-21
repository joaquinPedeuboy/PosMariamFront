import useOnlineStatus from "../hooks/useOnlineStatus";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineBanner() {
    const online = useOnlineStatus();

    return (
        <AnimatePresence>
            {!online && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 shadow-lg"
                >
                    <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10.29 3.86L1.82 12.34a1 1 0 00.71 1.7h18.94a1 1 0 00.71-1.7L13.71 3.86a1 1 0 00-1.42 0zM12 9v4"
                            />
                        </svg>

                        <span className="text-sm sm:text-base font-medium">
                            ❌ Sin conexión — revisa tu conexión a internet.
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
