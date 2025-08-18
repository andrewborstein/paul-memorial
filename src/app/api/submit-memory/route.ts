import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { emailHash } from '@/lib/utils';
import { createMemory } from '@/lib/notion';

async function verifyTurnstile(token: string | undefined) {
  console.log('Turnstile verification:', {
    hasSecretKey: !!process.env.TURNSTILE_SECRET_KEY,
    hasToken: !!token,
    tokenLength: token?.length,
  });

  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.log('No secret key - skipping verification');
    return true;
  }
  if (!token) {
    console.log('No token provided');
    return false;
  }

  const formData = new FormData();
  formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: formData }
  );
  const data = await res.json();
  console.log('Turnstile verification result:', data);
  return !!data.success;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ok = await verifyTurnstile(
      (await req.headers).get('cf-turnstile-response') ||
        body['cf-turnstile-response']
    );
    if (!ok) return new Response('Captcha failed', { status: 400 });

    const id = uuidv4().slice(0, 8);
    const editToken = uuidv4().replace(/-/g, '');
    const createdAt = dayjs().toISOString();

    // Truncate body text if it's too long for Notion's 2000 character limit
    const maxBodyLength = 1500;
    const truncatedBody =
      body.body && body.body.length > maxBodyLength
        ? body.body.substring(0, maxBodyLength) + '...'
        : body.body;

    // Create memory
    const memoryData = {
      id,
      createdAt,
      name: body.name,
      title: body.title,
      emailHash: body.email ? emailHash(body.email) : undefined,
      body: truncatedBody,
      media: [],
      comments: [],
      editToken,
    };

    if ((process.env.DATA_SOURCE || 'notion') === 'file') {
      // In file mode, write is not supported in serverless without FS write to repo; you can wire GitHub commits later.
      return NextResponse.json({ item: memoryData }, { status: 201 });
    }

    const memoryPage = await createMemory(memoryData);
    return NextResponse.json(
      {
        item: { ...memoryData, id: memoryPage.id },
        memoryId: memoryPage.id,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return new Response(e?.message || 'Error', { status: 500 });
  }
}
