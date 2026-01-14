import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">SchedulePro</h1>
            </div>
            <div className="flex gap-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Let anyone book time with you
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Eliminate the back-and-forth emails. Share your scheduling link and let others book meetings with you instantly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition shadow-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Easy Scheduling</h3>
            <p className="text-gray-600">
              Create custom event types with your availability. Share your link and let others book time with you.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2">Calendar Sync</h3>
            <p className="text-gray-600">
              Connect your Google Calendar to prevent double-booking and automatically add meetings to your calendar.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">✉️</div>
            <h3 className="text-xl font-bold mb-2">Smart Notifications</h3>
            <p className="text-gray-600">
              Automatic email confirmations and reminders for both you and your attendees.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-32">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-bold mb-2">Sign Up</h4>
              <p className="text-gray-600">Create your free account in seconds</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-bold mb-2">Set Availability</h4>
              <p className="text-gray-600">Define your working hours and event types</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-bold mb-2">Share Your Link</h4>
              <p className="text-gray-600">Send your booking page to anyone</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-bold mb-2">Get Booked</h4>
              <p className="text-gray-600">Let others schedule meetings with you</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who simplified their scheduling
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
          >
            Create Your Free Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 SchedulePro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
