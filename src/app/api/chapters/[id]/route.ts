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
  const chapter = await Chapter.findByIdAndDelete(id).lean()
  if (!chapter) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
