/**
 * Tests for Icon components
 * 
 * Simple SVG icon components with className customization.
 */

import { render } from '@testing-library/react';
import IconEye from '@/components/Editor/Shared/IconEye';
import IconEyeOff from '@/components/Editor/Shared/IconEyeOff';
import IconTrash from '@/components/Editor/Shared/IconTrash';
import IconExternal from '@/components/Editor/Shared/IconExternal';

describe('Icon Components', () => {
  describe('IconEye', () => {
    it('should render SVG element', () => {
      const { container } = render(<IconEye />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should use default className', () => {
      const { container } = render(<IconEye />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-5', 'w-5');
    });

    it('should accept custom className', () => {
      const { container } = render(<IconEye className="h-6 w-6 text-blue-500" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-6', 'w-6', 'text-blue-500');
      expect(svg).not.toHaveClass('h-5', 'w-5');
    });

    it('should have proper SVG attributes', () => {
      const { container } = render(<IconEye />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should contain eye icon paths', () => {
      const { container } = render(<IconEye />);

      const paths = container.querySelectorAll('path');
      const circle = container.querySelector('circle');

      expect(paths.length).toBeGreaterThan(0);
      expect(circle).toBeInTheDocument();
    });
  });

  describe('IconEyeOff', () => {
    it('should render SVG element', () => {
      const { container } = render(<IconEyeOff />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should use default className', () => {
      const { container } = render(<IconEyeOff />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-5', 'w-5');
    });

    it('should accept custom className', () => {
      const { container } = render(<IconEyeOff className="h-8 w-8 text-red-600" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-8', 'w-8', 'text-red-600');
    });

    it('should have proper SVG attributes', () => {
      const { container } = render(<IconEyeOff />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should contain eye-off icon paths with strike-through', () => {
      const { container } = render(<IconEyeOff />);

      const paths = container.querySelectorAll('path');
      const line = container.querySelector('line');

      expect(paths.length).toBeGreaterThan(0);
      expect(line).toBeInTheDocument();
    });
  });

  describe('IconTrash', () => {
    it('should render SVG element', () => {
      const { container } = render(<IconTrash />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should use default className', () => {
      const { container } = render(<IconTrash />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-5', 'w-5');
    });

    it('should accept custom className', () => {
      const { container } = render(<IconTrash className="h-4 w-4 text-gray-400" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4', 'text-gray-400');
    });

    it('should have proper SVG attributes', () => {
      const { container } = render(<IconTrash />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should contain trash icon paths', () => {
      const { container } = render(<IconTrash />);

      const polyline = container.querySelector('polyline');
      const paths = container.querySelectorAll('path');

      expect(polyline).toBeInTheDocument();
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('IconExternal', () => {
    it('should render SVG element', () => {
      const { container } = render(<IconExternal />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should use default className', () => {
      const { container } = render(<IconExternal />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-5', 'w-5');
    });

    it('should accept custom className', () => {
      const { container } = render(<IconExternal className="h-3 w-3 text-blue-400" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-3', 'w-3', 'text-blue-400');
    });

    it('should have proper SVG attributes', () => {
      const { container } = render(<IconExternal />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should contain external link icon paths', () => {
      const { container } = render(<IconExternal />);

      const paths = container.querySelectorAll('path');
      const polyline = container.querySelector('polyline');
      const line = container.querySelector('line');

      expect(paths.length).toBeGreaterThan(0);
      expect(polyline).toBeInTheDocument();
      expect(line).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('all icons should be aria-hidden', () => {
      const { container: eyeContainer } = render(<IconEye />);
      const { container: eyeOffContainer } = render(<IconEyeOff />);
      const { container: trashContainer } = render(<IconTrash />);
      const { container: externalContainer } = render(<IconExternal />);

      expect(eyeContainer.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(eyeOffContainer.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(trashContainer.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(externalContainer.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Styling consistency', () => {
    it('all icons should support currentColor for stroke', () => {
      const { container: eyeContainer } = render(<IconEye />);
      const { container: eyeOffContainer } = render(<IconEyeOff />);
      const { container: trashContainer } = render(<IconTrash />);
      const { container: externalContainer } = render(<IconExternal />);

      expect(eyeContainer.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
      expect(eyeOffContainer.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
      expect(trashContainer.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
      expect(externalContainer.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
    });

    it('all icons should have same viewBox size', () => {
      const { container: eyeContainer } = render(<IconEye />);
      const { container: eyeOffContainer } = render(<IconEyeOff />);
      const { container: trashContainer } = render(<IconTrash />);
      const { container: externalContainer } = render(<IconExternal />);

      const viewBox = '0 0 24 24';
      expect(eyeContainer.querySelector('svg')).toHaveAttribute('viewBox', viewBox);
      expect(eyeOffContainer.querySelector('svg')).toHaveAttribute('viewBox', viewBox);
      expect(trashContainer.querySelector('svg')).toHaveAttribute('viewBox', viewBox);
      expect(externalContainer.querySelector('svg')).toHaveAttribute('viewBox', viewBox);
    });

    it('all icons should default to h-5 w-5', () => {
      const { container: eyeContainer } = render(<IconEye />);
      const { container: eyeOffContainer } = render(<IconEyeOff />);
      const { container: trashContainer } = render(<IconTrash />);
      const { container: externalContainer } = render(<IconExternal />);

      [eyeContainer, eyeOffContainer, trashContainer, externalContainer].forEach(container => {
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('h-5', 'w-5');
      });
    });
  });
});
