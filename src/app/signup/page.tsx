'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [step, setStep] = useState<'account'|'schedule'>('account')
  const [meeting, setMeeting] = useState({ date:'', time:'10:00 AM' })
  const [form, setForm] = useState({ firstName:'', lastName:'', company:'', email:'', password:'', type:'Fintech Lender' })

  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setForm(f => ({...f,[k]:e.target.value})) }
  function setMeetingField(k: 'date'|'time') { return (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setMeeting(m => ({...m,[k]:e.target.value})) }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (step === 'account') {
      if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
      setError('')
      setStep('schedule')
      return
    }
    if (!meeting.date || !meeting.time) { setError('Please choose a date and time with our team'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); setStep('account'); return }
    setLoading(true); setError('')
    try {
      const { data, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
      if (authErr) throw authErr
      if (!data.user) throw new Error('No user returned')

      const code = form.company.toLowerCase().replace(/\s+/g,'_') + '_' + Date.now().toString(36)
      const { data: lender, error: lErr } = await supabase.from('lenders').insert({
        company_name: form.company,
        plan: 'starter',
        affiliate_code: code,
        primary_color: '#455c62',
        min_score: 620,
        max_risk: 'Medium',
      }).select().single()
      if (lErr) throw lErr

      const { error: uErr } = await supabase.from('users').insert({
        id: data.user.id,
        email: form.email,
        name: `${form.firstName} ${form.lastName}`.trim(),
        lender_id: lender.id,
        role: 'admin',
      })
      if (uErr) console.error('User profile error:', uErr)

      localStorage.setItem('trbo_onboarding_meeting', JSON.stringify({ ...meeting, company: form.company, email: form.email }))
      localStorage.removeItem('trbo_demo_lender')
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      setLoading(false)
    }
  }

  if (done) return (
    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',padding:32,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:'center',maxWidth:430}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:40,color:'#455c62',marginBottom:8}}>trbo.</div>
        <div style={{width:64,height:64,background:'#f0fdf4',border:'2px solid #bbf7d0',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',fontSize:28}}>✓</div>
        <h1 style={{fontSize:22,fontWeight:600,color:'#0f172a',marginBottom:8}}>You&apos;re on the calendar</h1>
        <p style={{color:'#64748b',fontSize:14,marginBottom:24,lineHeight:1.6}}>We reserved <strong>{meeting.date}</strong> at <strong>{meeting.time}</strong> for {form.company || 'your team'}. We also sent account confirmation details to <strong>{form.email}</strong>.</p>
        <Link href="/login" style={{display:'inline-block',background:'#455c62',color:'white',padding:'12px 32px',borderRadius:10,fontSize:14,fontWeight:600,textDecoration:'none'}}>Go to Sign In →</Link>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',padding:32,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:'100%',maxWidth:480}}>
        <Link href="/" style={{display:'block',textAlign:'center',marginBottom:32,textDecoration:'none'}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:40,color:'#455c62'}}>trbo.</div>
          <div style={{fontSize:11,letterSpacing:'0.3em',color:'#94a3b8',textTransform:'uppercase',marginTop:4}}>Financial</div>
        </Link>
        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:16,padding:32,boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            <div style={{height:4,flex:1,borderRadius:999,background:'#455c62'}} />
            <div style={{height:4,flex:1,borderRadius:999,background:step==='schedule'?'#455c62':'#e2e8f0'}} />
          </div>
          <h1 style={{fontSize:20,fontWeight:600,color:'#0f172a',marginBottom:8}}>{step === 'account' ? 'Create your account' : 'Schedule time with our team'}</h1>
          <p style={{fontSize:13,color:'#64748b',lineHeight:1.6,marginBottom:24}}>{step === 'account' ? 'Tell us who should own your trbo workspace.' : 'Pick a time for onboarding, pricing, and implementation planning.'}</p>
          {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',fontSize:13,padding:'10px 14px',borderRadius:8,marginBottom:16}}>{error}</div>}
          <form onSubmit={handleSignup}>
            {step === 'account' ? <>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div><label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>First Name</label><input value={form.firstName} onChange={set('firstName')} placeholder="Sarah" required style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}}/></div>
                <div><label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Last Name</label><input value={form.lastName} onChange={set('lastName')} placeholder="Chen" required style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}}/></div>
              </div>
              <div style={{marginBottom:16}}><label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Company Name</label><input value={form.company} onChange={set('company')} placeholder="XYZ Financial" required style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}}/></div>
              <div style={{marginBottom:16}}><label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Company Type</label><select value={form.type} onChange={set('type')} style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a'}}>{['Fintech Lender','Bank','Credit Union','Mortgage Broker','Neo-Bank','Other'].map(t => <option key={t}>{t}</option>)}</select></div>
              <div style={{marginBottom:16}}><label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Work Email</label><input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" required style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}}/></div>
              <div style={{marginBottom:24}}><label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Password</label><input type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}}/></div>
            </> : <>
              <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:16,marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,color:'#455c62',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Onboarding calendar</div>
                <input type="date" value={meeting.date} onChange={setMeetingField('date')} required style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'white',color:'#0f172a',boxSizing:'border-box',marginBottom:12}} />
                <select value={meeting.time} onChange={setMeetingField('time')} style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'white',color:'#0f172a'}}>{['10:00 AM','11:30 AM','1:00 PM','2:30 PM','4:00 PM'].map(t => <option key={t}>{t}</option>)}</select>
              </div>
              <button type="button" onClick={() => setStep('account')} style={{width:'100%',padding:'10px',background:'transparent',color:'#64748b',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',marginBottom:12}}>← Back</button>
            </>}
            <button type="submit" disabled={loading} style={{width:'100%',padding:'12px',background:'#455c62',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:600,cursor:'pointer',opacity:loading?0.6:1,fontFamily:'inherit'}}>{loading ? 'Scheduling...' : step === 'account' ? 'Next →' : 'Schedule time →'}</button>
            <p style={{textAlign:'center',fontSize:13,color:'#64748b',marginTop:16}}>Already have an account? <Link href="/login" style={{color:'#455c62',fontWeight:500}}>Sign in →</Link></p>
          </form>
        </div>
      </div>
    </div>
  )
}
