'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

type VerifyResponse = {
  token: string;
  user: unknown;
};

type ResendResponse = {
  devOtp?: string;
};

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryContact = searchParams.get('contact') || '';
  const contactInfo =
    queryContact ||
    (typeof window !== 'undefined' ? localStorage.getItem('pendingOtpContact') || '' : '');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiMessage, setApiMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [devOtp, setDevOtp] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('pendingDevOtp') || '' : ''
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canResend = resendTimer <= 0;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [resendTimer]);

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setApiError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = digits.split('');

    while (newOtp.length < 6) {
      newOtp.push('');
    }

    setOtp(newOtp);
    window.setTimeout(() => inputRefs.current[Math.min(digits.length, 5)]?.focus(), 0);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (!contactInfo) {
      setApiError('Missing contact details. Please sign up or log in again.');
      return;
    }

    if (otpCode.length !== 6) {
      setApiError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setApiError('');
    setApiMessage('');

    try {
      const result = await apiFetch<VerifyResponse>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          otp: otpCode,
          contact: contactInfo,
        }),
      });

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.removeItem('pendingOtpContact');
      localStorage.removeItem('pendingDevOtp');
      router.push('/onboarding');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'OTP verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!contactInfo || !canResend) return;

    setResendTimer(60);
    setApiError('');
    setApiMessage('');

    try {
      const result = await apiFetch<ResendResponse>('/api/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ contact: contactInfo }),
      });

      if (result.devOtp) {
        localStorage.setItem('pendingDevOtp', result.devOtp);
        setDevOtp(result.devOtp);
      }
      setApiMessage('A new OTP has been sent.');
    } catch (error) {
      setResendTimer(0);
      setApiError(error instanceof Error ? error.message : 'Could not resend OTP');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Verify OTP</h1>
            <p className="text-gray-600">
              Enter the 6-digit code sent to{' '}
              <span className="font-medium text-gray-900">{contactInfo || 'your contact'}</span>
            </p>
            {devOtp && (
              <p className="text-sm font-medium text-[#1E3A5F]">
                Local demo code: {devOtp}
              </p>
            )}
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={onSubmit} className="space-y-6">
            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{apiError}</p>
              </div>
            )}

            {apiMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">{apiMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`
                      w-12 h-14 text-center text-2xl font-bold rounded-lg
                      border-2 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${
                        digit
                          ? 'border-[#1E3A5F] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]'
                          : 'border-gray-300 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]'
                      }
                    `}
                    inputMode="numeric"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[#2563EB] font-semibold hover:underline text-sm"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <p className="text-sm text-gray-600">
                    Resend OTP in <span className="font-semibold text-gray-900">{resendTimer}s</span>
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Verify OTP
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOTPContent />
    </Suspense>
  );
}
