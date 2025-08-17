import { NextResponse } from 'next/server'
import { getMemoryById } from '@/lib/memories'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const memory = await getMemoryById(id)
    
    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }
    
    return NextResponse.json(memory)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 })
  }
}
