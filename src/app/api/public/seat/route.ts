import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { dayKeyForNow, nextSeatNumber } from '@/lib/counters'
import { isPro } from '@/lib/entitlements'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { outletKey?: unknown; pax?: unknown }
  const outletKey = String(body.outletKey || '').trim()
  const pax = Number(body.pax)

  if (!outletKey) return NextResponse.json({ ok: false, error: 'outlet_required' }, { status: 400 })
  if (!Number.isFinite(pax) || pax <= 0 || pax > 50) {
    return NextResponse.json({ ok: false, error: 'pax_invalid' }, { status: 400 })
  }

  const outlet = await prisma.outlet.findUnique({ where: { key: outletKey }, include: { business: true } })
  if (!outlet) return NextResponse.json({ ok: false, error: 'outlet_not_found' }, { status: 404 })

  if (!isPro(outlet.business.plan)) {
    return NextResponse.json({ ok: false, error: 'pro_required' }, { status: 402 })
  }

  const dayKey = dayKeyForNow(outlet.timezone)
  const seatNo = await nextSeatNumber({ outletId: outlet.id, dayKey })

  const token = crypto.randomBytes(12).toString('hex')
  const ticket = await prisma.ticket.create({
    data: {
      outletId: outlet.id,
      type: 'seat',
      status: 'created',
      orderNumber: seatNo,
      pax,
      token,
    },
  })

  return NextResponse.json({ ok: true, ticket: { token: ticket.token, id: ticket.id, seatNo: ticket.orderNumber } })
}
