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
      { error: 'DEEPGRAM_API_KEY is not set on the server.' },
      { status: 500 }
    )
  }

  const projectId = process.env.DEEPGRAM_PROJECT_ID

  // No project ID — return the master key directly (fine for local/demo use)
  if (!projectId) {
    return NextResponse.json({ key: apiKey })
  }

  // Attempt to create a short-lived ephemeral key
  try {
    const dgRes = await fetch(
      `https://api.deepgram.com/v1/projects/${projectId}/keys`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: `ephemeral-${user.id}`,
          scopes: ['usage:write'],
          time_to_live_in_seconds: 60,
        }),
      }
    )

    if (!dgRes.ok) {
      const errBody = await dgRes.text()
      console.error(`[deepgram/token] Deepgram key creation failed (${dgRes.status}):`, errBody)
      // Fall back to master key so voice still works
      return NextResponse.json({ key: apiKey })
    }

    const body = await dgRes.json()
    // Deepgram returns { key: '...' } on success
    if (!body.key) {
      console.error('[deepgram/token] Unexpected Deepgram response shape:', body)
      return NextResponse.json({ key: apiKey })
    }

    return NextResponse.json({ key: body.key })
  } catch (e) {
    console.error('[deepgram/token] Fetch error:', e)
    return NextResponse.json({ key: apiKey })
  }
}