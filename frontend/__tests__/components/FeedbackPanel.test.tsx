import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FeedbackPanel from '@/components/FeedbackPanel';
import { FeedbackCard } from '@/types';

describe('FeedbackPanel', () => {
  const mockFeedbackCards: FeedbackCard[] = [
    {
      id: '1',
      type: 'eye_contact',
      title: 'Eye Contact',
      message: 'Good eye contact maintained',
      severity: 'good',
      actionable_tip: 'Keep looking at the camera',
      timestamp: 10.5,
      show_example: true,
      dismissible: true,
    },
    {
      id: '2',
      type: 'posture',
      title: 'Posture',
      message: 'Slight posture deviation detected',
      severity: 'warning',
      actionable_tip: 'Straighten your back',
      timestamp: 15.2,
      show_example: true,
      dismissible: true,
    },
  ];

  const mockHandlers = {
    onDismiss: jest.fn(),
    onShowExample: jest.fn(),
    onJumpToTimestamp: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders feedback cards correctly', () => {
    render(<FeedbackPanel feedbackCards={mockFeedbackCards} {...mockHandlers} />);
    
    expect(screen.getByText('Live Feedback')).toBeInTheDocument();
    expect(screen.getByText('Eye Contact')).toBeInTheDocument();
    expect(screen.getByText('Posture')).toBeInTheDocument();
    expect(screen.getByText('Good eye contact maintained')).toBeInTheDocument();
    expect(screen.getByText('Slight posture deviation detected')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    render(<FeedbackPanel feedbackCards={mockFeedbackCards} {...mockHandlers} />);
    
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButtons[0]);
    
    expect(mockHandlers.onDismiss).toHaveBeenCalledWith('1');
  });

  it('calls onShowExample when show example button is clicked', () => {
    render(<FeedbackPanel feedbackCards={mockFeedbackCards} {...mockHandlers} />);
    
    const showExampleButtons = screen.getAllByText('Show Example');
    fireEvent.click(showExampleButtons[0]);
    
    expect(mockHandlers.onShowExample).toHaveBeenCalledWith('1');
  });

  it('shows empty state when no feedback cards', () => {
    render(<FeedbackPanel feedbackCards={[]} {...mockHandlers} />);
    
    expect(screen.getByText('No feedback available yet')).toBeInTheDocument();
    expect(screen.getByText('Start recording to get real-time insights')).toBeInTheDocument();
  });

  it('displays severity indicators correctly', () => {
    render(<FeedbackPanel feedbackCards={mockFeedbackCards} {...mockHandlers} />);
    
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
