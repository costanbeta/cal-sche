'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Loader2, CheckCircle2, ArrowLeft, Key } from 'lucide-react'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setSuccess(true)
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
              "This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before." - Sofia Davis
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full border border-neutral-700">
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Form Title */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-sm text-neutral-400">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              {/* Success Message */}
              <Alert className="bg-green-950/50 border-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-200">
                  <p className="font-semibold mb-1">Check your email</p>
                  <p className="text-sm">
                    If an account exists with <strong>{email}</strong>, you will receive password reset instructions.
                  </p>
                </AlertDescription>
              </Alert>

              {/* Tips */}
              <Alert className="bg-blue-950/50 border-blue-900">
                <AlertDescription className="text-blue-200">
                  <p className="font-semibold mb-2 text-sm">📧 Didn't receive the email?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-blue-300">
                    <li>Check your spam folder</li>
                    <li>Make sure you entered the correct email</li>
                    <li>The link expires in 1 hour</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Try Again */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Try another email address
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-950/50 border-red-900">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-9 bg-white/5 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-600"
                />
                <p className="text-xs text-neutral-500">
                  Enter the email address associated with your account
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 bg-white text-black hover:bg-neutral-100 font-semibold"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <div className="text-center pt-2">
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              className="text-neutral-400 hover:text-white hover:bg-transparent"
            >
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
