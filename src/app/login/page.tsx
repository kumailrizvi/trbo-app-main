'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const DEMOS = [
  { id: 'lender_koho', name: 'KOHO Financial', plan: 'Growth', color: '#2563eb', logo: 'K' },
  { id: 'lender_borrowell', name: 'Borrowell', plan: 'Starter', color: '#059669', logo: 'B' },
  { id: 'lender_rbc', name: 'RBC Newcomer', plan: 'Enterprise', color: '#dc2626', logo: 'R' },
  { id: 'trbo_admin', name: 'trbo Admin', plan: 'Super Admin', color: '#455c62', logo: 'T' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/portal')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      setLoading(false)
    }
  }

  function loginAsDemo(id: string) {
    localStorage.setItem('trbo_demo_lender', id)
    router.push('/portal')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <div style={{fontFamily:"'DM Serif Display',serif"}} className="text-4xl text-[#455c62]">trbo.</div>
          <div className="text-xs tracking-[0.3em] text-gray-400 uppercase mt-1">Financial</div>
        </Link>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm mb-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Sign in</h1>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62] focus:ring-2 focus:ring-[#455c62]/10 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62] focus:ring-2 focus:ring-[#455c62]/10 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#455c62] hover:bg-[#344a50] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            No account? <Link href="/signup" className="text-[#455c62] font-medium">Create one →</Link>
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Demo Accounts</div>
          <div className="space-y-2">
            {DEMOS.map(d => (
              <button key={d.id} onClick={() => loginAsDemo(d.id)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 hover:border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-all text-left">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{background:d.color}}>{d.logo}</div>
                <div className="flex-1"><div className="text-sm font-medium text-gray-900">{d.name}</div><div className="text-xs text-gray-400">{d.plan}</div></div>
                <span className="text-xs text-[#455c62] font-medium">Sign in →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
