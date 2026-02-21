import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function makePrisma() {
  const url = process.env.DATABASE_URL || 'file:./dev.db'
  const file = url.startsWith('file:') ? url.slice('file:'.length) : url
  const adapter = new PrismaBetterSqlite3({ url: file })
  return new PrismaClient({ adapter })
}

export const prisma = global.prisma || makePrisma()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
