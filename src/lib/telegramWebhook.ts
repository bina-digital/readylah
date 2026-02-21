export async function telegramSetWebhook(opts: { botToken: string; url: string }) {
  const res = await fetch(`https://api.telegram.org/bot${opts.botToken}/setWebhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: opts.url, drop_pending_updates: false }),
  })
  const j = await res.json().catch(() => null)
  if (!res.ok || !j?.ok) {
    throw new Error(`telegram_set_webhook_failed:${res.status}:${JSON.stringify(j)}`)
  }
  return j
}
