import { readMemory, writeMemory } from '@/lib/data';
import { readIndex, writeIndex } from '@/lib/data';

export const revalidate = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = await readMemory(id);
  if (!doc) return new Response('Not found', { status: 404 });
  return Response.json(doc, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = await readMemory(id);
  if (!doc) return new Response('Not found', { status: 404 });

  // Delete photos from Cloudinary
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && preset && doc.photos.length > 0) {
    const deletePromises = doc.photos.map(async (photo) => {
      try {
        const formData = new FormData();
        formData.append('public_id', photo.public_id);
        formData.append('upload_preset', preset);

        await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
          {
            method: 'POST',
            body: formData,
          }
        );
      } catch (error) {
        console.warn(`Failed to delete photo ${photo.public_id}:`, error);
      }
    });

    await Promise.all(deletePromises);
  }

  // Remove from index
  const index = await readIndex();
  const updatedIndex = index.filter((item) => item.id !== id);
  await writeIndex(updatedIndex);

  // Delete memory file (optional - could keep for audit)
  // For now, we'll just remove from index

  return new Response('Deleted', { status: 200 });
}
