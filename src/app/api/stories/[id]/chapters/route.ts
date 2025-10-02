import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Chapter from '@/models/Chapter'
import Story from '@/models/Story'
import dbConnect from '@/lib/mongodb'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid story id' }, { status: 400 })
  }
  const chapters = await Chapter.find({ storyId: id }).sort({ order: 1 }).lean()
  return NextResponse.json(chapters)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid story id' }, { status: 400 })
  }
  const body = await req.json()
  const { title = 'Untitled', content = '', order, published = false } = body

  const story = await Story.findById(id)
  if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  // auth check: only author can add chapters
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (String(story.authorId) !== String(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const chapter = await Chapter.create({ storyId: id, title, content, order, published: Boolean(published) })
  // increment chapterCount
  story.chapterCount = (story.chapterCount || 0) + 1
  await story.save()
  return NextResponse.json(chapter, { status: 201 })
}
