"use client"
import React, { useState } from 'react'

type Props = {
  chapter?: any
  onSave: (data: any) => Promise<void>
  onCancel?: () => void
  saving?: boolean
}

export default function ChapterEditor({ chapter, onSave, onCancel, saving }: Props) {
  const [title, setTitle] = useState(chapter?.title || '')
  const [content, setContent] = useState(chapter?.content || '')
  const [published, setPublished] = useState(!!chapter?.published)

  async function save() {
    if (!title.trim()) return alert('Title is required')
    await onSave({ title: title.trim(), content, published })
  }

  return (
    <div className="p-4 border rounded bg-white">
      <label className="block mb-2">
        <div className="text-sm font-medium">Title</div>
        <input className="w-full border p-2 mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block mb-2">
        <div className="text-sm font-medium">Content</div>
        <textarea className="w-full border p-2 mt-1 min-h-[120px]" value={content} onChange={(e) => setContent(e.target.value)} />
      </label>
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        <span className="text-sm">Published</span>
      </label>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
