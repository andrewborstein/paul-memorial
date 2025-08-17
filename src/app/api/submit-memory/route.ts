import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { emailHash } from '@/lib/utils'
import { createTribute } from '@/lib/notion'

async function verifyTurnstile(token: string | undefined) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true
  if (!token) return false
  const formData = new FormData()
  formData.append('secret', process.env.TURNSTILE_SECRET_KEY)
  formData.append('response', token)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: formData })
  const data = await res.json()
  return !!data.success
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const ok = await verifyTurnstile((await req.headers).get('cf-turnstile-response') || body['cf-turnstile-response'])
    if (!ok) return new Response('Captcha failed', { status: 400 })

    const id = uuidv4().slice(0, 8)
    const editToken = uuidv4().replace(/-/g, '')
    const createdAt = dayjs().toISOString()

    const media = [
      ...(body.media||[]),
      ...(body.youtube ? [{ type: 'youtube', url: body.youtube }] : [])
    ]

    const item = {
      id,
      createdAt,
      name: body.name,
      emailHash: body.email ? emailHash(body.email) : undefined,
      body: body.body,
      media,
      comments: [],
      editToken
    }

    if ((process.env.DATA_SOURCE||'notion') === 'file') {
      // In file mode, write is not supported in serverless without FS write to repo; you can wire GitHub commits later.
      return NextResponse.json({ item }, { status: 201 })
    }

    await createTribute(item)
    return NextResponse.json({ item }, { status: 201 })
  } catch (e: any) {
    return new Response(e?.message || 'Error', { status: 500 })
  }
}
