'use client'

import { useEffect, useState } from 'react'

type Ticket = { id: string; orderNumber: string; status: string; token: string; createdAt: string }

type Outlet = { id: string; name: string; key: string }

export default function StaffPage() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [outletId, setOutletId] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/staff/state', { cache: 'no-store' })
    const j = await res.json().catch(() => ({}))
    if (res.ok && j?.ok) {
      setAuthed(Boolean(j.authed))
      setOutlets(j.outlets || [])
      setOutletId(j.outlets?.[0]?.id || '')
      setTickets(j.tickets || [])
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function login() {
    setErr(null)
    const res = await fetch('/api/staff/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErr(j?.error || 'login_failed')
      return
    }
    setAuthed(true)
    setPin('')
    await load()
  }

  async function createTicket() {
    setErr(null)
    const res = await fetch('/api/staff/tickets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ outletId, orderNumber }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErr(j?.error || 'create_failed')
      return
    }
    setOrderNumber('')
    await load()
  }

  async function markReady(t: Ticket) {
    const res = await fetch(`/api/staff/tickets/${encodeURIComponent(t.id)}/ready`, { method: 'POST' })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(j?.error || 'ready_failed')
      return
    }

    if (j?.notified === 0) {
      alert('Marked READY. No Telegram subscribers yet (customer must click Telegram updates and press Start in Telegram).')
    }

    if (j?.notifyError) {
      alert(`Marked READY, but Telegram send failed: ${String(j.notifyError).slice(0, 160)}`)
    }

    await load()
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Staff — Ready Board</h1>
        <div className="text-sm text-white/60">Manual order entry + READY (MVP).</div>

        {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-200">{err}</div> : null}

        {!authed ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-extrabold text-emerald-300">Login</div>
            <input
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-white"
              placeholder="Staff PIN"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button className="mt-3 w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-extrabold text-black" onClick={() => void login()}>
              Login
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-extrabold text-emerald-300">Create ticket</div>
              <div className="mt-3 grid gap-2">
                <select
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-white"
                  value={outletId}
                  onChange={(e) => setOutletId(e.target.value)}
                >
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-white"
                  placeholder="Order number (e.g. 128)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
                <button className="w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-extrabold text-black" onClick={() => void createTicket()}>
                  Create
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-extrabold text-emerald-300">Active tickets</div>
              {tickets.length === 0 ? (
                <div className="mt-3 text-sm text-white/60">No tickets.</div>
              ) : (
                <div className="mt-3 space-y-2">
                  {tickets.map((t) => (
                    <div key={t.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-extrabold">{t.orderNumber}</div>
                          <div className="text-xs text-white/50">Status: {t.status}</div>
                        </div>
                        <button
                          className="rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-black disabled:opacity-50"
                          disabled={t.status !== 'created'}
                          onClick={() => void markReady(t)}
                        >
                          READY
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-white/50">Web status:</div>
                      <div className="mt-1 break-all rounded-lg bg-black/50 p-2 text-xs font-mono text-white/70">/s/{t.token}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
