export interface Chapter {
  title: string;
  content: string;
  order?: number;
}

export interface Story {
  _id: string;
  title: string;
  description: string;
  authorId?: string;
  chapterCount?: number;
  chapters: Chapter[];
  published?: boolean;
  bravos?: string[];
  createdAt?: string;
}

export default Story;
