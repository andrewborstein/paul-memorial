import { aggregateIndex } from '@/lib/data';
import { findUserByEmail } from '@/lib/user';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response('Email is required', { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('Checking email:', normalizedEmail);

    // First check the users file
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      console.log('Existing user found in users file:', existingUser);
      return Response.json({
        exists: true,
        name: existingUser.name,
        email: existingUser.email,
      });
    }

    // If not found in users, check memories as fallback
    const memories = await aggregateIndex();
    console.log('Found memories:', memories.length);

    const memoriesWithEmail = await Promise.all(
      memories.map(async (memory) => {
        try {
          const { readMemory } = await import('@/lib/data');
          const detail = await readMemory(memory.id);
          console.log(`Memory ${memory.id} email:`, detail?.email);
          return detail?.email === normalizedEmail ? detail : null;
        } catch (error) {
          console.error(`Error reading memory ${memory.id}:`, error);
          return null;
        }
      })
    );

    const existingMemoryUser = memoriesWithEmail.find((m) => m !== null);
    console.log('Existing user found in memories:', existingMemoryUser);

    if (existingMemoryUser) {
      return Response.json({
        exists: true,
        name: existingMemoryUser.name,
        email: existingMemoryUser.email,
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
