import React from 'react';
import { render, screen } from '../../setup/test-utils';
import StoriesPaginationSummary, { calculateStoriesPaginationRange } from '@/components/Stories/StoriesPaginationSummary';

describe('StoriesPaginationSummary', () => {
  it('renders simple count when pagination data incomplete', () => {
    render(<StoriesPaginationSummary count={12} />);
    expect(screen.getByText('Showing 12 stories')).toBeInTheDocument();
  });

  it('renders range when page, pageSize and total are provided', () => {
    render(<StoriesPaginationSummary page={2} pageSize={5} total={18} />);
    expect(screen.getByText('Showing 6-10 of 18')).toBeInTheDocument();
  });
});

describe('calculateStoriesPaginationRange', () => {
  it('returns zero range when total is 0', () => {
    expect(calculateStoriesPaginationRange(1, 10, 0)).toEqual({ start: 0, end: 0 });
  });

  it('clamps start/end values to total bounds', () => {
    expect(calculateStoriesPaginationRange(3, 10, 25)).toEqual({ start: 21, end: 25 });
  });

  it('defaults page and pageSize when omitted', () => {
    expect(calculateStoriesPaginationRange(undefined, undefined, 15)).toEqual({ start: 1, end: 10 });
  });
});
