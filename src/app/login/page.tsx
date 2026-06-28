'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const DEMOS = [
  { id:'lender_koho', name:'XYZ Financial', plan:'Growth Plan', color:'#2563eb', logo:'X' },
  { id:'lender_borrowell', name:'Acme Lending', plan:'Starter Plan', color:'#059669', logo:'A' },
  { id:'lender_rbc', name:'Example Bank Newcomer', plan:'Enterprise Plan', color:'#dc2626', logo:'E' },
  { id:'trbo_admin', name:'trbo Admin', plan:'Super Admin', color:'#455c62', logo:'T' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // Clear any demo session so real auth takes over
      localStorage.removeItem('trbo_demo_lender')
      window.location.href = '/portal.html'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      setLoading(false)
    }
  }

  function loginAsDemo(id: string) {
    localStorage.setItem('trbo_demo_lender', id)
    window.location.href = '/portal.html'
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',padding:32,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:'100%',maxWidth:440}}>
        <Link href="/" style={{display:'block',textAlign:'center',marginBottom:32,textDecoration:'none'}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:40,color:'#455c62'}}>trbo.</div>
          <div style={{fontSize:11,letterSpacing:'0.3em',color:'#94a3b8',textTransform:'uppercase',marginTop:4}}>Financial</div>
        </Link>

        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:16,padding:32,boxShadow:'0 4px 20px rgba(0,0,0,0.06)',marginBottom:16}}>
          <h1 style={{fontSize:20,fontWeight:600,color:'#0f172a',marginBottom:24}}>Sign in to your account</h1>
          {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',fontSize:13,padding:'10px 14px',borderRadius:8,marginBottom:16}}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required
                style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}}/>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}}/>
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'12px',background:'#455c62',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:600,cursor:'pointer',opacity:loading?0.6:1}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{textAlign:'center',fontSize:13,color:'#64748b',marginTop:16}}>
            No account? <Link href="/signup" style={{color:'#455c62',fontWeight:500}}>Create one →</Link>
          </p>
        </div>

        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:16,padding:20,boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12}}>Demo Accounts</div>
          {DEMOS.map(d => (
            <button key={d.id} onClick={()=>loginAsDemo(d.id)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'10px 12px',border:'1px solid #f1f5f9',borderRadius:10,background:'#f8fafc',cursor:'pointer',fontFamily:'inherit',marginBottom:8,textAlign:'left'}}>
              <div style={{width:32,height:32,borderRadius:8,background:d.color,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,flexShrink:0}}>{d.logo}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:'#0f172a'}}>{d.name}</div>
                <div style={{fontSize:11,color:'#94a3b8'}}>{d.plan}</div>
              </div>
              <span style={{fontSize:12,color:'#455c62',fontWeight:500}}>Sign in →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
