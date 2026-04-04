import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, user, system } = body
    
    const userContent = prompt || user || ''
    const systemContent = system || `You are TRBO's credit scoring engine for cross-border migrants. Score borrowers 300–850.
SCORING WEIGHTS: Income Stability 25%, Remittance Consistency 20%, Savings Rate 15%, Income Level 15%, Employment Stability 10%, Document Completeness 10%, Cash Flow Health 5%.
Return ONLY valid JSON: {"global_score":number,"income_score":number,"savings_score":number,"remittance_score":number,"identity_score":number,"employment_score":number,"risk_tier":"Prime|Near-Prime|Subprime|High-Risk|Decline","suggested_limit":number,"suggested_apr_low":number,"suggested_apr_high":number,"monthly_income_usd":number,"income_consistency":"HIGH|MEDIUM|LOW","key_strengths":[],"key_risks":[],"analyst_narrative":"string","confidence":number}`

    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, attempt * 8000))
      }

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
            { role: 'system', content: systemContent },
            { role: 'user', content: userContent }
          ],
        }),
      })

      if (response.status === 429) {
        console.log(`Score API rate limited, attempt ${attempt + 1}/5`)
        continue
      }

      if (!response.ok) {
        const err = await response.text()
        return NextResponse.json({ error: err }, { status: response.status })
      }

      const data = await response.json()
      const text = data.choices[0].message.content || '{}'
      return NextResponse.json(JSON.parse(text))
    }

    return NextResponse.json({ error: 'Failed after retries' }, { status: 429 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
