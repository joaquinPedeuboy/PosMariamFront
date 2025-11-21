import { mutate } from "swr";
import clienteAxios from "../config/axios";

export const softRevalidate = async (key) => {
    window.dispatchEvent(new Event("swr:revalidate-start"));

    try {
        await mutate(
            key,
            async (prev) => {
                // Si no hay cache previa, no hacer nada
                if (!prev) return prev;  

                const { data } = await clienteAxios.get(key);
                return data;
            },
            { revalidate: false } // No dispares el fetcher original de SWR
        );
    } finally {
        window.dispatchEvent(new Event("swr:revalidate-end"));
    }
};
