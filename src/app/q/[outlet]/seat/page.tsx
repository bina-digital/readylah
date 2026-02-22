'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function SeatingQRPage() {
  const params = useParams<{ outlet: string }>()
  const outletKey = params?.outlet

  const [outletName, setOutletName] = useState<string>('')
  const [pax, setPax] = useState('2')
  const [ticket, setTicket] = useState<{ token: string; seatNo: string } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function loadOutlet() {
    if (!outletKey) return
    const res = await fetch(`/api/public/outlets/${encodeURIComponent(outletKey)}`, { cache: 'no-store' })
    const j = await res.json().catch(() => ({}))
    if (res.ok) {
      setOutletName(j?.outlet?.name || '')
      return
    }
    setErr(j?.error || 'outlet_not_found')
  }

  useEffect(() => {
    void loadOutlet()
  }, [outletKey])

  async function createSeatTicket() {
    setErr(null)
    const res = await fetch('/api/public/seat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ outletKey, pax: Number(pax) }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErr(j?.error || 'create_failed')
      return
    }
    setTicket({ token: j.ticket.token, seatNo: j.ticket.seatNo })
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-bold text-emerald-300">ReadyLah! · Seating</div>
          <div className="mt-1 text-xl font-extrabold">{outletName || 'Outlet'}</div>
          <div className="mt-1 text-sm text-white/60">Enter pax and get your seating number.</div>

          {err ? <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-200">{err}</div> : null}

          {!ticket ? (
            <>
              <input
                className="mt-4 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-white"
                placeholder="Pax"
                inputMode="numeric"
                value={pax}
                onChange={(e) => setPax(e.target.value)}
              />
              <button className="mt-3 w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-extrabold text-black" onClick={() => void createSeatTicket()}>
                Get number
              </button>
            </>
          ) : (
            <>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-sm">
                <div className="text-xs font-bold text-white/60">Your seating number</div>
                <div className="mt-1 text-3xl font-extrabold text-emerald-300">{ticket.seatNo}</div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a className="rounded-xl bg-white px-3 py-2 text-center text-sm font-extrabold text-black" href={`/s/${ticket.token}`}>
                  View status
                </a>
                <a
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-center text-sm font-extrabold text-white"
                  href={
                    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
                      ? `https://t.me/${String(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME).replace(/^@/, '')}?start=o_${ticket.token}`
                      : '#'
                  }
                  onClick={(e) => {
                    if (!process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME) {
                      e.preventDefault()
                      alert('Telegram bot username not configured yet.')
                    }
                  }}
                >
                  Telegram updates
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
