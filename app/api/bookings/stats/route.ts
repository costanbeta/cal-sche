import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import {
  format,
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  endOfDay,
  parseISO,
} from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()

    const searchParams = request.nextUrl.searchParams
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const now = new Date()

    // Custom date range mode
    if (fromParam && toParam) {
      const from = startOfDay(parseISO(fromParam))
      const to = endOfDay(parseISO(toParam))

      const bookings = await prisma.booking.findMany({
        where: {
          userId: auth.userId,
          status: 'confirmed',
          startTime: { gte: from, lte: to },
        },
        select: { startTime: true },
        orderBy: { startTime: 'asc' },
      })

      const days = eachDayOfInterval({ start: from, end: to })
      const dayMap = new Map<string, number>()
      days.forEach((d) => dayMap.set(format(d, 'yyyy-MM-dd'), 0))
      bookings.forEach((b) => {
        const key = format(b.startTime, 'yyyy-MM-dd')
        if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1)
      })
      const custom = days.map((d) => ({
        label: format(d, 'MMM d'),
        count: dayMap.get(format(d, 'yyyy-MM-dd')) ?? 0,
      }))

      return NextResponse.json({ custom })
    }

    // Default: fetch last 12 months of bookings once
    const since = subMonths(now, 12)
    const bookings = await prisma.booking.findMany({
      where: {
        userId: auth.userId,
        status: 'confirmed',
        startTime: { gte: since },
      },
      select: { startTime: true },
      orderBy: { startTime: 'asc' },
    })

    // --- Daily: last 30 days ---
    const dayStart = subDays(startOfDay(now), 29)
    const dayDays = eachDayOfInterval({ start: dayStart, end: now })
    const dayMap = new Map<string, number>()
    dayDays.forEach((d) => dayMap.set(format(d, 'yyyy-MM-dd'), 0))
    bookings.forEach((b) => {
      const key = format(b.startTime, 'yyyy-MM-dd')
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1)
    })
    const daily = dayDays.map((d) => ({
      label: format(d, 'MMM d'),
      count: dayMap.get(format(d, 'yyyy-MM-dd')) ?? 0,
    }))

    // --- Weekly: last 12 weeks ---
    const weekStart = startOfWeek(subWeeks(now, 11))
    const weekDays = eachWeekOfInterval({ start: weekStart, end: now })
    const weekMap = new Map<string, number>()
    weekDays.forEach((w) => weekMap.set(format(w, 'yyyy-ww'), 0))
    bookings.forEach((b) => {
      const key = format(b.startTime, 'yyyy-ww')
      if (weekMap.has(key)) weekMap.set(key, (weekMap.get(key) ?? 0) + 1)
    })
    const weekly = weekDays.map((w) => ({
      label: `W${format(w, 'w')} ${format(w, 'MMM')}`,
      count: weekMap.get(format(w, 'yyyy-ww')) ?? 0,
    }))

    // --- Monthly: last 12 months ---
    const monthStart = startOfMonth(subMonths(now, 11))
    const monthDays = eachMonthOfInterval({ start: monthStart, end: now })
    const monthMap = new Map<string, number>()
    monthDays.forEach((m) => monthMap.set(format(m, 'yyyy-MM'), 0))
    bookings.forEach((b) => {
      const key = format(b.startTime, 'yyyy-MM')
      if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
    })
    const monthly = monthDays.map((m) => ({
      label: format(m, 'MMM yyyy'),
      count: monthMap.get(format(m, 'yyyy-MM')) ?? 0,
    }))

    return NextResponse.json({ daily, weekly, monthly })
  } catch (error) {
    console.error('Booking stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
