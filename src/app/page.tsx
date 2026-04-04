'use client'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

const CORRIDORS = ['🇦🇪 UAE → 🇨🇦 Canada','🇮🇳 India → 🇨🇦 Canada','🇮🇳 India → 🇬🇧 UK','🇵🇭 Philippines → 🇨🇦 Canada','🇵🇰 Pakistan → 🇨🇦 Canada','🇳🇬 Nigeria → 🇬🇧 UK','🇲🇽 Mexico → 🇺🇸 USA','🇧🇷 Brazil → 🇺🇸 USA','🇧🇩 Bangladesh → 🇸🇦 Saudi','🇨🇳 China → 🇨🇦 Canada','🇬🇧 UK → 🇨🇦 Canada','🇸🇬 Singapore → 🇦🇺 Australia']

const PLANS = [
  { name:'Starter', price:'$2,000', period:'/month', desc:'For fintechs getting started.', featured:false, features:['200 credit checks/mo','3 corridors','3 team seats','Webhooks','Affiliate links'] },
  { name:'Growth', price:'$5,000', period:'/month', desc:'For scaling multi-corridor lenders.', featured:true, features:['1,000 credit checks/mo','All corridors','10 team seats','White-label portal','Custom risk thresholds','Priority support'] },
  { name:'Enterprise', price:'Custom', period:'', desc:'For banks with high volume needs.', featured:false, features:['Unlimited checks','Custom domain','Unlimited seats','SLA support','Bureau API integration','On-premise option'] },
]

