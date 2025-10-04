/**
 * Smoke test to verify Jest setup is working correctly
 */

describe('Jest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should have access to jest-dom matchers', () => {
    const element = document.createElement('div');
    element.textContent = 'Hello World';
    expect(element).toHaveTextContent('Hello World');
  });

  it('should support TypeScript', () => {
    const sum = (a: number, b: number): number => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});
