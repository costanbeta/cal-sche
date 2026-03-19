'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowUpDown,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  SquarePen,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import DashboardHeader from '@/components/DashboardHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface EventType {
  id: string
  name: string
  slug: string
  duration: number
  isActive: boolean
}

interface EventUsage {
  current: number
  limit: number
}

export default function EventTypesPage() {
  const router = useRouter()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<EventType | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [eventUsage, setEventUsage] = useState<EventUsage | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [userRes, eventsRes, usageRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/event-types'),
        fetch('/api/event-types/usage'),
      ])

      if (!userRes.ok) {
        router.push('/auth/login')
        return
      }

      const userData = await userRes.json()
      setUsername(userData.user.username)

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEventTypes(eventsData.eventTypes)
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setEventUsage({ current: usageData.current, limit: usageData.limit })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/event-types/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        setEventTypes((prev) => prev.filter((et) => et.id !== deleteTarget.id))
        setEventUsage((prev) =>
          prev ? { ...prev, current: Math.max(0, prev.current - 1) } : prev
        )
        toast.success(`"${deleteTarget.name}" deleted`)
      } else {
        toast.error('Failed to delete event type')
      }
    } catch (error) {
      console.error('Failed to delete event type:', error)
      toast.error('Failed to delete event type')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (loading) {
    return (
      <>
        <DashboardHeader
          title="Events"
          description="Here's a list of Events"
          showNewEvent
          showSearch
          eventUsage={eventUsage}
        />
        <LoadingSpinner />
      </>
    )
  }

  return (
    <>
      <DashboardHeader
        title="Events"
        description="Here's a list of Events"
        showNewEvent
        showSearch
        eventUsage={eventUsage}
      />

      {eventTypes.length === 0 ? (
        <div className="flex-1 p-6">
          <div className="bg-accent/50 rounded-xl h-full w-full flex flex-col items-center justify-center gap-4">
            <p className="text-base font-medium text-foreground text-center">
              No Event
            </p>
            <Button asChild>
              <Link href="/dashboard/event-types/new">New Event</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Header row */}
          <div className="flex items-center px-4 py-3 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5 flex-1">
              Event Name
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <div className="w-32 text-right">Visibility</div>
          </div>

          {/* Event rows */}
          {eventTypes.map((et) => (
            <div
              key={et.id}
              className="flex items-center px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Badge variant="outline">{et.name}</Badge>
                <span className="text-sm text-muted-foreground truncate">
                  /{username}/{et.slug}
                </span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {et.duration}min
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground w-24">
                  {et.isActive ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Active
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Hidden
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(et)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    asChild
                  >
                    <Link href={`/dashboard/event-types/${et.id}`}>
                      <SquarePen className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    asChild
                  >
                    <a
                      href={`/${username}/${et.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot
              be undone. All future bookings for this event type will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
