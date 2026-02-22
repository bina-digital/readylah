import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params
  const outlet = await prisma.outlet.findUnique({ where: { key }, include: { business: true } })
  if (!outlet) return NextResponse.json({ ok: false, error: 'outlet_not_found' }, { status: 404 })
  return NextResponse.json({
    ok: true,
    outlet: {
      id: outlet.id,
      name: outlet.name,
      key: outlet.key,
      plan: outlet.business.plan,
    },
  })
}
