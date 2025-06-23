import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
        'X-MANDAI-USER-ID': process.env.REACT_APP_USER_ID ?? 'test-uuid',
    },
});

export default api;