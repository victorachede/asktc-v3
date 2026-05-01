import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PADDLE_API = 'https://api.paddle.com'

const PRICE_IDS: Record<string, Record<string, string>> = {
  pro: {
    monthly: process.env.PADDLE_PRICE_PRO_MONTHLY!,
    yearly: process.env.PADDLE_PRICE_PRO_YEARLY!,
  },
  enterprise: {
    monthly: process.env.PADDLE_PRICE_ENTERPRISE_MONTHLY!,
    yearly: process.env.PADDLE_PRICE_ENTERPRISE_YEARLY!,
  },
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    const { plan, cycle } = await req.json()

    if (!plan || !cycle || !PRICE_IDS[plan]?.[cycle]) {
      return NextResponse.json({ error: 'Invalid plan or cycle' }, { status: 400 })
    }

    if (!process.env.PADDLE_API_KEY) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    const priceId = PRICE_IDS[plan][cycle]

    const response = await fetch(`${PADDLE_API}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer: { email: user.email },
        custom_data: {
          user_id: user.id,
          plan,
          cycle,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.error?.message || 'Payment initiation failed'
      return NextResponse.json(
        { error: errorMessage, detail: data.error },
        { status: response.status }
      )
    }

    const checkoutUrl = data.data?.checkout?.url

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Checkout URL generation failed. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Payment system error', detail: message },
      { status: 500 }
    )
  }
}
