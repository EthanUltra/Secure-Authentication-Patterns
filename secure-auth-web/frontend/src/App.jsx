import { useState } from 'react'
import { AuthProvider, useAuth } from './store/auth.jsx'
import LoginPage    from './pages/Login.jsx'
import RegisterPage from './pages/Register.jsx'
import Dashboard    from './pages/Dashboard.jsx'

function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage]   = useState('login') // login | register

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'2px solid var(--border)', borderTop:'2px solid var(--accent)', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 1s linear infinite' }} />
        <div style={{ fontFamily:'DM Mono', fontSize:12, color:'var(--ink3)' }}>Loading...</div>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )

  if (user) return <Dashboard />

  return page === 'login'
    ? <LoginPage onSwitch={() => setPage('register')} />
    : <RegisterPage onSwitch={() => setPage('login')} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
