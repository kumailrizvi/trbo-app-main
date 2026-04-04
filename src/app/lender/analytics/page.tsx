'use client'
import { useLender } from '@/lib/useLender'
import LenderLayout from '@/components/LenderLayout'

export default function AnalyticsPage() {
  const { lender, isAdmin, loading } = useLender()
  if (loading || !lender) return null

  const months = ['Oct','Nov','Dec','Jan','Feb','Mar']
  const scores = [680,695,710,698,725,741]
  const maxScore = 850

  return (
    <LenderLayout lenderName={lender.company_name} lenderColor={lender.primary_color} isAdmin={isAdmin}>
      <div style={{padding:'24px 32px'}}>
        <h1 style={{fontSize:24,fontWeight:600,color:'#0f172a',marginBottom:4}}>Analytics</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:32}}>Performance trends across your portfolio</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}}>
          {[['71%','Approval Rate','↑ +4%','#059669'],['2.4s','Avg Decision Time','↓ -0.8s','#2563eb'],['$8,200','Avg Credit Limit','↑ +$600','#059669'],['13.2%','Avg APR Issued','↓ -0.4%','#059669']].map(([v,l,c,col]) => (
            <div key={l} style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:20}}>
              <div style={{fontSize:28,fontWeight:700,color:'#0f172a',marginBottom:4}}>{v}</div>
              <div style={{fontSize:12,color:'#94a3b8',marginBottom:8}}>{l}</div>
              <div style={{fontSize:12,fontWeight:500,color:col as string}}>{c}</div>
            </div>
          ))}
        </div>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24,marginBottom:24}}>
          <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:24}}>Average Score Trend</h2>
          <div style={{display:'flex',alignItems:'flex-end',gap:16,height:160}}>
            {months.map((m,i) => (
              <div key={m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                <div style={{fontSize:11,fontWeight:600,color:'#455c62'}}>{scores[i]}</div>
                <div style={{width:'100%',background:'#455c62',borderRadius:6,opacity:0.8+i*0.04}} title={`${m}: ${scores[i]}`}
                  style2={{height: `${(scores[i]/maxScore)*140}px`,width:'100%',background:'#455c62',borderRadius:6}}
                  style={{height:`${(scores[i]/maxScore)*140}px`,width:'100%',background:'#455c62',borderRadius:'6px 6px 0 0'}} />
                <div style={{fontSize:11,color:'#94a3b8'}}>{m}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24}}>
            <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:16}}>Risk Distribution</h2>
            {[['Low Risk','62%','#059669'],['Medium Risk','28%','#d97706'],['High Risk','10%','#dc2626']].map(([l,p,c]) => (
              <div key={l} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:13,color:'#475569'}}>{l}</span>
                  <span style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{p}</span>
                </div>
                <div style={{height:8,background:'#f1f5f9',borderRadius:4,overflow:'hidden'}}>
                  <div style={{height:'100%',width:p,background:c as string,borderRadius:4}} />
                </div>
              </div>
            ))}
          </div>
          <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24}}>
            <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:16}}>Top Corridors</h2>
            {[['UAE → Canada','38%'],['India → Canada','31%'],['Pakistan → Canada','18%'],['Philippines → Canada','13%']].map(([c,p]) => (
              <div key={c} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f8fafc'}}>
                <span style={{fontSize:13,color:'#475569'}}>{c}</span>
                <span style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LenderLayout>
  )
}
