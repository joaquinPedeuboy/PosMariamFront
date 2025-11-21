import { useState, useEffect } from "react";
import { mutate } from "swr";

export default function useRevalidateStatus() {
    const [isRevalidating, setIsRevalidating] = useState(false);

    useEffect(() => {
        const start = () => setIsRevalidating(true);
        const end = () => setIsRevalidating(false);

        window.addEventListener("swr:revalidate-start", start);
        window.addEventListener("swr:revalidate-end", end);

        return () => {
            window.removeEventListener("swr:revalidate-start", start);
            window.removeEventListener("swr:revalidate-end", end);
        };
    }, []);

    return isRevalidating;
}
