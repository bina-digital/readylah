import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center justify-between">
          <div className="text-xl font-extrabold">
            Ready<span className="text-emerald-400">Lah!</span>
          </div>
          <div className="flex gap-3 text-sm font-bold">
            <Link className="rounded-lg border border-white/15 px-3 py-2 hover:bg-white/5" href="/admin">
              Admin
            </Link>
            <Link className="rounded-lg border border-white/15 px-3 py-2 hover:bg-white/5" href="/staff">
              Staff
            </Link>
          </div>
        </div>

        <h1 className="mt-10 text-4xl font-extrabold tracking-tight md:text-6xl">No-hardware customer paging.</h1>
        <p className="mt-4 max-w-xl text-white/70">
          MVP testing build. Landing page is live separately at{' '}
          <a className="underline" href="https://readylah-landing.vercel.app" target="_blank" rel="noreferrer">
            readylah-landing.vercel.app
          </a>
          .
        </p>

        <div className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-extrabold text-emerald-300">What works in this test build</div>
          <ul className="list-disc pl-5 text-sm text-white/70">
            <li>Admin: create business + outlet, generate QR URL</li>
            <li>Staff: login via PIN, create ticket, mark READY</li>
            <li>Customer: scan QR URL, enter order number, view web status</li>
            <li>Telegram subscribe/notify: stubbed until bot token is configured</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
