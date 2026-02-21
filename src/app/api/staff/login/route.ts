import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { verifyPin } from '@/lib/pin'

function hmacHex(secret: string, msg: string) {
  return crypto.createHmac('sha256', secret).update(msg).digest('hex')
}

export async function POST(req: Request) {
  const secret = process.env.STAFF_AUTH_SECRET || ''
  if (!secret) return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })

  const body = (await req.json().catch(() => ({}))) as { pin?: unknown }
  const pin = String(body.pin || '').trim()
  if (!pin) return NextResponse.json({ ok: false, error: 'pin_required' }, { status: 400 })

  const staff = await prisma.staffUser.findFirst({ where: { active: true } })
  if (!staff) return NextResponse.json({ ok: false, error: 'no_staff' }, { status: 404 })

  if (!verifyPin(pin, staff.pinHash)) {
    return NextResponse.json({ ok: false, error: 'invalid_pin' }, { status: 401 })
  }

  const token = hmacHex(secret, `staff:${staff.id}`)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('rl_staff', token, { httpOnly: true, sameSite: 'lax', path: '/' })
  res.cookies.set('rl_staff_id', staff.id, { httpOnly: true, sameSite: 'lax', path: '/' })
  return res
}
