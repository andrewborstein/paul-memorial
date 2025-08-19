export type MemoryIndexItem = {
  id: string;
  title?: string; // Optional - only if explicitly set
  cover_public_id?: string; // derived from first photo
  photo_count: number;
  body?: string; // truncated body text
  name?: string; // person's name
  email?: string; // person's email
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
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
  body: string;
  photos: MemoryPhoto[];
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};
