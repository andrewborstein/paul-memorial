'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loginWithEmailHash, getCurrentUser } from '@/lib/user';

export default function AutoLoginHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const handleAutoLogin = async () => {
      const emailHash = searchParams.get('emailHash');

      if (emailHash && !getCurrentUser()) {
        const success = await loginWithEmailHash(emailHash);

        if (success) {
          // Remove the emailHash from URL and redirect to clean URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('emailHash');
          router.replace(newUrl.pathname + newUrl.search);
        } else {
          // Show error for failed login
          setShowError(true);
          // Remove the emailHash from URL after showing error
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('emailHash');
          router.replace(newUrl.pathname + newUrl.search);
        }
      }
    };

    handleAutoLogin();
  }, [searchParams, router]);

  if (showError) {
    return (
      <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 shadow-lg z-50 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
            <p className="text-sm text-red-700 mt-1">
              The login link is invalid or has expired. Please contact an
              administrator for a new link.
            </p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setShowError(false)}
              className="text-red-400 hover:text-red-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null; // This component doesn't render anything
}
