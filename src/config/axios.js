import axios from "axios";

const clienteAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Accept' : 'application/json',
        'X-Requested-With' : 'XMLHttpRequest'
    },
    withCredentials: true

})

export default clienteAxios;

clienteAxios.interceptors.request.use(config => {
    if (!navigator.onLine) {
        return Promise.reject({ isOffline: true });
    }
    return config;
});
