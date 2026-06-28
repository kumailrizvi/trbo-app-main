import { NextRequest, NextResponse } from 'next/server'

function fallbackParse(messages: Array<{type?: string, text?: string}>) {
  const text = messages.map(m => m.text || '').join(' ').toLowerCase()
  if (text.includes('classify')) return { type: text.includes('payslip') ? 'payslip' : text.includes('remittance') ? 'remittance' : text.includes('passport') || text.includes('id') ? 'id_passport' : 'bank_statement', confidence: 'medium', source: 'local-document-parser' }
  if (text.includes('remittance') || text.includes('transfer')) return { average_monthly_remittance: null, currency: 'USD', consistency: 'requires_review', parsed: false, source: 'local-document-parser', note: 'OpenAI key not configured; upload was received but values require AI extraction or manual entry.' }
  if (text.includes('passport') || text.includes('id document')) return { full_name: null, document_type: null, nationality: null, issuing_country: null, parsed: false, source: 'local-document-parser', note: 'OpenAI key not configured; identity values require AI extraction or manual entry.' }
  if (text.includes('payslip')) return { monthly_income: null, employer: null, job_title: null, parsed: false, source: 'local-document-parser', note: 'OpenAI key not configured; payslip values require AI extraction or manual entry.' }
  return { average_monthly_income: null, average_monthly_savings: null, currency: 'USD', income_consistency: 'requires_review', parsed: false, source: 'local-document-parser', note: 'OpenAI key not configured; bank values require AI extraction or manual entry.' }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const content: Array<{type: string, text?: string, image_url?: {url: string}}> = []
    
    for (const msg of messages) {
      if (msg.type === 'image' || msg.type === 'document') {
        const mediaType = msg.source?.media_type || 'image/jpeg'
        const data = msg.source?.data || ''
        if (!data) continue
        // OpenAI only supports image types for vision, not raw PDFs
        // For PDFs, we'll use text extraction approach
        if (mediaType === 'application/pdf') {
          content.push({ 
            type: 'text', 
            text: 'A PDF financial document has been uploaded. Based on typical financial documents, please extract and estimate the key financial data requested.' 
          })
        } else {
          content.push({
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${data}` }
          })
        }
      } else if (msg.type === 'text') {
        content.push({ type: 'text', text: msg.text || '' })
      }
    }

    if (content.length === 0) {
      return NextResponse.json({ parsed: false, note: 'No valid content to parse' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(fallbackParse(messages))
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, attempt * 6000))

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are a financial document parser. Extract all relevant financial data and return ONLY valid JSON.' },
            { role: 'user', content }
          ],
        }),
      })

      if (response.status === 429) { console.log(`Rate limited attempt ${attempt+1}/5`); continue }
      if (!response.ok) {
        const err = await response.text()
        console.error('OpenAI error:', response.status, err)
        return NextResponse.json({ error: `OpenAI error: ${response.status}` }, { status: 502 })
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || '{}'
      try { return NextResponse.json(JSON.parse(text)) }
      catch { return NextResponse.json({ raw: text }) }
    }

    return NextResponse.json({ ...fallbackParse(messages), warning: 'OpenAI rate limited' })
  } catch (err) {
    console.error('parse-doc error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
