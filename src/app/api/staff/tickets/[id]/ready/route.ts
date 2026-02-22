import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

function hmacHex(secret: string, msg: string) {
  return crypto.createHmac('sha256', secret).update(msg).digest('hex')
}

function requireAuth(req: Request) {
  const secret = process.env.STAFF_AUTH_SECRET || ''
  if (!secret) return { ok: false as const, status: 500, error: 'server_misconfigured' }

  const cookie = req.headers.get('cookie') || ''
  const m1 = cookie.match(/(?:^|; )rl_staff=([^;]+)/)
  const m2 = cookie.match(/(?:^|; )rl_staff_id=([^;]+)/)
  const token = m1 ? decodeURIComponent(m1[1]) : ''
  const staffId = m2 ? decodeURIComponent(m2[1]) : ''
  if (!token || !staffId) return { ok: false as const, status: 401, error: 'not_authenticated' }

  const expected = hmacHex(secret, `staff:${staffId}`)
  if (token !== expected) return { ok: false as const, status: 401, error: 'not_authenticated' }

  return { ok: true as const, staffId }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const a = requireAuth(req)
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status })

  const { id } = await ctx.params

  const before = await prisma.ticket.findUnique({ where: { id } })
  if (!before) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

  // Idempotent: if already READY, just return success (don’t require multiple clicks)
  if (before.status === 'ready') {
    return NextResponse.json({ ok: true, ticket: before, notified: 0, notifyError: null })
  }

  const updated = await prisma.ticket.update({ where: { id }, data: { status: 'ready', readyAt: new Date() } })

  // Telegram notify (best-effort)
  let notified = 0
  let notifyError: string | null = null

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (botToken) {
    try {
      const subs = await prisma.subscriber.findMany({ where: { ticketId: id, channel: 'telegram' } })
      const { telegramSendMessage } = await import('@/lib/telegram')

      const results = await Promise.allSettled(
        subs
          .map((s: { telegramChatId: string | null }) => s.telegramChatId)
          .filter((x: string | null): x is string => Boolean(x))
          .map((chatId: string) => telegramSendMessage({ botToken, chatId: String(chatId), text: `✅ Order ${before.orderNumber} is READY for pickup.` }))
      )

      notified = results.filter((r) => r.status === 'fulfilled').length
    } catch (e: any) {
      notifyError = String(e?.message || e)
    }
  }

  return NextResponse.json({ ok: true, ticket: updated, notified, notifyError })
}
