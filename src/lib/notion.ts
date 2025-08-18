import { Client } from '@notionhq/client';
import { memory, type Memory } from './schema';

const token = process.env.NOTION_TOKEN!;
const dbId = process.env.NOTION_MEMORIES_DB_ID!;
const photosDbId = process.env.NOTION_PHOTOS_DB_ID!;

export const notion = new Client({ auth: token });

export async function listMemories(): Promise<Memory[]> {
  const res = await notion.databases.query({
    database_id: dbId,
    sorts: [{ property: 'Date', direction: 'descending' }],
  });
  
  // Get all memory IDs that have photos
  const memoryIdsWithPhotos = res.results
    .filter((p: any) => (p.properties['PhotoCount'] as any)?.number > 0)
    .map((p: any) => p.id);

  // Fetch all photos in a single query if there are any memories with photos
  let allPhotos: any[] = [];
  if (memoryIdsWithPhotos.length > 0) {
    try {
      const photosRes = await notion.databases.query({
        database_id: photosDbId,
        filter: {
          or: memoryIdsWithPhotos.map((memoryId) => ({
            property: 'Memory',
            relation: {
              contains: memoryId,
            },
          })),
        },
        sorts: [{ property: 'OrderIndex', direction: 'ascending' }],
      });

      allPhotos = photosRes.results.map((photoPage: any) => ({
        memoryId: (photoPage.properties['Memory'] as any)?.relation?.[0]?.id,
        type: (photoPage.properties['Type'] as any)?.select?.name || 'image',
        publicId: (photoPage.properties['PublicId'] as any)?.rich_text?.[0]?.plain_text || '',
        caption: (photoPage.properties['Caption'] as any)?.rich_text?.[0]?.plain_text,
      }));
    } catch (e: any) {
      console.warn('Failed to load photo data:', e);
    }
  }

  const items: Memory[] = [];

  for (const p of res.results) {
    if (p.object !== 'page' || !('properties' in p)) continue;

    // Read from native Notion fields
    const name = (p.properties['Name'] as any)?.title?.[0]?.plain_text || 'Memory';
    const body = (p.properties['Body'] as any)?.rich_text?.[0]?.plain_text || '';
    const title = (p.properties['Title'] as any)?.rich_text?.[0]?.plain_text;
    const emailHash = (p.properties['EmailHash'] as any)?.rich_text?.[0]?.plain_text;
    const date = (p.properties['Date'] as any)?.date?.start;

    // Skip hidden items (if we add a Hidden field later)
    const hidden = (p.properties['Hidden'] as any)?.checkbox || false;
    if (hidden) continue;

    // Get photos for this memory from the pre-fetched data
    const mediaItems = allPhotos
      .filter((photo) => photo.memoryId === p.id)
      .map((photo) => ({
        type: photo.type,
        publicId: photo.publicId,
        caption: photo.caption,
      }));

    // Create memory object from native fields
    const memoryData = {
      id: p.id,
      name,
      body,
      title,
      emailHash,
      createdAt: date || new Date().toISOString(),
      media: mediaItems,
      comments: [],
      editToken: '',
    };

    try {
      const t = memory.parse(memoryData);
      items.push(t);
    } catch (e) {
      console.warn('Failed to parse memory:', e);
    }
  }
  return items;
}

export async function createMemory(t: Memory) {
  const properties: any = {
    Name: { title: [{ type: 'text', text: { content: t.name } }] },
    Body: { rich_text: [{ type: 'text', text: { content: t.body || '' } }] },
    Date: { date: { start: new Date().toISOString() } }, // Auto-filled with current time
  };

  // Add optional fields if they exist
  if (t.title) {
    properties.Title = {
      rich_text: [{ type: 'text', text: { content: t.title } }],
    };
  }

  if (t.emailHash) {
    properties.EmailHash = {
      rich_text: [{ type: 'text', text: { content: t.emailHash } }],
    };
  }

  // Create the main memory
  const memoryPage = await notion.pages.create({
    parent: { database_id: dbId },
    properties,
  });

  return memoryPage;
}

export async function updateMemoryJSON(pageId: string, json: any) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      JSON: {
        rich_text: [{ type: 'text', text: { content: JSON.stringify(json) } }],
      },
    },
  });
}

export async function getAllPhotos() {
  const res = await notion.databases.query({
    database_id: photosDbId,
    sorts: [{ property: 'OrderIndex', direction: 'descending' }],
  });

  return res.results.map((photoPage: any) => ({
    id: photoPage.id,
    title:
      (photoPage.properties['Title'] as any)?.title?.[0]?.plain_text || 'Photo',
    type: (photoPage.properties['Type'] as any)?.select?.name || 'image',
    publicId:
      (photoPage.properties['PublicId'] as any)?.rich_text?.[0]?.plain_text ||
      '',
    caption: (photoPage.properties['Caption'] as any)?.rich_text?.[0]
      ?.plain_text,
    uploadDate: (photoPage.properties['UploadDate'] as any)?.date?.start,
    memoryId: (photoPage.properties['Memory'] as any)?.relation?.[0]?.id,
  }));
}
