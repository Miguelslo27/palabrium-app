import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import StoryFormClient from '@/components/Editor/StoryFormClient';
import useStoryForm from '@/components/Editor/useStoryForm';
import { toggleStoryPublish } from '@/lib/useStories';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/Editor/useStoryForm');

jest.mock('@/lib/useStories', () => ({
  toggleStoryPublish: jest.fn(),
}));

// Mock sub-components
jest.mock('@/components/Editor/EditorForm', () => {
  return function EditorForm({ children, onSubmit }: any) {
    return <form onSubmit={onSubmit}>{children}</form>;
  };
});

jest.mock('@/components/Editor/EditorHeader', () => {
  return function EditorHeader({ children, title }: any) {
    return (
      <div data-testid="editor-header">
        <h1>{title}</h1>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/Editor/Sidebar', () => {
  return function Sidebar({ title, description, setTitle, setDescription }: any) {
    return (
      <div data-testid="sidebar">
        <input
          data-testid="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Story title"
        />
        <textarea
          data-testid="description-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Story description"
        />
      </div>
    );
  };
});

jest.mock('@/components/Editor/Chapters', () => {
  return function Chapters({ chapters }: any) {
    return (
      <div data-testid="chapters">
        {chapters.map((ch: any, i: number) => (
          <div key={i} data-testid={`chapter-${i}`}>
            {ch.title || 'Untitled'}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('@/components/Editor/Shared/Button', () => {
  return function Button({ children, onClick, type, disabled, className }: any) {
    return (
      <button type={type} onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    );
  };
});

jest.mock('@/components/Editor/Shared/IconExternal', () => {
  return function IconExternal({ className }: any) {
    return <span className={className}>🔗</span>;
  };
});

describe('StoryFormClient', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockUseStoryForm = {
    title: '',
    setTitle: jest.fn(),
    description: '',
    setDescription: jest.fn(),
    origStory: null,
    chapters: [{ title: '', content: '' }],
    expandedIndex: 0,
    setExpandedIndex: jest.fn(),
    submitting: false,
    addChapter: jest.fn(),
    removeChapter: jest.fn(),
    updateChapterLocal: jest.fn(),
    setChapterPublished: jest.fn(),
    create: jest.fn(),
    edit: jest.fn(),
    applyOrigStoryPatch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useStoryForm as jest.Mock).mockReturnValue(mockUseStoryForm);
  });

  describe('create mode', () => {
    it('should render create story header', () => {
      render(<StoryFormClient mode="create" />);

      expect(screen.getByText('Create story')).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(<StoryFormClient mode="create" />);

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<StoryFormClient mode="create" />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should not render publish/unpublish buttons in create mode', () => {
      render(<StoryFormClient mode="create" />);

      expect(screen.queryByRole('button', { name: /Publish/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Unpublish/i })).not.toBeInTheDocument();
    });

    it('should not render preview button in create mode', () => {
      render(<StoryFormClient mode="create" />);

      expect(screen.queryByRole('button', { name: /Preview/i })).not.toBeInTheDocument();
    });

    it('should call create function on submit', async () => {
      const user = userEvent.setup();
      const mockCreate = jest.fn().mockResolvedValue({ id: 'story123' });
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        title: 'Test Story',
        description: 'Test description',
        chapters: [{ title: 'Chapter 1', content: 'Content 1', published: true }],
        create: mockCreate,
      });

      render(<StoryFormClient mode="create" />);

      const saveButton = screen.getByRole('button', { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          title: 'Test Story',
          description: 'Test description',
          chapters: [
            {
              title: 'Chapter 1',
              content: 'Content 1',
              order: 0,
              published: true,
            },
          ],
        });
      });
    });

    it('should navigate to story page after successful creation', async () => {
      const user = userEvent.setup();
      const mockCreate = jest.fn().mockResolvedValue({ id: 'story123' });
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        title: 'Test Story',
        create: mockCreate,
      });

      render(<StoryFormClient mode="create" />);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/story/story123');
      });
    });

    it('should call onSaved callback after creation', async () => {
      const user = userEvent.setup();
      const mockCreate = jest.fn().mockResolvedValue({ id: 'story123' });
      const onSaved = jest.fn();
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        title: 'Test Story',
        create: mockCreate,
      });

      render(<StoryFormClient mode="create" onSaved={onSaved} />);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(onSaved).toHaveBeenCalledWith('story123');
      });
    });

    it('should show alert on create error', async () => {
      const user = userEvent.setup();
      const mockCreate = jest.fn().mockRejectedValue(new Error('Create failed'));
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        title: 'Test Story',
        create: mockCreate,
      });

      render(<StoryFormClient mode="create" />);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error creating story');
      });

      alertSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle chapters with empty titles and content', async () => {
      const user = userEvent.setup();
      const mockCreate = jest.fn().mockResolvedValue({ id: 'story123' });
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        title: 'Test Story',
        chapters: [{ title: null, content: null }],
        create: mockCreate,
      });

      render(<StoryFormClient mode="create" />);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          title: 'Test Story',
          description: '',
          chapters: [
            {
              title: '',
              content: '',
              order: 0,
              published: false,
            },
          ],
        });
      });
    });
  });

  describe('edit mode', () => {
    it('should render edit story header', () => {
      render(<StoryFormClient mode="edit" storyId="story123" />);

      expect(screen.getByText('Edit story')).toBeInTheDocument();
    });

    it('should render preview button in edit mode', () => {
      render(<StoryFormClient mode="edit" storyId="story123" />);

      expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument();
    });

    it('should render publish button when story is not published', () => {
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        origStory: { published: false },
      });

      render(<StoryFormClient mode="edit" storyId="story123" />);

      expect(screen.getByRole('button', { name: /^Publish$/i })).toBeInTheDocument();
      expect(screen.queryByText('Published')).not.toBeInTheDocument();
    });

    it('should render unpublish button when story is published', () => {
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        origStory: { published: true },
      });

      render(<StoryFormClient mode="edit" storyId="story123" />);

      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Unpublish/i })).toBeInTheDocument();
    });

    it('should call edit function on submit', async () => {
      const user = userEvent.setup();
      const mockEdit = jest.fn().mockResolvedValue(undefined);
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        edit: mockEdit,
      });

      render(<StoryFormClient mode="edit" storyId="story123" />);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockEdit).toHaveBeenCalled();
      });
    });

    it('should call onSaved callback after edit', async () => {
      const user = userEvent.setup();
      const mockEdit = jest.fn().mockResolvedValue(undefined);
      const onSaved = jest.fn();
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        edit: mockEdit,
      });

      render(<StoryFormClient mode="edit" storyId="story123" onSaved={onSaved} />);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(onSaved).toHaveBeenCalledWith('story123');
      });
    });

    it('should not navigate after successful edit', async () => {
      const user = userEvent.setup();
      const mockEdit = jest.fn().mockResolvedValue(undefined);
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        edit: mockEdit,
      });

      render(<StoryFormClient mode="edit" storyId="story123" />);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockEdit).toHaveBeenCalled();
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should show alert on edit error', async () => {
      const user = userEvent.setup();
      const mockEdit = jest.fn().mockRejectedValue(new Error('Edit failed'));
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        edit: mockEdit,
      });

      render(<StoryFormClient mode="edit" storyId="story123" />);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error saving story');
      });

      alertSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should call toggleStoryPublish when publish button clicked', async () => {
      const user = userEvent.setup();
      (toggleStoryPublish as jest.Mock).mockResolvedValue({
        publishedAt: '2025-10-03',
        publishedBy: 'user123',
      });
      const mockApplyPatch = jest.fn();

      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        origStory: { published: false },
        applyOrigStoryPatch: mockApplyPatch,
      });

      render(<StoryFormClient mode="edit" storyId="story123" />);

      await user.click(screen.getByRole('button', { name: /^Publish$/i }));

      await waitFor(() => {
        expect(toggleStoryPublish).toHaveBeenCalledWith('story123', true);
      });

      expect(mockApplyPatch).toHaveBeenCalledWith({
        published: true,
        publishedAt: '2025-10-03',
        unPublishedAt: null,
        publishedBy: 'user123',
        unPublishedBy: null,
      });
    });

    it('should call toggleStoryPublish when unpublish button clicked', async () => {
      const user = userEvent.setup();
      (toggleStoryPublish as jest.Mock).mockResolvedValue({
        unPublishedAt: '2025-10-03',
        unPublishedBy: 'user123',
      });
      const mockApplyPatch = jest.fn();

      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        origStory: { published: true },
        applyOrigStoryPatch: mockApplyPatch,
      });

      render(<StoryFormClient mode="edit" storyId="story123" />);

      await user.click(screen.getByRole('button', { name: /Unpublish/i }));

      await waitFor(() => {
        expect(toggleStoryPublish).toHaveBeenCalledWith('story123', false);
      });

      expect(mockApplyPatch).toHaveBeenCalledWith({
        published: false,
        publishedAt: null,
        unPublishedAt: '2025-10-03',
        publishedBy: null,
        unPublishedBy: 'user123',
      });
    });

    it('should show loading state while publishing', async () => {
      const user = userEvent.setup();
      let resolvePublish: any;
      (toggleStoryPublish as jest.Mock).mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePublish = resolve;
        });
      });

      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        origStory: { published: false },
      });

      render(<StoryFormClient mode="edit" storyId="story123" />);

      const publishButton = screen.getByRole('button', { name: /^Publish$/i });
      await user.click(publishButton);

      expect(await screen.findByRole('button', { name: /Publishing/i })).toBeDisabled();

      resolvePublish({ publishedAt: '2025-10-03' });
    });

    it('should open preview in new tab', async () => {
      const user = userEvent.setup();
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

      render(<StoryFormClient mode="edit" storyId="story123" />);

      await user.click(screen.getByRole('button', { name: /Preview/i }));

      expect(windowOpenSpy).toHaveBeenCalledWith('/story/story123', '_blank', 'noopener,noreferrer');

      windowOpenSpy.mockRestore();
    });
  });

  describe('cancel functionality', () => {
    it('should navigate back when cancel button clicked and history exists', async () => {
      const user = userEvent.setup();
      Object.defineProperty(window, 'history', {
        value: { length: 2 },
        writable: true,
      });

      render(<StoryFormClient mode="create" />);

      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(mockRouter.back).toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should navigate to home when cancel clicked and no history', async () => {
      const user = userEvent.setup();
      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true,
      });

      render(<StoryFormClient mode="create" />);

      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(mockRouter.back).not.toHaveBeenCalled();
    });
  });

  describe('submitting state', () => {
    it('should disable save button when submitting', () => {
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        submitting: true,
      });

      render(<StoryFormClient mode="create" />);

      expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled();
    });

    it('should show "Saving…" text when submitting', () => {
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        submitting: true,
      });

      render(<StoryFormClient mode="create" />);

      expect(screen.getByRole('button', { name: /Saving…/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Save$/i })).not.toBeInTheDocument();
    });
  });

  describe('integration with sub-components', () => {
    it('should render sidebar with title and description', () => {
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        title: 'My Story',
        description: 'My Description',
      });

      render(<StoryFormClient mode="create" />);

      expect(screen.getByTestId('title-input')).toHaveValue('My Story');
      expect(screen.getByTestId('description-textarea')).toHaveValue('My Description');
    });

    it('should render chapters', () => {
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        chapters: [
          { title: 'Chapter 1', content: 'Content 1' },
          { title: 'Chapter 2', content: 'Content 2' },
        ],
      });

      render(<StoryFormClient mode="create" />);

      expect(screen.getByTestId('chapter-0')).toHaveTextContent('Chapter 1');
      expect(screen.getByTestId('chapter-1')).toHaveTextContent('Chapter 2');
    });

    it('should update title through sidebar', async () => {
      const user = userEvent.setup();
      const mockSetTitle = jest.fn();
      (useStoryForm as jest.Mock).mockReturnValue({
        ...mockUseStoryForm,
        setTitle: mockSetTitle,
      });

      render(<StoryFormClient mode="create" />);

      const titleInput = screen.getByTestId('title-input');
      await user.type(titleInput, 'New Title');

      expect(mockSetTitle).toHaveBeenCalled();
    });
  });
});
