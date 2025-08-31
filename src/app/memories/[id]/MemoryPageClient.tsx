'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import PhotoGrid from '@/components/PhotoGrid';
import MemoryActions from '@/components/MemoryActions';
import MemoryMetadata from '@/components/MemoryMetadata';
import LinkifiedText from '@/components/LinkifiedText';
import ThankYouModal from '@/components/ThankYouModal';
import type { MemoryDetail } from '@/types/memory';

interface MemoryPageClientProps {
  memory: MemoryDetail;
  showThanks: boolean;
  timestamp: string;
}

export default function MemoryPageClient({
  memory,
  showThanks,
  timestamp,
}: MemoryPageClientProps) {
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(showThanks);
  const router = useRouter();

  const displayTitle = memory.title || memory.name;

  // Clean up showThanks parameter immediately when modal should be shown
  useEffect(() => {
    if (showThanks) {
      const url = new URL(window.location.href);
      url.searchParams.delete('showThanks');
      window.history.replaceState({}, '', url.toString());
    }
  }, [showThanks]);

  const handleCloseThankYouModal = () => {
    setIsThankYouModalOpen(false);
  };

  return (
    <>
      <PageContainer>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          {/* Breadcrumbs */}
          <nav>
            <ol className="flex items-center space-x-2 text-sm flex-wrap">
              <li>
                <Link
                  href="/memories"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Memories
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-600 font-medium">{memory.name}</li>
            </ol>
          </nav>

          {/* Edit/Delete Actions */}
          <MemoryActions memoryId={memory.id} creatorEmail={memory.email} />
        </div>

        {/* Memory Content */}
        <div className="space-y-6">
          {/* Text Content */}
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <PageHeader title={displayTitle} visuallyHidden />
            </div>
            <MemoryMetadata
              date={memory.created_at}
              creatorEmail={memory.email}
              creatorName={memory.name}
            />
            {memory.title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {memory.title}
              </h2>
            )}
            <LinkifiedText
              text={memory.body}
              className="text-gray-700 whitespace-pre-wrap leading-relaxed"
            />
          </div>

          {/* Photos */}
          {memory.photos.length > 0 && (
            <div>
              <PhotoGrid photos={memory.photos} memoryId={memory.id} />
            </div>
          )}
        </div>
      </PageContainer>

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={isThankYouModalOpen}
        onClose={handleCloseThankYouModal}
        memoryId={memory.id}
        timestamp={timestamp}
      />
    </>
  );
}
