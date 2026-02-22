import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// MVP: Handle /start o_<ticketToken> to subscribe a chat to a ticket.
export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return NextResponse.json({ ok: true })

  const update = (await req.json().catch(() => null)) as any
  const message = update?.message
  const text = message?.text || ''
  const chatId = message?.chat?.id

  if (!chatId || typeof text !== 'string') return NextResponse.json({ ok: true })

  // If user starts bot without a token, give instructions.
  const m = text.match(/^\/start(?:\s+o_(\w+))?/) 
  if (!m) return NextResponse.json({ ok: true })
  const token = m[1]

  if (!token) {
    const { telegramSendMessage } = await import('@/lib/telegram')
    await telegramSendMessage({
      botToken,
      chatId: String(chatId),
      text: 'ReadyLah! here.\n\nTo get updates, scan the outlet QR code, enter your order number, then tap “Telegram updates”.',
    })
    return NextResponse.json({ ok: true })
  }

  const ticket = await prisma.ticket.findUnique({ where: { token } })
  if (!ticket) return NextResponse.json({ ok: true })

  const existing = await prisma.subscriber.findFirst({
    where: {
      ticketId: ticket.id,
      channel: 'telegram',
      telegramChatId: String(chatId),
    },
  })

  if (!existing) {
    await prisma.subscriber.create({
      data: {
        ticketId: ticket.id,
        channel: 'telegram',
        telegramChatId: String(chatId),
      },
    })
  }

  // Acknowledge
  const { telegramSendMessage } = await import('@/lib/telegram')
  await telegramSendMessage({
    botToken,
    chatId: String(chatId),
    text: `✅ Subscribed. We'll notify you when ${ticket.type === 'seat' ? 'Seating' : 'Order'} ${ticket.orderNumber} is READY.`,
  })

  return NextResponse.json({ ok: true })
}
