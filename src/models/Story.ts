import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  authorId: { type: String, required: true },
  // chapters are stored in a separate collection (Chapter) with a 1:N relation
  chapterCount: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
  likes: [{ type: String }], // array of userIds
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Story || mongoose.model('Story', StorySchema);
