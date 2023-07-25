import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  timeout: 5000000, // Defina um timeout adequado, se necessário
});

export default api;