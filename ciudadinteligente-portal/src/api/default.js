import axios from 'axios';

export default function runDefaultApi({ logout }) {
  axios.defaults.baseURL = import.meta.env.VITE_URL_API
  axios.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
  });
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );
}