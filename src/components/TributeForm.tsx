'use client'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function TributeForm({ onCreated }: { onCreated: (t: any) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [youtube, setYoutube] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function uploadToCloudinary(files: FileList) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    const urls: { type: 'image'|'video', url: string }[] = []
    for (const f of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('upload_preset', preset)
      // Let Cloudinary determine resource_type automatically
      fd.append('resource_type', 'auto')
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd })
      const json = await res.json()
      const kind = json.resource_type === 'video' ? 'video' : 'image'
      // Delivery URL with on-the-fly optimization
      const url = json.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1600/')
      urls.push({ type: kind, url })
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      let media: any[] = []
      if (files && files.length) media = await uploadToCloudinary(files)

      const res = await fetch('/api/submit-tribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, body, youtube, media })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      onCreated(data.item)
      setName(''); setEmail(''); setBody(''); setYoutube(''); (document.getElementById('file') as HTMLInputElement).value=''
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card grid gap-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="label">Your name</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div>
        <label className="label">Your email (for edit link)</label>
        <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea className="input min-h-[120px]" value={body} onChange={e=>setBody(e.target.value)} required />
      </div>
      <div>
        <label className="label">YouTube URL (optional)</label>
        <input className="input" value={youtube} onChange={e=>setYoutube(e.target.value)} placeholder="https://youtu.be/..." />
      </div>
      <div>
        <label className="label">Photos / videos (optional)</label>
        <input id="file" className="input" type="file" multiple accept="image/*,video/*" onChange={e=>setFiles(e.target.files)} />
        <p className="text-xs text-gray-500 mt-1">Large files are auto-compressed by Cloudinary on delivery.</p>
      </div>
      {/* Turnstile */}
      <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
      <button disabled={submitting} className="btn">{submitting? 'Submitting…':'Post Tribute'}</button>
    </form>
  )
}
