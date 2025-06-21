import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
        'X-MANDAI-USER-ID': '3f0a1c2d4b5e6f7a8b9c0d1e2f3a4b5c',
    },
});

export default api;