import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY
  const projectId = process.env.DEEPGRAM_PROJECT_ID

  if (!apiKey || !projectId) {
    return NextResponse.json({ error: 'Missing env vars', apiKey: !!apiKey, projectId: !!projectId })
  }

  const dgRes = await fetch(
    `https://api.deepgram.com/v1/projects/${projectId}/keys`,
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: 'debug-test',
        scopes: ['usage:write'],
        time_to_live_in_seconds: 60,
      }),
    }
  )

  const body = await dgRes.json()
  return NextResponse.json({ status: dgRes.status, body })
}