'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Lender } from '@/lib/supabase'

const DEMO_LENDERS: Record<string, Lender> = {
  lender_koho: { id:'lender_koho', company_name:'XYZ Financial', plan:'growth', primary_color:'#2563eb', affiliate_code:'koho_canada_q2', min_score:650, max_risk:'Medium', corridors:[] },
  lender_borrowell: { id:'lender_borrowell', company_name:'Maple Lending', plan:'starter', primary_color:'#059669', affiliate_code:'', min_score:620, max_risk:'High', corridors:[] },
  lender_rbc: { id:'lender_rbc', company_name:'Horizon Credit', plan:'enterprise', primary_color:'#dc2626', affiliate_code:'', min_score:720, max_risk:'Low', corridors:[] },
  trbo_admin: { id:'trbo_admin', company_name:'trbo Admin', plan:'admin', primary_color:'#455c62', affiliate_code:'', min_score:0, max_risk:'High', corridors:[] },
}

export default function PortalSelector() {
  const router = useRouter()
  const [lender, setLender] = useState<Lender|null>(null)

  useEffect(() => {
    const demoId = localStorage.getItem('trbo_demo_lender')
    if (demoId) { setLender(DEMO_LENDERS[demoId]); return }
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('users').select('*, lenders(*)').eq('id', user.id).single()
      if (data?.lenders) setLender(data.lenders as Lender)
      else router.push('/login')
    })
  }, [router])

  if (!lender) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:32,height:32,border:'2px solid #e2e8f0',borderTopColor:'#455c62',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',padding:32,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:'100%',maxWidth:600}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:36,color:'#455c62',marginBottom:8}}>trbo.</div>
          <div style={{fontSize:20,fontWeight:600,color:'#0f172a',marginBottom:4}}>Welcome back, {lender.company_name}</div>
          <div style={{fontSize:14,color:'#64748b'}}>Where would you like to go?</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
          <Link href="/lender/dashboard" style={{background:'white',border:'2px solid #e2e8f0',borderRadius:20,padding:'32px 24px',textAlign:'center',textDecoration:'none',display:'block'}}>
            <div style={{width:64,height:64,background:'#455c62',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:28}}>📊</div>
            <div style={{fontSize:16,fontWeight:700,color:'#0f172a',marginBottom:8}}>Lender Portal</div>
            <div style={{fontSize:13,color:'#64748b',lineHeight:1.6}}>Review borrowers, run credit checks, manage your pipeline</div>
            <div style={{marginTop:16,fontSize:13,fontWeight:600,color:'#455c62'}}>Access Portal →</div>
          </Link>
          <Link href="/apply" style={{background:'white',border:'2px solid #e2e8f0',borderRadius:20,padding:'32px 24px',textAlign:'center',textDecoration:'none',display:'block'}}>
            <div style={{width:64,height:64,background:'#f0fdf4',border:'2px solid #bbf7d0',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:28}}>👤</div>
            <div style={{fontSize:16,fontWeight:700,color:'#0f172a',marginBottom:8}}>Borrower Portal</div>
            <div style={{fontSize:13,color:'#64748b',lineHeight:1.6}}>Upload documents, generate your Global Financial Passport</div>
            <div style={{marginTop:16,fontSize:13,fontWeight:600,color:'#059669'}}>Get Started →</div>
          </Link>
        </div>
        <div style={{textAlign:'center'}}>
          <button onClick={() => { localStorage.removeItem('trbo_demo_lender'); router.push('/') }}
            style={{background:'none',border:'none',color:'#94a3b8',fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>← Back to home</button>
        </div>
      </div>
    </div>
  )
}
