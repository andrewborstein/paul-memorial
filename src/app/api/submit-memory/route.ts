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

    // Truncate body text if it's too long for Notion's 2000 character limit
    // Leave some room for the JSON structure and other fields
    const maxBodyLength = 1500
    const truncatedBody = body.body && body.body.length > maxBodyLength 
      ? body.body.substring(0, maxBodyLength) + '...'
      : body.body

    // Create tribute without media to keep JSON small
    const tributeWithoutMedia = {
      id,
      createdAt,
      name: body.name,
      title: body.title,
      emailHash: body.email ? emailHash(body.email) : undefined,
      body: truncatedBody,
      media: [], // Empty array to keep JSON small
      comments: [],
      editToken
    }

    // Store media separately if there are any
    const mediaData = media.length > 0 ? JSON.stringify(media) : null

    if ((process.env.DATA_SOURCE||'notion') === 'file') {
      // In file mode, write is not supported in serverless without FS write to repo; you can wire GitHub commits later.
      return NextResponse.json({ item: tributeWithoutMedia }, { status: 201 })
    }

    const tributePage = await createTribute(tributeWithoutMedia, mediaData || undefined)
    return NextResponse.json({ item: tributeWithoutMedia }, { status: 201 })
  } catch (e: any) {
    return new Response(e?.message || 'Error', { status: 500 })
  }
}
