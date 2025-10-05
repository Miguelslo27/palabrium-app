/**
 * Tests for Button component
 * 
 * Simple presentational button component that spreads props and applies custom className.
 */

import { screen } from '@testing-library/react';
import { render } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import Button from '@/components/Editor/Shared/Button';

describe('Button', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render with default className', () => {
      render(<Button>Default Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('should merge custom className with default classes', () => {
      render(<Button className="bg-blue-500 text-white">Styled Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
      expect(button).toHaveClass('bg-blue-500', 'text-white');
    });

    it('should render with empty className when not provided', () => {
      render(<Button>No Style</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('inline-flex items-center justify-center');
    });
  });

  describe('HTML attributes', () => {
    it('should spread button HTML attributes', () => {
      render(
        <Button
          type="submit"
          disabled
          aria-label="Submit form"
          data-testid="custom-button"
        >
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-label', 'Submit form');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
    });

    it('should handle onClick event', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click Handler</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick} disabled>Disabled Button</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('children types', () => {
    it('should render text children', () => {
      render(<Button>Text Content</Button>);

      expect(screen.getByText('Text Content')).toBeInTheDocument();
    });

    it('should render element children', () => {
      render(
        <Button>
          <span data-testid="icon">🔥</span>
          <span>With Icon</span>
        </Button>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Button>
          <svg data-testid="svg-icon" />
          <span>Save</span>
          <span className="ml-2">→</span>
        </Button>
      );

      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('→')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be accessible with proper role', () => {
      render(<Button>Accessible Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>);

      expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="button-description">Action</Button>
          <div id="button-description">This button performs an action</div>
        </>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'button-description');
    });
  });

  describe('form integration', () => {
    it('should work as submit button in form', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /submit form/i });
      button.click();

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should work as reset button in form', () => {
      render(
        <form>
          <input defaultValue="test" />
          <Button type="reset">Reset Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /reset form/i });
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('edge cases', () => {
    it('should handle empty children gracefully', () => {
      render(<Button>{''}</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('');
    });

    it('should handle null className', () => {
      // TypeScript would prevent this, but testing runtime behavior
      render(<Button className={null as any}>Null Class</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle undefined className', () => {
      render(<Button className={undefined}>Undefined Class</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });
  });
});
