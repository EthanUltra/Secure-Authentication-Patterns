import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// Axios instance with auth header
export const api = axios.create({ baseURL: '/api', withCredentials: true })

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => sessionStorage.getItem('accessToken'))
  const [loading, setLoading] = useState(true)

  // Attach token to every request
  useEffect(() => {
    const id = api.interceptors.request.use(cfg => {
      if (token) cfg.headers.Authorization = 'Bearer ' + token
      return cfg
    })
    return () => api.interceptors.request.eject(id)
  }, [token])

  // Auto-refresh on 401
  useEffect(() => {
    const id = api.interceptors.response.use(
      r => r,
      async err => {
        if (err.response?.status === 401 && !err.config._retry) {
          err.config._retry = true
          try {
            const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
            const newToken = data.data.accessToken
            setToken(newToken)
            sessionStorage.setItem('accessToken', newToken)
            err.config.headers.Authorization = 'Bearer ' + newToken
            return api(err.config)
          } catch {
            setUser(null); setToken(null)
            sessionStorage.removeItem('accessToken')
          }
        }
        return Promise.reject(err)
      }
    )
    return () => api.interceptors.response.eject(id)
  }, [])

  // Fetch user on mount if token exists
  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(r => setUser(r.data.data.user))
      .catch(() => { setToken(null); sessionStorage.removeItem('accessToken') })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    const t = data.data.accessToken
    setToken(t)
    sessionStorage.setItem('accessToken', t)
    const me = await api.get('/auth/me', { headers: { Authorization: 'Bearer ' + t } })
    setUser(me.data.data.user)
    return me.data.data.user
  }, [])

  const register = useCallback(async (email, password, name) => {
    const { data } = await api.post('/auth/register', { email, password, name })
    return data.data.user
  }, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {})
    setUser(null); setToken(null)
    sessionStorage.removeItem('accessToken')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
