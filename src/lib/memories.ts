import { listMemories } from './notion';
import fs from 'fs/promises';
import path from 'path';
import { publicIdToUrl } from './cloudinary';

export interface Memory {
  id: string;
  name: string;
  title?: string;
  body?: string;
  createdAt: string;
  photos: Photo[];
  hasPhotos: boolean;
  hasText: boolean;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  type: 'image' | 'video';
  memoryId: string;
  memoryName: string;
  memoryIndex: number;
  totalInMemory: number;
}

async function getMemoriesData() {
  const source = process.env.DATA_SOURCE || 'notion';
  if (source === 'file') {
    const dir = path.join(process.cwd(), 'data', 'memories');
    const files = await fs.readdir(dir);
    const items = [] as any[];
    for (const f of files.filter((f) => f.endsWith('.json'))) {
      const raw = await fs.readFile(path.join(dir, f), 'utf8');
      items.push(JSON.parse(raw));
    }
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return items;
  }
  return await listMemories();
}

export async function getAllMemories(): Promise<Memory[]> {
  const data = await getMemoriesData();

  return data.map((item) => {
    const photos = (item.media || [])
      .filter((m: any) => m.type === 'image' || m.type === 'video')
      .map((media: any, index: number) => {
        // Convert public ID to URL if needed
        const url =
          media.url ||
          (media.publicId ? publicIdToUrl(media.publicId, media.type) : '');

        return {
          id: `${item.id}-${index}`,
          url,
          caption: media.caption,
          type: media.type as 'image' | 'video',
          memoryId: item.id,
          memoryName: item.name,
          memoryIndex: index + 1,
          totalInMemory: (item.media || []).filter(
            (m: any) => m.type === 'image' || m.type === 'video'
          ).length,
        };
      });

    return {
      id: item.id,
      name: item.name,
      title: item.title,
      body: item.body,
      createdAt: item.createdAt,
      photos,
      hasPhotos: photos.length > 0,
      hasText: !!item.body && item.body.trim().length > 0,
    };
  });
}

export async function getMemoryById(id: string): Promise<Memory | null> {
  const memories = await getAllMemories();
  return memories.find((memory) => memory.id === id) || null;
}

export async function getRecentMemories(limit: number): Promise<Memory[]> {
  const memories = await getAllMemories();
  return memories.slice(0, limit);
}

export async function getMemoriesWithPhotos(): Promise<Memory[]> {
  const memories = await getAllMemories();
  return memories.filter((memory) => memory.hasPhotos);
}

export async function getAllPhotos(): Promise<Photo[]> {
  const memories = await getAllMemories();
  return memories.flatMap((memory) => memory.photos);
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const photos = await getAllPhotos();
  return photos.find((photo) => photo.id === id) || null;
}

export async function getRecentPhotos(limit: number): Promise<Photo[]> {
  const photos = await getAllPhotos();
  return photos.slice(0, limit);
}
