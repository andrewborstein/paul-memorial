'use client';
import React, { useEffect } from 'react';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryId: string;
  timestamp: string;
}

export default function ThankYouModal({
  isOpen,
  onClose,
  memoryId,
  timestamp,
}: ThankYouModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Bust the memories and photos cache when modal opens
      fetch(`/api/memories?t=${timestamp}`, { cache: 'no-store' }).catch(
        () => {}
      );
      fetch(`/api/photos-index?t=${timestamp}`, { cache: 'no-store' }).catch(
        () => {}
      );
    }
  }, [isOpen, timestamp]);

  const handleViewAllMemories = () => {
    // Navigate to all memories page with timestamp query param
    window.location.href = `/memories?t=${timestamp}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full mx-auto shadow-xl">
        {/* Header with close button */}
        <div className="flex justify-between items-start p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Thanks for your contribution
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-6">
          <p className="text-gray-700">
            Your memory means the world to Paul's family and loved ones. You can
            edit or delete the memory and its content (both text and photos) at
            any time on this device.
          </p>
          <p className="text-gray-700">
            Email{' '}
            <a
              href="mailto:contact@paulbedrosian.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              contact@paulbedrosian.com
            </a>{' '}
            with feedback or questions.
          </p>

          {/* Footer buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onClose} className="btn">
              View your memory
            </button>
            <button onClick={handleViewAllMemories} className="btn-secondary">
              View all memories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
