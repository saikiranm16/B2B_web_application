'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

const signupSchema = z.object({
  contactMethod: z.enum(['email', 'phone']),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'supplier'], { message: 'Please select a role' }),
  entityType: z.string({ message: 'Please select entity type' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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

type SignupFormData = z.infer<typeof signupSchema>;

type RegisterResponse = {
  contact: string;
  devOtp?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      contactMethod: 'email',
      role: 'buyer',
      entityType: '',
    },
  });

  const [selectedRole, setSelectedRole] = useState<'buyer' | 'supplier'>('buyer');

  const handleContactMethodChange = (value: string) => {
    setContactMethod(value as 'email' | 'phone');
    setValue('contactMethod', value as 'email' | 'phone');
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setApiError('');

    try {
      const result = await apiFetch<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email || undefined,
          phone: data.phone || undefined,
          password: data.password,
          role: data.role,
          entityType: data.entityType,
        }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingOtpContact', result.contact);
        if (result.devOtp) {
          localStorage.setItem('pendingDevOtp', result.devOtp);
        }
      }

      router.push(`/verify-otp?contact=${encodeURIComponent(result.contact)}`);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600">Join our B2B marketplace to start buying or selling</p>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{apiError}</p>
              </div>
            )}

            {/* Contact Method Toggle */}
            <div>
              <ToggleGroup
                label="Contact Method"
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
              helperText="At least 8 characters"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            {/* Role Selection */}
            <div>
              <RadioCardGroup
                label="I am a..."
                name="role"
                value={selectedRole}
                onChange={(value) => {
                  const role = value as 'buyer' | 'supplier';
                  setSelectedRole(role);
                  setValue('role', role);
                }}
                options={[
                  {
                    value: 'buyer',
                    label: 'Buyer',
                    description: 'Looking to purchase products/services',
                  },
                  {
                    value: 'supplier',
                    label: 'Supplier',
                    description: 'Looking to sell products/services',
                  },
                ]}
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.role.message}</p>
              )}
            </div>

            {/* Entity Type */}
            <Select
              label="Entity Type"
              options={[
                { value: 'individual', label: 'Individual' },
                { value: 'business', label: 'Business' },
                { value: 'company', label: 'Company' },
              ]}
              {...register('entityType')}
              error={errors.entityType?.message}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Create Account
            </Button>

            {/* Login Link */}
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1E3A5F] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
