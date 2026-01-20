import React from 'react';
import { render, fireEvent, screen } from '../../setup/test-utils';
import StoriesPaginationControls from '@/components/Stories/StoriesPaginationControls';

describe('StoriesPaginationControls', () => {
  const defaultProps = {
    page: 2,
    totalPages: 5,
    pageSize: 10,
    onChangePage: jest.fn(),
    onChangePageSize: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onChangePage.mockReset();
    defaultProps.onChangePageSize.mockReset();
  });

  it('disables previous button on first page', () => {
    render(<StoriesPaginationControls {...defaultProps} page={1} />);
    expect(screen.getByText('Prev')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<StoriesPaginationControls {...defaultProps} page={5} totalPages={5} />);
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('calls onChangePage when clicking next/prev', () => {
    render(<StoriesPaginationControls {...defaultProps} />);

    fireEvent.click(screen.getByText('Prev'));
    expect(defaultProps.onChangePage).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('Next'));
    expect(defaultProps.onChangePage).toHaveBeenCalledWith(3);
  });

  it('updates page size when selection changes', () => {
    render(<StoriesPaginationControls {...defaultProps} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } });
    expect(defaultProps.onChangePageSize).toHaveBeenCalledWith(20);
  });

  it('renders custom page size options when provided', () => {
    render(
      <StoriesPaginationControls
        {...defaultProps}
        pageSizeOptions={[15, 30]}
        pageSize={15}
      />,
    );

    expect(screen.getByRole('combobox')).toHaveValue('15');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
});