const FEATURES = [
  { icon:'📄', title:'Real Document Parsing', desc:'Upload any PDF bank statement, payslip, or remittance receipt. trbo extracts real numbers — no forms to fill.' },
  { icon:'📊', title:'7-Factor Credit Score', desc:'Income stability, savings rate, remittance consistency, employment tenure, document completeness, cash flow health.' },
  { icon:'🔗', title:'Affiliate Links', desc:'Generate branded borrower links per campaign. Track clicks, conversions, and corridor performance in real time.' },
  { icon:'🔒', title:'White-Label Portal', desc:'Borrowers see your brand, your domain, your colors. trbo is invisible infrastructure underneath.' },
  { icon:'⚡', title:'Pricing Engine', desc:'Set score bands, APR ranges, credit limits, DTI rules, and corridor restrictions per lender account.' },
  { icon:'🔌', title:'Webhooks & API', desc:'Real-time events fired to your endpoint on every decision. Full REST API for deep integration.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white" style={{fontFamily:"'DM Sans',sans-serif"}}>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-5 border-b border-white/5 backdrop-blur-md bg-[#0d1117]/80">
        <div style={{fontFamily:"'DM Serif Display',serif"}} className="text-3xl text-white tracking-tight">trbo<span className="text-[#455c62]">.</span></div>
        <div className="flex items-center gap-8">
          {['How it works','Features','Pricing'].map(l => <a key={l} href={'#'+l.toLowerCase().replace(' ','-')} className="text-sm text-white/50 hover:text-white transition-colors">{l}</a>)}
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
          <Link href="/signup" className="bg-[#455c62] hover:bg-[#344a50] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">Get started free →</Link>
        </div>
      </nav>

      <section className="pt-48 pb-24 px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-[#455c62]/15 border border-[#455c62]/30 text-[#7a9aab] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#455c62] animate-pulse" />Cross-border credit infrastructure
        </div>
        <h1 style={{fontFamily:"'DM Serif Display',serif"}} className="text-6xl md:text-7xl leading-[1.05] tracking-tight mb-6">
          Your Global<br /><em className="text-[#7a9aab] not-italic">Financial Passport</em>
        </h1>
        <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 font-light leading-relaxed">trbo gives lenders instant credit decisions on migrants using their real global financial history — no local credit history needed.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-[#455c62] hover:bg-[#344a50] text-white font-medium px-8 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5 flex items-center gap-2">Start for free <ArrowRight size={18}/></Link>
          <Link href="/login" className="border border-white/15 hover:border-white/30 text-white/70 hover:text-white px-8 py-4 rounded-xl text-base transition-all">View demo portal</Link>
        </div>
      </section>

      <div className="border-y border-white/5 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-4">
          {[['2.4s','Average score time'],['12+','Active corridors'],['94%','Parse accuracy'],['300–850','Global credit scale']].map(([n,l],i) => (
            <div key={l} className={`text-center px-8 ${i<3?'border-r border-white/5':''}`}>
              <div style={{fontFamily:"'DM Serif Display',serif"}} className="text-4xl text-white mb-1">{n}</div>
              <div className="text-xs text-white/35 tracking-wide">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <section id="how-it-works" className="py-24 px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-[0.12em] uppercase text-[#455c62] mb-3">Process</div>
          <h2 style={{fontFamily:"'DM Serif Display',serif"}} className="text-4xl text-white mb-3">From application to decision<br/>in under 3 seconds</h2>
        </div>
        <div className="grid grid-cols-4 gap-6 relative">
          <div className="absolute top-7 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#455c62]/40 to-transparent"/>
          {[['1','Borrower applies','Via your branded portal. Uploads bank statement, payslip, remittance proof.'],['2','trbo reads documents','AI extracts income, savings, employer, and transfer history from real files.'],['3','Score generated','300–850 global score across 7 weighted factors. APR and limit suggested.'],['4','Lender decides','Auto-approve, auto-decline, or route to review based on your thresholds.']].map(([n,t,d]) => (
            <div key={n} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#161b22] border border-[#455c62]/40 text-[#455c62] text-xl flex items-center justify-center mx-auto mb-5" style={{fontFamily:"'DM Serif Display',serif"}}>{n}</div>
              <div className="text-sm font-medium text-white mb-2">{t}</div>
              <div className="text-xs text-white/35 leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold tracking-[0.12em] uppercase text-[#455c62] mb-3">Features</div>
          <h2 style={{fontFamily:"'DM Serif Display',serif"}} className="text-4xl text-white">Built for the full lending lifecycle</h2>
        </div>
        <div className="grid grid-cols-3 border border-white/6 rounded-2xl overflow-hidden bg-[#0d1117]">
          {FEATURES.map((f,i) => (
            <div key={f.title} className="p-10 hover:bg-[#161b22] transition-colors" style={{borderRight:i%3<2?'1px solid rgba(255,255,255,0.06)':'none',borderBottom:i<3?'1px solid rgba(255,255,255,0.06)':'none'}}>
              <div className="w-11 h-11 bg-[#455c62]/15 border border-[#455c62]/25 rounded-xl flex items-center justify-center text-lg mb-5">{f.icon}</div>
              <div className="text-sm font-medium text-white mb-2">{f.title}</div>
              <div className="text-xs text-white/35 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-y border-white/5 py-16 px-12">
        <div className="max-w-6xl mx-auto flex items-center gap-16">
          <div className="flex-shrink-0 w-80">
            <div className="text-xs font-semibold tracking-[0.12em] uppercase text-[#455c62] mb-3">Coverage</div>
            <h3 style={{fontFamily:"'DM Serif Display',serif"}} className="text-3xl text-white leading-tight mb-3">12 active corridors.<br/>More quarterly.</h3>
            <p className="text-sm text-white/35 leading-relaxed font-light">We score borrowers from any country with bank statements in any currency.</p>
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            {CORRIDORS.map(c => <span key={c} className="px-4 py-2 bg-[#161b22] border border-white/8 rounded-full text-xs text-white/50 hover:border-[#455c62]/50 hover:text-white/80 transition-all cursor-default">{c}</span>)}
          </div>
        </div>
      </div>

      <section id="pricing" className="py-24 px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold tracking-[0.12em] uppercase text-[#455c62] mb-3">Pricing</div>
          <h2 style={{fontFamily:"'DM Serif Display',serif"}} className="text-4xl text-white mb-3">Simple, usage-based pricing</h2>
          <p className="text-white/40 text-sm">Pay per credit check. No setup fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div key={p.name} className={`relative rounded-2xl p-8 ${p.featured?'border border-[#455c62]/50 bg-[#1a2030]':'bg-[#161b22] border border-white/8'}`}>
              {p.featured && <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-[#455c62] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-b-lg">Most popular</div>}
              <div className="text-xs font-semibold tracking-widest uppercase text-white/35 mb-3">{p.name}</div>
              <div style={{fontFamily:"'DM Serif Display',serif"}} className="text-5xl text-white leading-none mb-1">{p.price}<span className="text-base font-sans text-white/35">{p.period}</span></div>
              <div className="text-sm text-white/35 mb-6">{p.desc}</div>
              {p.features.map(f => <div key={f} className="flex items-center gap-2.5 text-sm text-white/55 mb-2.5"><CheckCircle size={14} className="text-[#455c62] flex-shrink-0"/>{f}</div>)}
              <Link href="/signup" className={`block w-full text-center mt-6 py-3 rounded-xl text-sm font-medium transition-all ${p.featured?'bg-[#455c62] hover:bg-[#344a50] text-white':'border border-white/15 hover:border-white/30 text-white/60 hover:text-white'}`}>
                {p.name==='Enterprise'?'Contact sales':'Get started'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="py-32 px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-[600px] h-[600px] rounded-full bg-[#455c62]/8" style={{filter:'blur(80px)'}}/></div>
        <h2 style={{fontFamily:"'DM Serif Display',serif"}} className="text-5xl text-white mb-4 relative">Issue the Global<br/>Financial Passport.</h2>
        <p className="text-white/40 mb-10 relative font-light">Join lenders already using trbo to approve more borrowers, faster.</p>
        <div className="flex gap-4 justify-center relative">
          <Link href="/signup" className="bg-[#455c62] hover:bg-[#344a50] text-white font-medium px-8 py-4 rounded-xl flex items-center gap-2">Start for free <ArrowRight size={18}/></Link>
          <Link href="/login" className="border border-white/15 hover:border-white/30 text-white/60 hover:text-white px-8 py-4 rounded-xl">View live demo</Link>
        </div>
      </div>

      <footer className="border-t border-white/5 px-12 py-8 flex items-center justify-between">
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif"}} className="text-xl text-white/30 mb-1">trbo.</div>
          <div className="text-xs text-white/20">© 2026 trbo Financial. The Global Financial Passport.</div>
        </div>
        <div className="flex gap-6">{['Privacy','Terms','Security','API Docs'].map(l => <span key={l} className="text-xs text-white/20 hover:text-white/40 cursor-pointer transition-colors">{l}</span>)}</div>
      </footer>
    </div>
  )
}
