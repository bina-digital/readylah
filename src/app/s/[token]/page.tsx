'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function StatusPage() {
  const params = useParams<{ token: string }>()
  const token = params?.token

  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    if (!token) return
    const res = await fetch(`/api/public/tickets/${encodeURIComponent(token)}`, { cache: 'no-store' })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErr(j?.error || 'not_found')
      setData(null)
      return
    }
    setErr(null)
    setData(j.ticket)
  }

  useEffect(() => {
    void load()
    const t = setInterval(() => void load(), 3000)
    return () => clearInterval(t)
  }, [token])

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-bold text-emerald-300">ReadyLah!</div>
          {err ? (
            <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-200">
              {err}
            </div>
          ) : !data ? (
            <div className="mt-3 text-sm text-white/60">Loading…</div>
          ) : (
            <>
              <div className="mt-2 text-xl font-extrabold">{data.type === 'seat' ? 'Seating' : 'Order'} {data.orderNumber}</div>
              <div className="mt-1 text-sm text-white/60">Status: {String(data.status).toUpperCase()}</div>

              <div className={
                'mt-4 rounded-xl border p-4 ' +
                (data.status === 'ready'
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-white/10 bg-black/30')
              }>
                <div className="text-sm font-extrabold">
                  {data.type === 'seat'
                    ? data.status === 'ready'
                      ? '✅ Your table is ready. Please come to the counter.'
                      : data.status === 'no_show'
                        ? '⚪ Marked no-show'
                        : '🟢 Waiting to be seated'
                    : data.status === 'ready'
                      ? '✅ Ready for pickup'
                      : '🟢 Preparing'}
                </div>
                <div className="mt-1 text-xs text-white/50">Auto-refreshes every 3s</div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
