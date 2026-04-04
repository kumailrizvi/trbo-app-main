import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `You are TRBO's credit scoring engine for cross-border migrants. Score borrowers 300-850. Return ONLY valid JSON: {"global_score":number,"income_score":number,"savings_score":number,"remittance_score":number,"identity_score":number,"employment_score":number,"risk_tier":"Prime|Near-Prime|Subprime|High-Risk|Decline","suggested_limit":number,"suggested_apr_low":number,"suggested_apr_high":number,"monthly_income_usd":number,"key_strengths":[],"key_risks":[],"analyst_narrative":"string","confidence":number}` },
          { role: 'user', content: prompt }
        ],
      }),
    })
    const data = await response.json()
    return NextResponse.json(JSON.parse(data.choices[0].message.content))
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
