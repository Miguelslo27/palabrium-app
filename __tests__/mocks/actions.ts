/**
 * Mock for Server Actions
 * Used in tests to avoid importing @clerk/backend which uses ESM
 */

export const deleteStoryAction = jest.fn();
export const createStoryAction = jest.fn();
export const updateStoryAction = jest.fn();
export const publishStoryAction = jest.fn();
export const unpublishStoryAction = jest.fn();
export const createChapterAction = jest.fn();
export const updateChapterAction = jest.fn();
export const deleteChapterAction = jest.fn();
export const publishChapterAction = jest.fn();
export const unpublishChapterAction = jest.fn();
export const toggleChapterPublishAction = jest.fn();
export const toggleBravoAction = jest.fn();
export const getCommentsAction = jest.fn();
export const createCommentAction = jest.fn();
export const deleteCommentAction = jest.fn();
