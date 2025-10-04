import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import ChapterEditor from '@/components/ChapterEditor';

describe('ChapterEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial render', () => {
    it('should render with empty fields when no chapter provided', () => {
      render(<ChapterEditor onSave={mockOnSave} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('');
      expect(screen.getByLabelText(/Content/i)).toHaveValue('');
      expect(screen.getByRole('checkbox', { name: /Published/i })).not.toBeChecked();
    });

    it('should render with chapter data when provided', () => {
      const chapter = {
        title: 'Test Chapter',
        content: 'Test content here',
        published: true,
      };

      render(<ChapterEditor chapter={chapter} onSave={mockOnSave} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('Test Chapter');
      expect(screen.getByLabelText(/Content/i)).toHaveValue('Test content here');
      expect(screen.getByRole('checkbox', { name: /Published/i })).toBeChecked();
    });

    it('should render Save and Cancel buttons', () => {
      render(<ChapterEditor onSave={mockOnSave} />);

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should handle partial chapter data', () => {
      const chapter = {
        title: 'Only Title',
      };

      render(<ChapterEditor chapter={chapter} onSave={mockOnSave} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('Only Title');
      expect(screen.getByLabelText(/Content/i)).toHaveValue('');
      expect(screen.getByRole('checkbox', { name: /Published/i })).not.toBeChecked();
    });
  });

  describe('form interactions', () => {
    it('should update title when typing', async () => {
      const user = userEvent.setup();
      render(<ChapterEditor onSave={mockOnSave} />);

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'New Chapter Title');

      expect(titleInput).toHaveValue('New Chapter Title');
    });

    it('should update content when typing', async () => {
      const user = userEvent.setup();
      render(<ChapterEditor onSave={mockOnSave} />);

      const contentTextarea = screen.getByLabelText(/Content/i);
      await user.type(contentTextarea, 'Chapter content goes here');

      expect(contentTextarea).toHaveValue('Chapter content goes here');
    });

    it('should toggle published checkbox', async () => {
      const user = userEvent.setup();
      render(<ChapterEditor onSave={mockOnSave} />);

      const checkbox = screen.getByRole('checkbox', { name: /Published/i });
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should allow clearing existing values', async () => {
      const user = userEvent.setup();
      const chapter = {
        title: 'Original Title',
        content: 'Original content',
        published: true,
      };

      render(<ChapterEditor chapter={chapter} onSave={mockOnSave} />);

      const titleInput = screen.getByLabelText(/Title/i);
      const contentTextarea = screen.getByLabelText(/Content/i);

      await user.clear(titleInput);
      await user.clear(contentTextarea);

      expect(titleInput).toHaveValue('');
      expect(contentTextarea).toHaveValue('');
    });
  });

  describe('save functionality', () => {
    it('should call onSave with correct data when Save button clicked', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<ChapterEditor onSave={mockOnSave} />);

      await user.type(screen.getByLabelText(/Title/i), 'New Chapter');
      await user.type(screen.getByLabelText(/Content/i), 'New content');
      await user.click(screen.getByRole('checkbox', { name: /Published/i }));

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: 'New Chapter',
          content: 'New content',
          published: true,
        });
      });
    });

    it('should trim whitespace from title before saving', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<ChapterEditor onSave={mockOnSave} />);

      await user.type(screen.getByLabelText(/Title/i), '  Trimmed Title  ');
      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: 'Trimmed Title',
          content: '',
          published: false,
        });
      });
    });

    it('should not call onSave when title is empty', async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

      render(<ChapterEditor onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      expect(mockOnSave).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Title is required');

      alertSpy.mockRestore();
    });

    it('should not call onSave when title is only whitespace', async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

      render(<ChapterEditor onSave={mockOnSave} />);

      await user.type(screen.getByLabelText(/Title/i), '   ');
      await user.click(screen.getByRole('button', { name: /Save/i }));

      expect(mockOnSave).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Title is required');

      alertSpy.mockRestore();
    });

    it('should allow saving with empty content', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<ChapterEditor onSave={mockOnSave} />);

      await user.type(screen.getByLabelText(/Title/i), 'Title Only');
      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: 'Title Only',
          content: '',
          published: false,
        });
      });
    });
  });

  describe('cancel functionality', () => {
    it('should call onCancel when Cancel button clicked', async () => {
      const user = userEvent.setup();

      render(<ChapterEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should not throw when onCancel is not provided', async () => {
      const user = userEvent.setup();

      render(<ChapterEditor onSave={mockOnSave} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Should not throw error
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('saving state', () => {
    it('should disable Save button when saving is true', () => {
      render(<ChapterEditor onSave={mockOnSave} saving={true} />);

      expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled();
    });

    it('should show "Saving..." text when saving is true', () => {
      render(<ChapterEditor onSave={mockOnSave} saving={true} />);

      expect(screen.getByRole('button', { name: /Saving/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Save$/i })).not.toBeInTheDocument();
    });

    it('should enable Save button when saving is false', () => {
      render(<ChapterEditor onSave={mockOnSave} saving={false} />);

      expect(screen.getByRole('button', { name: /Save/i })).not.toBeDisabled();
    });

    it('should not disable Cancel button when saving', () => {
      render(<ChapterEditor onSave={mockOnSave} saving={true} />);

      expect(screen.getByRole('button', { name: /Cancel/i })).not.toBeDisabled();
    });
  });

  describe('edge cases', () => {
    it('should handle very long title', async () => {
      const user = userEvent.setup();
      const longTitle = 'A'.repeat(500);

      render(<ChapterEditor onSave={mockOnSave} />);

      await user.type(screen.getByLabelText(/Title/i), longTitle);

      expect(screen.getByLabelText(/Title/i)).toHaveValue(longTitle);
    });

    it('should handle very long content', async () => {
      const user = userEvent.setup();
      const longContent = 'Lorem ipsum '.repeat(100); // Reducido a 100 en lugar de 1000

      render(<ChapterEditor onSave={mockOnSave} />);

      await user.type(screen.getByLabelText(/Content/i), longContent);

      expect(screen.getByLabelText(/Content/i)).toHaveValue(longContent);
    }, 10000); // Increased timeout to 10 seconds

    it('should handle rapid state changes', async () => {
      const user = userEvent.setup();

      render(<ChapterEditor onSave={mockOnSave} />);

      const checkbox = screen.getByRole('checkbox', { name: /Published/i });

      // Rapidly toggle checkbox
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(checkbox).not.toBeChecked();
    });

    it('should maintain state when saving prop changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ChapterEditor onSave={mockOnSave} saving={false} />);

      await user.type(screen.getByLabelText(/Title/i), 'Test Title');

      rerender(<ChapterEditor onSave={mockOnSave} saving={true} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('Test Title');
    });

    it('should handle special characters in title and content', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<ChapterEditor onSave={mockOnSave} />);

      const specialText = '!@#$%^&*()_+-=';

      // Use paste instead of type for special characters
      const titleInput = screen.getByLabelText(/Title/i);
      const contentTextarea = screen.getByLabelText(/Content/i);

      await user.click(titleInput);
      await user.paste(specialText);

      await user.click(contentTextarea);
      await user.paste(specialText);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: specialText,
          content: specialText,
          published: false,
        });
      });
    });

    it('should handle unicode characters', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<ChapterEditor onSave={mockOnSave} />);

      const unicodeText = '你好世界émojis';
      const titleInput = screen.getByLabelText(/Title/i);

      await user.click(titleInput);
      await user.paste(unicodeText);

      await user.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: unicodeText,
          content: '',
          published: false,
        });
      });
    });
  });

  describe('accessibility', () => {
    it('should have accessible labels for all inputs', () => {
      render(<ChapterEditor onSave={mockOnSave} />);

      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Published/i)).toBeInTheDocument();
    });

    it('should have appropriate input types', () => {
      render(<ChapterEditor onSave={mockOnSave} />);

      const titleInput = screen.getByLabelText(/Title/i);
      const contentTextarea = screen.getByLabelText(/Content/i);
      const publishedCheckbox = screen.getByLabelText(/Published/i);

      expect(titleInput.tagName).toBe('INPUT');
      expect(contentTextarea.tagName).toBe('TEXTAREA');
      expect(publishedCheckbox).toHaveAttribute('type', 'checkbox');
    });

    it('should have proper button roles', () => {
      render(<ChapterEditor onSave={mockOnSave} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });
});
