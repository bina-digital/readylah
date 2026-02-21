import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const business = await prisma.business.findFirst({ include: { outlets: true } })
  return NextResponse.json({ ok: true, business })
}
