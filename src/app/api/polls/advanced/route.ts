import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * POST /api/polls/advanced
 *
 * Why this route exists:
 * The `advanced_polls` and `poll_options` tables have RLS enabled but are
 * missing an INSERT policy for authenticated users — so any direct client
 * insert returns 403. This route runs with the SERVICE_ROLE key (server-only)
 * which bypasses RLS, letting the authenticated moderator create polls.
 *
 * Body: { eventId, pollType, title, description?, options: string[], images?: string[] }
 */
export async function POST(req: NextRequest) {
  // 1. Verify the caller is a signed-in user
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: {
    eventId: string
    pollType: string
    title: string
    description?: string
    options: string[]
    images?: string[]
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { eventId, pollType, title, description, options, images = [] } = body

  if (!eventId || !pollType || !title?.trim() || !options?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (options.some((o) => !o?.trim())) {
    return NextResponse.json({ error: 'All options must be non-empty' }, { status: 400 })
  }

  // 3. Verify the user owns the event (prevents any auth'd user from creating polls on others' events)
  const { data: event, error: eventErr } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('host_id', user.id)
    .single()

  if (eventErr || !event) {
    return NextResponse.json({ error: 'Event not found or not authorized' }, { status: 403 })
  }

  // 4. Use the service role client to bypass RLS
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Server misconfiguration: missing Supabase service role key' },
      { status: 500 }
    )
  }
  const admin = createServiceClient(serviceUrl, serviceKey)

  // 5. Insert the poll
  const { data: poll, error: pollError } = await admin
    .from('advanced_polls')
    .insert({
      event_id: eventId,
      poll_type: pollType,
      title: title.trim(),
      description: description?.trim() || null,
      is_active: true,
      show_results: false,
      created_by: user.id,
    })
    .select()
    .single()

  if (pollError) {
    console.error('[advanced poll insert]', pollError)
    return NextResponse.json({ error: pollError.message }, { status: 500 })
  }

  // 6. Insert options
  const optionsData = options.map((text, idx) => ({
    poll_id: poll.id,
    option_text: text.trim(),
    option_order: idx,
    image_url: pollType === 'image_choice' ? images[idx] || null : null,
    vote_count: 0,
  }))

  const { error: optionsError } = await admin.from('poll_options').insert(optionsData)

  if (optionsError) {
    // Clean up orphaned poll
    await admin.from('advanced_polls').delete().eq('id', poll.id)
    console.error('[poll_options insert]', optionsError)
    return NextResponse.json({ error: optionsError.message }, { status: 500 })
  }

  return NextResponse.json({ poll })
}
