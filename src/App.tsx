import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

import { Speechly } from '@/components';
import { Toaster } from '@/ui';

function App() {
  // You can provide your own API key here, or it will use the one from the environment variables
  const apiKey = import.meta.env.VITE_SPEECHIFY_API_KEY; // Replace with your actual API key

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      {/* Example of using the Speechly component with a custom API key */}
      <Speechly apiKey={apiKey} />
      <Toaster />
    </>
  );
}

export default App;
