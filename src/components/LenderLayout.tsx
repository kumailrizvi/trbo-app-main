'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Users, Search, BarChart2, Link2,
  Shield, Terminal, Users2, Settings, LogOut, Lock, ChevronDown
} from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/lender/dashboard' },
  { id: 'borrowers', label: 'Borrowers', icon: Users, href: '/lender/borrowers' },
  { id: 'run-check', label: 'Run Check', icon: Search, href: '/lender/run-check' },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, href: '/lender/analytics' },
  { id: 'affiliate', label: 'Affiliate Links', icon: Link2, href: '/lender/affiliate' },
  { id: 'pricing', label: 'Pricing Engine', icon: Shield, href: '/lender/pricing' },
  { id: 'webhooks', label: 'Webhooks', icon: Terminal, href: '/lender/webhooks' },
  { id: 'team', label: 'Team', icon: Users2, href: '/lender/team' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/lender/settings' },
]

type Props = {
  lenderName: string
  lenderColor: string
  isAdmin: boolean
  children: React.ReactNode
}

export default function LenderLayout({ lenderName, lenderColor, isAdmin, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    localStorage.removeItem('trbo_demo_lender')
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: '#455c62' }}>
        <div className="px-5 py-6 border-b border-white/10">
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.5rem', color: 'white' }}>trbo.</div>
          <div style={{ fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: '2px' }}>Financial</div>
        </div>

        <div className="px-3 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: lenderColor }}>{lenderName[0]}</div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }} className="truncate flex-1">{lenderName}</span>
            {isAdmin && <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />}
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link key={item.id} href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                  textDecoration: 'none',
                  background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.55)',
                }}>
                <Icon size={15} />{item.label}
              </Link>
            )
          })}
          {isAdmin && (
            <>
              <div style={{ margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <Link href="/lender/all-lenders"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                }}>
                <Lock size={13} />All Lenders
              </Link>
            </>
          )}
        </nav>

        <div className="px-2 pb-4">
          <button onClick={signOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', fontSize: '12px',
              color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer',
            }}>
            <LogOut size={14} />Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
