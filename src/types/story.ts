export interface Chapter {
  title: string;
  content: string;
  order?: number;
  published?: boolean;
}

export interface Story {
  _id: string;
  title: string;
  description: string;
  authorId?: string;
  chapterCount?: number;
  chapters: Chapter[];
  published?: boolean;
  publishedAt?: string | null;
  unPublishedAt?: string | null;
  publishedBy?: string | null;
  unPublishedBy?: string | null;
  bravos?: string[];
  createdAt?: string;
}

export default Story;
