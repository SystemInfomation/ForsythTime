import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Broadcaster } from '@/components/Broadcaster';

// Mock dependencies
jest.mock('@/hooks/usePeerConnection', () => ({
  usePeerCall: jest.fn(() => ({
    callId: 'test-call-id-123',
    status: 'idle',
    localStream: null,
    remoteStream: null,
    error: null,
    isMuted: false,
    startCall: jest.fn(),
    toggleMute: jest.fn(),
    switchCamera: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

describe('Broadcaster Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the broadcaster component', () => {
    render(<Broadcaster />);
    
    expect(screen.getByText('Your Call ID')).toBeInTheDocument();
    expect(screen.getByText('test-call-id-123')).toBeInTheDocument();
  });

  it('should show Start Call button', () => {
    render(<Broadcaster />);
    
    const startButton = screen.getByRole('button', { name: /start call/i });
    expect(startButton).toBeInTheDocument();
    expect(startButton).not.toBeDisabled();
  });

  it('should display call instructions', () => {
    render(<Broadcaster />);
    
    expect(screen.getByText(/start a call to share your camera/i)).toBeInTheDocument();
  });

  it('should render copy button for call ID', () => {
    render(<Broadcaster />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    expect(copyButton).toBeInTheDocument();
  });
});
