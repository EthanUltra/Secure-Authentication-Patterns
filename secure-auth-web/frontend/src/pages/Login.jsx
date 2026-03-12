import { useState } from 'react'
import { useAuth } from '../store/auth.jsx'
import AuthCard from '../components/AuthCard.jsx'

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Welcome back." subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" />

        {error && <ErrorBox msg={error} />}

        <button type="submit" disabled={loading} style={primaryBtn(loading)}>
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>

        <div style={{ textAlign:'center', fontSize:13, color:'var(--ink3)' }}>
          No account?{' '}
          <button type="button" onClick={onSwitch} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontWeight:600, fontFamily:'Syne' }}>
            Create one
          </button>
        </div>
      </form>

      <SecurityNote items={[
        'argon2id password hashing',
        '15-minute access tokens',
        'Rotating refresh tokens',
        'Account lockout after 5 failures',
      ]} />
    </AuthCard>
  )
}

export function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:12, fontWeight:600, color:'var(--ink2)', fontFamily:'DM Mono', letterSpacing:'0.05em' }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder} required
        onChange={e => onChange(e.target.value)}
        style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          padding:'10px 14px', fontSize:14, color:'var(--ink)', outline:'none',
          transition:'border-color 0.2s', fontFamily:'DM Mono'
        }}
        onFocus={e => e.target.style.borderColor='var(--ink)'}
        onBlur={e => e.target.style.borderColor='var(--border)'}
      />
    </div>
  )
}

export function ErrorBox({ msg }) {
  return (
    <div style={{ background:'var(--accent-light)', border:'1px solid var(--accent)', color:'var(--accent)', padding:'10px 14px', fontSize:13, lineHeight:1.4 }}>
      {msg}
    </div>
  )
}

export function SecurityNote({ items }) {
  return (
    <div style={{ marginTop:24, padding:'16px', background:'var(--bg2)', border:'1px solid var(--border)' }}>
      <div style={{ fontFamily:'DM Mono', fontSize:10, color:'var(--ink3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Security features active</div>
      {items.map(item => (
        <div key={item} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0', fontSize:12, color:'var(--ink2)' }}>
          <span style={{ color:'var(--green)', fontWeight:700 }}>✓</span> {item}
        </div>
      ))}
    </div>
  )
}

export function primaryBtn(loading) {
  return {
    background: loading ? 'var(--bg3)' : 'var(--ink)',
    color: loading ? 'var(--ink3)' : 'var(--bg)',
    border: 'none', padding:'12px 24px',
    fontFamily:'Syne', fontSize:14, fontWeight:700,
    cursor: loading ? 'not-allowed' : 'pointer',
    letterSpacing:'0.03em', transition:'background 0.2s'
  }
}
