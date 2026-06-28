'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, type Borrower } from '@/lib/supabase'
import { useLender } from '@/lib/useLender'
import LenderLayout from '@/components/LenderLayout'

export default function Dashboard() {
  const { lender, isAdmin, loading, dbLenderId } = useLender()
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [bLoading, setBLoading] = useState(true)

  useEffect(() => {
    if (!dbLenderId) return
    supabase.from('borrowers').select('*').eq('lender_id', dbLenderId).order('created_at', { ascending: false }).then(({ data }) => {
      setBorrowers(data || []); setBLoading(false)
    })
  }, [dbLenderId])

  if (loading || !lender) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:32,height:32,border:'2px solid #e2e8f0',borderTopColor:'#455c62',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const total = borrowers.length
  const approved = borrowers.filter(b => b.status === 'Ready' || b.status === 'approved').length
  const review = borrowers.filter(b => b.status === 'Under Review' || b.status === 'Processing' || b.status === 'pending').length
  const declined = borrowers.filter(b => b.status === 'declined').length

  const statCards = [
    { label:'Total Borrowers', value: bLoading?'—':total.toLocaleString(), change:'↑ +12%', changeColor:'#059669', iconColor:'#2563eb', iconBg:'#dbeafe',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label:'Approved', value: bLoading?'—':approved.toLocaleString(), change:'↑ +8%', changeColor:'#059669', iconColor:'#059669', iconBg:'#dcfce7',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}><polyline points="20 6 9 17 4 12"/></svg> },
    { label:'Under Review', value: bLoading?'—':review.toLocaleString(), change:'↑ +15%', changeColor:'#059669', iconColor:'#d97706', iconBg:'#fef9c3',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label:'Declined', value: bLoading?'—':declined.toLocaleString(), change:'↓ -3%', changeColor:'#dc2626', iconColor:'#dc2626', iconBg:'#fee2e2',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
  ]

  function riskBadge(risk: string) {
    const map: Record<string,{bg:string,color:string}> = {
      Low:{bg:'#dcfce7',color:'#15803d'}, Medium:{bg:'#fef9c3',color:'#a16207'}, High:{bg:'#fee2e2',color:'#b91c1c'}
    }
    const s = map[risk] || {bg:'#f1f5f9',color:'#64748b'}
    return <span style={{fontSize:'0.75rem',fontWeight:500,padding:'0.2rem 0.6rem',borderRadius:9999,background:s.bg,color:s.color}}>{risk}</span>
  }

  function statusBadge(status: string) {
    const map: Record<string,{bg:string,color:string}> = {
      Ready:{bg:'#dcfce7',color:'#15803d'}, approved:{bg:'#dcfce7',color:'#15803d'},
      Processing:{bg:'#dbeafe',color:'#1d4ed8'}, pending:{bg:'#dbeafe',color:'#1d4ed8'},
      'Under Review':{bg:'#fef9c3',color:'#a16207'},
      declined:{bg:'#fee2e2',color:'#b91c1c'},
    }
    const s = map[status] || {bg:'#f1f5f9',color:'#64748b'}
    return <span style={{fontSize:'0.75rem',fontWeight:500,padding:'0.2rem 0.6rem',borderRadius:9999,background:s.bg,color:s.color}}>{status}</span>
  }

  return (
    <LenderLayout lenderName={lender.company_name} lenderColor={lender.primary_color} isAdmin={isAdmin}>
      <div style={{padding:'2rem',background:'#f8fafc',minHeight:'100%'}}>
        <div style={{fontSize:'1.75rem',fontWeight:600,color:'#0f172a',marginBottom:'0.4rem'}}>Dashboard</div>
        <div style={{fontSize:'0.875rem',color:'#64748b',marginBottom:'2rem'}}>Global Financial Passport — credit underwriting dashboard</div>

        {/* Stats grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1.25rem',marginBottom:'2rem'}}>
          {statCards.map(s => (
            <div key={s.label} style={{background:'#fff',borderRadius:'0.75rem',padding:'1.25rem',border:'1px solid #e2e8f0'}}>
              <div style={{width:44,height:44,borderRadius:'0.5rem',background:s.iconBg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem',color:s.iconColor}}>{s.icon}</div>
              <div style={{fontSize:'0.75rem',color:s.changeColor,marginBottom:'0.75rem'}}>{s.change}</div>
              <div style={{fontSize:'1.75rem',fontWeight:600,color:'#0f172a',marginBottom:'0.25rem'}}>{s.value}</div>
              <div style={{fontSize:'0.8rem',color:'#64748b'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent borrowers table */}
        <div style={{background:'#fff',borderRadius:'0.75rem',border:'1px solid #e2e8f0',overflow:'hidden'}}>
          <div style={{padding:'1.25rem 1.5rem',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h2 style={{fontSize:'1rem',fontWeight:600,color:'#0f172a',margin:0}}>Recent Borrowers</h2>
              <p style={{fontSize:'0.82rem',color:'#64748b',margin:'0.2rem 0 0'}}>Latest credit applications</p>
            </div>
            <Link href="/lender/borrowers" style={{fontSize:'0.85rem',color:'#455c62',background:'none',border:'none',cursor:'pointer',textDecoration:'none',fontWeight:500}}>View All →</Link>
          </div>
          {bLoading ? (
            <div style={{padding:'3rem',textAlign:'center'}}><div style={{width:24,height:24,border:'2px solid #e2e8f0',borderTopColor:'#455c62',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto'}}/></div>
          ) : borrowers.length === 0 ? (
            <div style={{padding:'3rem',textAlign:'center',color:'#94a3b8',fontSize:'0.875rem'}}>No borrowers yet — share your affiliate link to get started</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                  {['Borrower','Corridor','Global Score','Risk','Status','Action'].map((h,i) => (
                    <th key={h} style={{padding:'0.875rem 1.5rem',textAlign:i===5?'right':'left',fontSize:'0.78rem',fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {borrowers.slice(0,8).map(b => (
                  <tr key={b.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={{padding:'1rem 1.5rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:'0.9rem',fontWeight:500,color:'#0f172a'}}>{b.name}</span>
                        {b.is_demo && <span style={{fontSize:'0.65rem',background:'#f1f5f9',color:'#94a3b8',padding:'0.1rem 0.4rem',borderRadius:4,fontWeight:500}}>demo</span>}
                      </div>
                    </td>
                    <td style={{padding:'1rem 1.5rem',fontSize:'0.875rem',color:'#64748b'}}>{b.origin_country} → {b.destination_country}</td>
                    <td style={{padding:'1rem 1.5rem',fontSize:'0.9rem',fontWeight:600,color:'#0f172a'}}>{b.global_score || '—'}</td>
                    <td style={{padding:'1rem 1.5rem'}}>{riskBadge(b.risk || '')}</td>
                    <td style={{padding:'1rem 1.5rem'}}>{statusBadge(b.status)}</td>
                    <td style={{padding:'1rem 1.5rem',textAlign:'right'}}>
                      <Link href={`/lender/borrowers/${b.id}`} style={{fontSize:'0.82rem',color:'#455c62',fontWeight:500,background:'none',border:'none',cursor:'pointer',textDecoration:'none'}}>View Profile →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </LenderLayout>
  )
}
