import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  authorId: { type: String, required: true },
  // chapters are stored in a separate collection (Chapter) with a 1:N relation
  chapterCount: { type: Number, default: 0 },
  pinned: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  unPublishedAt: { type: Date, default: null },
  publishedBy: { type: String, default: null },
  unPublishedBy: { type: String, default: null },
  bravos: [{ type: String }], // array of userIds (formerly 'likes')
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Story || mongoose.model('Story', StorySchema);
