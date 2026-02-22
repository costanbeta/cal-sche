'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Eye, LogIn } from 'lucide-react'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link')
      setVerifying(false)
      return
    }

    // Verify token on mount
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok && data.valid) {
          setTokenValid(true)
          setUserEmail(data.email)
        } else {
          setError(data.error || 'Invalid or expired reset link')
        }
      } catch (err) {
        setError('Failed to verify reset link')
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-neutral-400">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="flex min-h-screen bg-black">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-[640px] relative bg-neutral-800 overflow-hidden">
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

          <div className="relative z-10 flex flex-col justify-between p-8 w-full">
            <Link href="/">
              <Logo size="md" showText={true} />
            </Link>

            <div className="text-white">
              <p className="text-base leading-relaxed">
                "This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before." - Sofia Davis
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Error */}
        <div className="flex-1 flex items-center justify-center p-8 bg-black">
          <div className="w-full max-w-[400px] space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-950/50 rounded-full border border-red-900">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white">Invalid Reset Link</h1>
              <p className="text-sm text-neutral-400">{error}</p>
            </div>

            <Alert className="bg-yellow-950/50 border-yellow-900">
              <AlertDescription className="text-yellow-200">
                <p className="font-semibold mb-2 text-sm">⚠️ Common reasons:</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-yellow-300">
                  <li>The link has expired (valid for 1 hour)</li>
                  <li>The link has already been used</li>
                  <li>The link is malformed</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button asChild className="w-full h-9 bg-white text-black hover:bg-neutral-100">
              <Link href="/auth/forgot-password">
                Request New Reset Link
              </Link>
            </Button>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
              "This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before." - Sofia Davis
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-[350px] space-y-6">
          {/* Form Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm text-neutral-400">
              Create a new password for <strong>{userEmail}</strong>
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <Alert className="bg-green-950/50 border-green-900">
                <AlertDescription className="text-green-200">
                  <p className="font-semibold mb-1">Password Reset Successful!</p>
                  <p className="text-sm">
                    Redirecting you to login page...
                  </p>
                </AlertDescription>
              </Alert>

              <Button asChild className="w-full h-9 bg-white text-black hover:bg-neutral-100">
                <Link href="/auth/login">
                  Go to Login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-950/50 border-red-900">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* New Password */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-xs text-white">
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="h-9 bg-white/5 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-600 pr-10"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-xs text-white">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="h-9 bg-white/5 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-600 pr-10"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 bg-white text-black hover:bg-neutral-100 font-semibold"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {/* Did you remember password */}
          {!success && (
            <div className="flex flex-col items-center gap-1 pt-2">
              <p className="text-xs text-white">
                Did you remember password?
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                asChild
                className="h-9 text-neutral-300 hover:text-white hover:bg-transparent"
              >
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-black items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
            <p className="text-neutral-400">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
