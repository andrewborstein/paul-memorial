export interface User {
  email: string;
  name: string;
  createdAt: string;
}

import { aggregateIndex } from '@/lib/data';

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    // Check memories for user instead of separate users database
    // Import the function directly instead of making HTTP request
    const memories = await aggregateIndex({ forceFresh: true });
    const normalizedEmail = email.trim().toLowerCase();

    const userMemory = memories.find(
      (memory: any) => memory.email?.toLowerCase() === normalizedEmail
    );

    if (userMemory && userMemory.email && userMemory.name) {
      return {
        email: userMemory.email,
        name: userMemory.name,
        createdAt: userMemory.created_at || new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}
