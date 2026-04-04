'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, type Borrower } from '@/lib/supabase'
import { useLender } from '@/lib/useLender'
import LenderLayout from '@/components/LenderLayout'
import { Users, CheckCircle, Clock, XCircle, TrendingUp, ArrowRight, FileText } from 'lucide-react'

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

  if (loading || !lender) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:32,height:32,border:'2px solid #e2e8f0',borderTopColor:'#455c62',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} /></div>

  const stats = [
    { label: 'Total Borrowers', value: borrowers.length, icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Approved', value: borrowers.filter(b => b.status === 'Ready' || b.status === 'approved').length, icon: CheckCircle, color: '#059669', bg: '#f0fdf4' },
    { label: 'Under Review', value: borrowers.filter(b => b.status === 'Under Review').length, icon: Clock, color: '#d97706', bg: '#fefce8' },
    { label: 'Declined', value: borrowers.filter(b => b.status === 'declined').length, icon: XCircle, color: '#dc2626', bg: '#fef2f2' },
    { label: 'Avg Score', value: borrowers.length ? Math.round(borrowers.reduce((a,b) => a+(b.global_score||0),0)/borrowers.length) : '—', icon: TrendingUp, color: '#455c62', bg: '#f0f4f5' },
  ]

  return (
    <LenderLayout lenderName={lender.company_name} lenderColor={lender.primary_color} isAdmin={isAdmin}>
      <div style={{padding:'24px 32px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:600,color:'#0f172a'}}>Dashboard</h1>
            <p style={{fontSize:14,color:'#64748b',marginTop:4}}>Global Financial Passport — credit underwriting dashboard</p>
          </div>
          <Link href="/apply" target="_blank" style={{display:'flex',alignItems:'center',gap:8,background:'#455c62',color:'white',padding:'10px 16px',borderRadius:12,fontSize:14,fontWeight:500,textDecoration:'none'}}>
            <FileText size={15} />Borrower Portal
          </Link>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16,marginBottom:32}}>
          {stats.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:20}}>
                <div style={{width:36,height:36,background:s.bg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                  <Icon size={17} color={s.color} />
                </div>
                <div style={{fontSize:26,fontWeight:700,color:'#0f172a',marginBottom:4}}>{bLoading ? '—' : s.value}</div>
                <div style={{fontSize:12,color:'#94a3b8'}}>{s.label}</div>
              </div>
            )
          })}
        </div>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,overflow:'hidden'}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid #f8fafc',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a'}}>Recent Borrowers</h2>
              <p style={{fontSize:12,color:'#94a3b8',marginTop:2}}>Latest credit applications</p>
            </div>
            <Link href="/lender/borrowers" style={{fontSize:12,fontWeight:500,color:'#455c62',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {bLoading ? (
            <div style={{padding:64,textAlign:'center'}}><div style={{width:24,height:24,border:'2px solid #e2e8f0',borderTopColor:'#455c62',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto'}} /></div>
          ) : borrowers.length === 0 ? (
            <div style={{padding:64,textAlign:'center',color:'#94a3b8'}}>
              <Users size={32} style={{margin:'0 auto 12px',opacity:0.3}} />
              <p style={{fontSize:14}}>No borrowers yet. Share your affiliate link to get started.</p>
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid #f8fafc',background:'#f8fafc'}}>
                {['Borrower','Corridor','Score','Risk','Status','Date',''].map(h => (
                  <th key={h} style={{padding:'12px 24px',textAlign:'left',fontSize:11,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {borrowers.slice(0,8).map(b => (
                  <tr key={b.id} style={{borderBottom:'1px solid #f8fafc'}}>
                    <td style={{padding:'16px 24px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:14,fontWeight:500,color:'#0f172a'}}>{b.name}</span>
                        {b.is_demo && <span style={{fontSize:10,background:'#f1f5f9',color:'#94a3b8',padding:'2px 6px',borderRadius:4,fontWeight:500}}>demo</span>}
                      </div>
                    </td>
                    <td style={{padding:'16px 24px',fontSize:14,color:'#64748b'}}>{b.origin_country} → {b.destination_country}</td>
                    <td style={{padding:'16px 24px',fontSize:14,fontWeight:700,color:'#0f172a'}}>{b.global_score || '—'}</td>
                    <td style={{padding:'16px 24px'}}>
                      <span style={{fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:9999,background:b.risk==='Low'?'#f0fdf4':b.risk==='Medium'?'#fefce8':'#fef2f2',color:b.risk==='Low'?'#15803d':b.risk==='Medium'?'#a16207':'#dc2626'}}>{b.risk||'—'}</span>
                    </td>
                    <td style={{padding:'16px 24px'}}>
                      <span style={{fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:9999,background:b.status==='Ready'||b.status==='approved'?'#f0fdf4':b.status==='Under Review'?'#fefce8':'#eff6ff',color:b.status==='Ready'||b.status==='approved'?'#15803d':b.status==='Under Review'?'#a16207':'#2563eb'}}>{b.status}</span>
                    </td>
                    <td style={{padding:'16px 24px',fontSize:14,color:'#94a3b8'}}>{new Date(b.created_at).toLocaleDateString('en-CA')}</td>
                    <td style={{padding:'16px 24px',textAlign:'right'}}>
                      <Link href={`/lender/borrowers/${b.id}`} style={{fontSize:12,fontWeight:500,color:'#455c62',textDecoration:'none'}}>View →</Link>
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
