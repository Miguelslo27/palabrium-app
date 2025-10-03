/**
 * Mock for MongoDB/Mongoose
 * This file mocks Mongoose models and database connection for testing
 */

// Mock story data
export const mockStory = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Story',
  description: 'This is a test story',
  authorId: 'user_test123',
  published: false,
  publishedAt: null,
  unPublishedAt: null,
  publishedBy: null,
  unPublishedBy: null,
  bravos: [],
  chapters: [],
  chapterCount: 0,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  save: jest.fn().mockResolvedValue(this),
  toObject: jest.fn(function (this: any) { return { ...this }; }),
};

// Mock chapter data
export const mockChapter = {
  _id: '507f1f77bcf86cd799439012',
  storyId: '507f1f77bcf86cd799439011',
  title: 'Chapter 1',
  content: 'This is the first chapter',
  order: 1,
  published: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  save: jest.fn().mockResolvedValue(this),
  toObject: jest.fn(function (this: any) { return { ...this }; }),
};

// Mock comment data
export const mockComment = {
  _id: '507f1f77bcf86cd799439013',
  storyId: '507f1f77bcf86cd799439011',
  authorId: 'user_test123',
  content: 'Great story!',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  save: jest.fn().mockResolvedValue(this),
  toObject: jest.fn(function (this: any) { return { ...this }; }),
};

// Mock user data
export const mockMongoUser = {
  _id: '507f1f77bcf86cd799439014',
  clerkId: 'user_test123',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  save: jest.fn().mockResolvedValue(this),
  toObject: jest.fn(function (this: any) { return { ...this }; }),
};

// Helper to create mock query chain
const createMockQuery = (returnValue: any) => {
  const query: any = {
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
    then: jest.fn((resolve) => Promise.resolve(returnValue).then(resolve)),
    catch: jest.fn((reject) => Promise.resolve(returnValue).catch(reject)),
  };
  return query;
};

// Mock Story Model
export const MockStoryModel = {
  find: jest.fn(() => createMockQuery([mockStory])),
  findById: jest.fn(() => createMockQuery(mockStory)),
  findOne: jest.fn(() => createMockQuery(mockStory)),
  findByIdAndUpdate: jest.fn(() => createMockQuery(mockStory)),
  findByIdAndDelete: jest.fn(() => createMockQuery(mockStory)),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  countDocuments: jest.fn().mockResolvedValue(1),
  create: jest.fn().mockResolvedValue(mockStory),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
};

// Mock Chapter Model
export const MockChapterModel = {
  find: jest.fn(() => createMockQuery([mockChapter])),
  findById: jest.fn(() => createMockQuery(mockChapter)),
  findOne: jest.fn(() => createMockQuery(mockChapter)),
  findByIdAndUpdate: jest.fn(() => createMockQuery(mockChapter)),
  findByIdAndDelete: jest.fn(() => createMockQuery(mockChapter)),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  countDocuments: jest.fn().mockResolvedValue(1),
  create: jest.fn().mockResolvedValue(mockChapter),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
};

// Mock Comment Model
export const MockCommentModel = {
  find: jest.fn(() => createMockQuery([mockComment])),
  findById: jest.fn(() => createMockQuery(mockComment)),
  findOne: jest.fn(() => createMockQuery(mockComment)),
  findByIdAndUpdate: jest.fn(() => createMockQuery(mockComment)),
  findByIdAndDelete: jest.fn(() => createMockQuery(mockComment)),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  countDocuments: jest.fn().mockResolvedValue(1),
  create: jest.fn().mockResolvedValue(mockComment),
};

// Mock User Model
export const MockUserModel = {
  find: jest.fn(() => createMockQuery([mockMongoUser])),
  findById: jest.fn(() => createMockQuery(mockMongoUser)),
  findOne: jest.fn(() => createMockQuery(mockMongoUser)),
  findByIdAndUpdate: jest.fn(() => createMockQuery(mockMongoUser)),
  findByIdAndDelete: jest.fn(() => createMockQuery(mockMongoUser)),
  findOneAndUpdate: jest.fn(() => createMockQuery(mockMongoUser)),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  create: jest.fn().mockResolvedValue(mockMongoUser),
};

// Mock mongoose connection
export const mockMongooseConnection = {
  readyState: 1, // 1 = connected
};

// Mock dbConnect
export const mockDbConnect = jest.fn().mockResolvedValue(undefined);

// Reset all MongoDB mocks
export const resetMongoMocks = () => {
  // Reset Story Model
  Object.values(MockStoryModel).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      (mock as jest.Mock).mockClear();
    }
  });
  MockStoryModel.find.mockReturnValue(createMockQuery([mockStory]));
  MockStoryModel.findById.mockReturnValue(createMockQuery(mockStory));
  MockStoryModel.findOne.mockReturnValue(createMockQuery(mockStory));

  // Reset Chapter Model
  Object.values(MockChapterModel).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      (mock as jest.Mock).mockClear();
    }
  });
  MockChapterModel.find.mockReturnValue(createMockQuery([mockChapter]));
  MockChapterModel.findById.mockReturnValue(createMockQuery(mockChapter));

  // Reset Comment Model
  Object.values(MockCommentModel).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      (mock as jest.Mock).mockClear();
    }
  });
  MockCommentModel.find.mockReturnValue(createMockQuery([mockComment]));

  // Reset User Model
  Object.values(MockUserModel).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      (mock as jest.Mock).mockClear();
    }
  });
  MockUserModel.findOne.mockReturnValue(createMockQuery(mockMongoUser));

  // Reset dbConnect
  mockDbConnect.mockClear();
};
