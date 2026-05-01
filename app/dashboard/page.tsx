'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

type StoredUser = {
  email?: string;
  phone?: string;
  role?: string;
  entityType?: string;
};

type Stats = {
  totalUsers: number;
  suppliers: number;
  buyers: number;
  totalLogins: number;
  supplierLogins: number;
  buyerLogins: number;
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

export default function DashboardPage() {
  const [user] = useState<StoredUser | null>(() => readStoredUser());
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!user || !token) {
      window.location.href = '/login';
      return;
    }

    apiFetch<Stats>('/api/stats')
      .then(setStats)
      .catch(() => {
        setStats(null);
      });
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-[#1E3A5F]">
            B2B Marketplace
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Signed in as {user?.email || user?.phone || 'your account'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <p className="text-sm font-medium text-gray-600">Total sign-ins</p>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-bold text-[#1E3A5F]">{stats?.totalLogins ?? 0}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm font-medium text-gray-600">Supplier sign-ins</p>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-bold text-[#1E3A5F]">{stats?.supplierLogins ?? 0}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm font-medium text-gray-600">Registered users</p>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-bold text-[#1E3A5F]">{stats?.totalUsers ?? 0}</p>
            </CardBody>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </CardHeader>
          <CardBody className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-semibold capitalize text-gray-900">{user?.role || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Entity type</p>
              <p className="font-semibold capitalize text-gray-900">{user?.entityType || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-semibold text-gray-900">{user?.email || user?.phone || '-'}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
