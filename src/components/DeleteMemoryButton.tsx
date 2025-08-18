'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteMemoryButtonProps {
  memoryId: string;
}

export default function DeleteMemoryButton({
  memoryId,
}: DeleteMemoryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/memory/${memoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/memories');
        router.refresh();
      } else {
        alert('Failed to delete memory');
      }
    } catch (error) {
      alert('Failed to delete memory');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
    >
      Delete
    </button>
  );
}
