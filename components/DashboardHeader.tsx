'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

interface DashboardHeaderProps {
  title: string
  description: string
  showNewEvent?: boolean
  showSearch?: boolean
  eventUsage?: { current: number; limit: number } | null
}

export default function DashboardHeader({
  title,
  description,
  showNewEvent = false,
  showSearch = true,
  eventUsage = null,
}: DashboardHeaderProps) {
  const atLimit = eventUsage ? eventUsage.current >= eventUsage.limit : false

  return (
    <div className="flex items-center gap-4 border-b border-border px-6 py-5">
      <div className="flex flex-col gap-1 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>
      {showSearch && (
        <div className="relative w-[250px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-8 h-8 bg-muted/50 border-border"
          />
        </div>
      )}
      {showNewEvent && (
        <div className="flex items-center gap-3">
          {eventUsage && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {eventUsage.current}/{eventUsage.limit}
            </span>
          )}
          {atLimit ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.error(
                  `You've reached the limit of ${eventUsage?.limit} events. Delete an existing event to create a new one.`
                )
              }
            >
              New Event
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/dashboard/event-types/new">New Event</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
