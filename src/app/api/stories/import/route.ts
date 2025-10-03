import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

import Story from '@/models/Story';
import Chapter from '@/models/Chapter';

const MAX_STORIES = 20;
const MAX_CHAPTERS = 50;

interface RawChapter {
  title?: string;
  content?: string;
  order?: number;
  published?: boolean;
}

interface RawStory {
  title?: string;
  description?: string;
  pinned?: boolean;
  published?: boolean;
  chapters?: RawChapter[];
}

interface ImportResult {
  index: number;
  status: 'ok' | 'created' | 'failed';
  id?: string;
  error?: unknown;
  planned?: { story: RawStory };
}

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

async function parseMultipartFile(req: NextRequest): Promise<unknown | null> {
  try {
    // Try formData first (works for browser file uploads)
    const fd = await (req as { formData(): Promise<FormData> }).formData();
    const file = fd.get('file');
    if (file && typeof (file as { text(): Promise<string> }).text === 'function') {
      const text = await (file as { text(): Promise<string> }).text();
      return JSON.parse(text);
    }

    // Fallback: parse raw body as JSON
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized: missing x-user-id' }, { status: 401 });

  const dryRun = !!(req.headers.get('x-dry-run') || req.nextUrl.searchParams.get('dryRun'));

  let parsed: unknown = null;
  // Accept application/json body or a raw JSON file payload
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      parsed = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
  } else {
    // try to parse raw body as JSON
    parsed = await parseMultipartFile(req);
    if (!parsed) return NextResponse.json({ error: 'Unsupported content-type or empty body' }, { status: 400 });
  }

  // Normalize envelope or array
  let storiesInput: unknown[];
  if (Array.isArray(parsed)) storiesInput = parsed;
  else if (parsed && typeof parsed === 'object' && 'stories' in parsed && Array.isArray((parsed as { stories: unknown[] }).stories))
    storiesInput = (parsed as { stories: unknown[] }).stories;
  else return NextResponse.json({ error: 'Expected array or { stories: [...] } envelope' }, { status: 400 });

  // Validate with Zod
  const parsedResult = PayloadSchema.safeParse(storiesInput);
  if (!parsedResult.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsedResult.error.flatten() }, { status: 400 });
  }

  const results: ImportResult[] = [];

  for (let i = 0; i < storiesInput.length; i++) {
    const raw = storiesInput[i] as RawStory;
    // sanitize chapter content before validating/creating
    if (raw && Array.isArray(raw.chapters)) {
      raw.chapters = raw.chapters.map((c) => ({
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
        const chaptersToCreate = storyData.chapters.map((c, idx: number) => ({
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
    } catch (err: unknown) {
      await session.abortTransaction();
      session.endSession();
      results.push({ index: i, status: 'failed', error: String((err as Error)?.message || err) });
    }
  }

  const summary = { total: storiesInput.length, created: results.filter((r) => r.status === 'created').length, failed: results.filter((r) => r.status === 'failed').length };

  return NextResponse.json({ summary, results });
}

export const dynamic = 'force-dynamic';
