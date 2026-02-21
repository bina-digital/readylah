import crypto from 'crypto'

export function hashPin(pin: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(pin, salt, 120_000, 32, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

export function verifyPin(pin: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const next = crypto.pbkdf2Sync(pin, salt, 120_000, 32, 'sha256').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(next, 'hex'))
}
