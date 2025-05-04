// Main entry point for the speechly package

// Import styles
import './index.css';

// Export the Speechly component and its types
export { Speechly } from './components/Speechly';
export type { SpeechlyProps } from './components/Speechly/types';

// Export the API service functions for advanced usage
export { setApiKey, createApi } from './lib/api';
