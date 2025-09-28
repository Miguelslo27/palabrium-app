import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

ChapterSchema.index({ storyId: 1, order: 1 });

export default mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
