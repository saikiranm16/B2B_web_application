'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

type StoredUser = {
  email?: string;
  phone?: string;
  role?: string;
};

function readStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedUser = localStorage.getItem('user');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as StoredUser;
  } catch {
    return null;
  }
}

export default function OnboardingPage() {
  const [user] = useState<StoredUser | null>(() => readStoredUser());

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!user || !token) {
      window.location.href = '/login';
    }
  }, [user]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Account verified</h1>
              <p className="text-gray-600">
                Welcome {user?.email || user?.phone || 'to the marketplace'}.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-medium text-green-800">
                OTP verification is complete for your {user?.role || 'user'} account.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
