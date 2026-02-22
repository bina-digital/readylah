import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  const ticket = await prisma.ticket.findUnique({ where: { token } })
  if (!ticket) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  return NextResponse.json({ ok: true, ticket: { orderNumber: ticket.orderNumber, status: ticket.status, type: ticket.type, pax: ticket.pax } })
}
