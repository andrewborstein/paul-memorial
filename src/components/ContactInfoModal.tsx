'use client';

import React, { useState } from 'react';
import { clearCurrentUser, getCurrentUser } from '@/lib/user';

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string) => void;
  title?: string;
  description?: string;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ContactInfoModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Contact info',
  description = 'Please provide your contact information to continue.',
}: ContactInfoModalProps) {
  const [step, setStep] = useState<'email' | 'name' | 'welcome'>('email');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [hasCurrentUser, setHasCurrentUser] = useState(false);

  // Check if there's a current user on mount and when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const currentUser = getCurrentUser();
      setHasCurrentUser(!!currentUser);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validateNames = (firstName: string, lastName: string) => {
    if (!firstName.trim()) {
      return 'First name is required';
    }
    if (!lastName.trim()) {
      return 'Last name is required';
    }
    if (firstName.trim().length < 2) {
      return 'First name must be at least 2 characters';
    }
    if (lastName.trim().length < 2) {
      return 'Last name must be at least 2 characters';
    }
    return null;
  };

  const checkEmail = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors([emailError]);
      return;
    }

    setIsCheckingEmail(true);
    setErrors([]);

    try {
      // Check if email exists in our system
      const response = await fetch('/api/user/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (response.ok) {
        const { exists, name: existingName } = await response.json();

        if (exists && existingName) {
          // Existing user - split the name
          const nameParts = existingName.split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
          setStep('welcome');
        } else {
          // New user
          setStep('name');
        }
      } else {
        // If API fails, assume new user
        setStep('name');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // If check fails, assume new user
      setStep('name');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleNameSubmit = () => {
    const nameError = validateNames(firstName, lastName);
    if (nameError) {
      setErrors([nameError]);
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit(
        `${firstName.trim()} ${lastName.trim()}`,
        email.trim().toLowerCase()
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWelcomeContinue = () => {
    setIsSubmitting(true);
    try {
      onSubmit(`${firstName} ${lastName}`, email.trim().toLowerCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setFirstName('');
    setLastName('');
    setErrors([]);
    setIsSubmitting(false);
    setIsCheckingEmail(false);
    onClose();
  };

  const handleSignOut = () => {
    clearCurrentUser();
    handleClose();
    // Reload the window to ensure clean state
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
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
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-2 pr-8">
          {title}
        </h2>
        {step === 'email' && (
          <p className="text-gray-600 mb-2">{description}</p>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1 sr-only"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
                disabled={isCheckingEmail}
                onKeyDown={(e) => e.key === 'Enter' && checkEmail()}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={checkEmail}
                disabled={isCheckingEmail}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingEmail ? 'Checking...' : 'Continue'}
              </button>
              {hasCurrentUser && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isCheckingEmail}
                  className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Name (for new users) */}
        {step === 'name' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Your name will be displayed next to your contributions.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1 sr-only"
                >
                  First name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="First name"
                  disabled={isSubmitting}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1 sr-only"
                >
                  Last name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Last name"
                  disabled={isSubmitting}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleNameSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Welcome back (for existing users) */}
        {step === 'welcome' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl mb-2">👋</div>
              <div className="text-lg font-medium text-gray-900 mb-1">
                Welcome back, {firstName} {lastName}!
              </div>
              <div className="text-sm text-gray-600">
                We'll use your existing contact info.
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleWelcomeContinue}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Continuing...' : 'Continue'}
              </button>
              {hasCurrentUser && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
