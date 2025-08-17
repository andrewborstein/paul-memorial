import { Client } from '@notionhq/client'
import { tribute, type Tribute } from './schema'

const token = process.env.NOTION_TOKEN!
const dbId = process.env.NOTION_TRIBUTES_DB_ID!
const photosDbId = process.env.NOTION_PHOTOS_DB_ID!

export const notion = new Client({ auth: token })

export async function listTributes(): Promise<Tribute[]> {
  const res = await notion.databases.query({ database_id: dbId, sorts: [{ property: 'CustomDate', direction: 'descending' }] })
  const items: Tribute[] = []
  
  for (const p of res.results) {
    if (p.object !== 'page' || !('properties' in p)) continue
    const title = (p.properties['Name'] as any)?.title?.[0]?.plain_text || 'Tribute'
    const rich = (p.properties['JSON'] as any)?.rich_text?.[0]?.plain_text || '{}'
    const mediaCount = (p.properties['PhotoCount'] as any)?.number || 0
    const customDate = (p.properties['CustomDate'] as any)?.date?.start
    
    try {
      const parsed = JSON.parse(rich)
      
      // Use custom date if available, otherwise fall back to createdAt
      if (customDate) {
        parsed.createdAt = customDate
      }
      
      // Load photos from Photos database if count > 0
      if (mediaCount > 0) {
        try {
          const photosRes = await notion.databases.query({
            database_id: photosDbId,
            filter: {
              property: 'Memory',
              relation: {
                contains: p.id
              }
            },
            sorts: [{ property: 'UploadDate', direction: 'ascending' }]
          })
          
          const mediaItems = photosRes.results.map((photoPage: any) => ({
            type: (photoPage.properties['Type'] as any)?.select?.name || 'image',
            publicId: (photoPage.properties['PublicId'] as any)?.rich_text?.[0]?.plain_text || '',
            caption: (photoPage.properties['Caption'] as any)?.rich_text?.[0]?.plain_text
          }))
          
          parsed.media = mediaItems
        } catch (e) {
          console.warn('Failed to load photo data:', e)
        }
      }
      
      const t = tribute.parse({ ...parsed, name: parsed.name || title })
      // skip hidden
      if (parsed.hidden) continue
      items.push(t)
    } catch (e) { /* ignore bad rows */ }
  }
  return items
}

export async function createTribute(t: Tribute, mediaData?: string) {
  const title = `${t.name} — ${new Date(t.createdAt).toLocaleString()}`
  
  const properties: any = {
    Name: { title: [{ type: 'text', text: { content: title } }] },
    JSON: { rich_text: [{ type: 'text', text: { content: JSON.stringify(t) } }] },
    CustomDate: { date: { start: t.createdAt } }
  }
  
  // Create the main tribute
  const tributePage = await notion.pages.create({
    parent: { database_id: dbId },
    properties
  })
  
  // If there's media data, create photo records in the Photos database
  if (mediaData && mediaData.length > 0) {
    try {
      const mediaItems = JSON.parse(mediaData)
      if (Array.isArray(mediaItems) && mediaItems.length > 0) {
        // Store photo count in the tribute
        await notion.pages.update({
          page_id: tributePage.id,
          properties: {
            PhotoCount: { number: mediaItems.length }
          }
        })
        
        // Create a photo record for each media item
        for (const mediaItem of mediaItems) {
          await notion.pages.create({
            parent: { database_id: photosDbId },
            properties: {
              Title: { title: [{ type: 'text', text: { content: `${title} - Photo` } }] },
              Memory: { relation: [{ id: tributePage.id }] },
              Type: { select: { name: mediaItem.type } },
              PublicId: { rich_text: [{ type: 'text', text: { content: mediaItem.publicId } }] },
              Caption: mediaItem.caption ? { rich_text: [{ type: 'text', text: { content: mediaItem.caption } }] } : { rich_text: [] },
              UploadDate: { date: { start: new Date().toISOString() } }
            }
          })
        }
      }
    } catch (e) {
      console.error('Failed to store photo data:', e)
    }
  }
  
  return tributePage
}

export async function updateTributeJSON(pageId: string, json: any) {
  await notion.pages.update({ page_id: pageId, properties: { JSON: { rich_text: [{ type: 'text', text: { content: JSON.stringify(json) } }] } } })
}

export async function getAllPhotos() {
  const res = await notion.databases.query({ 
    database_id: photosDbId, 
    sorts: [{ property: 'UploadDate', direction: 'descending' }] 
  })
  
  return res.results.map((photoPage: any) => ({
    id: photoPage.id,
    title: (photoPage.properties['Title'] as any)?.title?.[0]?.plain_text || 'Photo',
    type: (photoPage.properties['Type'] as any)?.select?.name || 'image',
    publicId: (photoPage.properties['PublicId'] as any)?.rich_text?.[0]?.plain_text || '',
    caption: (photoPage.properties['Caption'] as any)?.rich_text?.[0]?.plain_text,
    uploadDate: (photoPage.properties['UploadDate'] as any)?.date?.start,
    memoryId: (photoPage.properties['Memory'] as any)?.relation?.[0]?.id
  }))
}
