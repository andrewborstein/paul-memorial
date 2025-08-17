'use client'
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import imageCompression from 'browser-image-compression'

export default function TributeForm({ onCreated }: { onCreated: (t: any) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [youtube, setYoutube] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileLoaded, setTurnstileLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; message: string } | null>(null)
  const turnstileId = useRef(`turnstile-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    // Manually render Turnstile widget when script loads
    const renderTurnstile = () => {
      if ((window as any).turnstile) {
        setTurnstileLoaded(true)
        console.log('Turnstile loaded successfully')
        // Manually render the widget with unique ID
        const widgetId = (window as any).turnstile.render(`#${turnstileId.current}`, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            console.log('Turnstile token:', token)
            setTurnstileToken(token)
          }
        })
      } else {
        console.log('Turnstile not loaded yet')
        setTimeout(renderTurnstile, 1000)
      }
    }
    renderTurnstile()
  }, [isClient])

  async function uploadToCloudinary(files: FileList) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    const urls: { type: 'image'|'video', url: string }[] = []
    const fileArray = Array.from(files)
    
    setUploadProgress({ current: 0, total: fileArray.length, message: 'Starting uploads...' })
    
    for (let i = 0; i < fileArray.length; i++) {
      const f = fileArray[i]
      let fileToUpload = f
      
      // Compress images if they're too large
      if (f.type.startsWith('image/') && f.size > 5 * 1024 * 1024) { // 5MB threshold
        try {
          console.log(`Compressing ${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`)
          fileToUpload = await imageCompression(f, {
            maxSizeMB: 4, // Target 4MB max
            maxWidthOrHeight: 1920, // Max dimension
            useWebWorker: true
          })
          console.log(`Compressed to ${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB`)
        } catch (error) {
          console.warn('Compression failed, using original file:', error)
          fileToUpload = f
        }
      }
      
      // Update progress for upload
      setUploadProgress({ 
        current: i + 1, 
        total: fileArray.length, 
        message: `Uploading ${f.name}...` 
      })
      
      const fd = new FormData()
      fd.append('file', fileToUpload)
      fd.append('upload_preset', preset)
      // Let Cloudinary determine resource_type automatically
      fd.append('resource_type', 'auto')
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd })
      const json = await res.json()
      
      if (json.error) {
        throw new Error(`Upload failed: ${json.error.message}`)
      }
      
      const kind = json.resource_type === 'video' ? 'video' : 'image'
      // Delivery URL with on-the-fly optimization
      const url = json.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1600/')
      urls.push({ type: kind, url })
    }
    
    setUploadProgress(null)
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
        body: JSON.stringify({ name, email, body, youtube, media, 'cf-turnstile-response': turnstileToken })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      onCreated(data.item)
      setName(''); setEmail(''); setBody(''); setYoutube(''); setTurnstileToken(null); setUploadProgress(null); (document.getElementById('file') as HTMLInputElement).value=''
      // Reset Turnstile widget
      if ((window as any).turnstile) {
        (window as any).turnstile.reset(`#${turnstileId.current}`)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card grid gap-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {uploadProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              {uploadProgress.message}
            </span>
            <span className="text-sm text-blue-600">
              {uploadProgress.current} of {uploadProgress.total}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
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
        <p className="text-xs text-gray-500 mt-1">Large images are automatically compressed. Videos must be under 10MB.</p>
      </div>
      {/* Turnstile */}
      {isClient && (
        <div id={turnstileId.current} data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
      )}
      <button disabled={submitting} className="btn">{submitting? 'Submitting…':'Post Tribute'}</button>
    </form>
  )
}
