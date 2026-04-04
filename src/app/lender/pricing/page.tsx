'use client'
import { useState } from 'react'
import { useLender } from '@/lib/useLender'
import LenderLayout from '@/components/LenderLayout'

type Tier = { band: string; tier: string; decision: string; apr: string; limit: string }

const DEFAULT_TIERS: Record<string, Tier[]> = {
  lender_koho: [
    { band:'750–850', tier:'Prime', decision:'Auto-Approve', apr:'8.5–11%', limit:'$5k–$25k' },
    { band:'700–749', tier:'Near-Prime', decision:'Auto-Approve', apr:'11–14%', limit:'$3k–$15k' },
    { band:'650–699', tier:'Subprime', decision:'Manual Review', apr:'14–18%', limit:'$1k–$8k' },
    { band:'<650', tier:'Decline', decision:'Auto-Decline', apr:'N/A', limit:'N/A' },
  ],
  lender_borrowell: [
    { band:'750–850', tier:'Prime', decision:'Auto-Approve', apr:'9–12%', limit:'$3k–$20k' },
    { band:'700–749', tier:'Near-Prime', decision:'Auto-Approve', apr:'12–16%', limit:'$2k–$10k' },
    { band:'620–699', tier:'Subprime', decision:'Manual Review', apr:'16–22%', limit:'$500–$5k' },
    { band:'<620', tier:'Decline', decision:'Auto-Decline', apr:'N/A', limit:'N/A' },
  ],
  lender_rbc: [
    { band:'780–850', tier:'Prime+', decision:'Auto-Approve', apr:'7–9%', limit:'$10k–$50k' },
    { band:'740–779', tier:'Prime', decision:'Auto-Approve', apr:'9–11%', limit:'$5k–$25k' },
    { band:'720–739', tier:'Standard', decision:'Manual Review', apr:'11–13%', limit:'$3k–$15k' },
    { band:'<720', tier:'Decline', decision:'Auto-Decline', apr:'N/A', limit:'N/A' },
  ],
}

export default function PricingPage() {
  const { lender, isAdmin, loading } = useLender()
  const [saved, setSaved] = useState(false)
  const [minScore, setMinScore] = useState(650)

  if (loading || !lender) return null
  const tiers = DEFAULT_TIERS[lender.id] || DEFAULT_TIERS.lender_koho
  const decColor = { 'Auto-Approve':'#059669','Manual Review':'#d97706','Auto-Decline':'#dc2626' }

  return (
    <LenderLayout lenderName={lender.company_name} lenderColor={lender.primary_color} isAdmin={isAdmin}>
      <div style={{padding:'24px 32px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:600,color:'#0f172a',marginBottom:4}}>Pricing Engine</h1>
            <p style={{fontSize:14,color:'#64748b'}}>Risk thresholds, pricing tiers, corridor rules — {lender.company_name}</p>
          </div>
          <button onClick={() => setSaved(true)} style={{padding:'10px 24px',background:'#455c62',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer'}}>
            {saved ? '✓ Saved' : 'Save Configuration'}
          </button>
        </div>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,overflow:'hidden',marginBottom:24}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid #f8fafc'}}>
            <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a'}}>Score Band Pricing Table</h2>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>
              {['Score Band','Risk Tier','Decision','APR Range','Credit Limit'].map(h => (
                <th key={h} style={{padding:'12px 20px',textAlign:'left',fontSize:11,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {tiers.map((t,i) => (
                <tr key={i} style={{borderBottom:'1px solid #f8fafc'}}>
                  <td style={{padding:'16px 20px'}}>
                    <input defaultValue={t.band} style={{padding:'4px 8px',border:'1px solid #e2e8f0',borderRadius:6,fontSize:13,fontWeight:600,background:'#f8fafc',color:'#0f172a',width:90}} />
                  </td>
                  <td style={{padding:'16px 20px'}}>
                    <span style={{fontSize:12,padding:'3px 10px',borderRadius:9999,background:t.tier.includes('Prime')?'#eff6ff':t.tier==='Decline'?'#fef2f2':'#f8fafc',color:t.tier.includes('Prime')?'#2563eb':t.tier==='Decline'?'#dc2626':'#475569',fontWeight:500}}>{t.tier}</span>
                  </td>
                  <td style={{padding:'16px 20px',fontSize:13,fontWeight:500,color:decColor[t.decision as keyof typeof decColor]||'#475569'}}>{t.decision}</td>
                  <td style={{padding:'16px 20px'}}>
                    <input defaultValue={t.apr} style={{padding:'4px 8px',border:'1px solid #e2e8f0',borderRadius:6,fontSize:13,background:'#f8fafc',color:'#0f172a',width:80}} />
                  </td>
                  <td style={{padding:'16px 20px'}}>
                    <input defaultValue={t.limit} style={{padding:'4px 8px',border:'1px solid #e2e8f0',borderRadius:6,fontSize:13,background:'#f8fafc',color:'#0f172a',width:100}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24}}>
            <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:20}}>Minimum Score Cutoff</h2>
            <input type="range" min={500} max={800} value={minScore} onChange={e => setMinScore(parseInt(e.target.value))}
              style={{width:'100%',accentColor:'#455c62',marginBottom:16}} />
            <div style={{textAlign:'center',marginBottom:12}}>
              <div style={{fontSize:48,fontWeight:800,color:'#455c62'}}>{minScore}</div>
              <div style={{fontSize:12,color:'#94a3b8'}}>minimum score</div>
            </div>
            <div style={{padding:'12px',background:'#eff6ff',borderRadius:8,fontSize:13,color:'#1d4ed8'}}>
              Borrowers below <strong>{minScore}</strong> are auto-declined at intake
            </div>
          </div>

          <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24}}>
            <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:20}}>Auto-Decision Rules</h2>
            {[
              ['Auto-approve score ≥ 750','Bypass manual review',true],
              ['Auto-decline below cutoff','Instant rejection at intake',true],
              ['Flag remittance gaps > 2mo','Route to manual review',true],
              ['Require docs if score 650–750','Must upload before decision',false],
              ['Webhook on every decision','Fire event to your endpoint',true],
            ].map(([title,sub,checked]) => (
              <div key={title as string} style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:16,marginBottom:16,borderBottom:'1px solid #f8fafc'}}>
                <div>
                  <div style={{fontSize:13,color:'#0f172a',fontWeight:500}}>{title as string}</div>
                  <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>{sub as string}</div>
                </div>
                <input type="checkbox" defaultChecked={checked as boolean} style={{width:16,height:16,accentColor:'#455c62'}} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </LenderLayout>
  )
}
