import { NextRequest } from 'next/server';
import { serverFetch } from '@/lib/utils';
import { revalidateTag } from 'next/cache';

export async function DELETE(req: NextRequest) {
  try {
    // First, get all memories
    const memoriesResponse = await serverFetch('/api/memories');
    if (!memoriesResponse.ok) {
      return new Response('Failed to fetch memories', { status: 500 });
    }

    const memories = await memoriesResponse.json();
    let deletedCount = 0;

    // Delete each memory
    for (const memory of memories) {
      const deleteResponse = await serverFetch(`/api/memory/${memory.id}`, {
        method: 'DELETE',
      });

      if (deleteResponse.ok) {
        deletedCount++;
      }
    }

    // Re-index photos and memories
    revalidateTag('photos-index');
    revalidateTag('memories-index');

    return Response.json({
      success: true,
      count: deletedCount,
      message: `Deleted ${deletedCount} memories`,
    });
  } catch (error) {
    console.error('Error deleting memories:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
