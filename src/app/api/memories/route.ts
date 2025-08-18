import { readIndex, readMemory } from '@/lib/data';
import { unstable_noStore } from 'next/cache';

export const revalidate = 60; // Next's ISR hint

export async function GET() {
  // Disable caching to prevent stale data
  unstable_noStore();
  
  try {
    console.log('Starting /api/memories request');
    const list = await readIndex();
    console.log('Read index, found', list.length, 'memories');

    // Add truncated body text to each memory and filter out deleted ones
    const memoriesWithBody = await Promise.all(
      list.map(async (memory) => {
        try {
          const detail = await readMemory(memory.id);
          if (!detail) {
            console.warn(`Memory ${memory.id} not found, skipping`);
            return null;
          }
          
          const truncatedBody = detail?.body
            ? detail.body.length > 200
              ? detail.body.substring(0, 200).trim() + '...'
              : detail.body
            : '';

          return {
            ...memory,
            body: truncatedBody,
            name: detail?.name || '',
          };
        } catch (error) {
          console.warn(
            `Failed to fetch details for memory ${memory.id}:`,
            error
          );
          return null;
        }
      })
    );

    // Filter out null values (deleted memories)
    const validMemories = memoriesWithBody.filter(Boolean);

    console.log('Successfully processed', validMemories.length, 'memories');
    return Response.json(validMemories, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
  } catch (error) {
    console.error('Error in /api/memories:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
