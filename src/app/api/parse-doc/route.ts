import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages } = body

    const content: Array<{type: string, text?: string, image_url?: {url: string}}> = []
    for (const msg of (messages || [])) {
      if (msg.type === 'image' || msg.type === 'document') {
        const mediaType = msg.source?.media_type || 'image/jpeg'
        const data = msg.source?.data || ''
        content.push({ type: 'image_url', image_url: { url: `data:${mediaType};base64,${data}` } })
      } else if (msg.type === 'text') {
        content.push({ type: 'text', text: msg.text || '' })
      }
    }

    if (content.length === 0) return NextResponse.json({ error: 'No content' }, { status: 400 })

    // Retry up to 5 times with exponential backoff
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) {
        const wait = attempt * 6000 // 6s, 12s, 18s, 24s
        await new Promise(r => setTimeout(r, wait))
      }

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

      if (response.status === 429) {
        console.log(`Rate limited attempt ${attempt + 1}/5, waiting ${(attempt+1)*6}s...`)
        continue
      }

      if (!response.ok) {
        const err = await response.text()
        return NextResponse.json({ error: err }, { status: response.status })
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || '{}'
      try {
        return NextResponse.json(JSON.parse(text))
      } catch {
        return NextResponse.json({ raw: text })
      }
    }

    // After all retries, return a partial success so the form can still submit
    return NextResponse.json({ 
      note: 'Document parsing rate limited - manual review required',
      parsed: false 
    })

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
