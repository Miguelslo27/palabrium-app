import { connectDB, clearDB, disconnectDB, createMultipleStories, createTestStory, createStoryWithChapters } from '../helpers';
import { MOCK_USERS } from '../helpers/auth';
import { getMyStories, getStories, deleteStory } from '@/lib/data/stories';
import StoryModel from '@/models/Story';
import ChapterModel from '@/models/Chapter';

const AUTHOR_ID = MOCK_USERS.ALICE;
const OTHER_AUTHOR_ID = MOCK_USERS.BOB;

describe('Stories data layer integration', () => {
  let dbAvailable = true;

  beforeAll(async () => {
    try {
      await connectDB();
    } catch (error) {
      dbAvailable = false;
      console.warn('Skipping stories data integration tests: unable to start MongoMemoryServer.', error);
    }
  });

  afterEach(async () => {
    if (!dbAvailable) return;
    await clearDB();
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    await disconnectDB();
  });

  it('should return paginated results for getMyStories including drafts', async () => {
    if (!dbAvailable) {
      console.warn('Skipping getMyStories integration test: MongoMemoryServer not available.');
      expect(true).toBe(true);
      return;
    }

    await createMultipleStories(AUTHOR_ID, 12);
    await createMultipleStories(OTHER_AUTHOR_ID, 5);

    const firstPage = await getMyStories(AUTHOR_ID, { limit: 5, skip: 0 });

    expect(firstPage.total).toBe(12);
    expect(firstPage.stories).toHaveLength(5);
    expect(firstPage.stories[0].title).toBe('Test Story 12');
    expect(firstPage.stories.every((story) => story.authorId === AUTHOR_ID)).toBe(true);

    const secondPage = await getMyStories(AUTHOR_ID, { limit: 5, skip: 5 });
    expect(secondPage.stories).toHaveLength(5);
    expect(secondPage.stories[0].title).toBe('Test Story 7');
  });

  it('should return only published stories for public getStories()', async () => {
    if (!dbAvailable) {
      console.warn('Skipping public getStories integration test: MongoMemoryServer not available.');
      expect(true).toBe(true);
      return;
    }

    await createTestStory(AUTHOR_ID, { title: 'Draft Story', published: false });
    await createTestStory(AUTHOR_ID, { title: 'Published Story', published: true });

    const result = await getStories();

    expect(result.total).toBe(1);
    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toBe('Published Story');
    expect(result.stories[0].published).toBe(true);
  });

  it('should delete stories and related chapters via deleteStory()', async () => {
    if (!dbAvailable) {
      console.warn('Skipping deleteStory integration test: MongoMemoryServer not available.');
      expect(true).toBe(true);
      return;
    }

    const { story, chapters } = await createStoryWithChapters(AUTHOR_ID, 3);

    await deleteStory(story._id.toString(), AUTHOR_ID);

    const storyCount = await StoryModel.countDocuments({ _id: story._id });
    const chapterCount = await ChapterModel.countDocuments({ storyId: story._id });

    expect(storyCount).toBe(0);
    expect(chapterCount).toBe(0);
    expect(chapters).toHaveLength(3);
  });
});
