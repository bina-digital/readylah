import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

function hmacHex(secret: string, msg: string) {
  return crypto.createHmac('sha256', secret).update(msg).digest('hex')
}

function auth(req: Request) {
  const secret = process.env.STAFF_AUTH_SECRET || ''
  if (!secret) return { ok: false as const, status: 500, error: 'server_misconfigured' }

  // cookies
  const cookie = req.headers.get('cookie') || ''
  const m1 = cookie.match(/(?:^|; )rl_staff=([^;]+)/)
  const m2 = cookie.match(/(?:^|; )rl_staff_id=([^;]+)/)
  const token = m1 ? decodeURIComponent(m1[1]) : ''
  const staffId = m2 ? decodeURIComponent(m2[1]) : ''
  if (!token || !staffId) return { ok: true as const, authed: false }

  const expected = hmacHex(secret, `staff:${staffId}`)
  if (token !== expected) return { ok: true as const, authed: false }
  return { ok: true as const, authed: true, staffId }
}

export async function GET(req: Request) {
  const a = auth(req)
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status })

  const business = await prisma.business.findFirst({ include: { outlets: true } })
  const outlets = business?.outlets || []

  const tickets = a.authed
    ? await prisma.ticket.findMany({ where: { status: 'created' }, orderBy: { createdAt: 'desc' }, take: 50 })
    : []

  return NextResponse.json({ ok: true, authed: a.authed, outlets, tickets })
}
