import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: unknown }
  const name = String(body.name || '').trim()
  if (!name) return NextResponse.json({ ok: false, error: 'name_required' }, { status: 400 })

  const existing = await prisma.business.findFirst()
  if (existing) return NextResponse.json({ ok: false, error: 'business_exists' }, { status: 409 })

  const business = await prisma.business.create({ data: { name }, include: { outlets: true } })

  // Best-effort: set Telegram webhook after first bootstrap
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (botToken) {
    const origin = new URL(req.url).origin
    const { telegramSetWebhook } = await import('@/lib/telegramWebhook')
    try {
      await telegramSetWebhook({ botToken, url: `${origin}/api/telegram/webhook` })
    } catch {
      // ignore
    }
  }

  // Create a default staff PIN (1234) for testing
  const { hashPin } = await import('@/lib/pin')
  await prisma.staffUser.create({
    data: {
      businessId: business.id,
      name: 'Default staff',
      pinHash: hashPin('1234'),
      role: 'staff',
    },
  })

  return NextResponse.json({ ok: true, business })
}
