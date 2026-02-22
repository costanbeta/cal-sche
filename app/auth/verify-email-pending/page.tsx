'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'

export default function EmailVerificationPage() {
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found. Please sign up again.')
      return
    }

    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend email')
      }

      setMessage('Verification email sent successfully! Please check your inbox.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left Side - Branding with Image Background */}
      <div className="hidden lg:flex lg:w-[640px] relative bg-neutral-800 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/signup-bg.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-8 w-full">
          {/* Logo */}
          <Link href="/">
            <Logo size="md" showText={true} />
          </Link>

          {/* Testimonial */}
          <div className="text-white">
            <p className="text-base leading-relaxed">
              &quot;This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before.&quot; - Sofia Davis
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Verification Message */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-[350px] space-y-5">
          {/* Form Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Please verify your email
            </h1>
            <p className="text-sm text-neutral-400 leading-5">
              We sent an verification link. Please verify your email address, you can get started in croodle.
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="bg-green-950/50 border border-green-900 text-green-400 text-sm p-3 rounded-md">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Resend Email */}
          <div className="flex items-center gap-1">
            <p className="text-xs text-white">
              Didn&apos;t receive and email?
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendEmail}
              disabled={loading}
              className="h-9 text-white hover:text-white hover:bg-transparent px-4 py-2"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend Email
            </Button>
          </div>

          {/* Back to Login */}
          <div className="pt-4">
            <Button
              variant="outline"
              asChild
              className="w-full h-9 bg-transparent border-neutral-700 text-white hover:bg-white/5 hover:text-white"
            >
              <Link href="/auth/login">
                Back to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
