import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { audio } = await req.json()

  const res = await fetch('https://api.deepgram.com/v1/listen', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'audio/webm',
    },
    body: Buffer.from(audio, 'base64'),
  })

  const data = await res.json()

  const transcript =
    data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

  return NextResponse.json({ transcript })
}