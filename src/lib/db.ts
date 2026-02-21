import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function makePrisma() {
  const url = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!url) throw new Error('Missing PRISMA_DATABASE_URL / POSTGRES_URL / DATABASE_URL')

  const pool = new Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = global.prisma || makePrisma()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
