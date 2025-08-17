import { z } from 'zod'

export const mediaItem = z.object({
  type: z.enum(['image', 'youtube', 'video']).default('image'),
  url: z.string().url().optional(),
  publicId: z.string().optional(),
  caption: z.string().optional()
})

export const memory = z.object({
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

export type Memory = z.infer<typeof memory>
export type MediaItem = z.infer<typeof mediaItem>
