import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

import Story from '@/models/Story';
import Chapter from '@/models/Chapter';

const MAX_STORIES = 20;
const MAX_CHAPTERS = 50;

const ChapterSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(100_000),
  order: z.number().int().nonnegative().optional(),
  published: z.boolean().optional(),
});

const StorySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  pinned: z.boolean().optional(),
  published: z.boolean().optional(),
  chapters: z.array(ChapterSchema).max(MAX_CHAPTERS).optional(),
});

const PayloadSchema = z.union([
  z.array(StorySchema).max(MAX_STORIES),
  z.object({ stories: z.array(StorySchema).max(MAX_STORIES) }).transform((v) => v.stories),
]);

async function parseMultipartFile(req: NextRequest): Promise<any | null> {
  try {
    // Try formData first (works for browser file uploads)
    // @ts-ignore - NextRequest.formData exists in runtime
    const fd = await (req as any).formData();
    const file = fd.get('file');
    if (file && typeof (file as any).text === 'function') {
      const text = await (file as any).text();
      return JSON.parse(text);
    }

    // Fallback: parse raw body as JSON
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized: missing x-user-id' }, { status: 401 });

  const dryRun = !!(req.headers.get('x-dry-run') || req.nextUrl.searchParams.get('dryRun'));

  let parsed: any = null;
  // Accept application/json body or a raw JSON file payload
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      parsed = await req.json();
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
  } else {
    // try to parse raw body as JSON
    parsed = await parseMultipartFile(req);
    if (!parsed) return NextResponse.json({ error: 'Unsupported content-type or empty body' }, { status: 400 });
  }

  // Normalize envelope or array
  let storiesInput: any[];
  if (Array.isArray(parsed)) storiesInput = parsed;
  else if (parsed && Array.isArray(parsed.stories)) storiesInput = parsed.stories;
  else return NextResponse.json({ error: 'Expected array or { stories: [...] } envelope' }, { status: 400 });

  // Validate with Zod
  const parsedResult = PayloadSchema.safeParse(storiesInput);
  if (!parsedResult.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsedResult.error.flatten() }, { status: 400 });
  }

  const results: Array<any> = [];

  for (let i = 0; i < storiesInput.length; i++) {
    const raw = storiesInput[i];
    // sanitize chapter content before validating/creating
    if (raw && Array.isArray(raw.chapters)) {
      raw.chapters = raw.chapters.map((c: any) => ({
        ...c,
        content: typeof c.content === 'string' ? sanitizeHtml(c.content, { allowedTags: sanitizeHtml.defaults.allowedTags.filter((t: string) => t !== 'script') }) : c.content,
      }));
    }

    const storyValidation = StorySchema.safeParse(raw);
    if (!storyValidation.success) {
      results.push({ index: i, status: 'failed', error: storyValidation.error.flatten() });
      continue;
    }

    const storyData = storyValidation.data;

    if (dryRun) {
      results.push({ index: i, status: 'ok', planned: { story: storyData } });
      continue;
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const created = await Story.create([
        {
          title: storyData.title,
          description: storyData.description || '',
          authorId: String(userId),
          chapterCount: Array.isArray(storyData.chapters) ? storyData.chapters.length : 0,
          published: !!storyData.published,
          pinned: !!storyData.pinned,
        },
      ], { session });

      const storyDoc = created[0];

      if (Array.isArray(storyData.chapters) && storyData.chapters.length) {
        const chaptersToCreate = storyData.chapters.map((c: any, idx: number) => ({
          storyId: storyDoc._id,
          title: c.title,
          content: c.content,
          order: typeof c.order === 'number' ? c.order : idx,
          published: typeof c.published === 'boolean' ? c.published : true,
        }));

        await Chapter.insertMany(chaptersToCreate, { session });
      }

      await session.commitTransaction();
      session.endSession();

      results.push({ index: i, status: 'created', id: String(storyDoc._id) });
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      results.push({ index: i, status: 'failed', error: String(err?.message || err) });
    }
  }

  const summary = { total: storiesInput.length, created: results.filter((r) => r.status === 'created').length, failed: results.filter((r) => r.status === 'failed').length };

  return NextResponse.json({ summary, results });
}

export const dynamic = 'force-dynamic';
