'use client'
import { useState } from 'react'
import { useLender } from '@/lib/useLender'
import LenderLayout from '@/components/LenderLayout'
import { Plus, Trash2, Check } from 'lucide-react'

export default function WebhooksPage() {
  const { lender, isAdmin, loading } = useLender()
  const [hooks, setHooks] = useState([
    { id: 1, url: 'https://api.yourcompany.com/webhooks/trbo', events: ['borrower.score.ready', 'lender.decision.required'], active: true },
  ])
  const [newUrl, setNewUrl] = useState('')

  if (loading || !lender) return null

  function addHook() {
    if (!newUrl) return
    setHooks(h => [...h, { id: Date.now(), url: newUrl, events: ['borrower.score.ready'], active: true }])
    setNewUrl('')
  }

  const EVENTS = ['borrower.score.ready','borrower.document.verified','lender.decision.required','borrower.profile.updated','lender.check.completed']

  return (
    <LenderLayout lenderName={lender.company_name} lenderColor={lender.primary_color} isAdmin={isAdmin}>
      <div style={{padding:'24px 32px',maxWidth:800}}>
        <h1 style={{fontSize:24,fontWeight:600,color:'#0f172a',marginBottom:4}}>Webhook Console</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:32}}>Receive real-time events when borrower decisions are made</p>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24,marginBottom:24}}>
          <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:16}}>Add Endpoint</h2>
          <div style={{display:'flex',gap:12}}>
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://api.yourcompany.com/webhooks/trbo"
              style={{flex:1,padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a'}} />
            <button onClick={addHook} style={{padding:'10px 20px',background:'#455c62',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
              <Plus size={16} />Add
            </button>
          </div>
        </div>

        {hooks.map(h => (
          <div key={h.id} style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:h.active?'#059669':'#94a3b8'}} />
                <span style={{fontSize:13,fontFamily:'monospace',color:'#0f172a'}}>{h.url}</span>
              </div>
              <button onClick={() => setHooks(hooks.filter(x => x.id !== h.id))}
                style={{padding:'6px',background:'#fef2f2',border:'none',borderRadius:6,cursor:'pointer',color:'#dc2626'}}>
                <Trash2 size={14} />
              </button>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {EVENTS.map(e => (
                <label key={e} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 10px',border:'1px solid #e2e8f0',borderRadius:6,fontSize:11,cursor:'pointer',background:h.events.includes(e)?'#eff6ff':'white',color:h.events.includes(e)?'#2563eb':'#64748b'}}>
                  {h.events.includes(e) && <Check size={10} />}{e}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div style={{background:'#0f172a',borderRadius:16,padding:24}}>
          <div style={{fontSize:11,color:'#94a3b8',fontFamily:'monospace',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.08em'}}>Example Payload</div>
          <pre style={{fontSize:12,color:'#94a3b8',fontFamily:'monospace',lineHeight:1.6,margin:0}}>{JSON.stringify({
            event: "borrower.score.ready",
            timestamp: new Date().toISOString(),
            data: { borrower_id: "uuid", name: "Mohammed Al-Rahman", global_score: 782, risk_tier: "Near-Prime", suggested_limit: 15000 }
          }, null, 2)}</pre>
        </div>
      </div>
    </LenderLayout>
  )
}
