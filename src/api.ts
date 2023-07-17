import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  timeout: 500000, // Defina um timeout adequado, se necessário
});

export default api;