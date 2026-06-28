'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, DEMO_LENDER_IDS, type Borrower } from '@/lib/supabase'
import { Search, Filter, ArrowLeft } from 'lucide-react'


export default function BorrowersPage() {
  const router = useRouter()
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [filtered, setFiltered] = useState<Borrower[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  const loadBorrowers = useCallback(async (lenderId: string) => {
    const dbId = DEMO_LENDER_IDS[lenderId] || lenderId
    const { data } = await supabase.from('borrowers').select('*').eq('lender_id', dbId).order('created_at', { ascending: false })
    setBorrowers(data || [])
    setFiltered(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const demoId = localStorage.getItem('trbo_demo_lender')
    if (demoId && demoId !== 'trbo_admin') { loadBorrowers(demoId); return }
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('lender_id').eq('id', user.id).single()
      if (profile?.lender_id) loadBorrowers(profile.lender_id)
    })
  }, [router, loadBorrowers])

  useEffect(() => {
    let f = [...borrowers]
    if (search) f = f.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'all') f = f.filter(b => b.status === statusFilter)
    if (riskFilter !== 'all') f = f.filter(b => b.risk === riskFilter)
    setFiltered(f)
  }, [search, statusFilter, riskFilter, borrowers])

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/lender/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={15}/> Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-semibold text-gray-900">Borrowers</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search borrowers..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62] transition-all"/>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#455c62]">
            <option value="all">All Status</option>
            <option value="Ready">Ready</option>
            <option value="Processing">Processing</option>
            <option value="Under Review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#455c62]">
            <option value="all">All Risk</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
            <Filter size={13}/> {filtered.length} results
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#455c62]/20 border-t-[#455c62] rounded-full animate-spin"/></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-sm">No borrowers found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-gray-50 bg-gray-50/50">
                {['Borrower','Corridor','Score','Risk','Status','Date',''].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#455c62]/10 flex items-center justify-center text-xs font-semibold text-[#455c62]">
                          {b.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{b.name}</div>
                          {b.email && <div className="text-xs text-gray-400">{b.email}</div>}
                        </div>
                        {b.is_demo && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-medium">demo</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{b.origin_country} → {b.destination_country}</td>
                    <td className="px-6 py-4"><span className="text-sm font-bold text-gray-900">{b.global_score || '—'}</span></td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${b.risk === 'Low' ? 'bg-green-50 text-green-700' : b.risk === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                        {b.risk || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${b.status === 'Ready' || b.status === 'approved' ? 'bg-green-50 text-green-700' : b.status === 'Under Review' ? 'bg-yellow-50 text-yellow-700' : b.status === 'declined' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(b.created_at).toLocaleDateString('en-CA')}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/lender/borrowers/${b.id}`} className="text-xs font-medium text-[#455c62] hover:underline">View Profile →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
