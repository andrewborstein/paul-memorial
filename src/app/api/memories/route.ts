import { NextResponse } from 'next/server'
import { listTributes } from '@/lib/notion'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const source = process.env.DATA_SOURCE || 'notion'
    if (source === 'file') {
      const dir = path.join(process.cwd(), 'data', 'memories')
      const files = await fs.readdir(dir)
      const items = [] as any[]
      for (const f of files.filter(f=>f.endsWith('.json'))) {
        const raw = await fs.readFile(path.join(dir, f), 'utf8')
        items.push(JSON.parse(raw))
      }
      items.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
      return NextResponse.json({ items })
    }
    const items = await listTributes()
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ items: [] })
  }
}
