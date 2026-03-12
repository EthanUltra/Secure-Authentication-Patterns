import { useState } from 'react'
import { useAuth, api } from '../store/auth.jsx'

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const [tab, setTab] = useState('profile')

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Header */}
      <header style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'0 2rem', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--bg)', fontWeight:800, fontSize:14 }}>SA</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, letterSpacing:'0.03em' }}>SECURE AUTH PATTERNS</div>
              <div style={{ fontFamily:'DM Mono', fontSize:10, color:'var(--ink3)' }}>Dashboard</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--ink)', color:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12 }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{user?.name}</div>
                <div style={{ fontFamily:'DM Mono', fontSize:10, color:'var(--ink3)' }}>{user?.role}</div>
              </div>
            </div>
            <button onClick={logout} style={{ background:'var(--accent-light)', border:'1px solid var(--accent)', color:'var(--accent)', padding:'6px 16px', fontFamily:'Syne', fontWeight:600, fontSize:13, cursor:'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem' }}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:24 }}>
          {['profile','token','security'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'12px 20px', background:'none', border:'none',
              borderBottom: tab===t ? '2px solid var(--ink)' : '2px solid transparent',
              fontFamily:'Syne', fontWeight: tab===t ? 700 : 500, fontSize:14,
              color: tab===t ? 'var(--ink)' : 'var(--ink3)', cursor:'pointer',
              textTransform:'capitalize'
            }}>{t}</button>
          ))}
        </div>

        {tab === 'profile'  && <ProfileTab user={user} />}
        {tab === 'token'    && <TokenTab token={token} />}
        {tab === 'security' && <SecurityTab />}
      </div>
    </div>
  )
}

