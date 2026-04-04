'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAV = [
  { label: 'Dashboard', href: '/lender/dashboard', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={18} height={18}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: 'Borrowers', href: '/lender/borrowers', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={18} height={18}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Run Check', href: '/lender/run-check', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={18} height={18}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { label: 'Analytics', href: '/lender/analytics', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={18} height={18}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { label: 'Affiliate Links', href: '/lender/affiliate', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={18} height={18}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
  { label: 'Pricing Engine', href: '/lender/pricing', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={18} height={18}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { label: 'Webhooks', href: '/lender/webhooks', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={18} height={18}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg> },
  { label: 'Team', href: '/lender/team', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={18} height={18}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Settings', href: '/lender/settings', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={18} height={18}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

type Props = {
  lenderName: string
  lenderColor: string
  isAdmin: boolean
  children: React.ReactNode
}

export default function LenderLayout({ lenderName, lenderColor, isAdmin, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    localStorage.removeItem('trbo_demo_lender')
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',fontFamily:"'DM Sans',sans-serif"}}>
      {/* Sidebar */}
      <div style={{width:240,background:'#455c62',borderRight:'1px solid #344a50',flexShrink:0,display:'flex',flexDirection:'column',height:'100vh',overflowY:'auto'}}>
        {/* Header */}
        <div style={{padding:'1.5rem',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{fontFamily:"'Segoe UI','Segoe',Georgia,serif",fontSize:'2rem',fontWeight:400,color:'#ffffff',letterSpacing:'-0.01em',lineHeight:1}}>trbo.</div>
          <div style={{fontSize:'0.58rem',letterSpacing:'0.28em',color:'rgba(255,255,255,0.5)',textTransform:'uppercase',marginTop:'0.3rem'}}>Financial</div>
        </div>

        {/* Lender badge */}
        <div style={{padding:'0.5rem 0.75rem',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{width:'100%',display:'flex',alignItems:'center',gap:'0.6rem',background:'rgba(255,255,255,0.08)',border:'none',borderRadius:'0.4rem',padding:'0.5rem 0.75rem'}}>
            <div style={{width:24,height:24,borderRadius:6,background:lenderColor,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.7rem',color:'#fff'}}>{lenderName[0]}</div>
            <span style={{flex:1,fontSize:'0.78rem',color:'rgba(255,255,255,0.85)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{lenderName}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{padding:'0.75rem 0.5rem',flex:1}}>
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{
                display:'flex',alignItems:'center',gap:'0.75rem',
                padding:'0.75rem 1rem',borderRadius:'0.5rem',marginBottom:2,
                color: active ? 'white' : 'rgba(255,255,255,0.7)',
                fontSize:'0.9rem',textDecoration:'none',
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontWeight: active ? 500 : 400,
              }}>
                {item.icon}{item.label}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div style={{margin:'0.5rem 0',borderTop:'1px solid rgba(255,255,255,0.1)'}}/>
              <Link href="/lender/all-lenders" style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem',borderRadius:'0.5rem',color:'rgba(255,255,255,0.5)',fontSize:'0.78rem',textDecoration:'none'}}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width={15} height={15}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                All Lenders (Admin)
              </Link>
            </>
          )}
        </nav>

        {/* Back to home */}
        <div style={{padding:'1rem 0.5rem',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
          <button onClick={() => router.push('/portal')} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 1rem',width:'100%',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.5)',fontSize:'0.85rem',borderRadius:'0.5rem',fontFamily:'inherit'}}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Home
          </button>
          <button onClick={signOut} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 1rem',width:'100%',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:'0.85rem',borderRadius:'0.5rem',fontFamily:'inherit'}}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,overflowY:'auto',background:'#f8fafc'}}>
        {children}
      </div>
    </div>
  )
}
