import { useState } from 'react'
import { useAuth } from '../store/auth.jsx'
import AuthCard from '../components/AuthCard.jsx'
import { Field, ErrorBox, SecurityNote, primaryBtn } from './Login.jsx'

export default function RegisterPage({ onSwitch }) {
  const { register, login } = useAuth()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)

  const strength = getStrength(password)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await register(email, password, name)
      setSuccess(true)
      // Auto-login after registration
      setTimeout(() => login(email, password), 800)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <AuthCard title="Account created!" subtitle="Signing you in...">
      <div style={{ textAlign:'center', padding:'2rem 0' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
        <div style={{ color:'var(--green)', fontFamily:'DM Mono', fontSize:13 }}>Redirecting to dashboard...</div>
      </div>
    </AuthCard>
  )

  return (
    <AuthCard title="Create account." subtitle="Join the secure auth demo">
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Field label="Full name" type="text" value={name} onChange={setName} placeholder="Your name" />
        <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />

        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'var(--ink2)', fontFamily:'DM Mono', letterSpacing:'0.05em' }}>Password</label>
          <input
            type="password" value={password} placeholder="Min 8 chars, 1 uppercase, 1 number" required
            onChange={e => setPassword(e.target.value)}
            style={{ background:'var(--bg2)', border:'1px solid var(--border)', padding:'10px 14px', fontSize:14, color:'var(--ink)', outline:'none', fontFamily:'DM Mono' }}
            onFocus={e => e.target.style.borderColor='var(--ink)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
          {password && <StrengthBar strength={strength} />}
        </div>

        {error && <ErrorBox msg={error} />}

        <button type="submit" disabled={loading || strength.score < 2} style={primaryBtn(loading || strength.score < 2)}>
          {loading ? 'Creating account...' : 'Create account →'}
        </button>

        <div style={{ textAlign:'center', fontSize:13, color:'var(--ink3)' }}>
          Already have an account?{' '}
          <button type="button" onClick={onSwitch} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontWeight:600, fontFamily:'Syne' }}>
            Sign in
          </button>
        </div>
      </form>

      <SecurityNote items={[
        'argon2id hashing (memory-hard)',
        'Unique salt per password',
        'Zod schema validation',
        'Username enumeration prevention',
      ]} />
    </AuthCard>
  )
}

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'var(--border)' }
  let score = 0
  if (pw.length >= 8)    score++
  if (/[A-Z]/.test(pw))  score++
  if (/[0-9]/.test(pw))  score++
  if (/[^a-z0-9]/i.test(pw)) score++
  if (pw.length >= 12)   score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const colors = ['var(--border)', 'var(--accent)', 'orange', 'var(--blue)', 'var(--green)', 'var(--green)']
  return { score, label: labels[score] || 'Weak', color: colors[score] || 'var(--accent)' }
}

function StrengthBar({ strength }) {
  return (
    <div>
      <div style={{ display:'flex', gap:3, marginBottom:4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1, height:3, background: i <= strength.score ? strength.color : 'var(--bg3)', transition:'background 0.3s' }} />
        ))}
      </div>
      <div style={{ fontFamily:'DM Mono', fontSize:10, color: strength.color }}>{strength.label}</div>
    </div>
  )
}
