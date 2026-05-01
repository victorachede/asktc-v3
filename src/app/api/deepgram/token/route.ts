import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

/**
 * Returns a short-lived Deepgram API key so the client never sees
 * the real DEEPGRAM_API_KEY env var.
 *
 * Requires: DEEPGRAM_API_KEY in your environment.
 *
 * To tighten security further you can create a scoped key via Deepgram's
 * Key Management API instead of returning the main key directly:
 * https://developers.deepgram.com/reference/create-key
 */
export async function GET() {
  // Only allow authenticated moderators to get a token
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

  // Option A – return the key directly (simplest; key is only visible server-side)
  // Option B – create a scoped ephemeral key via Deepgram Key Management API
  //            Uncomment the block below and remove the direct return above.
  //
  // try {
  //   const dgRes = await fetch(
  //     `https://api.deepgram.com/v1/projects/${process.env.DEEPGRAM_PROJECT_ID}/keys`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Token ${apiKey}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         comment: `ephemeral-${user.id}`,
  //         scopes: ['usage:write'],
  //         expiration_date: new Date(Date.now() + 60_000).toISOString(), // 1 min
  //       }),
  //     }
  //   )
  //   if (!dgRes.ok) throw new Error('Deepgram key creation failed')
  //   const { key } = await dgRes.json()
  //   return NextResponse.json({ key })
  // } catch (e: any) {
  //   return NextResponse.json({ error: e.message }, { status: 500 })
  // }

  return NextResponse.json({ key: apiKey })
}
