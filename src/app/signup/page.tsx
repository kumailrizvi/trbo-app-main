'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ firstName:'', lastName:'', company:'', email:'', password:'', type:'Fintech Lender' })

  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setForm(f => ({...f,[k]:e.target.value})) }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      const { data, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
      if (authErr) throw authErr

      const code = form.company.toLowerCase().replace(/\s+/g,'_') + '_' + Date.now().toString(36)
      const { data: lender, error: lErr } = await supabase.from('lenders').insert({
        company_name: form.company, plan: 'starter', affiliate_code: code, primary_color: '#455c62',
      }).select().single()
      if (lErr) throw lErr

      await supabase.from('users').insert({
        id: data.user!.id, email: form.email,
        name: `${form.firstName} ${form.lastName}`.trim(),
        lender_id: lender.id, role: 'admin',
      })

      router.push('/portal')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <div style={{fontFamily:"'DM Serif Display',serif"}} className="text-4xl text-[#455c62]">trbo.</div>
          <div className="text-xs tracking-[0.3em] text-gray-400 uppercase mt-1">Financial</div>
        </Link>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Create your account</h1>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
                <input value={form.firstName} onChange={set('firstName')} placeholder="Sarah" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62] transition-all"/></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Last Name</label>
                <input value={form.lastName} onChange={set('lastName')} placeholder="Chen" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62] transition-all"/></div>
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Company Name</label>
              <input value={form.company} onChange={set('company')} placeholder="KOHO Financial" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62] transition-all"/></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Company Type</label>
              <select value={form.type} onChange={set('type')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62] transition-all">
                {['Fintech Lender','Traditional Bank','Credit Union','Alternative Lender','BNPL Provider'].map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Work Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62] transition-all"/></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#455c62] transition-all"/></div>
            <p className="text-xs text-gray-400">By creating an account you agree to trbo&apos;s Terms of Service and Privacy Policy</p>
            <button type="submit" disabled={loading} className="w-full bg-[#455c62] hover:bg-[#344a50] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link href="/login" className="text-[#455c62] font-medium">Sign in →</Link></p>
        </div>
      </div>
    </div>
  )
}
