export type CreditInput = {
  name?: string
  origin?: string
  destination?: string
  income?: string | number
  savings?: string | number
  remittance?: string | number
  employer?: string
  tenure?: string | number
  empType?: string
  documents?: Record<string, unknown>
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function scoreBorrower(input: CreditInput) {
  const income = toNumber(input.income)
  const savings = toNumber(input.savings)
  const remittance = toNumber(input.remittance)
  const tenureMonths = toNumber(input.tenure)
  const savingsRate = income > 0 ? savings / income : 0
  const remittanceRate = income > 0 ? remittance / income : 0
  const docKeys = Object.keys(input.documents || {}).filter(Boolean)

  const incomeScore = clamp(Math.round((Math.min(income, 9000) / 9000) * 100), 0, 100)
  const savingsScore = clamp(Math.round(Math.min(savingsRate, 0.35) / 0.35 * 100), 0, 100)
  const remittanceScore = clamp(Math.round(Math.min(remittanceRate, 0.25) / 0.25 * 100), 0, 100)
  const employmentScore = clamp(Math.round(Math.min(tenureMonths, 72) / 72 * 100), 0, 100)
  const identityScore = docKeys.includes('passport') || docKeys.includes('id') ? 95 : 70
  const documentScore = clamp(55 + docKeys.length * 11, 55, 100)

  const weighted =
    incomeScore * 0.25 +
    remittanceScore * 0.2 +
    savingsScore * 0.15 +
    incomeScore * 0.15 +
    employmentScore * 0.1 +
    documentScore * 0.1 +
    Math.min(100, (savingsScore + incomeScore) / 2) * 0.05

  const globalScore = clamp(Math.round(430 + weighted * 4.5), 300, 850)
  const riskTier = globalScore >= 760 ? 'Prime' : globalScore >= 680 ? 'Near-Prime' : globalScore >= 600 ? 'Subprime' : globalScore >= 540 ? 'High-Risk' : 'Decline'
  const risk = globalScore >= 740 ? 'Low' : globalScore >= 640 ? 'Medium' : 'High'
  const suggestedLimit = Math.round(clamp(income * (globalScore >= 700 ? 2.2 : 1.2), 500, 25000) / 100) * 100
  const aprLow = globalScore >= 760 ? 9.9 : globalScore >= 680 ? 13.9 : globalScore >= 600 ? 18.9 : 24.9
  const aprHigh = aprLow + (risk === 'Low' ? 3 : risk === 'Medium' ? 5 : 8)

  const keyStrengths = [
    income >= 4000 ? `Verified monthly income around $${Math.round(income).toLocaleString()}.` : '',
    savingsRate >= 0.1 ? `Savings rate of ${Math.round(savingsRate * 100)}% supports affordability.` : '',
    remittance > 0 ? `Recurring remittance signal of $${Math.round(remittance).toLocaleString()} per month.` : '',
    tenureMonths >= 24 ? `${Math.round(tenureMonths / 12)} years of employment history.` : '',
  ].filter(Boolean)

  const keyRisks = [
    income < 2500 ? 'Income level is below the preferred automated-approval threshold.' : '',
    savingsRate < 0.05 ? 'Limited savings buffer relative to income.' : '',
    docKeys.length < 2 ? 'Additional documents would improve confidence.' : '',
    tenureMonths < 12 ? 'Employment tenure is still developing.' : '',
  ].filter(Boolean)

  return {
    global_score: globalScore,
    passport_score: globalScore,
    income_score: incomeScore,
    savings_score: savingsScore,
    remittance_score: remittanceScore,
    identity_score: identityScore,
    employment_score: employmentScore,
    document_score: documentScore,
    risk,
    risk_tier: riskTier,
    suggested_limit: suggestedLimit,
    suggested_credit_limit: suggestedLimit,
    suggested_apr_low: aprLow,
    suggested_apr_high: aprHigh,
    monthly_income_usd: Math.round(income),
    income_verified: income > 0,
    income_consistency: income >= 4500 && tenureMonths >= 24 ? 'HIGH' : income >= 2500 ? 'MEDIUM' : 'LOW',
    underwriting_recommendation: globalScore >= 700 ? 'Approve' : globalScore >= 620 ? 'Manual review' : 'Decline or request more evidence',
    key_strengths: keyStrengths,
    key_risks: keyRisks,
    analyst_narrative: `${input.name || 'The borrower'} has a ${riskTier} cross-border profile with a Passport Score of ${globalScore}. ${keyStrengths[0] || 'The profile can be strengthened with more verified financial history.'}`,
    confidence: clamp(65 + docKeys.length * 8 + (income > 0 ? 10 : 0), 55, 98),
  }
}

export function extractCreditInputFromPrompt(prompt: string): CreditInput {
  const income = prompt.match(/Income:\s*\$?([0-9,.]+)/i)?.[1]
  const savings = prompt.match(/Savings:\s*\$?([0-9,.]+)/i)?.[1]
  const remittance = prompt.match(/Remittances?:\s*\$?([0-9,.]+)/i)?.[1]
  const tenure = prompt.match(/Tenure:\s*([0-9,.]+)/i)?.[1] || prompt.match(/([0-9,.]+)\s*(?:yrs?|years?|months?)\s+employed/i)?.[1]
  const borrower = prompt.match(/Borrower:\s*([^,\n]+)/i)?.[1]
  return { name: borrower, income, savings, remittance, tenure }
}
