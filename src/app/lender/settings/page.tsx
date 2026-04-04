'use client'
import { useState } from 'react'
import { useLender } from '@/lib/useLender'
import LenderLayout from '@/components/LenderLayout'

export default function SettingsPage() {
  const { lender, isAdmin, loading } = useLender()
  const [saved, setSaved] = useState(false)

  if (loading || !lender) return null

  return (
    <LenderLayout lenderName={lender.company_name} lenderColor={lender.primary_color} isAdmin={isAdmin}>
      <div style={{padding:'24px 32px',maxWidth:720}}>
        <h1 style={{fontSize:24,fontWeight:600,color:'#0f172a',marginBottom:4}}>Settings</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:32}}>Manage your account and portal configuration</p>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24,marginBottom:24}}>
          <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:20}}>Company Details</h2>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[['Company Name',lender.company_name],['Primary Market','Canada'],['Plan',lender.plan]].map(([l,v]) => (
              <div key={l}>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>{l}</label>
                <input defaultValue={v} style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}} />
              </div>
            ))}
          </div>
        </div>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24,marginBottom:24}}>
          <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:20}}>White-Label Branding</h2>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Brand Color</label>
              <div style={{display:'flex',gap:8}}>
                {['#455c62','#2563eb','#059669','#dc2626','#7c3aed','#d97706','#0f172a'].map(c => (
                  <div key={c} style={{width:32,height:32,borderRadius:8,background:c,cursor:'pointer',outline:c===lender.primary_color?'3px solid #0f172a':'none',outlineOffset:2}} />
                ))}
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Custom Domain</label>
              <input defaultValue={`apply.trbo.io?ref=${lender.affiliate_code}`} style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',boxSizing:'border-box'}} />
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Borrower Welcome Message</label>
              <textarea defaultValue="Build your global credit profile with your real financial history." style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a',resize:'none',height:80,fontFamily:'inherit',boxSizing:'border-box'}} />
            </div>
          </div>
        </div>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24,marginBottom:24}}>
          <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:4}}>API Key</h2>
          <p style={{fontSize:13,color:'#94a3b8',marginBottom:16}}>Use this key to authenticate API requests</p>
          <div style={{display:'flex',gap:8}}>
            <div style={{flex:1,padding:'10px 14px',background:'#0f172a',borderRadius:10,fontFamily:'monospace',fontSize:12,color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              trbo_live_sk_••••••••••••••••••••••••••••••••
            </div>
            <button style={{padding:'10px 16px',background:'#455c62',color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer'}}>Copy</button>
          </div>
        </div>

        <button onClick={() => setSaved(true)} style={{padding:'12px 32px',background:'#455c62',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer'}}>
          {saved ? '✓ Changes Saved' : 'Save Changes'}
        </button>
      </div>
    </LenderLayout>
  )
}
