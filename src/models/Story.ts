import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  authorId: { type: String, required: true }, // Clerk user id
  chapters: [{
    title: String,
    content: String,
    order: Number,
  }],
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Story || mongoose.model('Story', StorySchema);