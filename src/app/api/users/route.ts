import { NextRequest } from 'next/server';
import {
  readUsers,
  writeUsers,
  findUserByEmail,
  createUser,
  type User,
} from '@/lib/user';

export async function GET() {
  try {
    const users = await readUsers();
    return Response.json(users);
  } catch (error) {
    console.error('Error reading users:', error);
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

    // Check if user already exists
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return Response.json({
        exists: true,
        name: existingUser.name,
        email: existingUser.email,
      });
    }

    // Add new user
    const newUser = await createUser(normalizedEmail, name);

    return Response.json({
      exists: false,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
