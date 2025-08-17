import { listMemories } from './notion';
import fs from 'fs/promises';
import path from 'path';

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  type: 'image' | 'video';
  createdAt: string;
  albumId?: string;
  albumName?: string;
  albumIndex?: number;
  totalInAlbum?: number;
}

export interface Album {
  id: string;
  name: string;
  thumbnail?: string;
  photoCount: number;
  createdAt: string;
  photos: Photo[];
  message?: string;
}

async function getMemories() {
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

export async function getAllPhotos(): Promise<Photo[]> {
  const memories = await getMemories();
  const photos: Photo[] = [];

  memories.forEach((memory) => {
    const imageMedia = (memory.media || []).filter(
      (m: any) => m.type === 'image'
    );
    imageMedia.forEach((media: any, index: number) => {
      photos.push({
        id: `${memory.id}-${index}`,
        url: media.url,
        caption: media.caption,
        type: 'image',
        createdAt: memory.createdAt,
        albumId: memory.id,
        albumName: `${memory.name} - ${new Date(memory.createdAt).toLocaleDateString()}`,
        albumIndex: index + 1,
        totalInAlbum: imageMedia.length,
      });
    });
  });

  return photos.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getRecentPhotos(limit: number): Promise<Photo[]> {
  const photos = await getAllPhotos();
  return photos.slice(0, limit);
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const photos = await getAllPhotos();
  return photos.find((photo) => photo.id === id) || null;
}

export async function getAlbums(): Promise<Album[]> {
  const memories = await getMemories();

  return memories
    .filter((memory) => {
      const imageMedia = (memory.media || []).filter(
        (m: any) => m.type === 'image'
      );
      return imageMedia.length > 0;
    })
    .map((memory) => {
      const imageMedia = (memory.media || []).filter(
        (m: any) => m.type === 'image'
      );
      const photos: Photo[] = imageMedia.map((media: any, index: number) => ({
        id: `${memory.id}-${index}`,
        url: media.url,
        caption: media.caption,
        type: 'image',
        createdAt: memory.createdAt,
        albumId: memory.id,
        albumName: `${memory.name} - ${new Date(memory.createdAt).toLocaleDateString()}`,
        albumIndex: index + 1,
        totalInAlbum: imageMedia.length,
      }));

      return {
        id: memory.id,
        name: `${memory.name} - ${new Date(memory.createdAt).toLocaleDateString()}`,
        thumbnail: photos[0]?.url,
        photoCount: photos.length,
        createdAt: memory.createdAt,
        photos,
        message: memory.body,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const albums = await getAlbums();
  return albums.find((album) => album.id === id) || null;
}
