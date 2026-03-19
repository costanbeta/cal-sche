'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BrandingRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/settings')
  }, [router])

  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirecting to settings…</p>
    </div>
  )
}
