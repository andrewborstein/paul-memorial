'use client';

import { useState } from 'react';

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string) => void;
  title?: string;
  description?: string;
}

interface UserInfo {
  name: string;
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
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

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

  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
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
          // Existing user
          setName(existingName);
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
    const nameError = validateName(name);
    if (nameError) {
      setErrors([nameError]);
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit(name.trim(), email.trim().toLowerCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWelcomeContinue = () => {
    setIsSubmitting(true);
    try {
      onSubmit(name, email.trim().toLowerCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setName('');
    setErrors([]);
    setIsSubmitting(false);
    setIsCheckingEmail(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingEmail ? 'Checking...' : 'Continue'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isCheckingEmail}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Name (for new users) */}
        {step === 'name' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Welcome! Please tell us your name.
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your first and last name"
                disabled={isSubmitting}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                autoFocus
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleNameSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
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
                Welcome back, {name}!
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
              <button
                type="button"
                onClick={() => setStep('email')}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Use different email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
