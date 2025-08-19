import { aggregateIndex } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response('Email is required', { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Read all memories to check for existing email
    const memories = await aggregateIndex();

    // Find any memory with this email
    const existingMemory = memories.find((memory) => {
      // We need to read the full memory to get the email
      // For now, we'll check the index and then read the detail if needed
      return false; // Placeholder - we'll implement this properly
    });

    // For now, let's check if we have any memories with this email
    // This is a simplified approach - in a real app you'd have a users table
    const memoriesWithEmail = await Promise.all(
      memories.map(async (memory) => {
        try {
          const { readMemory } = await import('@/lib/data');
          const detail = await readMemory(memory.id);
          return detail?.email === normalizedEmail ? detail : null;
        } catch {
          return null;
        }
      })
    );

    const existingUser = memoriesWithEmail.find((m) => m !== null);

    if (existingUser) {
      return Response.json({
        exists: true,
        name: existingUser.name,
        email: existingUser.email,
      });
    } else {
      return Response.json({
        exists: false,
        name: null,
        email: null,
      });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
