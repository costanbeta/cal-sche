import { prisma } from './prisma'

const MAX_EVENT_TYPES = 5

export async function checkEventTypeLimit(
  userId: string
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const current = await prisma.eventType.count({
    where: { userId },
  })

  return {
    allowed: current < MAX_EVENT_TYPES,
    current,
    limit: MAX_EVENT_TYPES,
  }
}
