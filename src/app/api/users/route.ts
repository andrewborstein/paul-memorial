import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

interface User {
  email: string;
  name: string;
  createdAt: string;
}

async function ensureUsersFile() {
  try {
    await fs.access(USERS_FILE);
  } catch {
    // Create the file if it doesn't exist
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
  }
}

async function readUsers(): Promise<User[]> {
  await ensureUsersFile();
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeUsers(users: User[]) {
  await ensureUsersFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

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
    const users = await readUsers();

    // Check if user already exists
    const existingUser = users.find(user => user.email === normalizedEmail);
    if (existingUser) {
      return Response.json({
        exists: true,
        name: existingUser.name,
        email: existingUser.email,
      });
    }

    // Add new user
    const newUser: User = {
      email: normalizedEmail,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);

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
