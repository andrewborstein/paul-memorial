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
    
    // Read from native Notion fields
    const name = (p.properties['Name'] as any)?.title?.[0]?.plain_text || 'Tribute'
    const body = (p.properties['Body'] as any)?.rich_text?.[0]?.plain_text || ''
    const title = (p.properties['Title'] as any)?.rich_text?.[0]?.plain_text
    const emailHash = (p.properties['EmailHash'] as any)?.rich_text?.[0]?.plain_text
    const customDate = (p.properties['CustomDate'] as any)?.date?.start
    const mediaCount = (p.properties['PhotoCount'] as any)?.number || 0
    
    // Skip hidden items (if we add a Hidden field later)
    const hidden = (p.properties['Hidden'] as any)?.checkbox || false
    if (hidden) continue
    
    // Load photos from Photos database if count > 0
    let mediaItems: any[] = []
    if (mediaCount > 0) {
      try {
        console.log('Loading photos for memory:', p.id, 'count:', mediaCount)
        console.log('Photos database ID:', photosDbId)
        
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
        
        console.log('Found photos:', photosRes.results.length)
        
        mediaItems = photosRes.results.map((photoPage: any) => ({
          type: (photoPage.properties['Type'] as any)?.select?.name || 'image',
          publicId: (photoPage.properties['PublicId'] as any)?.rich_text?.[0]?.plain_text || '',
          caption: (photoPage.properties['Caption'] as any)?.rich_text?.[0]?.plain_text
        }))
        
        console.log('Processed media items:', mediaItems.length)
      } catch (e: any) {
        console.warn('Failed to load photo data:', e)
        console.warn('Error details:', e.message, e.stack)
      }
    }
    
    // Create tribute object from native fields
    const tributeData = {
      id: p.id,
      name,
      body,
      title,
      emailHash,
      createdAt: customDate || new Date().toISOString(),
      media: mediaItems,
      comments: [], // We can add comments later if needed
      editToken: '' // We can add edit tokens later if needed
    }
    
    try {
      const t = tribute.parse(tributeData)
      items.push(t)
    } catch (e) {
      console.warn('Failed to parse tribute:', e)
    }
  }
  return items
}

export async function createTribute(t: Tribute) {
  const properties: any = {
    Name: { title: [{ type: 'text', text: { content: t.name } }] },
    Body: { rich_text: [{ type: 'text', text: { content: t.body || '' } }] },
    CustomDate: { date: { start: t.createdAt } }
  }
  
  // Add optional fields if they exist
  if (t.title) {
    properties.Title = { rich_text: [{ type: 'text', text: { content: t.title } }] }
  }
  
  if (t.emailHash) {
    properties.EmailHash = { rich_text: [{ type: 'text', text: { content: t.emailHash } }] }
  }
  
  // Create the main tribute
  const tributePage = await notion.pages.create({
    parent: { database_id: dbId },
    properties
  })
  
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
