import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.DEEPGRAM_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'DEEPGRAM_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  try {
    const dgRes = await fetch(
      `https://api.deepgram.com/v1/projects/${process.env.DEEPGRAM_PROJECT_ID}/keys`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: `ephemeral-${user.id}`,
          scopes: ['usage:write'],
          expiration_date: new Date(Date.now() + 60_000).toISOString(),
        }),
      }
    )
    if (!dgRes.ok) throw new Error('Deepgram key creation failed')
    const { key } = await dgRes.json()
    return NextResponse.json({ key })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}