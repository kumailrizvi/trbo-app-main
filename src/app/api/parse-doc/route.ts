import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const content = messages.map((msg: {type: string, source?: {media_type: string, data: string}, text?: string}) => {
      if (msg.type === 'image' || msg.type === 'document') {
        return { type: 'image_url', image_url: { url: `data:${msg.source!.media_type};base64,${msg.source!.data}` } }
      }
      return { type: 'text', text: msg.text }
    })
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 800,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a financial document parser. Return ONLY valid JSON, no markdown.' },
          { role: 'user', content }
        ],
      }),
    })
    const data = await response.json()
    return NextResponse.json(JSON.parse(data.choices[0].message.content))
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
