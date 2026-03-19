'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Video, Loader2, Check, ExternalLink, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface EventType {
  id: string
  name: string
  slug: string
  description?: string
  duration: number
  color: string
  isActive: boolean
  location?: string
  meetingLink?: string
}

interface IntegrationStatus {
  zoom: { connected: boolean; email: string | null }
  google_meet: { connected: boolean }
}

export default function EditEventTypePage() {
  const params = useParams()
  const router = useRouter()
  const eventTypeId = params.id as string

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    duration: 30,
    color: '#3B82F6',
    isActive: true,
    location: '',
    meetingLink: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null)

  const fetchIntegrationStatus = async () => {
    try {
      const res = await fetch('/api/integrations/status')
      if (res.ok) {
        const data = await res.json()
        setIntegrations(data)
      }
    } catch {
      // Silently fail
    }
  }

  const fetchEventType = useCallback(async () => {
    try {
      const response = await fetch('/api/event-types')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch event type')
      }

      const data = await response.json()
      const eventType = data.eventTypes.find((et: EventType) => et.id === eventTypeId)

      if (!eventType) {
        setError('Event type not found')
        return
      }

      setFormData({
        name: eventType.name,
        slug: eventType.slug,
        description: eventType.description || '',
        duration: eventType.duration,
        color: eventType.color,
        isActive: eventType.isActive,
        location: eventType.location || '',
        meetingLink: eventType.meetingLink || '',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }, [eventTypeId, router])

  useEffect(() => {
    fetchEventType()
    fetchIntegrationStatus()
  }, [fetchEventType])

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    setFormData({ ...formData, name, slug })
  }

  const showMeetingLink =
    formData.location === 'zoom' ||
    formData.location === 'google_meet' ||
    formData.location === 'custom'

  const generateMeetingLink = async () => {
    setGeneratingLink(true)
    try {
      let endpoint = ''
      let body = {}

      if (formData.location === 'zoom') {
        endpoint = '/api/integrations/zoom/create-meeting'
        body = {
          topic: formData.name || 'Meeting',
          duration: formData.duration || 30,
        }
      } else if (formData.location === 'google_meet') {
        endpoint = '/api/integrations/google-meet/create-meeting'
        body = {
          summary: formData.name || 'Meeting',
          duration: formData.duration || 30,
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate link')
      }

      setFormData({ ...formData, meetingLink: data.meetingLink })
      toast.success('Meeting link generated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate meeting link')
    } finally {
      setGeneratingLink(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/event-types/${eventTypeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update event type')
      }

      toast.success('Event updated!')
      router.push('/dashboard/event-types')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isZoomConnected = integrations?.zoom?.connected ?? false
  const isGoogleConnected = integrations?.google_meet?.connected ?? false

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-muted-foreground">Loading event type...</div>
      </div>
    )
  }

  if (error && !formData.name) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/dashboard" className="text-primary hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/event-types"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Events
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Edit Event</span>
      </div>

      <Card>
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Edit Event Type</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="30-minute meeting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="30-min-meeting"
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs text-muted-foreground">
                Your booking link will be: /yourusername/{formData.slug || 'event-slug'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Brief description of what this meeting is about..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <select
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-12 border border-input rounded cursor-pointer bg-background"
                />
                <span className="text-sm text-muted-foreground">{formData.color}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Meeting Location</Label>
              <select
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value, meetingLink: '' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select location type...</option>
                <option value="zoom">📹 Zoom</option>
                <option value="google_meet">📹 Google Meet</option>
                <option value="phone">📞 Phone Call</option>
                <option value="in_person">🏢 In Person</option>
                <option value="custom">🔗 Custom Link</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Where will this meeting take place?
              </p>
            </div>

            {/* Meeting link / integration section */}
            {showMeetingLink && (
              <div className="space-y-4 rounded-lg border border-border p-5 bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">
                    {formData.location === 'zoom' && 'Zoom Meeting Link'}
                    {formData.location === 'google_meet' && 'Google Meet Link'}
                    {formData.location === 'custom' && 'Custom Meeting Link'}
                  </Label>
                </div>

                {/* Zoom section */}
                {formData.location === 'zoom' && (
                  <>
                    {isZoomConnected ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                            <Check className="h-3.5 w-3.5" />
                            <span>Zoom connected</span>
                          </div>
                          {integrations?.zoom?.email && (
                            <span className="text-muted-foreground">({integrations.zoom.email})</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Click 'Generate' or paste a link"
                            value={formData.meetingLink}
                            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateMeetingLink}
                            disabled={generatingLink}
                            className="shrink-0"
                          >
                            {generatingLink ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Link2 className="h-4 w-4 mr-2" />
                                Generate Link
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Generate a Zoom link automatically, or paste your own meeting URL.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Connect your Zoom account to auto-generate meeting links, or paste a link manually.
                        </p>
                        <div className="flex gap-2 items-start">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              window.location.href = '/api/integrations/zoom/connect'
                            }}
                            className="shrink-0"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Connect Zoom
                          </Button>
                          <span className="text-xs text-muted-foreground pt-2.5">or</span>
                          <Input
                            placeholder="https://zoom.us/j/123456789"
                            value={formData.meetingLink}
                            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Google Meet section */}
                {formData.location === 'google_meet' && (
                  <>
                    {isGoogleConnected ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                            <Check className="h-3.5 w-3.5" />
                            <span>Google Calendar connected</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Click 'Generate' or paste a link"
                            value={formData.meetingLink}
                            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateMeetingLink}
                            disabled={generatingLink}
                            className="shrink-0"
                          >
                            {generatingLink ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Link2 className="h-4 w-4 mr-2" />
                                Generate Link
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Generate a Google Meet link automatically, or paste your own link.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Connect your Google Calendar to auto-generate Meet links, or paste a link manually.
                        </p>
                        <div className="flex gap-2 items-start">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              window.location.href = '/api/calendar/connect'
                            }}
                            className="shrink-0"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Connect Google
                          </Button>
                          <span className="text-xs text-muted-foreground pt-2.5">or</span>
                          <Input
                            placeholder="https://meet.google.com/abc-defg-hij"
                            value={formData.meetingLink}
                            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Custom link section */}
                {formData.location === 'custom' && (
                  <Input
                    placeholder="https://your-meeting-link.com"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  />
                )}

                {formData.meetingLink && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-md">
                    <Check className="h-3 w-3" />
                    <span>Meeting link set</span>
                    <a
                      href={formData.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto underline hover:no-underline"
                    >
                      Open link
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked === true })
                }
              />
              <Label htmlFor="isActive" className="font-medium cursor-pointer">
                Active (visible on your booking page)
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Event Type'}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/event-types">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
