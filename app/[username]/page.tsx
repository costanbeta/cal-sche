'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Video, Phone, Building2 } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import BrandedFooter from '@/components/BrandedFooter'
import { cn } from '@/lib/utils'

interface EventType {
  id: string
  name: string
  slug: string
  description?: string
  duration: number
  color: string
  location?: string
}

interface BrandingSettings {
  brandLogoUrl?: string
  brandColor?: string
  brandName?: string
  hidePoweredBy?: boolean
  customFooterText?: string
}

interface UserProfile {
  name: string
  username: string
  timezone: string
  eventTypes: EventType[]
  branding?: BrandingSettings
}

function getLocationLabel(location?: string) {
  if (!location) return null
  switch (location) {
    case 'zoom':
    case 'google_meet':
    case 'custom':
      return { label: 'Video Call', icon: Video }
    case 'phone':
      return { label: 'Phone', icon: Phone }
    case 'in_person':
      return { label: 'In Person', icon: Building2 }
    default:
      return { label: location, icon: Video }
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${username}`)
        if (!res.ok) {
          setError(true)
          return
        }
        const data = await res.json()
        setProfile(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>
              The profile you&apos;re looking for doesn&apos;t exist or has been removed.
            </CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const displayName = profile.branding?.brandName || profile.name
  const showPoweredBy = !profile.branding?.hidePoweredBy

  if (profile.eventTypes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>{displayName}</CardTitle>
            <CardDescription>
              {displayName} hasn&apos;t created any event types yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          {profile.branding?.brandLogoUrl ? (
            <Image
              src={profile.branding.brandLogoUrl}
              alt={displayName}
              width={80}
              height={80}
              className="rounded-full mb-4"
            />
          ) : (
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-foreground">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-4xl font-bold text-foreground">{displayName}</h1>
        </div>

        {/* Event type cards */}
        <div className="space-y-3">
          {profile.eventTypes.map((event) => {
            const loc = getLocationLabel(event.location)

            return (
              <Link
                key={event.id}
                href={`/${username}/${event.slug}`}
                className="block"
              >
                <div
                  className={cn(
                    'bg-card border border-border rounded-xl p-5',
                    'hover:bg-accent transition-colors'
                  )}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full inline-block mr-2"
                    style={{ backgroundColor: event.color }}
                  />
                  <span className="text-lg font-semibold text-foreground">
                    {event.name}
                  </span>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1 ml-3.5">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3 ml-3.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{event.duration} min</span>
                    </div>

                    {loc && (
                      <div className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1 text-xs text-secondary-foreground">
                        <loc.icon className="h-3 w-3" />
                        <span>{loc.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-12">
          <BrandedFooter
            variant="minimal"
            showPoweredBy={showPoweredBy}
            customText={profile.branding?.customFooterText}
          />
        </div>
      </div>
    </div>
  )
}
