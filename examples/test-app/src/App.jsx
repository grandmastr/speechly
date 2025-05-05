import React from "react";
import { Speechly } from "speechly";
import "speechly/dist/speechly.css";

function App() {
  const apiKey = import.meta.env.VITE_SPEECHIFY_API_KEY;

  return (
    <div className="app">
      <h1>Speechly Test App</h1>
      <p>This is a test app to verify that the Speechly package works correctly when installed from npm.</p>
      <p>Try selecting this text to see the read selection button appear.</p>
      <Speechly apiKey={apiKey} />
    </div>
  );
}

export default App;
