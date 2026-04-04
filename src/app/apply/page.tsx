'use client'
import { useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type Step = 'welcome' | 'upload' | 'form' | 'loading' | 'result'
type DocType = 'bank' | 'payslip' | 'remit' | 'passport'
type ParsedDocs = Partial<Record<DocType, Record<string, unknown>>>

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', 'Inter', sans-serif; }

  .bwelcome { min-height:100vh; background:#ffffff; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
  .bwelcome-inner { max-width:860px; width:100%; }
  .bwelcome h1 { font-size:2.8rem; font-weight:600; letter-spacing:-0.02em; text-align:center; margin-bottom:1rem; color:#111111; }
  .bwelcome-subs { text-align:center; color:#64748b; margin-bottom:0.5rem; font-size:1rem; }
  .bwelcome-sub2 { text-align:center; color:#94a3b8; font-size:0.9rem; margin-bottom:2rem; }
  .bwelcome-card { background:#fff; border:1px solid rgba(0,0,0,0.1); border-radius:1rem; padding:2rem; box-shadow:0 4px 24px rgba(0,0,0,0.06); }
  .bwelcome-features { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:2rem; }
  .feature-card { text-align:center; padding:1.5rem; }
  .feature-icon { width:56px; height:56px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; }
  .feature-icon svg { width:26px; height:26px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
  .feature-icon.green { background:#dcfce7; color:#059669; }
  .feature-icon.blue { background:#dbeafe; color:#2563eb; }
  .feature-icon.purple { background:#f3e8ff; color:#7c3aed; }
  .feature-icon.amber { background:#fef9c3; color:#d97706; }
  .feature-title { font-size:0.85rem; font-weight:600; color:#111111; margin-bottom:0.3rem; }
  .feature-desc { font-size:0.78rem; color:#64748b; line-height:1.5; }
  .bwelcome-divider { border:none; border-top:1px solid #e2e8f0; margin:1.5rem 0; }
  .bwelcome-cta { text-align:center; }
  .btn-primary { background:#455c62; color:#fff; border:none; border-radius:0.5rem; padding:0.85rem 2.5rem; font-size:1rem; font-weight:600; cursor:pointer; font-family:inherit; }
  .btn-primary:hover { background:#344a50; }
  .btn-secondary { background:#f3f3f5; color:#475569; border:1px solid #e2e8f0; border-radius:0.5rem; padding:0.85rem 1.5rem; font-size:0.95rem; font-weight:500; cursor:pointer; font-family:inherit; }

  .bform-wrap { min-height:100vh; background:#f8fafc; padding:2rem 1.5rem; }
  .bform-inner { max-width:640px; margin:0 auto; }
  .bform-inner.wide { max-width:900px; }
  .step-bar { display:flex; align-items:center; margin-bottom:2rem; }
  .step-dot { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:600; flex-shrink:0; }
  .step-dot.done { background:#059669; color:#fff; }
  .step-dot.active { background:#455c62; color:#fff; }
  .step-dot.todo { background:#e2e8f0; color:#94a3b8; }
  .step-line { flex:1; height:2px; margin:0 0.5rem; }
  .step-line.done { background:#059669; }
  .step-line.todo { background:#e2e8f0; }
  .bform-title { font-size:1.5rem; font-weight:600; color:#0f172a; margin-bottom:0.5rem; }
  .bform-sub { font-size:0.875rem; color:#64748b; margin-bottom:1.5rem; }
  .bform-card { background:#fff; border:1px solid #e2e8f0; border-radius:0.75rem; padding:1.5rem; margin-bottom:1.25rem; }
  .bform-label { display:block; font-size:0.75rem; font-weight:600; color:#475569; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.4rem; }
  .bform-input { width:100%; padding:0.7rem 0.9rem; border:1px solid #e2e8f0; border-radius:0.5rem; font-size:0.875rem; outline:none; background:#f3f3f5; color:#0f172a; font-family:inherit; }
  .bform-input:focus { border-color:#455c62; background:#fff; }
  .bform-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .bform-actions { display:flex; gap:1rem; margin-top:1.5rem; }

  .upload-dropzone { border:2px dashed #e2e8f0; border-radius:0.5rem; padding:1rem; text-align:center; cursor:pointer; transition:border-color 0.2s; }
  .upload-dropzone:hover { border-color:#455c62; }
  .upload-choose-btn { display:inline-block; padding:0.45rem 1rem; border-radius:0.35rem; font-size:0.78rem; font-weight:600; border:none; cursor:pointer; font-family:inherit; }
  .upload-choose-btn.gold { background:#455c62; color:#fff; }
  .upload-done { display:none; margin-top:0.4rem; color:#059669; font-size:0.82rem; font-weight:500; }

  .bresult-wrap { min-height:100vh; background:#f8fafc; padding:2rem 1.5rem; }
  .bresult-inner { max-width:1100px; margin:0 auto; }
  .bresult-grid { display:grid; grid-template-columns:1fr 340px; gap:1.5rem; }
  .bresult-main { display:flex; flex-direction:column; gap:1.25rem; }
  .bresult-sidebar { display:flex; flex-direction:column; gap:1.25rem; }
  .result-card { background:#fff; border:1px solid #e2e8f0; border-radius:0.75rem; padding:1.5rem; }
  .result-card h2 { font-size:1rem; font-weight:600; color:#0f172a; margin-bottom:1rem; }
  .result-card h3 { font-size:0.95rem; font-weight:600; color:#0f172a; margin-bottom:0.75rem; }
  .score-big { font-size:5rem; font-weight:700; line-height:1; letter-spacing:-0.03em; margin:0.5rem 0; }
  .score-band-pill { display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 1rem; border-radius:0.4rem; background:#dcfce7; color:#15803d; font-size:0.85rem; font-weight:600; }
  .factor-row { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem; }
  .factor-label { font-size:0.8rem; color:#475569; width:140px; flex-shrink:0; }
  .bar-track { flex:1; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:4px; transition:width 1s ease; }
  .factor-score { font-size:0.8rem; font-weight:600; color:#0f172a; width:30px; text-align:right; }
  .check-item { display:flex; align-items:center; gap:0.6rem; margin-bottom:0.6rem; font-size:0.875rem; color:#475569; }
  .check-item svg { width:16px; height:16px; flex-shrink:0; }
  .insight-item { display:flex; align-items:flex-start; gap:0.6rem; margin-bottom:0.6rem; padding:0.6rem; border-radius:0.4rem; }
  .insight-item.pos { background:#f0fdf4; }
  .insight-item.neg { background:#fff7ed; }
  .b-narrative { background:#fff; border:1px solid #e2e8f0; border-radius:0.75rem; padding:1.5rem; }
  .b-narrative h2 { font-size:1rem; font-weight:600; color:#0f172a; margin-bottom:1rem; }
  .analyst-box { background:#f8fafc; border-radius:0.5rem; padding:1rem; font-size:0.875rem; color:#475569; line-height:1.7; font-style:italic; }

  .loading-spinner { width:48px; height:48px; border:3px solid #e2e8f0; border-top-color:#455c62; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 1.5rem; }
  @keyframes spin { to { transform:rotate(360deg); } }

  .powered-bar { text-align:center; padding:0.75rem; background:rgba(0,0,0,0.03); border-top:1px solid #e2e8f0; font-size:0.75rem; color:#94a3b8; }
`

function BorrowerPortalContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref') || ''
  const [step, setStep] = useState<Step>('welcome')
  const [parsedDocs, setParsedDocs] = useState<ParsedDocs>({})
  const [docStatus, setDocStatus] = useState<Partial<Record<DocType, 'loading'|'done'|'error'>>>({})
  const [docErrors, setDocErrors] = useState<Partial<Record<DocType, string>>>({})
  const [docNames, setDocNames] = useState<Partial<Record<DocType, string>>>({})
  const [result, setResult] = useState<Record<string,unknown>|null>(null)
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'',
    origin:'🇦🇪 UAE', destination:'🇨🇦 Canada',
    income:'', savings:'', remittance:'',
    employer:'', empType:'Full-time permanent', tenure:''
  })
  const fileRefs = useRef<Partial<Record<DocType, HTMLInputElement|null>>>({})

  function setF(k: string) { return (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setForm(f => ({...f,[k]:e.target.value})) }

  async function handleUpload(file: File, docType: DocType) {
    setDocStatus(s => ({...s,[docType]:'loading'}))
    setDocErrors(s => ({ ...s, [docType]: '' }))
    setDocNames(n => ({...n,[docType]:file.name}))
    try {
      const base64 = await new Promise<string>((res,rej) => {
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(',')[1])
        r.onerror = rej
        r.readAsDataURL(file)
      })
      const isImg = file.type.startsWith('image/')
      const prompts: Record<DocType,string> = {
        bank: 'Extract from this bank statement: average_monthly_income, average_monthly_balance, average_monthly_savings, currency, income_consistency (HIGH/MEDIUM/LOW), months_covered. Return JSON only.',
        payslip: 'Extract: monthly_income, currency, employer, job_title, employment_type. Return JSON only.',
        remit: 'Extract: average_monthly_remittance, currency, transfer_provider, months_covered. Return JSON only.',
        passport: 'Extract: full_name, nationality, date_of_birth, document_type. Return JSON only.',
      }
      const resp = await fetch('/api/parse-doc', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: [
          { type: isImg ? 'image' : 'document', source: { type:'base64', media_type: isImg ? file.type : 'application/pdf', data: base64 } },
          { type:'text', text: prompts[docType] }
        ]})
      })
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}))
        throw new Error(payload.error || `Upload failed (${resp.status})`)
      }
      const parsed = await resp.json()
      setParsedDocs(d => ({...d,[docType]:parsed}))
      setDocStatus(s => ({...s,[docType]:'done'}))
      // Auto-fill
      if (docType === 'bank' && parsed.average_monthly_income) setForm(f => ({...f, income: String(parsed.average_monthly_income)}))
      if (docType === 'payslip') {
        if (parsed.employer) setForm(f => ({...f, employer: parsed.employer as string}))
        if (parsed.monthly_income && !form.income) setForm(f => ({...f, income: String(parsed.monthly_income)}))
      }
      if (docType === 'remit' && parsed.average_monthly_remittance) setForm(f => ({...f, remittance: String(parsed.average_monthly_remittance)}))
      if (docType === 'passport' && parsed.full_name) {
        const parts = (parsed.full_name as string).split(' ')
        setForm(f => ({...f, firstName: parts[0]||'', lastName: parts.slice(1).join(' ')||''}))
      }
    } catch (error: unknown) {
      setDocStatus(s => ({...s,[docType]:'error'}))
      setDocErrors(s => ({ ...s, [docType]: error instanceof Error ? error.message : 'Document parsing failed. Please retry.' }))
    }
  }

  async function generateScore() {
    setStep('loading')
    const prompt = `Borrower: ${form.firstName} ${form.lastName}, from ${form.origin} to ${form.destination}.
Income: $${form.income}/mo, Savings: $${form.savings}/mo, Remittances: $${form.remittance}/mo.
Employer: ${form.employer}, Tenure: ${form.tenure} months, Type: ${form.empType}.
Documents uploaded: ${Object.keys(parsedDocs).join(', ')}.
Extracted data: ${JSON.stringify(parsedDocs, null, 2)}
Score this borrower using the TRBO 7-factor methodology.`
    try {
      const resp = await fetch('/api/score', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({prompt})
      })
      const data = await resp.json()
      if (data.error) throw new Error(data.error)

      // Save to Supabase
      try {
        const { supabase } = await import('@/lib/supabase')
        const DEMO_IDS: Record<string,string> = {
          koho: '11111111-1111-1111-1111-111111111111',
          borrowell: '22222222-2222-2222-2222-222222222222',
          rbc: '33333333-3333-3333-3333-333333333333',
        }
        const lenderId = ref ? (DEMO_IDS[ref.split('_')[0]] || null) : null
        await supabase.from('borrowers').insert({
          lender_id: lenderId,
          name: `${form.firstName} ${form.lastName}`.trim() || 'Unknown',
          email: form.email || null,
          origin_country: form.origin,
          destination_country: form.destination,
          status: 'Ready',
          global_score: data.global_score,
          risk: data.risk_tier === 'Prime' || data.risk_tier === 'Near-Prime' ? 'Low' : data.risk_tier === 'Subprime' ? 'Medium' : 'High',
          risk_tier: data.risk_tier,
          income_usd: parseFloat(form.income)||null,
          savings_usd: parseFloat(form.savings)||null,
          remittance_usd: parseFloat(form.remittance)||null,
          employer: form.employer||null,
          employment_type: form.empType,
          tenure_months: parseInt(form.tenure)||null,
          suggested_limit: data.suggested_limit,
          suggested_apr_low: data.suggested_apr_low,
          suggested_apr_high: data.suggested_apr_high,
          analyst_narrative: data.analyst_narrative,
          key_strengths: data.key_strengths||[],
          key_risks: data.key_risks||[],
          confidence: data.confidence,
          parsed_docs: parsedDocs,
          is_demo: false,
        })
      } catch(e) { console.error('DB save failed:', e) }

      setResult(data)
      setStep('result')
    } catch {
      setStep('form')
      alert('Scoring failed. Please try again.')
    }
  }

  function removeDoc(docType: DocType) {
    setParsedDocs(d => { const n = {...d}; delete n[docType]; return n })
    setDocStatus(s => { const n = {...s}; delete n[docType]; return n })
    setDocErrors(s => { const n = {...s}; delete n[docType]; return n })
    setDocNames(n => { const nd = {...n}; delete nd[docType]; return nd })
    if (fileRefs.current[docType]) fileRefs.current[docType]!.value = ''
  }

  const requiredDocsUploaded = docStatus.bank === 'done' && docStatus.passport === 'done'
  const hasPendingUploads = Object.values(docStatus).some(s => s === 'loading')

  const scoreColor = result ? (
    (result.global_score as number) >= 750 ? '#059669' :
    (result.global_score as number) >= 650 ? '#2563eb' : '#d97706'
  ) : '#455c62'

  const scoreFactors = result ? [
    { label: 'Income Stability', score: result.income_score as number, color: '#2563eb' },
    { label: 'Savings Rate', score: result.savings_score as number, color: '#059669' },
    { label: 'Remittances', score: result.remittance_score as number, color: '#7c3aed' },
    { label: 'Identity', score: result.identity_score as number, color: '#d97706' },
    { label: 'Employment', score: result.employment_score as number, color: '#0891b2' },
  ] : []

  return (
    <>
      <style>{CSS}</style>

      {/* WELCOME */}
      {step === 'welcome' && (
        <div className="bwelcome">
          <div className="bwelcome-inner">
            <h1>Build Your Global Credit Profile</h1>
            <p className="bwelcome-subs">Your financial history, across borders</p>
            <p className="bwelcome-sub2">Your Global Financial Passport.</p>
            <div className="bwelcome-card">
              <div className="bwelcome-features">
                <div className="feature-card">
                  <div className="feature-icon green">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="feature-title">Upload Documents</div>
                  <div className="feature-desc">Bank statements, payslips, remittance proof</div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon blue">
                    <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <div className="feature-title">AI Analysis</div>
                  <div className="feature-desc">trbo reads and scores your financial history</div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon purple">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className="feature-title">2 Minutes</div>
                  <div className="feature-desc">Fast, secure, and private</div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon amber">
                    <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <div className="feature-title">Bank-Grade Security</div>
                  <div className="feature-desc">256-bit encrypted, never stored</div>
                </div>
              </div>
              <hr className="bwelcome-divider" />
              <div className="bwelcome-cta">
                <button className="btn-primary" onClick={() => setStep('upload')}>
                  Get Started — Build My Credit Profile →
                </button>
                <p style={{fontSize:'0.78rem',color:'#94a3b8',marginTop:'0.75rem'}}>No credit check required · Free to apply</p>
              </div>
            </div>
          </div>
          <div className="powered-bar">Powered by trbo · Global Financial Passport</div>
        </div>
      )}

      {/* UPLOAD */}
      {step === 'upload' && (
        <div className="bform-wrap">
          <div className="bform-inner wide">
            <div className="step-bar">
              <div className="step-dot done">✓</div>
              <div className="step-line done" />
              <div className="step-dot active">2</div>
              <div className="step-line todo" />
              <div className="step-dot todo">3</div>
            </div>
            <div className="bform-title">Connect Your Financial Data</div>
            <div className="bform-sub">Upload real documents — trbo reads and extracts your data automatically</div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'1.5rem',alignItems:'start'}}>
              <div className="bform-card" style={{padding:'1.75rem'}}>
                {([
                  { key:'bank' as DocType, label:'Bank Statements', emoji:'🏦', required:true, badge:'trbo verified', badgeColor:'#dbeafe', badgeText:'#2563eb', desc:'trbo reads your PDF and extracts real income, balance & transaction data' },
                  { key:'payslip' as DocType, label:'Payslip / Salary Letter', emoji:'💼', required:false, badge:'', badgeColor:'', badgeText:'', desc:'trbo extracts salary, employer, job title from payslips' },
                  { key:'remit' as DocType, label:'Remittance Receipts', emoji:'↗️', required:false, badge:'BOOSTS SCORE', badgeColor:'#dcfce7', badgeText:'#15803d', desc:'Wise, Remitly, Western Union receipts boost your score significantly' },
                  { key:'passport' as DocType, label:'Passport / ID', emoji:'🪪', required:true, badge:'', badgeColor:'', badgeText:'', desc:'Government-issued identity document' },
                ]).map(doc => (
                  <div key={doc.key} style={{marginBottom:'1.25rem',paddingBottom:'1.25rem',borderBottom:'1px solid #f1f5f9'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem',flexWrap:'wrap'}}>
                      <span style={{fontSize:'1.1rem'}}>{doc.emoji}</span>
                      <span style={{fontSize:'0.95rem',fontWeight:600,color:'#0f172a'}}>{doc.label}</span>
                      {doc.required && <span style={{fontSize:'0.62rem',background:'#fee2e2',color:'#dc2626',border:'1px solid #fecaca',padding:'0.1rem 0.4rem',borderRadius:3,fontWeight:600}}>REQUIRED</span>}
                      {doc.badge && <span style={{fontSize:'0.62rem',background:doc.badgeColor,color:doc.badgeText,padding:'0.1rem 0.4rem',borderRadius:3,fontWeight:600}}>{doc.badge}</span>}
                    </div>
                    <div style={{fontSize:'0.78rem',color:'#64748b',marginBottom:'0.75rem'}}>{doc.desc}</div>
                    {docStatus[doc.key] === 'done' ? (
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 0.85rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.4rem',fontSize:'0.82rem',color:'#15803d',fontWeight:500}}>
                        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {docNames[doc.key]} — verified by trbo
                        <button onClick={() => removeDoc(doc.key)} style={{marginLeft:'auto',background:'none',border:'none',color:'#dc2626',cursor:'pointer',fontSize:'0.75rem',fontFamily:'inherit'}}>✕ Remove</button>
                      </div>
                    ) : docStatus[doc.key] === 'loading' ? (
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.82rem',color:'#2563eb',padding:'0.6rem 0'}}>
                        <div className="loading-spinner" style={{width:16,height:16,borderWidth:2,margin:0}} />
                        trbo is reading {docNames[doc.key]}...
                      </div>
                    ) : docStatus[doc.key] === 'error' ? (
                      <div style={{padding:'0.7rem 0.85rem',background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:'0.4rem'}}>
                        <div style={{fontSize:'0.8rem',fontWeight:600,color:'#c2410c',marginBottom:'0.35rem'}}>⚠ Upload failed</div>
                        <div style={{fontSize:'0.76rem',color:'#9a3412',marginBottom:'0.6rem'}}>{docErrors[doc.key] || 'Please try again with a smaller or clearer file.'}</div>
                        <button className="upload-choose-btn gold" type="button" onClick={() => fileRefs.current[doc.key]?.click()}>Retry Upload</button>
                        <input ref={el => { fileRefs.current[doc.key] = el }} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{display:'none'}} onChange={e => { if(e.target.files?.[0]) handleUpload(e.target.files[0], doc.key) }} />
                      </div>
                    ) : (
                      <div className="upload-dropzone" onClick={() => fileRefs.current[doc.key]?.click()}>
                        <svg viewBox="0 0 24 24" style={{width:28,height:28,stroke:'#94a3b8',fill:'none',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round',display:'block',margin:'0 auto 0.4rem'}}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                        <p style={{fontSize:'0.82rem',color:'#64748b',margin:'0.2rem 0 0.6rem'}}>Drop PDF here or click to upload</p>
                        <button className="upload-choose-btn gold" type="button" onClick={e => { e.stopPropagation(); fileRefs.current[doc.key]?.click() }}>Choose File</button>
                        <input ref={el => { fileRefs.current[doc.key] = el }} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{display:'none'}} onChange={e => { if(e.target.files?.[0]) handleUpload(e.target.files[0], doc.key) }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div className="bform-card">
                  <div style={{fontWeight:600,color:'#0f172a',marginBottom:'0.5rem',fontSize:'0.9rem'}}>What trbo reads</div>
                  {[
                    ['Bank statement','Income, savings, spending patterns'],
                    ['Payslip','Salary, employer, tenure'],
                    ['Remittances','Transfer consistency, amounts'],
                    ['ID / Passport','Identity verification'],
                  ].map(([doc,desc]) => (
                    <div key={doc} style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem',fontSize:'0.78rem'}}>
                      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#455c62" strokeWidth="2.5" style={{flexShrink:0,marginTop:2}}><polyline points="20 6 9 17 4 12"/></svg>
                      <div><strong>{doc}</strong><br/><span style={{color:'#64748b'}}>{desc}</span></div>
                    </div>
                  ))}
                </div>

                {Object.keys(parsedDocs).length > 0 && (
                  <div className="bform-card" style={{background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
                    <div style={{fontWeight:600,color:'#15803d',marginBottom:'0.75rem',fontSize:'0.85rem'}}>📊 Data extracted by trbo</div>
                    {parsedDocs.bank?.average_monthly_income && <div style={{fontSize:'0.78rem',marginBottom:'0.4rem'}}><strong>Income:</strong> ${Number(parsedDocs.bank.average_monthly_income).toLocaleString()}/mo</div>}
                    {parsedDocs.payslip?.employer && <div style={{fontSize:'0.78rem',marginBottom:'0.4rem'}}><strong>Employer:</strong> {parsedDocs.payslip.employer as string}</div>}
                    {parsedDocs.remit?.average_monthly_remittance && <div style={{fontSize:'0.78rem',marginBottom:'0.4rem'}}><strong>Remittances:</strong> ${Number(parsedDocs.remit.average_monthly_remittance).toLocaleString()}/mo</div>}
                    {parsedDocs.passport?.full_name && <div style={{fontSize:'0.78rem',marginBottom:'0.4rem'}}><strong>Name:</strong> {parsedDocs.passport.full_name as string}</div>}
                  </div>
                )}

                <div className="bform-card" style={{fontSize:'0.78rem',color:'#64748b',lineHeight:1.6}}>
                  <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.4rem'}}>
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#455c62" strokeWidth="2" style={{flexShrink:0,marginTop:2}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    256-bit encryption
                  </div>
                  <div style={{display:'flex',gap:'0.4rem'}}>
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#455c62" strokeWidth="2" style={{flexShrink:0,marginTop:2}}><polyline points="20 6 9 17 4 12"/></svg>
                    Data never stored permanently
                  </div>
                </div>
              </div>
            </div>

            <div className="bform-actions">
              <button className="btn-secondary" onClick={() => setStep('welcome')}>← Back</button>
              <button className="btn-primary" disabled={!requiredDocsUploaded || hasPendingUploads} onClick={() => setStep('form')} style={{opacity: (!requiredDocsUploaded || hasPendingUploads) ? 0.6 : 1, cursor: (!requiredDocsUploaded || hasPendingUploads) ? 'not-allowed' : 'pointer'}}>
                Continue to Your Details →
              </button>
            </div>
            {!requiredDocsUploaded && (
              <div style={{fontSize:'0.78rem',color:'#b45309',marginTop:'0.7rem'}}>Please upload the required documents (Bank Statement + Passport/ID) to continue.</div>
            )}
          </div>
        </div>
      )}

      {/* FORM */}
      {step === 'form' && (
        <div className="bform-wrap">
          <div className="bform-inner">
            <div className="step-bar">
              <div className="step-dot done">✓</div>
              <div className="step-line done" />
              <div className="step-dot done">✓</div>
              <div className="step-line done" />
              <div className="step-dot active">3</div>
            </div>
            <div className="bform-title">Basic Information</div>
            <div className="bform-sub">Confirm your details — documents take priority if uploaded</div>

            <div className="bform-card">
              <div style={{marginBottom:'1rem',fontWeight:600,fontSize:'0.85rem',color:'#475569',textTransform:'uppercase',letterSpacing:'0.05em'}}>Personal Details</div>
              <div className="bform-grid2" style={{marginBottom:'1rem'}}>
                <div>
                  <label className="bform-label">First Name</label>
                  <input className="bform-input" value={form.firstName} onChange={setF('firstName')} placeholder="Mohammed" />
                </div>
                <div>
                  <label className="bform-label">Last Name</label>
                  <input className="bform-input" value={form.lastName} onChange={setF('lastName')} placeholder="Al-Rahman" />
                </div>
              </div>
              <div className="bform-grid2" style={{marginBottom:'1rem'}}>
                <div>
                  <label className="bform-label">Email</label>
                  <input className="bform-input" type="email" value={form.email} onChange={setF('email')} placeholder="you@email.com" />
                </div>
                <div>
                  <label className="bform-label">Phone</label>
                  <input className="bform-input" value={form.phone} onChange={setF('phone')} placeholder="+971 50 000 0000" />
                </div>
              </div>
              <div className="bform-grid2">
                <div>
                  <label className="bform-label">Country of Origin</label>
                  <select className="bform-input" value={form.origin} onChange={setF('origin')}>
                    {['🇦🇪 UAE','🇮🇳 India','🇵🇰 Pakistan','🇵🇭 Philippines','🇳🇬 Nigeria','🇨🇳 China','🇧🇷 Brazil','🇲🇽 Mexico','🇬🇧 UK','🇧🇩 Bangladesh'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="bform-label">Destination Country</label>
                  <select className="bform-input" value={form.destination} onChange={setF('destination')}>
                    {['🇨🇦 Canada','🇬🇧 UK','🇺🇸 USA','🇦🇺 Australia','🇦🇪 UAE'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bform-card">
              <div style={{marginBottom:'1rem',fontWeight:600,fontSize:'0.85rem',color:'#475569',textTransform:'uppercase',letterSpacing:'0.05em'}}>Financial Information</div>
              <div className="bform-grid2" style={{marginBottom:'1rem'}}>
                <div>
                  <label className="bform-label">Monthly Income (USD)</label>
                  <input className="bform-input" type="number" value={form.income} onChange={setF('income')} placeholder="5000" />
                </div>
                <div>
                  <label className="bform-label">Monthly Savings (USD)</label>
                  <input className="bform-input" type="number" value={form.savings} onChange={setF('savings')} placeholder="800" />
                </div>
              </div>
              <div>
                <label className="bform-label">Monthly Remittances (USD)</label>
                <input className="bform-input" type="number" value={form.remittance} onChange={setF('remittance')} placeholder="600" style={{width:'100%'}} />
              </div>
            </div>

            <div className="bform-card">
              <div style={{marginBottom:'1rem',fontWeight:600,fontSize:'0.85rem',color:'#475569',textTransform:'uppercase',letterSpacing:'0.05em'}}>Employment</div>
              <div style={{marginBottom:'1rem'}}>
                <label className="bform-label">Employer</label>
                <input className="bform-input" value={form.employer} onChange={setF('employer')} placeholder="Emirates National Oil Co." style={{width:'100%'}} />
              </div>
              <div className="bform-grid2">
                <div>
                  <label className="bform-label">Employment Type</label>
                  <select className="bform-input" value={form.empType} onChange={setF('empType')}>
                    {['Full-time permanent','Full-time contract','Part-time','Self-employed','Freelance'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="bform-label">Tenure (months)</label>
                  <input className="bform-input" type="number" value={form.tenure} onChange={setF('tenure')} placeholder="24" />
                </div>
              </div>
            </div>

            <div className="bform-actions">
              <button className="btn-secondary" onClick={() => setStep('upload')}>← Back</button>
              <button className="btn-primary" onClick={generateScore}>Generate My Global Credit Profile →</button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {step === 'loading' && (
        <div className="bform-wrap">
          <div className="bform-inner" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'70vh',textAlign:'center'}}>
            <div className="step-bar" style={{maxWidth:320,width:'100%',marginBottom:'2.5rem'}}>
              <div className="step-dot done">✓</div>
              <div className="step-line done" />
              <div className="step-dot done">✓</div>
              <div className="step-line done" />
              <div className="step-dot active">3</div>
            </div>
            <div className="loading-spinner" />
            <h2 style={{fontSize:'1.5rem',fontWeight:600,color:'#0f172a',marginBottom:'0.75rem'}}>Analysing your financial profile…</h2>
            <p style={{color:'#64748b',fontSize:'0.9rem',marginBottom:'2rem'}}>Reading documents · Scoring income · Calculating risk</p>
            <div style={{display:'flex',flexDirection:'column',gap:'0.6rem',maxWidth:320,width:'100%'}}>
              {['Reading document data','Verifying income consistency','Calculating remittance score','Generating credit profile'].map((item) => (
                <div key={item} style={{display:'flex',alignItems:'center',gap:'0.6rem',fontSize:'0.82rem',color:'#64748b'}}>
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#455c62" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RESULT */}
      {step === 'result' && result && (
        <div className="bresult-wrap">
          <div className="bresult-inner">
            <div style={{marginBottom:'1.5rem'}}>
              <div className="step-bar" style={{maxWidth:300}}>
                <div className="step-dot done">✓</div>
                <div className="step-line done" />
                <div className="step-dot done">✓</div>
                <div className="step-line done" />
                <div className="step-dot done">3</div>
              </div>
              <div style={{fontSize:'1.75rem',fontWeight:600,color:'#0f172a',marginTop:'1rem'}}>Your Global Credit Profile is Ready!</div>
              <div style={{fontSize:'0.875rem',color:'#64748b'}}>You may qualify for credit in your new country</div>
            </div>

            <div className="bresult-grid">
              <div className="bresult-main">
                {/* Score card */}
                <div className="result-card" style={{textAlign:'center',padding:'2rem'}}>
                  <div style={{fontSize:'0.82rem',color:'#64748b',marginBottom:'0.5rem'}}>Your Global Credit Score</div>
                  <div className="score-big" style={{color:scoreColor}}>{result.global_score as number}</div>
                  <div className="score-band-pill" style={{background:scoreColor+'20',color:scoreColor,margin:'0.75rem auto',width:'fit-content'}}>
                    <svg viewBox="0 0 24 24" style={{width:14,height:14,stroke:scoreColor,fill:'none',strokeWidth:2.5}}><polyline points="20 6 9 17 4 12"/></svg>
                    {result.risk_tier as string}
                  </div>
                  <div style={{fontSize:'0.82rem',color:'#64748b',marginTop:'0.5rem'}}>
                    Confidence: {result.confidence as number}% · Credit Limit: ${(result.suggested_limit as number)?.toLocaleString()} · APR: {result.suggested_apr_low as number}–{result.suggested_apr_high as number}%
                  </div>
                </div>

                {/* Score factors */}
                <div className="result-card">
                  <h2>Your Financial Insights</h2>
                  {scoreFactors.map(f => (
                    <div key={f.label} className="factor-row">
                      <div className="factor-label">{f.label}</div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{width:`${f.score||0}%`,background:f.color}} />
                      </div>
                      <div className="factor-score">{f.score||0}</div>
                    </div>
                  ))}
                </div>

                {/* Narrative */}
                <div className="b-narrative">
                  <h2>What This Means</h2>
                  {(result.key_strengths as string[])?.length > 0 && (
                    <div style={{marginBottom:'1rem'}}>
                      <div style={{fontSize:'0.78rem',fontWeight:600,color:'#15803d',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.6rem'}}>✓ Strengths</div>
                      {(result.key_strengths as string[]).map(s => (
                        <div key={s} className="insight-item pos">
                          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#059669" strokeWidth="2.5" style={{flexShrink:0,marginTop:2}}><polyline points="20 6 9 17 4 12"/></svg>
                          <span style={{fontSize:'0.85rem',color:'#0f172a'}}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(result.key_risks as string[])?.length > 0 && (
                    <div style={{marginBottom:'1rem'}}>
                      <div style={{fontSize:'0.78rem',fontWeight:600,color:'#a16207',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.6rem'}}>⚠ Considerations</div>
                      {(result.key_risks as string[]).map(r => (
                        <div key={r} className="insight-item neg">
                          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#d97706" strokeWidth="2" style={{flexShrink:0,marginTop:2}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                          <span style={{fontSize:'0.85rem',color:'#0f172a'}}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.analyst_narrative && (
                    <div className="analyst-box">&ldquo;{result.analyst_narrative as string}&rdquo;</div>
                  )}
                </div>
              </div>

              <div className="bresult-sidebar">
                {/* Status */}
                <div className="result-card">
                  <h3>Status</h3>
                  {[
                    ['Identity verified', !!parsedDocs.passport],
                    ['Income confirmed', !!parsedDocs.bank || !!form.income],
                    ['Employment verified', !!parsedDocs.payslip || !!form.employer],
                    ['Remittances checked', !!parsedDocs.remit],
                  ].map(([label, done]) => (
                    <div key={label as string} className="check-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke={done ? '#059669' : '#94a3b8'} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{color: done ? '#0f172a' : '#94a3b8'}}>{label as string}</span>
                    </div>
                  ))}
                </div>

                {/* Decision */}
                <div className="result-card" style={{background:scoreColor+'10',border:`1px solid ${scoreColor}40`}}>
                  <h3 style={{color:scoreColor}}>Credit Decision</h3>
                  <div style={{fontSize:'2rem',fontWeight:700,color:scoreColor,marginBottom:'0.25rem'}}>${(result.suggested_limit as number)?.toLocaleString()}</div>
                  <div style={{fontSize:'0.78rem',color:'#64748b',marginBottom:'0.75rem'}}>Suggested credit limit</div>
                  <div style={{fontSize:'1.5rem',fontWeight:700,color:'#0f172a',marginBottom:'0.25rem'}}>{result.suggested_apr_low as number}–{result.suggested_apr_high as number}%</div>
                  <div style={{fontSize:'0.78rem',color:'#64748b'}}>Suggested APR range</div>
                </div>

                {/* Actions */}
                <div className="result-card">
                  <button style={{width:'100%',padding:'0.85rem',background:'#455c62',color:'#fff',border:'none',borderRadius:'0.5rem',fontSize:'0.9rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',marginBottom:'0.75rem'}}>
                    Send to Lender →
                  </button>
                  <button onClick={() => setStep('welcome')} style={{width:'100%',padding:'0.85rem',background:'#f3f3f5',color:'#475569',border:'1px solid #e2e8f0',borderRadius:'0.5rem',fontSize:'0.9rem',cursor:'pointer',fontFamily:'inherit'}}>
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="powered-bar" style={{marginTop:'2rem'}}>Powered by trbo · Global Financial Passport</div>
        </div>
      )}
    </>
  )
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:32,height:32,border:'2px solid #e2e8f0',borderTopColor:'#455c62',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <BorrowerPortalContent />
    </Suspense>
  )
}
