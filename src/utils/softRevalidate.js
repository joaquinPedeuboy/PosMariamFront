import { mutate } from "swr";

export const softRevalidate = (key) => {
    window.dispatchEvent(new Event("swr:revalidate-start"));

    return mutate(key).finally(() => {
        window.dispatchEvent(new Event("swr:revalidate-end"));
    });
};
