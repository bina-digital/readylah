import type { Plan } from '@prisma/client'

export function isPro(plan: Plan | null | undefined) {
  return plan === 'pro' || plan === 'enterprise'
}
