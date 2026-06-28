'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Borrower } from '@/lib/supabase'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'

export default function BorrowerProfile() {
  const { id } = useParams()
  const [borrower, setBorrower] = useState<Borrower | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('borrowers').select('*').eq('id', id as string).single().then(({ data }) => {
      setBorrower(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#455c62]/20 border-t-[#455c62] rounded-full animate-spin"/></div>
  if (!borrower) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><p className="text-gray-500">Borrower not found</p></div>

  const scoreColor = (borrower.global_score || 0) >= 750 ? '#059669' : (borrower.global_score || 0) >= 650 ? '#2563eb' : '#d97706'
  const scorePct = Math.round(((borrower.global_score || 300) - 300) / 550 * 100)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="px-8 py-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/lender/borrowers" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={15}/> Borrowers</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-700 font-medium">{borrower.name}</span>
          {borrower.is_demo && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded font-medium">demo</span>}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Score card */}
          <div className="col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Global Credit Score</div>
              <div className="text-7xl font-bold mb-2 leading-none" style={{color: scoreColor}}>{borrower.global_score || '—'}</div>
              <div className="text-sm font-medium mb-4" style={{color: scoreColor}}>{borrower.risk_tier || '—'}</div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-1000" style={{width: `${scorePct}%`, background: scoreColor}}/>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-4"><span>300</span><span>850</span></div>
              <div className="text-xs text-gray-400">Confidence: {borrower.confidence || '—'}%</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 mt-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Credit Decision</div>
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-0.5">Suggested Limit</div>
                <div className="text-2xl font-bold text-gray-900">${(borrower.suggested_limit || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Suggested APR</div>
                <div className="text-2xl font-bold text-gray-900">{borrower.suggested_apr_low}–{borrower.suggested_apr_high}%</div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="col-span-2 space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Borrower Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Name', borrower.name],
                  ['Email', borrower.email || '—'],
                  ['From', borrower.origin_country],
                  ['To', borrower.destination_country],
                  ['Employer', borrower.employer || '—'],
                  ['Employment', borrower.employment_type || '—'],
                  ['Tenure', borrower.tenure_months ? `${borrower.tenure_months} months` : '—'],
                  ['Status', borrower.status],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-gray-400 mb-0.5">{k}</div>
                    <div className="text-sm font-medium text-gray-900">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                ['Monthly Income', `$${(borrower.income_usd || 0).toLocaleString()}`],
                ['Monthly Savings', `$${(borrower.savings_usd || 0).toLocaleString()}`],
                ['Remittances', `$${(borrower.remittance_usd || 0).toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="text-xs text-gray-400 mb-1">{k}</div>
                  <div className="text-2xl font-bold text-gray-900">{v}</div>
                </div>
              ))}
            </div>

            {(borrower.key_strengths?.length || borrower.key_risks?.length) && (
              <div className="grid grid-cols-2 gap-4">
                {borrower.key_strengths?.length ? (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                    <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">Strengths</div>
                    {borrower.key_strengths.map((s: string) => (
                      <div key={s} className="flex items-start gap-2 mb-2"><CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0"/><span className="text-sm text-gray-700">{s}</span></div>
                    ))}
                  </div>
                ) : null}
                {borrower.key_risks?.length ? (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
                    <div className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3">Considerations</div>
                    {borrower.key_risks.map((r: string) => (
                      <div key={r} className="flex items-start gap-2 mb-2"><AlertTriangle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0"/><span className="text-sm text-gray-700">{r}</span></div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {borrower.analyst_narrative && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Analyst Narrative</div>
                <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{borrower.analyst_narrative}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
