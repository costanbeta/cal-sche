'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  CalendarFold,
  BookOpen,
  CalendarDays,
  Newspaper,
  Copy,
  Settings,
  User,
  Command,
  ChevronRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const mainNav = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Events', href: '/dashboard/event-types', icon: CalendarFold },
  { label: 'Booking', href: '/dashboard/bookings', icon: BookOpen },
  { label: 'Availability', href: '/dashboard/availability', icon: CalendarDays },
]

const moreNav = [
  { label: 'View public page', href: '#', icon: Newspaper, action: 'view-public' },
  { label: 'Copy public page', href: '#', icon: Copy, action: 'copy-public' },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Your Profile', href: '/dashboard/profile', icon: User },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [username, setUsername] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user?.username) setUsername(data.user.username)
      })
      .catch(() => {})
  }, [])

  const handleAction = (action: string) => {
    if (action === 'view-public' && username) {
      window.open(`/${username}`, '_blank')
    } else if (action === 'copy-public' && username) {
      const url = `${window.location.origin}/${username}`
      navigator.clipboard.writeText(url)
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex flex-col justify-between w-[216px] min-h-screen border-r border-border bg-background px-4 py-3">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 shadow-sm">
          <Command className="h-5 w-5 text-foreground" />
          <span className="text-sm text-foreground">Croodle</span>
        </div>

        <nav className="flex flex-col">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Getting started
          </p>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-3 w-3 opacity-50" />
            </Link>
          ))}
        </nav>
      </div>

      <nav className="flex flex-col gap-px">
        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          More
        </p>
        {moreNav.map((item) => {
          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={() => handleAction(item.action!)}
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left"
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="h-3 w-3 opacity-50" />
              </button>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-3 w-3 opacity-50" />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
