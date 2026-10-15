import axios from 'axios'
import { store } from './features/store'
import { dataChanged } from './features/dataVersionSlice'


// const baseURL = 'http://127.0.0.1:8000/'
const baseURL = import.meta.env.VITE_API_URL

const instance = axios.create({
    baseURL: baseURL,
});

// Navigation in the workspace repeatedly asks for the same read-only data.
// Keep it in memory briefly so a remounted component never has to wait for a
// network round trip. Mutations clear the cache, so the next visit gets fresh
// data. This cache is per browser tab and is never written to localStorage.
const GET_CACHE_TTL_MS = 2 * 60 * 1000
const MAX_CACHED_RESPONSES = 100
const responseCache = new Map()

const canCache = (config) => {
  const url = String(config.url || '')
  return config.method?.toLowerCase() === 'get'
    && !url.includes('addnotification')
    && !url.includes('member-access/')
}

const cacheKeyFor = (config) => JSON.stringify({
  token: localStorage.getItem('token') || '',
  url: config.url,
  params: config.params || {},
})

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

    if (canCache(config)) {
      const cacheKey = cacheKeyFor(config)
      const cached = responseCache.get(cacheKey)

      if (cached && Date.now() - cached.createdAt < GET_CACHE_TTL_MS) {
        // Supplying an adapter lets Axios resolve from memory without opening
        // another HTTP request, while preserving the normal Axios response.
        config.adapter = () => Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: { ...cached.headers, 'x-gym-cache': 'HIT' },
          config,
          request: null,
        })
      } else {
        responseCache.delete(cacheKey)
        config.__cacheKey = cacheKey
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Remove token automatically if backend says it's invalid/expired
instance.interceptors.response.use(
  (response) => {
    if (response.config.method?.toLowerCase() !== 'get') {
      // A successful write can affect several dashboard views, so a full
      // invalidation is safer than serving stale member, payment, or summary
      // data. Do this after the API has committed the write.
      responseCache.clear()
      store.dispatch(dataChanged())
    }

    if (response.config.__cacheKey) {
      responseCache.set(response.config.__cacheKey, {
        createdAt: Date.now(),
        data: response.data,
        headers: response.headers,
      })

      if (responseCache.size > MAX_CACHED_RESPONSES) {
        responseCache.delete(responseCache.keys().next().value)
      }
    }
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default instance
