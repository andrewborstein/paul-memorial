import { z } from 'zod'

export const mediaItem = z.object({
  type: z.enum(['image', 'youtube', 'video']).default('image'),
  url: z.string().url(),
  caption: z.string().optional()
})

export const tribute = z.object({
  id: z.string(),
  createdAt: z.string(),
  name: z.string().min(1),
  title: z.string().optional(),
  emailHash: z.string().optional(),
  body: z.string().min(1),
  media: z.array(mediaItem).default([]),
  comments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    body: z.string(),
    createdAt: z.string()
  })).default([]),
  editToken: z.string()
})

export type Tribute = z.infer<typeof tribute>
export type MediaItem = z.infer<typeof mediaItem>
