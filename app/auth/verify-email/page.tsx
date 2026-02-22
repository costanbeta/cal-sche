'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link')
      setVerifying(false)
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed')
        }

        setSuccess(true)
        sessionStorage.removeItem('verificationEmail')
        
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [token, router])

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

      {/* Right Side - Verification Status */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-[350px] space-y-6">
          {verifying && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-white tracking-tight">
                  Verifying your email...
                </h1>
                <p className="text-sm text-neutral-400 mt-2">
                  Please wait while we verify your email address.
                </p>
              </div>
            </div>
          )}

          {!verifying && success && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-white tracking-tight">
                  Email verified successfully!
                </h1>
                <p className="text-sm text-neutral-400 mt-2">
                  Your email has been verified. Redirecting to login...
                </p>
              </div>
              <Button
                asChild
                className="w-full h-9 bg-white text-black hover:bg-neutral-100 font-semibold mt-4"
              >
                <Link href="/auth/login">
                  Go to Login
                </Link>
              </Button>
            </div>
          )}

          {!verifying && error && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-white tracking-tight">
                  Verification failed
                </h1>
                <p className="text-sm text-neutral-400 mt-2">
                  {error}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-4">
                <Button
                  asChild
                  className="w-full h-9 bg-white text-black hover:bg-neutral-100 font-semibold"
                >
                  <Link href="/auth/signup">
                    Sign up again
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-9 bg-transparent border-neutral-700 text-white hover:bg-white/5 hover:text-white"
                >
                  <Link href="/auth/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-black items-center justify-center">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
