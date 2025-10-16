import ChapterNavigator from './ChapterNavigator';

type Chapter = { title: string; content: string; published?: boolean };

type Props = {
  chapters: Chapter[];
  initialIndex?: number;
  title?: string;
  authorId?: string | null;
  authorName?: string | null;
  createdAt?: string | null;
  chapterCount?: number | null;
  description?: string | null;
  userId?: string | null;
};

export default function ChapterViewer({
  chapters,
  initialIndex = 0,
  title,
  authorId,
  authorName,
  createdAt,
  chapterCount,
  description,
  userId = null,
}: Props) {
  const viewerIsAuthor = Boolean(userId && authorId && userId === authorId);

  const visibleChapters = viewerIsAuthor
    ? chapters
    : chapters.filter((chapter) => Boolean(chapter.published));

  const totalChapters = chapterCount ?? visibleChapters.length;

  const metadata = (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-1">{title}</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Author: {authorName || 'Unknown'}</div>
          <div>
            Created: {createdAt ? new Date(createdAt).toLocaleString() : '—'}
          </div>
          <div>Chapters: {totalChapters}</div>
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-800">{description}</p>
      )}
    </div>
  );

  return (
    <ChapterNavigator
      chapters={visibleChapters}
      initialIndex={initialIndex}
      viewerIsAuthor={viewerIsAuthor}
      metadata={metadata}
    />
  );
}
