import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../slices/authSlice';

const apiClient = axios.create({
  baseURL: 'http://localhost:5245/api/', // Adjust base URL as needed
});

apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default apiClient;