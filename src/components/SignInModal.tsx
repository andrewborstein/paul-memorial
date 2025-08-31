'use client';

import { useState } from 'react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string) => Promise<void>;
  title?: string;
  description?: string;
}

export default function SignInModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Sign in to continue',
  description = 'Please enter your name and email to share this content.',
}: SignInModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingMemory, setIsCreatingMemory] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push('Name is required');
    }

    if (!email.trim()) {
      newErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push('Please enter a valid email address');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsCreatingMemory(true);
    try {
      await onSubmit(name.trim(), email.trim().toLowerCase());
      // Modal will be closed by parent component after successful submission
      // (or we'll redirect away, so no need to reset states)
    } catch (error) {
      // Reset only form validation state, keep creating memory state
      // since we might retry or show error state
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isCreatingMemory ? 'Creating memory...' : title}
        </h2>
        <p className="text-gray-600 mb-6">
          {isCreatingMemory
            ? 'Please wait while we save your memory.'
            : description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
              disabled={isSubmitting || isCreatingMemory}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              disabled={isSubmitting || isCreatingMemory}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isCreatingMemory}
              className="btn disabled:opacity-50"
            >
              {isCreatingMemory
                ? 'Creating memory...'
                : isSubmitting
                  ? 'Signing in...'
                  : 'Continue'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isCreatingMemory}
              className="btn-secondary disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
