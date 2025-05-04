import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Speechly } from './index';
import { setApiKey } from '@/lib/api';

// Mock the api module
vi.mock('@/lib/api', () => ({
  setApiKey: vi.fn(),
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

// Mock the voice service
vi.mock('@/services/audio/voice', () => ({
  speakText: vi.fn().mockResolvedValue({
    audio: new Audio(),
    response: {
      audio_data: 'test_audio_data',
      audio_format: 'wav',
      billable_characters_count: 100,
    },
  }),
  voicesRefetchEvent: new EventTarget(),
  triggerVoicesRefetch: vi.fn(),
}));

describe('Speechly Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue('test-voice-id'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  it('renders without crashing', () => {
    // API key is now required
    render(<Speechly apiKey="test-api-key" />);
    // The FAB button should be in the document
    expect(document.querySelector('button')).toBeInTheDocument();
  });

  it('sets API key when provided', () => {
    const testApiKey = 'test-api-key';
    render(<Speechly apiKey={testApiKey} />);

    // Check if setApiKey was called with the correct API key
    expect(setApiKey).toHaveBeenCalledWith(testApiKey);
  });

  it('adds event listener for text selection', () => {
    // Mock document.addEventListener
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    // API key is now required
    render(<Speechly apiKey="test-api-key" />);

    // Check if the event listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'selectionchange',
      expect.any(Function),
      expect.objectContaining({ signal: expect.any(Object) })
    );

    // Clean up
    addEventListenerSpy.mockRestore();
  });

  it('passes fullName and email props to ControlPanel', () => {
    // Mock the ControlPanel component
    const mockControlPanel = vi.fn().mockReturnValue(null);
    vi.mock('@/components', () => ({
      ControlPanel: (props) => mockControlPanel(props),
      FAB: () => null,
      SpeechlyReadButton: () => null,
    }));

    // Render with fullName and email props
    const testFullName = 'Test User';
    const testEmail = 'test@example.com';
    render(<Speechly apiKey="test-api-key" fullName={testFullName} email={testEmail} />);

    // Check if ControlPanel was called with the correct props
    expect(mockControlPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: testFullName,
        email: testEmail,
      })
    );
  });
});
