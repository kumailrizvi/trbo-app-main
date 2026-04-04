'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Lender } from '@/lib/supabase'

const DEMO_LENDERS: Record<string, Lender> = {
  lender_koho: { id: 'lender_koho', company_name: 'KOHO Financial', plan: 'growth', primary_color: '#2563eb', affiliate_code: 'koho_canada_q2', min_score: 650, max_risk: 'Medium', corridors: ['UAE→Canada','India→Canada','Pakistan→Canada'] },
  lender_borrowell: { id: 'lender_borrowell', company_name: 'Borrowell', plan: 'starter', primary_color: '#059669', affiliate_code: 'borrowell_intl_2026', min_score: 620, max_risk: 'High', corridors: ['India→Canada','Philippines→Canada','Nigeria→UK'] },
  lender_rbc: { id: 'lender_rbc', company_name: 'RBC Newcomer', plan: 'enterprise', primary_color: '#dc2626', affiliate_code: 'rbc_newcomer_2026', min_score: 720, max_risk: 'Low', corridors: ['UAE→Canada','India→Canada','UK→Canada'] },
  trbo_admin: { id: 'trbo_admin', company_name: 'trbo Admin', plan: 'admin', primary_color: '#455c62', affiliate_code: '', min_score: 0, max_risk: 'High', corridors: [] },
}

export const DEMO_LENDER_IDS: Record<string, string> = {
  lender_koho: '11111111-1111-1111-1111-111111111111',
  lender_borrowell: '22222222-2222-2222-2222-222222222222',
  lender_rbc: '33333333-3333-3333-3333-333333333333',
}

export function useLender() {
  const router = useRouter()
  const [lender, setLender] = useState<Lender | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demoId = localStorage.getItem('trbo_demo_lender')
    if (demoId) {
      const dl = DEMO_LENDERS[demoId]
      if (dl) { setLender(dl); setIsAdmin(demoId === 'trbo_admin'); setLoading(false); return }
    }
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('*, lenders(*)').eq('id', user.id).single()
      if (profile?.lenders) { setLender(profile.lenders as Lender); setLoading(false) }
      else { router.push('/login') }
    })
  }, [router])

  const dbLenderId = lender ? (DEMO_LENDER_IDS[lender.id] || lender.id) : null

  return { lender, isAdmin, loading, dbLenderId }
}
