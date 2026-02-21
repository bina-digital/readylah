import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

function hmacHex(secret: string, msg: string) {
  return crypto.createHmac('sha256', secret).update(msg).digest('hex')
}

function requireAuth(req: Request) {
  const secret = process.env.STAFF_AUTH_SECRET || ''
  if (!secret) return { ok: false as const, status: 500, error: 'server_misconfigured' }

  const cookie = req.headers.get('cookie') || ''
  const m1 = cookie.match(/(?:^|; )rl_staff=([^;]+)/)
  const m2 = cookie.match(/(?:^|; )rl_staff_id=([^;]+)/)
  const token = m1 ? decodeURIComponent(m1[1]) : ''
  const staffId = m2 ? decodeURIComponent(m2[1]) : ''
  if (!token || !staffId) return { ok: false as const, status: 401, error: 'not_authenticated' }

  const expected = hmacHex(secret, `staff:${staffId}`)
  if (token !== expected) return { ok: false as const, status: 401, error: 'not_authenticated' }

  return { ok: true as const, staffId }
}

export async function POST(req: Request) {
  const a = requireAuth(req)
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status })

  const body = (await req.json().catch(() => ({}))) as { outletId?: unknown; orderNumber?: unknown }
  const outletId = String(body.outletId || '').trim()
  const orderNumber = String(body.orderNumber || '').trim()

  if (!outletId) return NextResponse.json({ ok: false, error: 'outlet_required' }, { status: 400 })
  if (!orderNumber) return NextResponse.json({ ok: false, error: 'order_required' }, { status: 400 })

  const token = crypto.randomBytes(12).toString('hex')

  const t = await prisma.ticket.create({
    data: {
      outletId,
      orderNumber,
      token,
      status: 'created',
    },
  })

  return NextResponse.json({ ok: true, ticket: t })
}
