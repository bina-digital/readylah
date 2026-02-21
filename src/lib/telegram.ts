export async function telegramSendMessage(opts: { botToken: string; chatId: string; text: string }) {
  const res = await fetch(`https://api.telegram.org/bot${opts.botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: opts.chatId, text: opts.text }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`telegram_send_failed:${res.status}:${t}`)
  }
  return res.json()
}
