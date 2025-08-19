import { NextRequest } from 'next/server';
import { serverFetch } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { memories } = await req.json();

    if (!Array.isArray(memories)) {
      return new Response('Memories must be an array', { status: 400 });
    }

    let createdCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < memories.length; i++) {
      const memory = memories[i];

      // Validate required fields
      if (!memory.name?.trim()) {
        errors.push(`Memory ${i + 1}: name is required`);
        continue;
      }
      if (!memory.email?.trim()) {
        errors.push(`Memory ${i + 1}: email is required`);
        continue;
      }
      if (!memory.body?.trim()) {
        errors.push(`Memory ${i + 1}: body is required`);
        continue;
      }

      // Add randomization to created_at if provided
      const memoryToCreate = { ...memory };
      if (memory.created_at) {
        const baseDate = new Date(memory.created_at);
        const randomMinutes = Math.floor(Math.random() * 1440);
        const randomSeconds = Math.floor(Math.random() * 60);
        const randomMilliseconds = Math.floor(Math.random() * 1000);

        baseDate.setMinutes(baseDate.getMinutes() + randomMinutes);
        baseDate.setSeconds(baseDate.getSeconds() + randomSeconds);
        baseDate.setMilliseconds(
          baseDate.getMilliseconds() + randomMilliseconds
        );

        memoryToCreate.created_at = baseDate.toISOString();
      }

      const response = await serverFetch('/api/memory', {
        method: 'POST',
        body: JSON.stringify(memoryToCreate),
      });

      if (response.ok) {
        createdCount++;
      } else {
        const errorText = await response.text();
        errors.push(`Memory ${i + 1}: ${errorText}`);
      }
    }

    return Response.json({
      success: true,
      count: createdCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Created ${createdCount} custom memories${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
    });
  } catch (error) {
    console.error('Error creating custom memories:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
