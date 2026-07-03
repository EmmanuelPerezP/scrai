import { render, screen } from '@testing-library/react';
import { SourceTag, StatusChip } from './NoteChips';

describe('StatusChip', () => {
  it('renders the label for a known status', () => {
    render(<StatusChip status="completed" />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('falls back to Pending for an unknown status', () => {
    render(<StatusChip status="nonsense" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});

describe('SourceTag', () => {
  it('renders the source label', () => {
    const { container } = render(<SourceTag source="audio" />);
    // The label sits next to the Material icon glyph, so assert on text content.
    expect(container.textContent).toContain('Audio');
  });
});
