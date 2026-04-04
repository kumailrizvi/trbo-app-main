import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Borrower = {
  id: string
  lender_id: string
  name: string
  email?: string
  origin_country: string
  destination_country: string
  status: 'pending' | 'Ready' | 'Processing' | 'Under Review' | 'approved' | 'declined'
  global_score?: number
  risk?: 'Low' | 'Medium' | 'High'
  risk_tier?: string
  income_usd?: number
  savings_usd?: number
  remittance_usd?: number
  employer?: string
  employment_type?: string
  tenure_months?: number
  suggested_limit?: number
  suggested_apr_low?: number
  suggested_apr_high?: number
  analyst_narrative?: string
  key_strengths?: string[]
  key_risks?: string[]
  confidence?: number
  parsed_docs?: Record<string, unknown>
  is_demo: boolean
  created_at: string
}

export type Lender = {
  id: string
  company_name: string
  plan: string
  primary_color: string
  affiliate_code: string
  min_score: number
  max_risk: string
  corridors: string[]
  webhook_url?: string
  welcome_msg?: string
}

export type UserProfile = {
  id: string
  email: string
  name: string
  lender_id: string
  role: 'admin' | 'analyst' | 'viewer'
  lenders?: Lender
}

export const DEMO_LENDER_IDS: Record<string, string> = {
  lender_koho: '11111111-1111-1111-1111-111111111111',
  lender_borrowell: '22222222-2222-2222-2222-222222222222',
  lender_rbc: '33333333-3333-3333-3333-333333333333',
}
