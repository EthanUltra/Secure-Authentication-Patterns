export default function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex' }}>
      {/* Left panel */}
      <div style={{ flex:1, background:'var(--ink)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'3rem', minHeight:'100vh' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, color:'var(--ink)' }}>SA</div>
          <div style={{ color:'var(--bg)', fontWeight:700, fontSize:14, letterSpacing:'0.05em' }}>SECURE AUTH PATTERNS</div>
        </div>
        <div>
          <div style={{ color:'rgba(255,255,255,0.3)', fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.2em', marginBottom:16 }}>// REFERENCE IMPLEMENTATION</div>
          <h1 style={{ color:'#fff', fontSize:'clamp(2rem,4vw,3rem)', fontWeight:800, lineHeight:1.1, letterSpacing:'-0.03em', margin:'0 0 1rem' }}>
            Production-grade<br />authentication<br /><span style={{ color:'rgba(255,255,255,0.4)' }}>patterns.</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.7, maxWidth:400 }}>
            argon2id · JWT · Rotating refresh tokens · httpOnly cookies · Rate limiting · Account lockout
          </p>
        </div>
        <div style={{ fontFamily:'DM Mono', fontSize:11, color:'rgba(255,255,255,0.2)' }}>
          Node.js · Express · PostgreSQL · Prisma
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width:'min(480px, 50vw)', padding:'3rem', display:'flex', flexDirection:'column', justifyContent:'center', overflowY:'auto' }}>
        <div style={{ marginBottom:32 }}>
          <h2 style={{ fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:800, letterSpacing:'-0.02em', margin:'0 0 8px' }}>{title}</h2>
          <p style={{ color:'var(--ink3)', margin:0, fontSize:14 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
