import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function randKey() {
  return Math.random().toString(36).slice(2, 8)
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { businessId?: unknown; name?: unknown }
  const businessId = String(body.businessId || '').trim()
  const name = String(body.name || '').trim()
  if (!businessId) return NextResponse.json({ ok: false, error: 'businessId_required' }, { status: 400 })
  if (!name) return NextResponse.json({ ok: false, error: 'name_required' }, { status: 400 })

  let key = randKey()
  // avoid collision
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.outlet.findUnique({ where: { key } })
    if (!exists) break
    key = randKey()
  }

  await prisma.outlet.create({ data: { businessId, name, key } })

  const business = await prisma.business.findUnique({ where: { id: businessId }, include: { outlets: true } })
  return NextResponse.json({ ok: true, business })
}
