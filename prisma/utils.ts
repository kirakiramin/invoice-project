// prisma.utils.ts
import {Prisma} from '@prisma/client'

export function rawArray<T>(arr: T[]): Prisma.Sql {
  return Prisma.sql`${Prisma.join(arr)}`
}