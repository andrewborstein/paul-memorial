import { Client } from '@notionhq/client'
import { tribute, type Tribute } from './schema'

const token = process.env.NOTION_TOKEN!
const dbId = process.env.NOTION_TRIBUTES_DB_ID!

export const notion = new Client({ auth: token })

export async function listTributes(): Promise<Tribute[]> {
  const res = await notion.databases.query({ database_id: dbId, sorts: [{ timestamp: 'created_time', direction: 'descending' }] })
  const items: Tribute[] = []
  for (const p of res.results) {
    if (p.object !== 'page' || !('properties' in p)) continue
    const title = (p.properties['Name'] as any)?.title?.[0]?.plain_text || 'Tribute'
    const rich = (p.properties['JSON'] as any)?.rich_text?.[0]?.plain_text || '{}'
    const mediaText = (p.properties['Media'] as any)?.rich_text?.[0]?.plain_text
    
    try {
      const parsed = JSON.parse(rich)
      
      // Merge media data if it exists
      if (mediaText) {
        try {
          const mediaData = JSON.parse(mediaText)
          parsed.media = mediaData
        } catch (e) {
          console.warn('Failed to parse media data:', e)
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
    JSON: { rich_text: [{ type: 'text', text: { content: JSON.stringify(t) } }] }
  }
  
  // Add media data to a separate field if provided
  if (mediaData) {
    properties.Media = { rich_text: [{ type: 'text', text: { content: mediaData } }] }
  }
  
  await notion.pages.create({
    parent: { database_id: dbId },
    properties
  })
}

export async function updateTributeJSON(pageId: string, json: any) {
  await notion.pages.update({ page_id: pageId, properties: { JSON: { rich_text: [{ type: 'text', text: { content: JSON.stringify(json) } }] } } })
}
