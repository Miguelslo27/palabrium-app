import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  authorId: { type: String, required: true },
  chapters: [{
    title: String,
    content: String,
    order: Number,
  }],
  published: { type: Boolean, default: false },
  likes: [{ type: String }], // array of userIds
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Story || mongoose.model('Story', StorySchema);
