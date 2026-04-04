'use client'
import { useState } from 'react'
import { useLender } from '@/lib/useLender'
import LenderLayout from '@/components/LenderLayout'
import { Copy, ExternalLink, Eye } from 'lucide-react'

export default function AffiliatePage() {
  const { lender, isAdmin, loading } = useLender()
  const [copied, setCopied] = useState('')

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading || !lender) return null

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://trbo-app-main.vercel.app'
  const applyUrl = `${baseUrl}/apply?ref=${lender.affiliate_code}`
  const campaigns = [
    { name: 'General', code: lender.affiliate_code, url: applyUrl, clicks: 142, conversions: 38 },
    { name: 'UAE Campaign', code: lender.affiliate_code + '_uae', url: `${applyUrl}_uae`, clicks: 89, conversions: 24 },
    { name: 'India Campaign', code: lender.affiliate_code + '_india', url: `${applyUrl}_india`, clicks: 67, conversions: 19 },
  ]

  return (
    <LenderLayout lenderName={lender.company_name} lenderColor={lender.primary_color} isAdmin={isAdmin}>
      <div style={{padding:'24px 32px'}}>
        <h1 style={{fontSize:24,fontWeight:600,color:'#0f172a',marginBottom:4}}>Affiliate Links</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:32}}>Generate and track borrower referral links for each campaign</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:32}}>
          {[['142','Total Clicks'],['38','Conversions'],['26.8%','Conversion Rate']].map(([v,l]) => (
            <div key={l} style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:20}}>
              <div style={{fontSize:32,fontWeight:700,color:'#0f172a',marginBottom:4}}>{v}</div>
              <div style={{fontSize:12,color:'#94a3b8'}}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,overflow:'hidden',marginBottom:24}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid #f8fafc'}}>
            <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a'}}>Your Affiliate Links</h2>
          </div>
          <div style={{padding:24,display:'flex',flexDirection:'column',gap:16}}>
            {campaigns.map(c => (
              <div key={c.name} style={{border:'1px solid #f1f5f9',borderRadius:12,padding:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{fontWeight:600,fontSize:14,color:'#0f172a'}}>{c.name}</div>
                  <div style={{display:'flex',gap:16,fontSize:12,color:'#94a3b8'}}>
                    <span>{c.clicks} clicks</span>
                    <span>{c.conversions} conversions</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <div style={{flex:1,padding:'8px 12px',background:'#f8fafc',borderRadius:8,fontSize:12,color:'#64748b',fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.url}</div>
                  <button onClick={() => copy(c.url, c.name)} style={{padding:'8px 12px',background:copied===c.name?'#f0fdf4':'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,cursor:'pointer',fontSize:12,color:copied===c.name?'#15803d':'#64748b',display:'flex',alignItems:'center',gap:4}}>
                    <Copy size={13} />{copied===c.name?'Copied!':'Copy'}
                  </button>
                  <a href={c.url} target="_blank" rel="noreferrer" style={{padding:'8px 12px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontSize:12,color:'#64748b',textDecoration:'none'}}>
                    <ExternalLink size={13} />Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{fontWeight:600,color:'#0f172a',marginBottom:4}}>Preview Borrower Portal</div>
              <div style={{fontSize:13,color:'#64748b'}}>See exactly what borrowers see when they click your link</div>
            </div>
            <a href={applyUrl} target="_blank" rel="noreferrer"
              style={{display:'flex',alignItems:'center',gap:8,background:'#0f172a',color:'white',padding:'10px 20px',borderRadius:10,fontSize:13,fontWeight:600,textDecoration:'none'}}>
              <Eye size={15} />Preview Portal →
            </a>
          </div>
        </div>
      </div>
    </LenderLayout>
  )
}
