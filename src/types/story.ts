export interface Chapter {
  _id?: string;
  storyId?: string;
  title: string;
  content: string;
  order?: number;
  published?: boolean;
  publishedAt?: string | Date | null;
  unPublishedAt?: string | Date | null;
  publishedBy?: string | null;
  unPublishedBy?: string | null;
  createdAt?: string | Date | null;
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
