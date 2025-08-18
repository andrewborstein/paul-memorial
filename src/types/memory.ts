export type MemoryIndexItem = {
  id: string;
  title: string;
  date: string; // ISO
  cover_url?: string; // derived from first photo
  photo_count: number;
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