function ProfileTab({ user }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
      <div style={{ background:'#fff', border:'1px solid var(--border)', padding:'2rem' }}>
        <Label>Profile</Label>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--ink)', color:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:22 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700 }}>{user?.name}</div>
            <div style={{ fontFamily:'DM Mono', fontSize:12, color:'var(--ink3)' }}>{user?.email}</div>
          </div>
        </div>
        <Fields items={[
          ['User ID', user?.id],
          ['Email', user?.email],
          ['Role', user?.role],
          ['Account status', user?.isLocked ? '🔒 Locked' : '✅ Active'],
          ['Failed logins', String(user?.failedLogins || 0)],
          ['Member since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'],
        ]} />
      </div>

      <div style={{ background:'#fff', border:'1px solid var(--border)', padding:'2rem' }}>
        <Label>Auth Architecture</Label>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[
            { icon:'🔐', title:'argon2id hashing', desc:'Memory-hard algorithm. Your password hash is stored, never the plain text.' },
            { icon:'🎫', title:'Short-lived access token', desc:'JWT expires in 15 minutes. Even if stolen, the window of attack is tiny.' },
            { icon:'♻️', title:'Rotating refresh tokens', desc:'7-day refresh token, rotated on every use. Reuse triggers full session revocation.' },
            { icon:'🍪', title:'httpOnly cookie', desc:'Refresh token lives in a Secure, SameSite=Strict cookie. JS cannot read it.' },
            { icon:'🔒', title:'Account lockout', desc:'After 5 failed logins the account is locked for 15 minutes.' },
          ].map(item => (
            <div key={item.title} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--bg2)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:2 }}>{item.title}</div>
                <div style={{ fontSize:12, color:'var(--ink2)', lineHeight:1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TokenTab({ token }) {
  const [decoded, setDecoded] = useState(null)
  const [copied, setCopied]   = useState(false)

  function decode() {
    try {
      const [h, p] = token.split('.')
      const parse = s => JSON.parse(atob(s.replace(/-/g,'+').replace(/_/g,'/')))
      setDecoded({ header: parse(h), payload: parse(p) })
    } catch (e) { console.error(e) }
  }

  function copy() {
    navigator.clipboard.writeText(token)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ background:'#fff', border:'1px solid var(--border)', padding:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <Label>Access Token (JWT)</Label>
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={decode}>Decode</Btn>
            <Btn onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</Btn>
          </div>
        </div>
        <div style={{ fontFamily:'DM Mono', fontSize:11, wordBreak:'break-all', lineHeight:1.8, background:'var(--bg2)', padding:16, borderRadius:4 }}>
          {token ? (
            <>
              <span style={{ color:'#e01e5a' }}>{token.split('.')[0]}</span>
              <span style={{ color:'var(--ink3)' }}>.</span>
              <span style={{ color:'var(--blue)' }}>{token.split('.')[1]}</span>
              <span style={{ color:'var(--ink3)' }}>.</span>
              <span style={{ color:'var(--green)' }}>{token.split('.')[2]}</span>
            </>
          ) : 'No token'}
        </div>

        {decoded && (
          <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <DecodedBox label="Header" data={decoded.header} color="#e01e5a" />
            <DecodedBox label="Payload" data={decoded.payload} color="var(--blue)" />
          </div>
        )}
      </div>

      <div style={{ background:'#fff', border:'1px solid var(--border)', padding:'2rem' }}>
        <Label>Token Lifecycle</Label>
        <div style={{ display:'flex', alignItems:'center', gap:0, overflowX:'auto', padding:'8px 0' }}>
          {[
            { label:'Login', sub:'email + password', color:'var(--ink)' },
            { label:'argon2id verify', sub:'timing-safe', color:'var(--accent)' },
            { label:'Issue tokens', sub:'access 15m + refresh 7d', color:'var(--ink)' },
            { label:'Return', sub:'access in body\nrefresh in cookie', color:'var(--green)' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ display:'flex', alignItems:'center' }}>
              <div style={{ textAlign:'center', minWidth:130 }}>
                <div style={{ background: s.color==='var(--green)' ? 'var(--green)' : s.color==='var(--accent)' ? 'var(--accent)' : 'var(--ink)', color:'#fff', padding:'8px 12px', fontSize:12, fontWeight:600 }}>{s.label}</div>
                <div style={{ fontFamily:'DM Mono', fontSize:10, color:'var(--ink3)', marginTop:4, whiteSpace:'pre' }}>{s.sub}</div>
              </div>
              {i < arr.length - 1 && <div style={{ color:'var(--border)', padding:'0 4px', fontSize:18, flexShrink:0 }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SecurityTab() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function testRefresh() {
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/auth/refresh')
      setResult({ ok: true, msg: 'Token rotated successfully. New access token issued, old refresh token revoked.', token: data.data.accessToken })
    } catch (e) {
      setResult({ ok: false, msg: e.response?.data?.message || e.message })
    } finally { setLoading(false) }
  }

  async function testMe() {
    setLoading(true); setResult(null)
    try {
      const { data } = await api.get('/auth/me')
      setResult({ ok: true, msg: 'Protected route accessed successfully.', data: data.data.user })
    } catch (e) {
      setResult({ ok: false, msg: e.response?.data?.message || e.message })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
      <div style={{ background:'#fff', border:'1px solid var(--border)', padding:'2rem' }}>
        <Label>Live Security Tests</Label>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <TestCard
            title="Test token rotation"
            desc="Call POST /auth/refresh — your refresh token is rotated. The old one is immediately revoked."
            onClick={testRefresh} loading={loading}
          />
          <TestCard
            title="Test protected route"
            desc="Call GET /auth/me with your access token. Server validates the JWT and returns your profile."
            onClick={testMe} loading={loading}
          />
        </div>
        {result && (
          <div style={{ marginTop:16, padding:'12px 16px', background: result.ok ? 'var(--green-light)' : 'var(--accent-light)', border:`1px solid ${result.ok ? 'var(--green)' : 'var(--accent)'}` }}>
            <div style={{ fontWeight:700, color: result.ok ? 'var(--green)' : 'var(--accent)', marginBottom:6, fontSize:13 }}>
              {result.ok ? '✓ SUCCESS' : '✗ ERROR'}
            </div>
            <div style={{ fontSize:12, color:'var(--ink2)', lineHeight:1.5 }}>{result.msg}</div>
            {result.token && <div style={{ fontFamily:'DM Mono', fontSize:10, marginTop:8, wordBreak:'break-all', color:'var(--ink3)' }}>{result.token.slice(0,60)}...</div>}
          </div>
        )}
      </div>

      <div style={{ background:'#fff', border:'1px solid var(--border)', padding:'2rem' }}>
        <Label>Security Properties</Label>
        {[
          { label:'Timing attack resistance', status:'active', detail:'Dummy hash verify prevents username enumeration' },
          { label:'Token reuse detection', status:'active', detail:'Replaying a revoked token revokes all sessions' },
          { label:'XSS token theft prevention', status:'active', detail:'Refresh token in httpOnly cookie — JS cannot read it' },
          { label:'CSRF protection', status:'active', detail:'SameSite=Strict cookie attribute' },
          { label:'Account lockout', status:'active', detail:'5 consecutive failures → 15 min lock' },
          { label:'Rate limiting', status:'active', detail:'Login: 10 req/15min · Register: 5 req/hour' },
        ].map(p => (
          <div key={p.label} style={{ padding:'10px 0', borderBottom:'1px solid var(--bg2)', display:'flex', gap:10 }}>
            <span style={{ color:'var(--green)', fontWeight:700, flexShrink:0 }}>✓</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>{p.label}</div>
              <div style={{ fontSize:11, color:'var(--ink3)', fontFamily:'DM Mono', marginTop:2 }}>{p.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TestCard({ title, desc, onClick, loading }) {
  return (
    <div style={{ padding:'14px', border:'1px solid var(--border)', background:'var(--bg)' }}>
      <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{title}</div>
      <div style={{ fontSize:12, color:'var(--ink2)', lineHeight:1.5, marginBottom:12 }}>{desc}</div>
      <button onClick={onClick} disabled={loading} style={{ background:'var(--ink)', color:'var(--bg)', border:'none', padding:'6px 16px', fontFamily:'Syne', fontWeight:600, fontSize:12, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Running...' : 'Run test →'}
      </button>
    </div>
  )
}

function DecodedBox({ label, data, color }) {
  return (
    <div>
      <div style={{ fontFamily:'DM Mono', fontSize:10, color, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>{label}</div>
      <div style={{ background:'var(--bg2)', padding:'10px', borderLeft:`3px solid ${color}`, fontFamily:'DM Mono', fontSize:11, lineHeight:1.7 }}>
        {Object.entries(data).map(([k,v]) => (
          <div key={k}>
            <span style={{ color:'var(--ink3)' }}>{k}: </span>
            <span style={{ color:'var(--ink)' }}>{typeof v === 'number' && (k==='exp'||k==='iat') ? `${v} (${new Date(v*1000).toLocaleTimeString()})` : JSON.stringify(v)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Fields({ items }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {items.map(([k,v]) => (
        <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--bg2)' }}>
          <span style={{ fontFamily:'DM Mono', fontSize:11, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{k}</span>
          <span style={{ fontFamily:'DM Mono', fontSize:12, color:'var(--ink)', maxWidth:'60%', textAlign:'right', wordBreak:'break-all' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--accent)', marginBottom:16 }}>{children}</div>
}

function Btn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--ink2)', padding:'5px 14px', fontFamily:'Syne', fontWeight:600, fontSize:12, cursor:'pointer' }}>
      {children}
    </button>
  )
}
