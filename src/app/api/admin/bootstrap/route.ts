import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function ensureTelegramWebhook(origin: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return { ok: false, skipped: true, reason: 'no_bot_token' }

  const url = `${origin}/api/telegram/webhook`
  const { telegramSetWebhook } = await import('@/lib/telegramWebhook')
  try {
    await telegramSetWebhook({ botToken, url })
    return { ok: true, url }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin
  const business = await prisma.business.findFirst({ include: { outlets: true } })

  // Best-effort: keep webhook set (idempotent on Telegram side)
  const telegramWebhook = await ensureTelegramWebhook(origin)

  return NextResponse.json({ ok: true, business, telegramWebhook })
}
