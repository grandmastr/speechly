// Test setup file for Vitest
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock the Web Audio API
window.AudioContext = vi.fn().mockImplementation(() => ({
  createMediaStreamSource: vi.fn(),
  createAnalyser: vi.fn(),
  createGain: vi.fn(),
  createOscillator: vi.fn(),
  destination: {},
}));

// Mock MediaRecorder
window.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: 'inactive',
}));

// Mock URL methods
URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
URL.revokeObjectURL = vi.fn();

// Mock FormData
global.FormData = vi.fn().mockImplementation(() => ({
  append: vi.fn(),
  delete: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  set: vi.fn(),
  forEach: vi.fn(),
  entries: vi.fn().mockReturnValue([]),
  keys: vi.fn(),
  values: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  blob: vi.fn().mockResolvedValue(new Blob()),
  json: vi.fn(),
  text: vi.fn(),
  arrayBuffer: vi.fn(),
  formData: vi.fn(),
  ok: true,
  status: 200,
  statusText: 'OK',
});

// Mock Audio
window.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Mock console methods to reduce noise in tests
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();
