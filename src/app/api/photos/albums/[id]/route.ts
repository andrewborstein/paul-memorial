import { NextResponse } from 'next/server'
import { getAlbumById } from '@/lib/photos'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const album = await getAlbumById(id)
    
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }
    
    return NextResponse.json(album)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 })
  }
}
