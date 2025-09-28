import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Chapter from '@/models/Chapter'
import dbConnect from '@/lib/mongodb'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const chapter = await Chapter.findById(id).lean()
  if (!chapter) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(chapter)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  // author validation: only story author can edit chapter
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const existing = await Chapter.findById(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const story = await (await import('@/models/Story')).default.findById(existing.storyId)
  if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  if (String(story.authorId) !== String(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const { title, content, order, published } = body
  const chapter = await Chapter.findByIdAndUpdate(
    id,
    { title, content, order, published },
    { new: true }
  ).lean()
  if (!chapter) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(chapter)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const existing = await Chapter.findById(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const story = await (await import('@/models/Story')).default.findById(existing.storyId)
  if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  if (String(story.authorId) !== String(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await existing.deleteOne()
  // decrement chapterCount on the story
  story.chapterCount = Math.max(0, (story.chapterCount || 1) - 1)
  await story.save()
  return NextResponse.json({ ok: true })
}
