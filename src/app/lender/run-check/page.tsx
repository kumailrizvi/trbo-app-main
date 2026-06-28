'use client'
import { useState } from 'react'
import { useLender } from '@/lib/useLender'
import LenderLayout from '@/components/LenderLayout'
import { Search, CheckCircle, AlertTriangle } from 'lucide-react'

export default function RunCheck() {
  const { lender, isAdmin, loading } = useLender()
  const [form, setForm] = useState({ name:'', origin:'🇦🇪 UAE', destination:'🇨🇦 Canada', income:'', savings:'', remittance:'', employer:'', tenure:'', empType:'Full-time permanent' })
  const [result, setResult] = useState<Record<string,unknown>|null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setForm(f => ({...f,[k]:e.target.value})) }

  async function runCheck() {
    if (!form.name) { setError('Please enter borrower name'); return }
    setRunning(true); setError(''); setResult(null)
    try {
      const prompt = `Borrower: ${form.name}, from ${form.origin} to ${form.destination}. Income: $${form.income}/mo, Savings: $${form.savings}/mo, Remittances: $${form.remittance}/mo. Employer: ${form.employer}, Tenure: ${form.tenure} months, Type: ${form.empType}. Score this borrower using the TRBO 7-factor methodology.`
      const resp = await fetch('/api/score', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt}) })
      const data = await resp.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch(e) { setError(e instanceof Error ? e.message : 'Scoring failed') }
    finally { setRunning(false) }
  }

  if (loading || !lender) return null
  const scoreColor = result ? ((result.global_score as number) >= 750 ? '#059669' : (result.global_score as number) >= 650 ? '#2563eb' : '#d97706') : '#455c62'

  return (
    <LenderLayout lenderName={lender.company_name} lenderColor={lender.primary_color} isAdmin={isAdmin}>
      <div style={{padding:'24px 32px',maxWidth:800}}>
        <h1 style={{fontSize:24,fontWeight:600,color:'#0f172a',marginBottom:4}}>Run Credit Check</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:32}}>Score a borrower manually using the TRBO 7-factor engine</p>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24,marginBottom:24}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{gridColumn:'span 2'}}>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Full Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Mohammed Al-Rahman"
                style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}} />
            </div>
            {[
              ['origin','Origin Country','select',['🇦🇪 UAE','🇮🇳 India','🇵🇰 Pakistan','🇵🇭 Philippines','🇳🇬 Nigeria','🇨🇳 China','🇧🇷 Brazil','🇲🇽 Mexico','🇬🇧 UK']],
              ['destination','Destination','select',['🇨🇦 Canada','🇬🇧 UK','🇺🇸 USA','🇦🇺 Australia']],
              ['income','Monthly Income (USD)','number',''],
              ['savings','Monthly Savings (USD)','number',''],
              ['remittance','Monthly Remittances (USD)','number',''],
              ['employer','Employer','text',''],
              ['tenure','Tenure (months)','number',''],
              ['empType','Employment Type','select',['Full-time permanent','Full-time contract','Part-time','Self-employed','Freelance']],
            ].map(([key, label, type, opts]) => (
              <div key={key as string}>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>{label as string}</label>
                {type === 'select' ? (
                  <select value={form[key as keyof typeof form]} onChange={set(key as string)}
                    style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a'}}>
                    {(opts as string[]).map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type as string} value={form[key as keyof typeof form]} onChange={set(key as string)}
                    style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}} />
                )}
              </div>
            ))}
          </div>

          {error && <div style={{marginTop:16,padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,fontSize:13,color:'#dc2626'}}>{error}</div>}

          <button onClick={runCheck} disabled={running}
            style={{marginTop:20,width:'100%',padding:'14px',background:'#455c62',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:running?0.7:1}}>
            {running ? <><div style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />Analyzing...</> : <><Search size={16} />Run Credit Check</>}
          </button>
        </div>

        {result && (
          <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24}}>
            <div style={{textAlign:'center',marginBottom:24}}>
              <div style={{fontSize:11,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Global Credit Score</div>
              <div style={{fontSize:80,fontWeight:800,color:scoreColor,lineHeight:1,marginBottom:8}}>{result.global_score as number}</div>
              <span style={{background:scoreColor,color:'white',padding:'4px 16px',borderRadius:9999,fontSize:13,fontWeight:600}}>{result.risk_tier as string}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div style={{background:'#f8fafc',borderRadius:12,padding:16}}>
                <div style={{fontSize:12,color:'#94a3b8',marginBottom:4}}>Suggested Limit</div>
                <div style={{fontSize:24,fontWeight:700,color:'#0f172a'}}>${(result.suggested_limit as number)?.toLocaleString()}</div>
              </div>
              <div style={{background:'#f8fafc',borderRadius:12,padding:16}}>
                <div style={{fontSize:12,color:'#94a3b8',marginBottom:4}}>APR Range</div>
                <div style={{fontSize:24,fontWeight:700,color:'#0f172a'}}>{result.suggested_apr_low as number}–{result.suggested_apr_high as number}%</div>
              </div>
            </div>
            {(result.key_strengths as string[])?.length > 0 && (
              <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:16,marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:'#15803d',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Strengths</div>
                {(result.key_strengths as string[]).map(s => <div key={s} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#0f172a',marginBottom:6}}><CheckCircle size={14} color="#059669" />{s}</div>)}
              </div>
            )}
            {(result.key_risks as string[])?.length > 0 && (
              <div style={{background:'#fefce8',border:'1px solid #fde68a',borderRadius:12,padding:16,marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:'#a16207',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Considerations</div>
                {(result.key_risks as string[]).map(r => <div key={r} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#0f172a',marginBottom:6}}><AlertTriangle size={14} color="#d97706" />{r}</div>)}
              </div>
            )}
            {typeof result.analyst_narrative === 'string' && <p style={{fontSize:13,color:'#64748b',fontStyle:'italic',lineHeight:1.6}}>&ldquo;{String(result.analyst_narrative)}&rdquo;</p>}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </LenderLayout>
  )
}
