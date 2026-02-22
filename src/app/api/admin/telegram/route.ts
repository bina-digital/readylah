import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return NextResponse.json({ ok: false, error: 'no_bot_token' }, { status: 500 })

  const origin = new URL(req.url).origin
  const webhookUrl = `${origin}/api/telegram/webhook`

  const getRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
  const getJson = await getRes.json().catch(() => null)

  const setRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl, drop_pending_updates: false }),
  })
  const setJson = await setRes.json().catch(() => null)

  return NextResponse.json({ ok: true, webhookUrl, get: getJson, set: setJson })
}
