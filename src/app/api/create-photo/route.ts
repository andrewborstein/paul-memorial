import { NextResponse } from 'next/server'
import { notion } from '@/lib/notion'
import { revalidatePath } from 'next/cache'

const photosDbId = process.env.NOTION_PHOTOS_DB_ID!;
const memoriesDbId = process.env.NOTION_MEMORIES_DB_ID!;

export async function POST(req: Request) {
  try {
    const { memoryId, publicId, type, caption } = await req.json();

    if (!memoryId || !publicId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create photo record in Notion
    const photoPage = await notion.pages.create({
      parent: { database_id: photosDbId },
      properties: {
        Name: { title: [{ type: 'text', text: { content: `Photo` } }] },
        Memory: { relation: [{ id: memoryId }] },
        Type: { select: { name: type } },
        PublicId: {
          rich_text: [{ type: 'text', text: { content: publicId } }],
        },
        Caption: caption
          ? { rich_text: [{ type: 'text', text: { content: caption } }] }
          : { rich_text: [] },
        UploadDate: { date: { start: new Date().toISOString() } },
        OrderIndex: { number: Date.now() }, // Use timestamp as default order
      },
    });

    // Update the memory's PhotoCount
    try {
      // First, get the current photo count
      const memoryPage = await notion.pages.retrieve({ page_id: memoryId });
      const currentCount =
        (memoryPage as any).properties['PhotoCount']?.number || 0;

      // Update with new count
      await notion.pages.update({
        page_id: memoryId,
        properties: {
          PhotoCount: { number: currentCount + 1 },
        },
      });

      // Invalidate cache for affected routes
      revalidatePath('/memories');
      revalidatePath('/memories/[id]', 'page');
      revalidatePath('/photos');
      revalidatePath('/photos/all');
      revalidatePath('/memories/photos');
      revalidatePath('/memories/photos/by-memory');
    } catch (e) {
      console.warn('Failed to update photo count:', e);
    }

    return NextResponse.json({ success: true, photoId: photoPage.id });
  } catch (error: any) {
    console.error('Failed to create photo record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
