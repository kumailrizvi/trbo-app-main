'use client'
import { useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase, DEMO_LENDER_IDS } from '@/lib/supabase'
import { Upload, CheckCircle, Loader } from 'lucide-react'

type DocKey = 'bank' | 'payslip' | 'remit' | 'passport'
type ParsedDocs = Partial<Record<DocKey, Record<string, unknown>>>

const DOC_CONFIG: Record<DocKey, { label: string; sub: string; required: boolean; boost?: boolean }> = {
  bank:     { label: 'Bank Statement', sub: 'Last 3–6 months', required: true },
  payslip:  { label: 'Payslip / Salary Letter', sub: 'Latest 1–3 payslips', required: false },
  remit:    { label: 'Remittance Proof', sub: 'Wise, Remitly, Western Union', required: false, boost: true },
  passport: { label: 'Passport / ID', sub: 'Any government-issued ID', required: true },
}

function ApplyContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref') || ''
  const [step, setStep] = useState(1)
  const [docs, setDocs] = useState<ParsedDocs>({})
  const [docStatus, setDocStatus] = useState<Partial<Record<DocKey, 'loading'|'done'|'error'>>>({})
  const [form, setForm] = useState({ name:'', origin:'🇦🇪 UAE', destination:'🇨🇦 Canada', income:'', savings:'', remittance:'', employer:'', empType:'Full-time permanent', tenure:'' })
  const [score, setScore] = useState<Record<string, unknown> | null>(null)
  const [scoring, setScoring] = useState(false)
  const fileRefs = useRef<Partial<Record<DocKey, HTMLInputElement | null>>>({})

  async function handleUpload(file: File, docType: DocKey) {
    setDocStatus(s => ({...s, [docType]: 'loading'}))
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader(); r.onload = () => res((r.result as string).split(',')[1]); r.onerror = rej; r.readAsDataURL(file)
      })
      const isImg = file.type.startsWith('image/')
      const prompts: Record<DocKey, string> = {
        bank: 'Extract from this bank statement: average_monthly_income, average_monthly_balance, average_monthly_savings, currency, income_consistency (HIGH/MEDIUM/LOW), months_covered. Return JSON only.',
        payslip: 'Extract from this payslip: monthly_income, currency, employer, job_title, employment_type. Return JSON only.',
        remit: 'Extract from this remittance document: average_monthly_remittance, currency, transfer_provider, destination_country, months_covered. Return JSON only.',
        passport: 'Extract from this ID document: full_name, nationality, date_of_birth, document_type. Return JSON only.',
      }
      const resp = await fetch('/api/parse-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [
          { type: isImg ? 'image' : 'document', source: { type: 'base64', media_type: isImg ? file.type : 'application/pdf', data: base64 } },
          { type: 'text', text: prompts[docType] }
        ]})
      })
      const parsed = await resp.json()
      setDocs(d => ({...d, [docType]: parsed}))
      setDocStatus(s => ({...s, [docType]: 'done'}))
      // Auto-fill form
      if (docType === 'bank' && parsed.average_monthly_income) setForm(f => ({...f, income: String(parsed.average_monthly_income)}))
      if (docType === 'payslip' && parsed.employer) setForm(f => ({...f, employer: parsed.employer as string}))
      if (docType === 'remit' && parsed.average_monthly_remittance) setForm(f => ({...f, remittance: String(parsed.average_monthly_remittance)}))
      if (docType === 'passport' && parsed.full_name) setForm(f => ({...f, name: parsed.full_name as string}))
    } catch {
      setDocStatus(s => ({...s, [docType]: 'error'}))
    }
  }

  async function generateScore() {
    setScoring(true)
    const prompt = `Borrower: ${form.name}, from ${form.origin} to ${form.destination}
Income: $${form.income}/mo, Savings: $${form.savings}/mo, Remittances: $${form.remittance}/mo
Employer: ${form.employer}, Tenure: ${form.tenure} months, Type: ${form.empType}
Documents: ${Object.keys(docs).join(', ')}
Extracted data: ${JSON.stringify(docs, null, 2)}`

    try {
      const resp = await fetch('/api/score', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({prompt}) })
      const result = await resp.json()
      setScore(result)

      // Save to Supabase
      const lenderId = ref ? (DEMO_LENDER_IDS['lender_' + ref.split('_')[0]] || null) : null
      await supabase.from('borrowers').insert({
        lender_id: lenderId,
        name: form.name, origin_country: form.origin, destination_country: form.destination,
        status: 'Ready', global_score: result.global_score,
        risk: result.risk_tier === 'Prime' || result.risk_tier === 'Near-Prime' ? 'Low' : result.risk_tier === 'Subprime' ? 'Medium' : 'High',
        risk_tier: result.risk_tier,
        income_usd: parseFloat(form.income)||null, savings_usd: parseFloat(form.savings)||null,
        remittance_usd: parseFloat(form.remittance)||null, employer: form.employer||null,
        employment_type: form.empType, tenure_months: parseInt(form.tenure)||null,
        suggested_limit: result.suggested_limit, suggested_apr_low: result.suggested_apr_low,
        suggested_apr_high: result.suggested_apr_high, analyst_narrative: result.analyst_narrative,
        key_strengths: result.key_strengths||[], key_risks: result.key_risks||[],
        confidence: result.confidence, parsed_docs: docs, is_demo: false,
      })
    } catch (e) { console.error(e) } finally { setScoring(false) }
  }

  const primaryColor = '#455c62'
  const scoreColor = score ? ((score.global_score as number) >= 750 ? '#059669' : (score.global_score as number) >= 650 ? '#2563eb' : '#d97706') : primaryColor

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div style={{fontFamily:"'DM Serif Display',serif"}} className="text-2xl" style2={{color: primaryColor}}>trbo.</div>
        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Powered by trbo</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${s <= step ? 'text-white' : 'bg-gray-100 text-gray-400'}`} style={s <= step ? {background: primaryColor} : {}}>{s < step ? '✓' : s}</div>
              {s < 3 && <div className={`h-px flex-1 w-16 transition-all ${s < step ? 'bg-[#455c62]' : 'bg-gray-200'}`}/>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Build Your Global Financial Passport</h1>
            <p className="text-gray-500 mb-8">Upload your documents and get a credit decision in minutes.</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[['⚡','2 minutes','to complete'],['🔒','Bank-grade','security'],['🌍','Global','data accepted']].map(([icon,t,s]) => (
                <div key={t} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-sm font-semibold text-gray-900">{t}</div>
                  <div className="text-xs text-gray-500">{s}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full py-4 rounded-xl text-white font-semibold text-base transition-colors" style={{background: primaryColor}}>Get My Credit Score →</button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Documents</h2>
            <p className="text-sm text-gray-500 mb-6">trbo reads your documents and extracts your financial data in seconds.</p>
            <div className="space-y-3 mb-6">
              {(Object.entries(DOC_CONFIG) as [DocKey, typeof DOC_CONFIG[DocKey]][]).map(([key, cfg]) => {
                const status = docStatus[key]
                return (
                  <div key={key} onClick={() => fileRefs.current[key]?.click()}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${status === 'done' ? 'border-green-300 bg-green-50' : status === 'loading' ? 'border-blue-200 bg-blue-50' : 'border-dashed border-gray-200 hover:border-[#455c62]/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{cfg.label}</span>
                          {cfg.required && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">REQUIRED</span>}
                          {cfg.boost && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-semibold">BOOSTS SCORE</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {status === 'loading' ? 'trbo is reading your document...' : status === 'done' ? '✓ Verified by trbo' : cfg.sub}
                        </div>
                      </div>
                      {status === 'loading' ? <Loader size={18} className="animate-spin text-blue-500"/> : status === 'done' ? <CheckCircle size={18} className="text-green-500"/> : <Upload size={18} className="text-gray-400"/>}
                    </div>
                    <input ref={el => { fileRefs.current[key] = el }} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], key) }}/>
                  </div>
                )
              })}
            </div>
            {Object.keys(docs).length > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                <div className="text-xs font-semibold text-green-700 mb-2">✓ Data extracted by trbo</div>
                <div className="grid grid-cols-2 gap-2">
                  {docs.bank?.average_monthly_income && <div className="bg-white rounded-lg p-2"><div className="text-xs text-gray-400">Income</div><div className="text-sm font-semibold">${Number(docs.bank.average_monthly_income).toLocaleString()}/mo</div></div>}
                  {docs.payslip?.employer && <div className="bg-white rounded-lg p-2"><div className="text-xs text-gray-400">Employer</div><div className="text-sm font-semibold">{String(docs.payslip.employer)}</div></div>}
                  {docs.remit?.average_monthly_remittance && <div className="bg-white rounded-lg p-2"><div className="text-xs text-gray-400">Remittances</div><div className="text-sm font-semibold">${Number(docs.remit.average_monthly_remittance).toLocaleString()}/mo</div></div>}
                  {docs.passport?.full_name && <div className="bg-white rounded-lg p-2"><div className="text-xs text-gray-400">Name verified</div><div className="text-sm font-semibold">{String(docs.passport.full_name)}</div></div>}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600">← Back</button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-white font-medium text-sm" style={{background: primaryColor}}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Details</h2>
            <p className="text-sm text-gray-500 mb-6">Confirm your information. Uploaded documents take priority.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} placeholder="Mohammed Al-Rahman" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62]"/></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Origin Country</label>
                <select value={form.origin} onChange={e => setForm(f => ({...f,origin:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62]">
                  {['🇦🇪 UAE','🇮🇳 India','🇵🇰 Pakistan','🇵🇭 Philippines','🇳🇬 Nigeria','🇨🇳 China','🇧🇷 Brazil','🇲🇽 Mexico','🇬🇧 UK'].map(o=><option key={o}>{o}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Destination</label>
                <select value={form.destination} onChange={e => setForm(f => ({...f,destination:e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62]">
                  {['🇨🇦 Canada','🇬🇧 UK','🇺🇸 USA','🇦🇺 Australia','🇦🇪 UAE'].map(o=><option key={o}>{o}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Monthly Income (USD)</label>
                <input type="number" value={form.income} onChange={e => setForm(f => ({...f,income:e.target.value}))} placeholder="5000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62]"/></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Monthly Savings (USD)</label>
                <input type="number" value={form.savings} onChange={e => setForm(f => ({...f,savings:e.target.value}))} placeholder="800" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62]"/></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Monthly Remittances (USD)</label>
                <input type="number" value={form.remittance} onChange={e => setForm(f => ({...f,remittance:e.target.value}))} placeholder="600" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62]"/></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Employer</label>
                <input value={form.employer} onChange={e => setForm(f => ({...f,employer:e.target.value}))} placeholder="Emirates National Oil Co." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62]"/></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tenure (months)</label>
                <input type="number" value={form.tenure} onChange={e => setForm(f => ({...f,tenure:e.target.value}))} placeholder="24" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62]"/></div>
            </div>

            {score && (
              <div className="border border-gray-100 rounded-2xl p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Global Credit Score</div>
                  <div className="text-7xl font-bold leading-none mb-2" style={{color: scoreColor}}>{score.global_score as number}</div>
                  <span className="text-sm font-medium px-3 py-1 rounded-full text-white" style={{background: scoreColor}}>{score.risk_tier as string}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-4"><div className="text-xs text-gray-400">Credit Limit</div><div className="text-xl font-bold">${(score.suggested_limit as number)?.toLocaleString()}</div></div>
                  <div className="bg-gray-50 rounded-xl p-4"><div className="text-xs text-gray-400">APR Range</div><div className="text-xl font-bold">{score.suggested_apr_low as number}–{score.suggested_apr_high as number}%</div></div>
                </div>
                {(score.key_strengths as string[])?.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4 mb-3">
                    <div className="text-xs font-semibold text-green-700 mb-2">✓ Strengths</div>
                    {(score.key_strengths as string[]).map(s => <div key={s} className="text-sm text-gray-700 mb-1">• {s}</div>)}
                  </div>
                )}
                {score.analyst_narrative && <p className="text-sm text-gray-500 italic">"{score.analyst_narrative as string}"</p>}
              </div>
            )}

            {scoring && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-3 border-gray-200 rounded-full animate-spin mx-auto mb-3" style={{borderTopColor: primaryColor, borderWidth: '3px'}}/>
                <div className="text-sm font-medium text-gray-700">Generating your Global Financial Passport...</div>
                <div className="text-xs text-gray-400 mt-1">Reading documents · Scoring income · Calculating risk</div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600">← Back</button>
              {!score ? (
                <button onClick={generateScore} disabled={scoring} className="flex-1 py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{background: primaryColor}}>
                  {scoring ? 'Analyzing...' : 'Generate My Credit Score →'}
                </button>
              ) : (
                <button className="flex-1 py-3.5 rounded-xl text-white font-semibold text-sm" style={{background: primaryColor}}>Send to Lender ✓</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApplyPage() {
  return <Suspense><ApplyContent /></Suspense>
}
