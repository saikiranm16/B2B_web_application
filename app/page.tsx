import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] via-blue-50 to-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-[#1E3A5F]">B2B Marketplace</div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" size="md">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#1E3A5F] leading-tight mb-4">
                Connect, Trade & Grow
              </h1>
              <p className="text-xl text-gray-600">
                Join the leading B2B marketplace connecting buyers and suppliers globally. Post requirements, receive competitive bids, and close deals faster.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-white">
              <CardBody>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                      <svg className="w-6 h-6 text-[#1E3A5F]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-12-3h8m-8 4h8m-8 4h5" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Post Requirements</h3>
                    <p className="text-sm text-gray-600">Describe what you need and get bids from verified suppliers</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white">
              <CardBody>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
                      <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Receive Bids</h3>
                    <p className="text-sm text-gray-600">Compare offers and select the best suppliers for your needs</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white">
              <CardBody>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100">
                      <svg className="w-6 h-6 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Close Deals</h3>
                    <p className="text-sm text-gray-600">Secure transactions with built-in payment and logistics</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-200">
        <div className="bg-[#1E3A5F] rounded-2xl p-12 text-center text-white space-y-6">
          <h2 className="text-4xl font-bold">Ready to get started?</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of businesses using our platform to connect and grow
          </p>
          <Link href="/signup">
            <Button variant="secondary" size="lg" className="bg-white text-[#1E3A5F] hover:bg-gray-100">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">&copy; 2024 B2B Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
