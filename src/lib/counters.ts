import { prisma } from '@/lib/db'

export async function nextSeatNumber(opts: { outletId: string; dayKey: string }) {
  const row = await prisma.outletDailyCounter.upsert({
    where: { outletId_dayKey_type: { outletId: opts.outletId, dayKey: opts.dayKey, type: 'seat' } },
    create: { outletId: opts.outletId, dayKey: opts.dayKey, type: 'seat', seq: 1 },
    update: { seq: { increment: 1 } },
  })

  const n = row.seq
  const s = String(n).padStart(3, '0')
  return `S${s}`
}

export function dayKeyForNow(tz = 'Asia/Kuala_Lumpur') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
