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
  chapters: Chapter[];
  published?: boolean;
  likes?: string[];
  createdAt?: string;
}

export default Story;
