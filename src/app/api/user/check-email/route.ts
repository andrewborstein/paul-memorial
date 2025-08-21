import { findUserByEmail } from '@/lib/user';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response('Email is required', { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('Checking email:', normalizedEmail);

    // Check for existing user in memories
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      console.log('Existing user found:', existingUser);
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
