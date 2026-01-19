'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { canEditMemory, isSuperUser, getCurrentUser } from '@/lib/user';

interface MemoryActionsProps {
  memoryId: string;
  creatorEmail: string;
}

export default function MemoryActions({
  memoryId,
  creatorEmail,
}: MemoryActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check permissions on client side only
  useEffect(() => {
    const canEditResult = canEditMemory(creatorEmail);
    const isSuperResult = isSuperUser();

    setCanEdit(canEditResult);
    setIsLoaded(true);

    // Debug logging
    console.log('MemoryActions Debug:', {
      memoryId,
      creatorEmail,
      canEdit: canEditResult,
      isSuper: isSuperResult,
      currentUser: getCurrentUser(),
    });
  }, [memoryId, creatorEmail]);

  // Don't render anything until client-side check is complete
  if (!isLoaded) {
    return null;
  }

  if (!canEdit) {
    return null;
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Deleting memory:', memoryId);
      const res = await fetch(`/api/memory/${memoryId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', res.status);

      if (res.ok) {
        console.log('Memory deleted successfully, redirecting...');
        // Force a full page reload to ensure cache is cleared
        window.location.href = '/memories';
      } else {
        const errorText = await res.text();
        console.error('Delete failed:', errorText);
        alert('Failed to delete memory');
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Failed to delete memory');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="relative flex gap-2 items-center">
      <div className="flex gap-4 items-center">
        <Link
          href={`/memories/${memoryId}/edit`}
          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Edit memory"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </Link>

        <button
          onClick={handleDelete}
          className={`rounded-md transition-colors ${
            showDeleteConfirm
              ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
          title="Delete memory"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="absolute top-full right-0 mt-2 flex gap-2 bg-white shadow-lg border rounded-md p-2 z-10">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isDeleting ? 'Deleting...' : 'Confirm delete'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
