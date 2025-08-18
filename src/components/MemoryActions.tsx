'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { canEditMemory, isSuperUser, getCurrentUser } from '@/lib/user';

interface MemoryActionsProps {
  memoryId: string;
  creatorEmail: string;
}

export default function MemoryActions({ 
  memoryId, 
  creatorEmail
}: MemoryActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  // Check if user can edit this memory
  const canEdit = canEditMemory(creatorEmail);
  const isSuper = isSuperUser();
  
  // Debug logging
  console.log('MemoryActions Debug:', {
    memoryId,
    creatorEmail,
    canEdit,
    isSuper,
    currentUser: getCurrentUser()
  });

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
      const res = await fetch(`/api/memory/${memoryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/memories');
        router.refresh();
      } else {
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
    <div className="flex gap-2 mt-4">
      {isSuperUser() && (
        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
          Super User Mode
        </span>
      )}
      <Link
        href={`/memories/${memoryId}/edit`}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
      >
        Edit Memory
      </Link>
      
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`px-4 py-2 rounded-md text-sm transition-colors ${
          showDeleteConfirm
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isDeleting 
          ? 'Deleting...' 
          : showDeleteConfirm 
            ? 'Click again to confirm' 
            : 'Delete Memory'
        }
      </button>
      
      {showDeleteConfirm && (
        <button
          onClick={() => setShowDeleteConfirm(false)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
