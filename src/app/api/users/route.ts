import { NextRequest } from 'next/server';
import { serverFetch } from '@/lib/utils';

export async function GET() {
  try {
    // Fetch all memories to extract unique users
    const response = await serverFetch('/api/memories');
    if (!response.ok) {
      return new Response('Failed to fetch memories', { status: 500 });
    }

    const memories = await response.json();

    // Extract unique users from memories
    const userMap = new Map();

    memories.forEach((memory: any) => {
      if (memory.email && memory.name) {
        const normalizedEmail = memory.email.trim().toLowerCase();
        if (!userMap.has(normalizedEmail)) {
          userMap.set(normalizedEmail, {
            email: normalizedEmail,
            name: memory.name.trim(),
            createdAt: memory.created_at || new Date().toISOString(),
          });
        }
      }
    });

    // Convert map to array and sort by name
    const users = Array.from(userMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return Response.json(users);
  } catch (error) {
    console.error('Error reading users from memories:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return new Response('Email and name are required', { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists by looking at memories
    const response = await serverFetch('/api/memories');
    if (response.ok) {
      const memories = await response.json();
      const existingUser = memories.find(
        (memory: any) => memory.email?.toLowerCase() === normalizedEmail
      );

      if (existingUser) {
        return Response.json({
          exists: true,
          name: existingUser.name,
          email: existingUser.email,
        });
      }
    }

    // User doesn't exist - they would need to create a memory to be added
    return Response.json({
      exists: false,
      name: name.trim(),
      email: normalizedEmail,
      message: 'User will be created when they submit their first memory',
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
