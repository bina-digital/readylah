import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('rl_staff', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
  res.cookies.set('rl_staff_id', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}
