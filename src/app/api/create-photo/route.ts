import { NextResponse } from 'next/server'
import { notion } from '@/lib/notion'

const photosDbId = process.env.NOTION_PHOTOS_DB_ID!

export async function POST(req: Request) {
  try {
    const { memoryId, publicId, type, caption } = await req.json()
    
    if (!memoryId || !publicId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Create photo record in Notion
    const photoPage = await notion.pages.create({
      parent: { database_id: photosDbId },
      properties: {
        Name: { title: [{ type: 'text', text: { content: `Photo` } }] },
        Memory: { relation: [{ id: memoryId }] },
        Type: { select: { name: type } },
        PublicId: { rich_text: [{ type: 'text', text: { content: publicId } }] },
        Caption: caption ? { rich_text: [{ type: 'text', text: { content: caption } }] } : { rich_text: [] },
        UploadDate: { date: { start: new Date().toISOString() } }
      }
    })
    
    return NextResponse.json({ success: true, photoId: photoPage.id })
  } catch (error: any) {
    console.error('Failed to create photo record:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
