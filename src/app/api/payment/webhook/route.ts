import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifyPaddleWebhook(rawBody: string, signature: string, secret: string): boolean {
  const [tspart, h1part] = signature.split(';')
  const ts = tspart.replace('ts=', '')
  const h1 = h1part.replace('h1=', '')
  const signed = `${ts}:${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(h1))
}

function getPeriodEnd(cycle: string): Date {
  const now = new Date()
  const periodEnd = new Date(now)
  if (cycle === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }
  return periodEnd
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('paddle-signature') || ''

  console.log('[webhook] received')
  console.log('[webhook] signature:', signature ? 'present' : 'MISSING')
  console.log('[webhook] body preview:', rawBody.slice(0, 200))

  try {
    const valid = verifyPaddleWebhook(rawBody, signature, process.env.PADDLE_WEBHOOK_SECRET!)
    console.log('[webhook] signature valid:', valid)
    if (!valid) {
      console.log('[webhook] INVALID SIGNATURE')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch (e) {
    console.log('[webhook] signature error:', e)
    return NextResponse.json({ error: 'Signature error' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  console.log('[webhook] event_type:', event.event_type)
  console.log('[webhook] custom_data:', event.data?.custom_data)

  // ── First payment ─────────────────────────────────────────────
  if (event.event_type === 'transaction.completed') {
    const txn = event.data
    const { user_id: userId, plan, cycle } = txn.custom_data || {}

    console.log('[webhook] transaction.completed — userId:', userId, 'plan:', plan, 'cycle:', cycle)

    if (!userId || !plan || !cycle) {
      console.log('[webhook] missing custom data')
      return NextResponse.json({ error: 'Missing custom data' }, { status: 400 })
    }

    const now = new Date()
    const periodEnd = getPeriodEnd(cycle)

    const { error } = await supabase.from('subscriptions').upsert({
      user_id: userId, plan, billing_cycle: cycle, status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: now.toISOString(),
    }, { onConflict: 'user_id' })

    if (error) {
      console.log('[webhook] DB upsert error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    console.log('[webhook] subscription upserted successfully')

    await supabase.from('payments').insert({
      user_id: userId,
      amount: Math.round(txn.details?.totals?.total ?? 0),
      plan, billing_cycle: cycle, status: 'success',
    })
  }

  // ── Renewal ───────────────────────────────────────────────────
  if (event.event_type === 'subscription.renewed') {
    const sub = event.data
    const { user_id: userId, plan, cycle } = sub.custom_data || {}
    console.log('[webhook] subscription.renewed — userId:', userId)
    if (userId) {
      const now = new Date()
      const periodEnd = getPeriodEnd(cycle || 'monthly')
      await supabase.from('subscriptions').update({
        status: 'active', plan, billing_cycle: cycle,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString(),
      }).eq('user_id', userId)
    }
  }

  // ── Cancellation ──────────────────────────────────────────────
  if (event.event_type === 'subscription.canceled') {
    const userId = event.data?.custom_data?.user_id
    console.log('[webhook] subscription.canceled — userId:', userId)
    if (userId) {
      await supabase.from('subscriptions').update({
        status: 'cancelled', plan: 'free', updated_at: new Date().toISOString(),
      }).eq('user_id', userId)
    }
  }

  return NextResponse.json({ ok: true })
}