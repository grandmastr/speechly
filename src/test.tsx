import React from 'react';
import { createRoot } from 'react-dom/client';
import { Speechly } from './components/Speechly';

// Test the Speechly component with a custom API key and user information
const apiKey = 'TEST_API_KEY';
const fullName = 'Test User';
const email = 'test@example.com';

// Create a test container
const container = document.createElement('div');
document.body.appendChild(container);

// Render the Speechly component with the custom API key and user information
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <h1>Speechly Test</h1>
    <p>Testing with custom API key: {apiKey}</p>
    <p>User: {fullName} ({email})</p>
    <Speechly
      apiKey={apiKey}
      fullName={fullName}
      email={email}
    />
  </React.StrictMode>
);
