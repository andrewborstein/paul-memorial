export type MemoryIndexItem = {
  id: string;
  title?: string; // Optional - only if explicitly set
  date: string; // ISO
  cover_public_id?: string; // derived from first photo
  photo_count: number;
  body?: string; // truncated body text
  name?: string; // person's name
  email?: string; // person's email
};

export type MemoryPhoto = {
  public_id: string;
  caption?: string;
  taken_at?: string | null; // ISO
  sort_index: number;
};

export type MemoryDetail = {
  id: string;
  name: string;
  email: string;
  title?: string; // Optional - if not provided, use name
  date: string; // ISO
  body: string;
  photos: MemoryPhoto[];
};
