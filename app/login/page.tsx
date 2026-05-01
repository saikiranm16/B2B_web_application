'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

const loginSchema = z.object({
  contactMethod: z.enum(['email', 'phone']),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
  password: z.string().min(1, 'Password is required'),
}).refine(
  (data) => {
    if (data.contactMethod === 'email') return data.email !== '';
    return data.phone !== '';
  },
  {
    message: 'Please provide contact information',
    path: ['email'],
  }
);

type LoginFormData = z.infer<typeof loginSchema>;

type LoginResponse = {
  token?: string;
  user?: unknown;
  requiresOtp?: boolean;
  contact?: string;
  devOtp?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      contactMethod: 'email',
    },
  });

  const handleContactMethodChange = (value: string) => {
    setContactMethod(value as 'email' | 'phone');
    setValue('contactMethod', value as 'email' | 'phone');
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError('');

    try {
      const result = await apiFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email || undefined,
          phone: data.phone || undefined,
          password: data.password,
        }),
      });

      if (result.requiresOtp && result.contact) {
        localStorage.setItem('pendingOtpContact', result.contact);
        if (result.devOtp) {
          localStorage.setItem('pendingDevOtp', result.devOtp);
        }
        router.push(`/verify-otp?contact=${encodeURIComponent(result.contact)}`);
        return;
      }

      if (!result.token || !result.user) {
        setApiError('Login response was missing account data');
        return;
      }

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
            <p className="text-gray-600">Enter your credentials to access the marketplace</p>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{apiError}</p>
              </div>
            )}

            {/* Contact Method Toggle */}
            <div>
              <ToggleGroup
                label="Login with"
                options={[
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' },
                ]}
                value={contactMethod}
                onChange={handleContactMethodChange}
                name="contactMethod"
              />
            </div>

            {/* Email or Phone Input */}
            {contactMethod === 'email' ? (
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                error={errors.email?.message}
              />
            ) : (
              <Input
                label="Phone Number"
                type="tel"
                placeholder="1234567890"
                {...register('phone')}
                error={errors.phone?.message}
              />
            )}

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            {/* Footer Links */}
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#1E3A5F] font-semibold hover:underline">
                  Create one
                </Link>
              </p>
              <p className="text-sm">
                <a href="#" className="text-[#2563EB] font-medium hover:underline">
                  Forgot password?
                </a>
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
