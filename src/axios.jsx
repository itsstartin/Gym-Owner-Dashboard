import axios from 'axios'


// const baseURL = 'http://127.0.0.1:8000/'
const baseURL = import.meta.env.VITE_API_URL

const instance = axios.create({
    baseURL: baseURL,
});

// Attach the interceptor to the axios *instance* so that
// all requests made via `import axios from '../axios'`
// automatically include the Authorization header.
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Remove token automatically if backend says it's invalid/expired
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default instance