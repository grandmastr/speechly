import React from 'react';
import { Speechly } from 'speechly';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Speechly Basic Example</h1>
        <p>
          This is a basic example of how to use Speechly in a React application.
          Click the floating button in the bottom right corner to open the control panel.
        </p>
      </header>
      <main className="app-content">
        <div className="example-section">
          <h2>Text Selection Example</h2>
          <p>
            Select any text on this page to see the "Read Selection" button appear.
            Click it to have the selected text read aloud using the selected voice.
          </p>
        </div>
        <div className="example-section">
          <h2>Usage Instructions</h2>
          <ol>
            <li>Click the floating button in the bottom right corner to open the control panel</li>
            <li>Record or upload an audio sample to clone your voice</li>
            <li>Select a voice from the dropdown</li>
            <li>Enter text in the input field and click "Read All" to hear it</li>
            <li>Or select any text on this page and click the "Read Selection" button that appears</li>
          </ol>
        </div>
      </main>

      {/* The Speechly component - you can provide your own API key as a prop */}
      <Speechly apiKey={import.meta.env.VITE_SPEECHIFY_API_KEY} />
    </div>
  );
}

export default App;
