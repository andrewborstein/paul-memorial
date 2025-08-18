'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const [isSuper, setIsSuper] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  // Check permissions on client side only
  useEffect(() => {
    const canEditResult = canEditMemory(creatorEmail);
    const isSuperResult = isSuperUser();
    
    setCanEdit(canEditResult);
    setIsSuper(isSuperResult);
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
    <div className="flex gap-2">
      <Link
        href={`/memories/${memoryId}/edit`}
        className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
      >
        Edit
      </Link>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
          showDeleteConfirm
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isDeleting ? 'Deleting...' : showDeleteConfirm ? 'Confirm' : 'Delete'}
      </button>

      {showDeleteConfirm && (
        <button
          onClick={() => setShowDeleteConfirm(false)}
          className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 transition-colors text-sm"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
