// API Types for TypeScript safety in routes

export interface PublishRequestBody {
  published: boolean;
}

export interface ChapterUpdateBody {
  title?: string;
  content?: string;
  order?: number;
  published?: boolean;
}

export interface CommentRequestBody {
  content: string;
}

export interface StoryCreateBody {
  title: string;
  description: string;
  published?: boolean;
  chapters?: Array<{
    title?: string;
    content?: string;
    order?: number;
    published?: boolean;
  }>;
}

export interface PublishUpdateObject {
  published: boolean;
  publishedAt: Date | null;
  publishedBy: string | null;
  unPublishedAt: Date | null;
  unPublishedBy: string | null;
}

export interface StoryFilter {
  published?: boolean;
  authorId?: string;
  $or?: Array<{ title: RegExp } | { description: RegExp }>;
}

export interface PaginationParams {
  skip: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserInfo {
  name: string | null;
  image: string | null;
}

// Raw comment from MongoDB with lean() - matches Mongoose document structure
export interface RawCommentLean {
  _id: unknown; // Mongoose ObjectId
  storyId: unknown; // Mongoose ObjectId  
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface EnrichedComment {
  _id: string;
  storyId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorName: string | null;
  authorImage: string | null;
}

export interface BravoResponse {
  bravos: number;
  braved: boolean;
}

export interface DeleteResult {
  deletedCount: number;
}