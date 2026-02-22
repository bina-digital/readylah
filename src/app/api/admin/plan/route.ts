import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { businessId?: unknown; plan?: unknown }
  const businessId = String(body.businessId || '').trim()
  const plan = String(body.plan || '').trim()

  if (!businessId) return NextResponse.json({ ok: false, error: 'businessId_required' }, { status: 400 })
  if (!['starter', 'pro', 'enterprise'].includes(plan)) {
    return NextResponse.json({ ok: false, error: 'plan_invalid' }, { status: 400 })
  }

  const business = await prisma.business.update({ where: { id: businessId }, data: { plan: plan as any }, include: { outlets: true } })
  return NextResponse.json({ ok: true, business })
}
