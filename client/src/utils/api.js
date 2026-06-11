import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: false,
})

// Attach Clerk token to every request
api.interceptors.request.use(async (config) => {
  try {
    // Clerk's global getToken() is available on window.__clerk
    if (window.Clerk?.session) {
      const token = await window.Clerk.session.getToken()
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch (_) {}
  return config
})

export default api
