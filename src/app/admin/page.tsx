'use client'

import { useEffect, useState } from 'react'

type Outlet = { id: string; name: string; key: string }

type Business = { id: string; name: string; plan?: string; outlets: Outlet[] }

export default function AdminPage() {
  const [name, setName] = useState('')
  const [outletName, setOutletName] = useState('')
  const [biz, setBiz] = useState<Business | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function bootstrap() {
    const res = await fetch('/api/admin/bootstrap', { cache: 'no-store' })
    const j = await res.json().catch(() => ({}))
    if (res.ok && j?.business) setBiz(j.business)
  }

  useEffect(() => {
    void bootstrap()
  }, [])

  async function createBusiness() {
    setErr(null)
    const res = await fetch('/api/admin/business', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErr(j?.error || 'create_failed')
      return
    }
    setBiz(j.business)
  }

  async function createOutlet() {
    if (!biz) return
    setErr(null)
    const res = await fetch('/api/admin/outlets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ businessId: biz.id, name: outletName }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErr(j?.error || 'create_outlet_failed')
      return
    }
    setBiz(j.business)
    setOutletName('')
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Admin</h1>
        <div className="text-sm text-white/60">MVP admin setup (single business for now).</div>

        {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-200">{err}</div> : null}

        {!biz ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-extrabold text-emerald-300">Create business</div>
            <input
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-white"
              placeholder="Business name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="mt-3 w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-extrabold text-black"
              onClick={() => void createBusiness()}
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-extrabold text-emerald-300">Business</div>
              <div className="mt-1 text-lg font-extrabold">{biz.name}</div>
              <div className="mt-3 grid gap-2">
                <div className="text-xs font-bold text-white/60">Plan</div>
                <select
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-white"
                  value={biz.plan || 'starter'}
                  onChange={async (e) => {
                    const plan = e.target.value
                    const res = await fetch('/api/admin/plan', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ businessId: biz.id, plan }),
                    })
                    const j = await res.json().catch(() => ({}))
                    if (!res.ok) {
                      alert(j?.error || 'update_failed')
                      return
                    }
                    setBiz(j.business)
                  }}
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <div className="text-[11px] text-white/40">Pro enables Seating and future WhatsApp.</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold text-emerald-300">Outlets</div>
              </div>

              <div className="mt-3 space-y-2">
                {biz.outlets.map((o) => (
                  <div key={o.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-extrabold">{o.name}</div>
                        <div className="text-xs text-white/50">key: {o.key}</div>
                      </div>
                      <a
                        className="text-xs font-bold underline"
                        href={`/q/${encodeURIComponent(o.key)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open QR page
                      </a>
                    </div>
                    <div className="mt-2 text-xs text-white/60">Order QR URL:</div>
                    <div className="mt-1 break-all rounded-lg bg-black/50 p-2 text-xs font-mono text-white/80">
                      {baseUrl}/q/{o.key}
                    </div>

                    <div className="mt-2 text-xs text-white/60">Seating QR URL (PRO):</div>
                    <div className="mt-1 break-all rounded-lg bg-black/50 p-2 text-xs font-mono text-white/80">
                      {baseUrl}/q/{o.key}/seat
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-2">
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-white"
                  placeholder="New outlet name"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                />
                <button
                  className="w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-extrabold text-black"
                  onClick={() => void createOutlet()}
                >
                  Add outlet
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
