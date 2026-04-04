'use client'
import { useState } from 'react'
import { useLender } from '@/lib/useLender'
import LenderLayout from '@/components/LenderLayout'
import { Plus, Trash2 } from 'lucide-react'

export default function TeamPage() {
  const { lender, isAdmin, loading } = useLender()
  const [members, setMembers] = useState([
    { id: 1, name: 'Sarah Chen', email: 'sarah@company.com', role: 'Admin', joined: '2026-01-15' },
    { id: 2, name: 'James Wright', email: 'james@company.com', role: 'Analyst', joined: '2026-02-01' },
    { id: 3, name: 'Priya Nair', email: 'priya@company.com', role: 'Viewer', joined: '2026-03-10' },
  ])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Analyst')

  if (loading || !lender) return null

  return (
    <LenderLayout lenderName={lender.company_name} lenderColor={lender.primary_color} isAdmin={isAdmin}>
      <div style={{padding:'24px 32px',maxWidth:800}}>
        <h1 style={{fontSize:24,fontWeight:600,color:'#0f172a',marginBottom:4}}>Team</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:32}}>Manage who has access to your lender portal</p>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,padding:24,marginBottom:24}}>
          <h2 style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:16}}>Invite Team Member</h2>
          <div style={{display:'flex',gap:12}}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com"
              style={{flex:1,padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a'}} />
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,outline:'none',background:'#f8fafc',color:'#0f172a'}}>
              <option>Admin</option><option>Analyst</option><option>Viewer</option>
            </select>
            <button onClick={() => { if(email) { setMembers(m => [...m, {id:Date.now(),name:email.split('@')[0],email,role,joined:new Date().toISOString().slice(0,10)}]); setEmail('') }}}
              style={{padding:'10px 20px',background:'#455c62',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
              <Plus size={16} />Invite
            </button>
          </div>
        </div>

        <div style={{background:'white',border:'1px solid #f1f5f9',borderRadius:16,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc',borderBottom:'1px solid #e2e8f0'}}>
              {['Member','Role','Joined',''].map(h => <th key={h} style={{padding:'12px 24px',textAlign:'left',fontSize:11,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{borderBottom:'1px solid #f8fafc'}}>
                  <td style={{padding:'16px 24px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:'#455c62',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,flexShrink:0}}>{m.name[0]}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:500,color:'#0f172a'}}>{m.name}</div>
                        <div style={{fontSize:12,color:'#94a3b8'}}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'16px 24px'}}>
                    <span style={{fontSize:12,padding:'4px 10px',borderRadius:9999,background:m.role==='Admin'?'#eff6ff':m.role==='Analyst'?'#f0fdf4':'#f8fafc',color:m.role==='Admin'?'#2563eb':m.role==='Analyst'?'#15803d':'#475569',fontWeight:500}}>{m.role}</span>
                  </td>
                  <td style={{padding:'16px 24px',fontSize:13,color:'#94a3b8'}}>{m.joined}</td>
                  <td style={{padding:'16px 24px',textAlign:'right'}}>
                    <button onClick={() => setMembers(members.filter(x => x.id !== m.id))}
                      style={{padding:'6px',background:'#fef2f2',border:'none',borderRadius:6,cursor:'pointer',color:'#dc2626'}}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LenderLayout>
  )
}
