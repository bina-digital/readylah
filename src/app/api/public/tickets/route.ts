import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { outletKey?: unknown; orderNumber?: unknown }
  const outletKey = String(body.outletKey || '').trim()
  const orderNumber = String(body.orderNumber || '').trim()
  if (!outletKey) return NextResponse.json({ ok: false, error: 'outlet_required' }, { status: 400 })
  if (!orderNumber) return NextResponse.json({ ok: false, error: 'order_required' }, { status: 400 })

  const outlet = await prisma.outlet.findUnique({ where: { key: outletKey } })
  if (!outlet) return NextResponse.json({ ok: false, error: 'outlet_not_found' }, { status: 404 })

  const token = crypto.randomBytes(12).toString('hex')
  const ticket = await prisma.ticket.create({ data: { outletId: outlet.id, orderNumber, token, status: 'created' } })

  return NextResponse.json({ ok: true, ticket: { token: ticket.token, id: ticket.id } })
}
